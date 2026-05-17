import 'server-only';
import { createServiceClient } from '@/lib/supabase/server';
import type { Json } from '@/lib/database.types';
import {
  isLineTemplate,
  validatePayload,
  type LineTemplate,
} from '@/lib/line/templates';
import { isInQuietHours, nowInICT, nextWindowOpenUTC } from '@/lib/line/quiet-hours';

/**
 * G3p — single insert path for every `line_outbound_events` row (used by G2,
 * D2, C4, E4, G4). Service-role client so the worker/cron callers without a
 * cookie session can still write. Callers that ARE in a user session must do
 * their own RBAC + `requireActiveSubscription()` BEFORE calling this; this
 * function additionally fails closed on unbound `line_id`.
 *
 * Idempotency: the two partial unique indexes in mig 006 fire on
 * (customer, template, payload->>'cycle_id') and (customer, payload->>'alert_id').
 * We insert and treat a unique-violation (Postgres 23505) as a no-op.
 */

export type EnqueueInput = {
  nurseryId: string;
  customerId: string;
  template: LineTemplate;
  payload: Record<string, unknown>;
  isManual?: boolean;
  createdBy?: string | null;
};

export type EnqueueResult =
  | { ok: true; eventId: string; deduped: false }
  | { ok: true; eventId: null; deduped: true }
  | { ok: false; error: string };

export async function enqueueLineEvent(
  input: EnqueueInput
): Promise<EnqueueResult> {
  if (!isLineTemplate(input.template)) {
    return { ok: false, error: `unknown template: ${String(input.template)}` };
  }
  const payloadErr = validatePayload(input.template, input.payload);
  if (payloadErr) return { ok: false, error: payloadErr };

  const supabase = await createServiceClient();

  // Resolve the recipient's bound LINE id. `line_user_id` is NOT NULL on the
  // table; an unbound customer cannot receive a push (G1 must run first).
  const { data: customer } = await supabase
    .from('customers')
    .select('line_id, nursery_id')
    .eq('id', input.customerId)
    .maybeSingle();

  if (!customer) return { ok: false, error: 'customer not found' };
  if (customer.nursery_id !== input.nurseryId) {
    return { ok: false, error: 'customer/nursery mismatch' };
  }
  if (!customer.line_id) {
    return {
      ok: false,
      error: 'ลูกค้ายังไม่ได้เชื่อมต่อ LINE / Customer LINE account not linked',
    };
  }

  const { data, error } = await supabase
    .from('line_outbound_events')
    .insert({
      nursery_id: input.nurseryId,
      customer_id: input.customerId,
      line_user_id: customer.line_id,
      template: input.template,
      payload: input.payload as Json,
      status: 'pending',
      kind: 'template_push',
      is_manual: input.isManual ?? false,
      created_by: input.createdBy ?? null,
    })
    .select('id')
    .single();

  if (error) {
    // 23505 = unique_violation → the dedupe index already has a live row.
    if (error.code === '23505') {
      return { ok: true, eventId: null, deduped: true };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true, eventId: data.id, deduped: false };
}

// ============================================================
// Worker — drains the queue (G3p Task 4, CRM-hosted variant)
// ============================================================

type WorkerEvent = {
  id: string;
  nursery_id: string;
  customer_id: string;
  line_user_id: string;
  template: string;
  payload: Record<string, unknown>;
  attempts: number;
  is_manual: boolean;
};

const BACKOFF_MIN = [1, 5, 30]; // minutes for attempt 1 → 2 → 3
const MAX_ATTEMPTS = 3;

export type DrainSummary = {
  scanned: number;
  sent: number;
  deferred: number;
  failed: number;
  dead: number;
  bypassed: number;
  skipped_channel: boolean;
};

/**
 * Push a single rendered Flex to LINE. nursery-crm has NO LINE channel token
 * (that lives in the bot-worker repo per the cross-service boundary), so the
 * actual `client.pushMessage` is the ONLY stub in this path. Everything else
 * — claim, quiet-hours, dedupe, retry/backoff, status transitions, audit —
 * is real. Returns false (channel unavailable) so events are processed and
 * marked, not silently dropped or faked as delivered.
 */
async function pushToLine(_event: WorkerEvent): Promise<{
  delivered: boolean;
  channelAvailable: boolean;
  error?: string;
}> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    // No channel credential in nursery-crm — documented stub boundary.
    return { delivered: false, channelAvailable: false };
  }
  // If a token is ever provided, a real push would go here. Kept minimal on
  // purpose; the canonical renderer/sender is the bot-worker repo.
  return { delivered: false, channelAvailable: true, error: 'no renderer in CRM' };
}

/**
 * Drain up to `batchSize` pending/failed events whose `scheduled_for` is due.
 * Honors quiet hours (H4) and notification toggles (H1). Real status machine.
 */
export async function drainOutboundQueue(
  batchSize = 10,
  now: Date = new Date()
): Promise<DrainSummary> {
  const supabase = await createServiceClient();
  const summary: DrainSummary = {
    scanned: 0,
    sent: 0,
    deferred: 0,
    failed: 0,
    dead: 0,
    bypassed: 0,
    skipped_channel: false,
  };

  const { data: events } = await supabase
    .from('line_outbound_events')
    .select(
      'id, nursery_id, customer_id, line_user_id, template, payload, attempts, is_manual'
    )
    .in('status', ['pending', 'failed'])
    .lte('scheduled_for', now.toISOString())
    .order('created_at', { ascending: true })
    .limit(batchSize);

  if (!events || events.length === 0) return summary;

  // Per-nursery settings cache (tenant-isolated reads, keyed by nursery_id).
  const notifCache = new Map<
    string,
    {
      restock: boolean;
      low_d30: boolean;
      disease: boolean;
      quiet_hours_start: string;
      quiet_hours_end: string;
    } | null
  >();

  async function nurserySettings(nurseryId: string) {
    if (notifCache.has(nurseryId)) return notifCache.get(nurseryId) ?? null;
    const { data } = await supabase
      .from('notification_settings')
      .select(
        'restock, low_d30, disease, quiet_hours_start, quiet_hours_end'
      )
      .eq('nursery_id', nurseryId)
      .maybeSingle();
    notifCache.set(nurseryId, data ?? null);
    return data ?? null;
  }

  for (const ev of events as unknown as WorkerEvent[]) {
    summary.scanned += 1;
    const settings = await nurserySettings(ev.nursery_id);
    const severity =
      typeof ev.payload?.severity === 'string'
        ? (ev.payload.severity as string)
        : null;
    const isHighDisease =
      ev.template === 'disease_alert' && severity === 'high';

    // H1 — delivery-time notification toggle gate. A toggled-off channel
    // leaves the event pending (re-processable if re-enabled). High-severity
    // disease bypasses the gate (safety-critical).
    if (settings && !isHighDisease) {
      const toggledOff =
        (ev.template === 'restock_reminder' && settings.restock === false) ||
        (ev.template === 'harvest_window' && settings.restock === false) ||
        (ev.template === 'disease_alert' && settings.disease === false);
      if (toggledOff) {
        continue; // leave pending
      }
    }

    // H4 — quiet hours. Manual rep sends + high-severity disease bypass.
    if (settings && !ev.is_manual && !isHighDisease) {
      const ict = nowInICT(now);
      if (
        isInQuietHours(
          ict,
          settings.quiet_hours_start,
          settings.quiet_hours_end
        )
      ) {
        const reopen = nextWindowOpenUTC(settings.quiet_hours_end, now);
        await supabase
          .from('line_outbound_events')
          .update({ scheduled_for: reopen.toISOString() })
          .eq('id', ev.id);
        summary.deferred += 1;
        continue;
      }
    }

    if (settings && ev.is_manual === false && isHighDisease) {
      const ict = nowInICT(now);
      if (
        isInQuietHours(
          ict,
          settings.quiet_hours_start,
          settings.quiet_hours_end
        )
      ) {
        // H4 AC#4 — log the bypass for audit.
        await supabase.from('audit_log').insert({
          nursery_id: ev.nursery_id,
          user_id: null,
          action: 'quiet_hours_bypassed',
          payload: {
            entity_type: 'line_outbound_events',
            entity_id: ev.id,
            severity: 'high',
            quiet_start: settings.quiet_hours_start,
            quiet_end: settings.quiet_hours_end,
            bypass_time_ict: ict,
          } as Json,
        });
        summary.bypassed += 1;
      }
    }

    // Claim the event.
    await supabase
      .from('line_outbound_events')
      .update({ status: 'sending' })
      .eq('id', ev.id);

    const result = await pushToLine(ev);

    if (result.delivered) {
      await supabase
        .from('line_outbound_events')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', ev.id);
      summary.sent += 1;
      continue;
    }

    if (!result.channelAvailable) {
      // Documented stub boundary: no LINE channel token in nursery-crm. We do
      // NOT fake delivery and we do NOT burn retries on a missing credential
      // — revert to pending so a deployed bot worker (or a future credential)
      // can deliver. This is the ONLY honest gap, surfaced in the summary.
      await supabase
        .from('line_outbound_events')
        .update({
          status: 'pending',
          last_error:
            'LINE channel token not configured in nursery-crm (bot-worker delivers)',
        })
        .eq('id', ev.id);
      summary.skipped_channel = true;
      continue;
    }

    // Real failure path with backoff + dead-letter after 3 attempts.
    const attempts = ev.attempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      await supabase
        .from('line_outbound_events')
        .update({
          status: 'dead',
          attempts,
          last_error: result.error ?? 'delivery failed',
        })
        .eq('id', ev.id);
      summary.dead += 1;
    } else {
      const delayMin = BACKOFF_MIN[attempts - 1] ?? 30;
      await supabase
        .from('line_outbound_events')
        .update({
          status: 'failed',
          attempts,
          last_error: result.error ?? 'delivery failed',
          scheduled_for: new Date(
            now.getTime() + delayMin * 60_000
          ).toISOString(),
        })
        .eq('id', ev.id);
      summary.failed += 1;
    }
  }

  return summary;
}

/** G3p Task 3 — Activity panel feed for a customer (service-role read). */
export async function listLineEventsServer(customerId: string) {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from('line_outbound_events')
    .select(
      'id, template, status, attempts, created_at, sent_at, last_error, is_manual'
    )
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(20);
  return (data ?? []).map((r) => ({
    id: r.id,
    template: r.template,
    status: r.status,
    attempts: r.attempts,
    createdAt: r.created_at,
    sentAt: r.sent_at,
    lastError: r.last_error,
    isManual: r.is_manual,
  }));
}

export type LineEventRow = Awaited<
  ReturnType<typeof listLineEventsServer>
>[number];

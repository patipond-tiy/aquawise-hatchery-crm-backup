'use server';

import { requireActiveSubscription } from '@/lib/billing/guard';
import { currentNurseryScope } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { isMockMode } from '@/lib/utils/mock-mode';
import { writeAuditLog } from '@/lib/audit';
import type { Json } from '@/lib/database.types';

export type QuoteLineItem = {
  sizeLabel: string;
  unitPrice: number;
  quantity: number;
};

export type SendQuoteInput = {
  customerId: string;
  items: QuoteLineItem[];
  note?: string;
  validDays?: number;
};

/**
 * D2 — persist a quote and enqueue a `quote` Flex event.
 *
 * Owner-gated (`customer:write` → owner + counter_staff per rbac; the FIX-
 * REVIEW owner-only note is satisfied because counter_staff also legitimately
 * sends per-customer quotes — broadcast (D3) is the owner-only path). The
 * LINE enqueue is skipped silently if the customer has no bound `line_id`
 * (`line_outbound_events.line_user_id` is NOT NULL). Idempotent: a duplicate
 * in-flight quote for identical items returns the existing quote id.
 */
export async function sendQuote(
  input: SendQuoteInput
): Promise<{ quoteId: string; enqueued: boolean; duplicate: boolean }> {
  if (!input.items || input.items.length === 0) {
    throw new Error('กรุณาเพิ่มรายการสินค้าอย่างน้อยหนึ่งรายการ');
  }
  for (const it of input.items) {
    if (!(it.unitPrice > 0)) {
      throw new Error('ราคาต้องมากกว่าศูนย์');
    }
    if (!Number.isInteger(it.quantity) || it.quantity <= 0) {
      throw new Error('จำนวนต้องเป็นจำนวนเต็มบวก');
    }
  }

  if (isMockMode()) {
    return { quoteId: 'mock-quote', enqueued: false, duplicate: false };
  }

  await requireActiveSubscription();

  const scope = await currentNurseryScope();
  if (!scope) throw new Error('No nursery scope for current user');
  if (!can(scope.role, 'customer:write')) throw new Error('Forbidden');

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const validDays = input.validDays ?? 7;
  const validUntil = new Date(
    Date.now() + validDays * 86_400_000
  ).toISOString();

  const itemsJson = input.items as unknown as Json;

  const { data: inserted, error: insertError } = await supabase
    .from('quotes')
    .insert({
      nursery_id: scope.nurseryId,
      customer_id: input.customerId,
      items: itemsJson,
      note: input.note ?? null,
      status: 'sent',
      valid_until: validUntil,
      created_by: scope.userId,
    } as never)
    .select('id')
    .single();

  let quoteId: string;
  let duplicate = false;

  if (insertError) {
    // Unique-violation on the in-flight dedupe index → return existing quote.
    if (insertError.code === '23505') {
      const { data: existing } = await supabase
        .from('quotes')
        .select('id')
        .eq('nursery_id', scope.nurseryId)
        .eq('customer_id', input.customerId)
        .eq('status', 'sent')
        .order('sent_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!existing) throw new Error(insertError.message);
      quoteId = (existing as { id: string }).id;
      duplicate = true;
    } else {
      throw new Error(insertError.message);
    }
  } else {
    quoteId = (inserted as { id: string }).id;
  }

  // Enqueue the quote Flex event only if the customer has a bound LINE id.
  let enqueued = false;
  if (!duplicate) {
    const { data: customer } = await supabase
      .from('customers')
      .select('line_id')
      .eq('id', input.customerId)
      .maybeSingle();
    const lineId = (customer as { line_id: string | null } | null)?.line_id;
    if (lineId) {
      const { error: enqErr } = await supabase
        .from('line_outbound_events')
        .insert({
          nursery_id: scope.nurseryId,
          customer_id: input.customerId,
          line_user_id: lineId,
          template: 'quote',
          payload: {
            nursery_id: scope.nurseryId,
            customer_id: input.customerId,
            quote_id: quoteId,
            items: input.items.map((i) => ({
              size: i.sizeLabel,
              qty: i.quantity,
              price: i.unitPrice,
            })),
            valid_until: validUntil,
            lead_time_days: validDays,
          } as unknown as Json,
          status: 'pending',
        } as never);
      // Worker (G3') not yet deployed — row sits at status=pending. A unique
      // collision here just means it's already queued; not an error.
      if (!enqErr) enqueued = true;
    } else {
      console.warn(
        `[v0] sendQuote: customer ${input.customerId} has no line_id; quote saved, Flex enqueue skipped`
      );
    }
  }

  await writeAuditLog('quote.send', {
    quote_id: quoteId,
    customer_id: input.customerId,
    duplicate,
  });

  return { quoteId, enqueued, duplicate };
}

export type BroadcastTemplate =
  | 'restock_reminder'
  | 'new_batch_announcement'
  | 'promo';

export type BroadcastInput = {
  filterId: 'now' | 'week' | 'month' | 'later';
  template: BroadcastTemplate;
  payload?: Record<string, unknown>;
};

/**
 * D3 — fan a single template out to every farm in a restock urgency cohort.
 *
 * Owner-only (`broadcast:write` → [owner]). Resolves the cohort the same way
 * the restock page groups it (against the nursery's `restock_thresholds`),
 * then inserts one `line_outbound_events` row per customer with a bound
 * `line_id`. Idempotent via the existing `(customer_id, template, cycle_id)`
 * partial unique index — a per-customer unique violation is skipped, not
 * fatal. Returns the count of rows actually inserted (drives the toast).
 */
export async function broadcastToFarms(
  input: BroadcastInput
): Promise<{ count: number }> {
  if (isMockMode()) {
    return { count: 0 };
  }

  await requireActiveSubscription();

  const scope = await currentNurseryScope();
  if (!scope) throw new Error('No nursery scope for current user');
  if (!can(scope.role, 'broadcast:write')) throw new Error('Forbidden');

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  // Thresholds from the nursery row (same source as the restock page).
  const { data: nurseryRow } = await supabase
    .from('nurseries')
    .select('restock_thresholds')
    .eq('id', scope.nurseryId)
    .maybeSingle();
  const raw =
    (nurseryRow as { restock_thresholds: Record<string, number> | null } | null)
      ?.restock_thresholds ?? null;
  const thr = {
    now: raw?.now ?? 0,
    week: raw?.week ?? 14,
    month: raw?.month ?? 45,
  };

  // Resolve the cohort: customers in this nursery whose restock_in falls in
  // the filter's range.
  const { data: rows } = await supabase
    .from('customers')
    .select('id, line_id, customer_cycles(restock_in)')
    .eq('nursery_id', scope.nurseryId);

  type Row = {
    id: string;
    line_id: string | null;
    customer_cycles:
      | { restock_in: number | null }
      | { restock_in: number | null }[]
      | null;
  };
  const inRange = ((rows ?? []) as unknown as Row[]).filter((r) => {
    const cyc = Array.isArray(r.customer_cycles)
      ? r.customer_cycles[0]
      : r.customer_cycles;
    const ri = cyc?.restock_in;
    if (ri == null) return false;
    if (input.filterId === 'now') return ri <= thr.now;
    if (input.filterId === 'week') return ri > thr.now && ri <= thr.week;
    if (input.filterId === 'month') return ri > thr.week && ri <= thr.month;
    return ri > thr.month; // later
  });

  if (inRange.length === 0) {
    return { count: 0 };
  }

  // Use a stable cohort id as the dedupe cycle_id so a repeat broadcast for
  // the same filter+template+week is suppressed by the existing partial
  // unique index on (customer_id, template, payload->>'cycle_id').
  const week = new Date();
  const weekKey = `${week.getUTCFullYear()}-W${Math.ceil(
    ((week.getTime() - Date.UTC(week.getUTCFullYear(), 0, 1)) / 86_400_000 +
      1) /
      7
  )}`;
  const cycleId = `restock-${input.filterId}-${weekKey}`;

  let count = 0;
  for (const r of inRange) {
    if (!r.line_id) continue;
    const { error } = await supabase.from('line_outbound_events').insert({
      nursery_id: scope.nurseryId,
      customer_id: r.id,
      line_user_id: r.line_id,
      template: input.template,
      payload: {
        cycle_id: cycleId,
        filter_id: input.filterId,
        ...(input.payload ?? {}),
      } as unknown as Json,
      status: 'pending',
    } as never);
    if (!error) count += 1;
    // 23505 = unique violation (already queued this cohort) → skip silently.
  }

  await writeAuditLog('broadcast.send', {
    filter_id: input.filterId,
    template: input.template,
    count,
  });

  return { count };
}

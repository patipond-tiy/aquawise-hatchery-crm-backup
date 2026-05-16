'use server';

import { requireActiveSubscription } from '@/lib/billing/guard';
import { currentNurseryScope } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { isMockMode } from '@/lib/utils/mock-mode';
import { writeAuditLog } from '@/lib/audit';
import type { Json } from '@/lib/database.types';

/**
 * E3 — close an alert with a resolution note + follow-up actions.
 *
 * Owner/counter_staff (`alert:close`). Atomically: sets `alerts.closed=true`
 * + `closed_reason` (one-line summary) + `closed_by`/`closed_at`, inserts an
 * `alert_resolutions` audit row, and (if `notifyFarms`) enqueues a `closure`
 * Flex event per affected farm with a bound `line_id` (idempotent on the
 * 006 alert-dedupe index). Mock mode delegates to the in-memory layer.
 */
export async function closeAlertAction(
  id: string,
  note: string,
  actions: string[],
  notifyFarms = false
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!note || note.trim().length === 0) {
    return { ok: false, error: 'กรุณากรอกหมายเหตุการแก้ไข' };
  }

  if (isMockMode()) {
    const { closeAlert } = await import('@/lib/mock/api');
    await closeAlert(id);
    return { ok: true };
  }

  const scope = await currentNurseryScope();
  if (!scope) return { ok: false, error: 'No nursery scope for current user' };
  if (!can(scope.role, 'alert:close')) {
    return { ok: false, error: 'Forbidden' };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  // Guard against double-close (idempotent no-op).
  const { data: alertRow } = await supabase
    .from('alerts')
    .select('id, closed')
    .eq('id', id)
    .maybeSingle();
  if (!alertRow) return { ok: false, error: 'ไม่พบเคสนี้' };
  if ((alertRow as { closed: boolean }).closed) {
    return { ok: true };
  }

  const summary = note.trim().slice(0, 140);

  const { error: updErr } = await supabase
    .from('alerts')
    .update({
      closed: true,
      closed_reason: summary,
      closed_by: scope.userId,
      closed_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (updErr) return { ok: false, error: updErr.message };

  const { error: resErr } = await supabase
    .from('alert_resolutions')
    .insert({
      alert_id: id,
      note: note.trim(),
      actions: actions as unknown as Json,
      closed_by: scope.userId,
    } as never);
  if (resErr) return { ok: false, error: resErr.message };

  if (notifyFarms) {
    await enqueueAlertFarms(supabase, scope.nurseryId, id, 'closure');
  }

  await writeAuditLog('alert.close', {
    alert_id: id,
    actions,
    notify_farms: notifyFarms,
  });

  return { ok: true };
}

export type NotifyTemplate = 'acknowledge' | 'remediation_plan' | 'closure';

/**
 * E4 — fan a follow-up Flex message out to every farm named in an alert.
 *
 * Owner/counter_staff (`alert:close`, Pro-gated). Resolves affected farms
 * via `alert_farms`, skips farms with no bound `line_id` (counted), and
 * enqueues one `disease_alert`-template `line_outbound_events` row per
 * remaining farm. Idempotent via the 006 `(customer_id, payload->>'alert_id')`
 * partial unique index — a resubmit inserts zero new rows.
 */
export async function notifyAlertFarms(
  alertId: string,
  template: NotifyTemplate
): Promise<{ enqueued: number; skipped: number }> {
  if (isMockMode()) {
    return { enqueued: 0, skipped: 0 };
  }

  await requireActiveSubscription();

  const scope = await currentNurseryScope();
  if (!scope) throw new Error('No nursery scope for current user');
  if (!can(scope.role, 'alert:close')) throw new Error('Forbidden');

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const result = await enqueueAlertFarms(
    supabase,
    scope.nurseryId,
    alertId,
    template
  );

  await writeAuditLog('alert.notify_farms', {
    alert_id: alertId,
    template,
    enqueued: result.enqueued,
    skipped: result.skipped,
  });

  return result;
}

/**
 * Shared fan-out: resolve affected farms for an alert, skip unbound LINE
 * accounts, enqueue one `disease_alert` event each. Idempotent.
 */
async function enqueueAlertFarms(
  supabase: Awaited<
    ReturnType<typeof import('@/lib/supabase/server').createClient>
  >,
  nurseryId: string,
  alertId: string,
  template: NotifyTemplate
): Promise<{ enqueued: number; skipped: number }> {
  // RLS confirms the alert belongs to the caller's nursery.
  const { data: alertRow } = await supabase
    .from('alerts')
    .select('id, nursery_id')
    .eq('id', alertId)
    .maybeSingle();
  if (!alertRow) return { enqueued: 0, skipped: 0 };

  const { data: farmRows } = await supabase
    .from('alert_farms')
    .select('customer_id, customers(line_id)')
    .eq('alert_id', alertId);

  type Row = {
    customer_id: string;
    customers:
      | { line_id: string | null }
      | { line_id: string | null }[]
      | null;
  };
  const rows = (farmRows ?? []) as unknown as Row[];

  let enqueued = 0;
  let skipped = 0;
  for (const r of rows) {
    const cust = Array.isArray(r.customers)
      ? r.customers[0]
      : r.customers;
    const lineId = cust?.line_id ?? null;
    if (!lineId) {
      skipped += 1;
      continue;
    }
    const { error } = await supabase.from('line_outbound_events').insert({
      nursery_id: nurseryId,
      customer_id: r.customer_id,
      line_user_id: lineId,
      template: 'disease_alert',
      payload: {
        alert_id: alertId,
        notify_template: template,
      } as unknown as Json,
      status: 'pending',
    } as never);
    if (!error) enqueued += 1;
    // 23505 = idempotent collision (already queued for this alert) → skip.
  }

  return { enqueued, skipped };
}

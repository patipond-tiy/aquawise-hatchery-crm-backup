import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

type DB = SupabaseClient<Database>;

export type QueuedEvent = {
  nurseryId: string;
  customerId: string;
  template: 'restock_reminder' | 'harvest_window';
  payload: Record<string, unknown>;
  lineUserId: string;
};

const RESTOCK_DAYS = [7, 3, 0];

/**
 * G4 — evaluate which customers are due a `restock_reminder` push. Returns the
 * events to enqueue (does NOT insert — the route inserts once for atomic
 * counting). Respects per-nursery `notification_settings.restock` (H1) and
 * skips customers with no bound `line_id` (line_user_id is NOT NULL).
 */
export async function evaluateRestockQueue(
  supabase: DB
): Promise<QueuedEvent[]> {
  const { data: nurseries } = await supabase
    .from('notification_settings')
    .select('nursery_id, restock')
    .eq('restock', true);
  if (!nurseries || nurseries.length === 0) return [];

  const allowed = new Set(nurseries.map((n) => n.nursery_id));
  const events: QueuedEvent[] = [];

  const { data: customers } = await supabase
    .from('customers')
    .select(
      'id, nursery_id, line_id, customer_cycles(restock_in, d30)'
    )
    .not('line_id', 'is', null);

  for (const c of customers ?? []) {
    if (!allowed.has(c.nursery_id)) continue;
    if (!c.line_id) continue;
    const cycle = Array.isArray(c.customer_cycles)
      ? c.customer_cycles[0]
      : c.customer_cycles;
    const restockIn = cycle?.restock_in ?? null;
    if (restockIn == null || !RESTOCK_DAYS.includes(restockIn)) continue;

    events.push({
      nurseryId: c.nursery_id,
      customerId: c.id,
      template: 'restock_reminder',
      lineUserId: c.line_id,
      payload: {
        nursery_id: c.nursery_id,
        customer_id: c.id,
        cycle_id: `restock-${new Date().toISOString().slice(0, 10)}-d${restockIn}`,
        days_until_restock: restockIn,
        last_d30: cycle?.d30 ?? null,
      },
    });
  }
  return events;
}

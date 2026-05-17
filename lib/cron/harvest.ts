import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import type { QueuedEvent } from '@/lib/cron/restock';

type DB = SupabaseClient<Database>;

/**
 * G4 — evaluate upcoming harvest windows. A customer is in the harvest window
 * when its cycle's `expected_harvest` is within the next 3 days. Same
 * notification-toggle + bound-line_id gating as restock. Returns events to
 * enqueue (route inserts once).
 */
export async function evaluateHarvestWindowQueue(
  supabase: DB
): Promise<QueuedEvent[]> {
  const { data: nurseries } = await supabase
    .from('notification_settings')
    .select('nursery_id, restock')
    .eq('restock', true);
  if (!nurseries || nurseries.length === 0) return [];
  const allowed = new Set(nurseries.map((n) => n.nursery_id));

  const now = Date.now();
  const horizon = now + 3 * 24 * 3600 * 1000;
  const events: QueuedEvent[] = [];

  const { data: customers } = await supabase
    .from('customers')
    .select(
      'id, nursery_id, line_id, customer_cycles(expected_harvest)'
    )
    .not('line_id', 'is', null);

  for (const c of customers ?? []) {
    if (!allowed.has(c.nursery_id)) continue;
    if (!c.line_id) continue;
    const cycle = Array.isArray(c.customer_cycles)
      ? c.customer_cycles[0]
      : c.customer_cycles;
    const harvest = cycle?.expected_harvest;
    if (!harvest) continue;
    const t = new Date(harvest).getTime();
    if (Number.isNaN(t) || t < now || t > horizon) continue;

    events.push({
      nurseryId: c.nursery_id,
      customerId: c.id,
      template: 'harvest_window',
      lineUserId: c.line_id,
      payload: {
        nursery_id: c.nursery_id,
        customer_id: c.id,
        cycle_id: `harvest-${harvest}`,
        harvest_date: harvest,
      },
    });
  }
  return events;
}

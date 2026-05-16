-- D3: extend cohort-broadcast idempotency to all broadcast templates.
-- Applied to live supabase-hatchery via apply_migration (band 023).
-- The 006 cycle-dedupe index only covers ('restock_reminder','harvest_window').
-- D3 also broadcasts 'new_batch_announcement' and 'promo'; without this a
-- repeat broadcast for those would duplicate rows. Same (customer_id,
-- template, payload->>'cycle_id') shape, scoped to the broadcast templates.
create unique index if not exists line_outbound_events_broadcast_dedupe_idx
  on public.line_outbound_events (customer_id, template, (payload->>'cycle_id'))
  where status in ('pending', 'sending', 'sent')
    and template in ('new_batch_announcement', 'promo');

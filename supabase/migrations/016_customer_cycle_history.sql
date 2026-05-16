-- 016_customer_cycle_history.sql
-- B3 (view-customer-detail-and-history): time-series table backing the
-- customer-detail D30 sparkline (up to 6 rows per customer). The existing
-- `customer_cycles` table stays the 1-row-per-customer snapshot; this is the
-- history series. `nursery_id` is denormalised so RLS can scope directly.
--
-- Migration band: 015 was consumed by the hatchery→nursery rename; 016 is the
-- next free band (see docs/temp-docs/MOCK-TO-PROD.md §0). Applied to the live
-- `supabase-hatchery` project via apply_migration.

create table if not exists public.customer_cycle_history (
  id uuid primary key default gen_random_uuid(),
  nursery_id uuid not null references public.nurseries(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  batch_id text references public.batches(id) on delete set null,
  started_at timestamptz not null,
  d30 numeric,
  d60 numeric,
  harvest text,
  created_at timestamptz not null default now()
);

create index if not exists customer_cycle_history_customer_idx
  on public.customer_cycle_history (customer_id, started_at desc);

alter table public.customer_cycle_history enable row level security;

create policy customer_cycle_history_sel on public.customer_cycle_history
  for select using (nursery_id in (select public.current_user_nursery_ids()));

create policy customer_cycle_history_ins on public.customer_cycle_history
  for insert with check (
    nursery_id in (select public.current_user_nursery_ids())
    and exists (
      select 1 from public.nursery_members m
      where m.nursery_id = customer_cycle_history.nursery_id
        and m.user_id = auth.uid()
        and m.role in ('owner','counter_staff')
    )
  );

create policy customer_cycle_history_upd on public.customer_cycle_history
  for update using (
    nursery_id in (select public.current_user_nursery_ids())
    and exists (
      select 1 from public.nursery_members m
      where m.nursery_id = customer_cycle_history.nursery_id
        and m.user_id = auth.uid()
        and m.role in ('owner','counter_staff')
    )
  );

revoke all on public.customer_cycle_history from anon;

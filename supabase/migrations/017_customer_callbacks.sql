-- 017_customer_callbacks.sql
-- B4 (schedule-a-callback): rep-initiated reminder to call a nursery operator
-- at a specific time. NOT a CRM activity log or ticketing system — a personal
-- reminder with a channel preference. INSERT gated to owner + counter_staff;
-- completion gated to the row creator OR an owner.
--
-- Migration band 017 (015 = rename, 016 = customer_cycle_history). Applied to
-- the live `supabase-hatchery` project via apply_migration.

create table if not exists public.customer_callbacks (
  id uuid primary key default gen_random_uuid(),
  nursery_id uuid not null references public.nurseries(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  scheduled_for timestamptz not null,
  channel text not null check (channel in ('call','line')),
  note text,
  created_by uuid not null references auth.users(id) on delete cascade,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists customer_callbacks_customer_idx
  on public.customer_callbacks (customer_id, scheduled_for);

alter table public.customer_callbacks enable row level security;

create policy customer_callbacks_sel on public.customer_callbacks
  for select using (nursery_id in (select public.current_user_nursery_ids()));

create policy customer_callbacks_ins on public.customer_callbacks
  for insert with check (
    nursery_id in (select public.current_user_nursery_ids())
    and exists (
      select 1 from public.nursery_members m
      where m.nursery_id = customer_callbacks.nursery_id
        and m.user_id = auth.uid()
        and m.role in ('owner','counter_staff')
    )
  );

create policy customer_callbacks_upd on public.customer_callbacks
  for update using (
    nursery_id in (select public.current_user_nursery_ids())
    and (
      created_by = auth.uid()
      or exists (
        select 1 from public.nursery_members m
        where m.nursery_id = customer_callbacks.nursery_id
          and m.user_id = auth.uid()
          and m.role = 'owner'
      )
    )
  );

revoke all on public.customer_callbacks from anon;

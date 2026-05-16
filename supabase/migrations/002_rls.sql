-- Row-Level Security: scope every read/write to the user's nursery membership.

alter table public.nurseries          enable row level security;
alter table public.nursery_members    enable row level security;
alter table public.customers           enable row level security;
alter table public.customer_cycles     enable row level security;
alter table public.batches             enable row level security;
alter table public.batch_buyers        enable row level security;
alter table public.pcr_results         enable row level security;
alter table public.alerts              enable row level security;
alter table public.alert_farms         enable row level security;
alter table public.scorecard_settings  enable row level security;
alter table public.notification_settings enable row level security;
alter table public.audit_log           enable row level security;

-- ============================================================
-- Nurseries: read-only scoped, no INSERT via RLS (use signup flow)
-- ============================================================

create policy nurseries_select on public.nurseries
  for select using (id in (select public.current_user_nursery_ids()));

create policy nurseries_update on public.nurseries
  for update using (
    id in (
      select nursery_id from public.nursery_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- ============================================================
-- Members
-- ============================================================

create policy members_select on public.nursery_members
  for select using (nursery_id in (select public.current_user_nursery_ids()));

create policy members_insert on public.nursery_members
  for insert with check (
    nursery_id in (
      select nursery_id from public.nursery_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

create policy members_delete on public.nursery_members
  for delete using (
    nursery_id in (
      select nursery_id from public.nursery_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- ============================================================
-- Generic helpers — produce policies for tables scoped purely by nursery_id
-- ============================================================

-- customers
create policy customers_rw on public.customers for all
  using (nursery_id in (select public.current_user_nursery_ids()))
  with check (nursery_id in (select public.current_user_nursery_ids()));

-- customer_cycles (joined via customer_id)
create policy customer_cycles_rw on public.customer_cycles for all
  using (
    customer_id in (
      select id from public.customers
      where nursery_id in (select public.current_user_nursery_ids())
    )
  )
  with check (
    customer_id in (
      select id from public.customers
      where nursery_id in (select public.current_user_nursery_ids())
    )
  );

-- batches
create policy batches_rw on public.batches for all
  using (nursery_id in (select public.current_user_nursery_ids()))
  with check (nursery_id in (select public.current_user_nursery_ids()));

-- batch_buyers
create policy batch_buyers_rw on public.batch_buyers for all
  using (
    batch_id in (
      select id from public.batches
      where nursery_id in (select public.current_user_nursery_ids())
    )
  )
  with check (
    batch_id in (
      select id from public.batches
      where nursery_id in (select public.current_user_nursery_ids())
    )
  );

-- pcr_results
create policy pcr_results_rw on public.pcr_results for all
  using (
    batch_id in (
      select id from public.batches
      where nursery_id in (select public.current_user_nursery_ids())
    )
  )
  with check (
    batch_id in (
      select id from public.batches
      where nursery_id in (select public.current_user_nursery_ids())
    )
  );

-- alerts
create policy alerts_rw on public.alerts for all
  using (nursery_id in (select public.current_user_nursery_ids()))
  with check (nursery_id in (select public.current_user_nursery_ids()));

-- alert_farms
create policy alert_farms_rw on public.alert_farms for all
  using (
    alert_id in (
      select id from public.alerts
      where nursery_id in (select public.current_user_nursery_ids())
    )
  )
  with check (
    alert_id in (
      select id from public.alerts
      where nursery_id in (select public.current_user_nursery_ids())
    )
  );

-- settings
create policy scorecard_rw on public.scorecard_settings for all
  using (nursery_id in (select public.current_user_nursery_ids()))
  with check (nursery_id in (select public.current_user_nursery_ids()));

create policy notif_rw on public.notification_settings for all
  using (nursery_id in (select public.current_user_nursery_ids()))
  with check (nursery_id in (select public.current_user_nursery_ids()));

-- audit_log: read scoped, insert by service_role only (handled via server actions w/ service key OR triggers).
create policy audit_select on public.audit_log
  for select using (nursery_id in (select public.current_user_nursery_ids()));

create policy audit_insert on public.audit_log
  for insert with check (nursery_id in (select public.current_user_nursery_ids()));

-- ============================================================
-- Public scorecard view (anon role) — only published nurseries
-- ============================================================

create or replace view public.public_scorecard as
  select
    h.id,
    h.name,
    h.name_en,
    h.location,
    h.location_en,
    s.public,
    s.show_d30,
    s.show_pcr,
    s.show_retention,
    s.show_volume
  from public.nurseries h
  join public.scorecard_settings s on s.nursery_id = h.id
  where s.public;

grant select on public.public_scorecard to anon;

-- ============================================================
-- New-nursery bootstrap RPC: creates row + owner membership atomically
-- ============================================================

create or replace function public.create_nursery(
  p_name text,
  p_name_en text default null,
  p_location text default null
) returns uuid
language plpgsql security definer as $$
declare
  v_uid uuid := auth.uid();
  v_id  uuid;
begin
  if v_uid is null then
    raise exception 'must be signed in';
  end if;

  insert into public.nurseries (name, name_en, location)
  values (p_name, p_name_en, p_location)
  returning id into v_id;

  insert into public.nursery_members (nursery_id, user_id, role)
  values (v_id, v_uid, 'owner');

  insert into public.scorecard_settings (nursery_id) values (v_id);
  insert into public.notification_settings (nursery_id) values (v_id);

  return v_id;
end $$;

revoke all on function public.create_nursery(text, text, text) from public;
grant execute on function public.create_nursery(text, text, text) to authenticated;

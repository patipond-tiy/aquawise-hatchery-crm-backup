-- E3: alert_resolutions — long-form audit row for a closed alert.
-- E4: alert_severity 'critical' enum value + alert_batches join.
-- Applied to live supabase-hatchery via apply_migration (band 021).
-- alert_resolutions coexists with alerts.closed_reason/closed_by/closed_at
-- (the denormalised one-line summary set at close time).
create table if not exists public.alert_resolutions (
  id         uuid primary key default gen_random_uuid(),
  alert_id   uuid not null references public.alerts(id) on delete cascade,
  note       text not null,
  actions    jsonb not null default '[]',
  closed_by  uuid not null references auth.users(id),
  closed_at  timestamptz not null default now()
);
create index if not exists alert_resolutions_alert_idx
  on public.alert_resolutions(alert_id);

alter table public.alert_resolutions enable row level security;

-- Nursery-scoped via the owning alert's nursery_id.
drop policy if exists alert_resolutions_select on public.alert_resolutions;
create policy alert_resolutions_select on public.alert_resolutions for select
  using (
    alert_id in (
      select id from public.alerts
      where nursery_id in (select public.current_user_nursery_ids())
    )
  );

drop policy if exists alert_resolutions_insert on public.alert_resolutions;
create policy alert_resolutions_insert on public.alert_resolutions for insert
  with check (
    alert_id in (
      select id from public.alerts
      where nursery_id in (select public.current_user_nursery_ids())
    )
  );

-- E4 Task 0: additive enum extension (safe — no existing rows use 'critical').
alter type public.alert_severity add value if not exists 'critical';

-- E4 Task 6: alert_batches join (alert <-> batch for Epic-K fan-out).
create table if not exists public.alert_batches (
  alert_id  uuid not null references public.alerts(id) on delete cascade,
  batch_id  text not null references public.batches(id) on delete cascade,
  primary key (alert_id, batch_id)
);

alter table public.alert_batches enable row level security;

drop policy if exists alert_batches_rw on public.alert_batches;
create policy alert_batches_rw on public.alert_batches for all
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

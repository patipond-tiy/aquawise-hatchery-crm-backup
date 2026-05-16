-- E2: D30-dip auto-alert rule engine.
-- Applied to live supabase-hatchery via apply_migration (band 022).
--
-- DOMAIN NOTE: The story's AC1 sources dips from a farm-side
-- `farm_cycle_metrics` table that does NOT exist in this DB (it requires the
-- farmer-side AquaWise app at 2027+ scale — see story E2 "Domain Framing").
-- That cross-chain ingestion path is the documented 2027+ blocker (⛔).
--
-- This migration ships the REAL rule engine against the nursery-side signal
-- that DOES exist today: `batch_buyers.d30` — the D30 survival each farm
-- customer reports back on the PL batch they bought. Same threshold logic,
-- real data, fully testable now. When `farm_cycle_metrics` lands, only the
-- row source changes; the threshold + dedupe logic is reused.
--
-- Thresholds (integer-percent scale, consistent with the app's `d30 < 70`
-- convention everywhere):
--   dip      = d30 < 70
--   severe   = d30 < 60
--   >=2 dips                    -> medium
--   >=3 dips OR any severe dip  -> high
-- De-dup: partial unique (batch_id, alert_kind, dip_week) — one auto-alert
-- per batch per ISO week. dip_week is an explicit IMMUTABLE-friendly column.

alter table public.alerts
  add column if not exists alert_kind text;
alter table public.alerts
  add column if not exists dip_week date;

create unique index if not exists alerts_d30_week_dedupe_idx
  on public.alerts (batch_id, alert_kind, dip_week)
  where alert_kind = 'd30_dip';

create or replace function public.run_d30_dip_alert_scan(p_nursery_id uuid)
returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  r            record;
  v_inserted   int := 0;
  v_alert_id   uuid;
  v_sev        public.alert_severity;
  v_title      text;
  v_week       date := date_trunc('week', now())::date;
begin
  for r in
    select
      bb.batch_id,
      b.source,
      count(*) filter (where bb.d30 is not null and bb.d30 < 70) as dip_count,
      bool_or(bb.d30 is not null and bb.d30 < 60)                as severe_dip
    from public.batch_buyers bb
    join public.batches b on b.id = bb.batch_id
    where b.nursery_id = p_nursery_id
    group by bb.batch_id, b.source
    having count(*) filter (where bb.d30 is not null and bb.d30 < 70) >= 2
        or bool_or(bb.d30 is not null and bb.d30 < 60)
  loop
    if r.dip_count >= 3 or r.severe_dip then
      v_sev := 'high';
    else
      v_sev := 'medium';
    end if;

    v_title := 'D30 ต่ำกว่าเป้าในล็อต ' || r.batch_id;

    insert into public.alerts
      (nursery_id, sev, title, description, batch_id, action,
       alert_kind, dip_week)
    values (
      p_nursery_id, v_sev, v_title,
      r.dip_count || ' ฟาร์มรายงาน D30 ต่ำกว่า 70% บนล็อต ' || r.batch_id
        || ' (' || coalesce(r.source,'') || ')',
      r.batch_id, 'ตรวจสอบล็อต', 'd30_dip', v_week
    )
    on conflict do nothing
    returning id into v_alert_id;

    if v_alert_id is not null then
      v_inserted := v_inserted + 1;
      insert into public.alert_farms (alert_id, customer_id)
      select v_alert_id, bb.customer_id
      from public.batch_buyers bb
      where bb.batch_id = r.batch_id
        and bb.d30 is not null and bb.d30 < 70
      on conflict do nothing;
      v_alert_id := null;
    end if;
  end loop;

  return v_inserted;
end;
$$;

revoke all on function public.run_d30_dip_alert_scan(uuid) from public, anon;

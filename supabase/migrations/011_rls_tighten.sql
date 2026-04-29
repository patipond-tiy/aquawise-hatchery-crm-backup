-- Tighten RLS policies to match 08-roles-and-rls.md.
--
-- Migration 007 deliberately preserved old behaviour when renaming the role
-- enum: policies that admitted 'admin' became policies that admit
-- 'counter_staff'. The spec (08-roles-and-rls.md) calls for stricter
-- owner-only on a few of these. With the role enum stable we tighten now
-- so subsequent code can rely on the spec's permission model.
--
-- Spec references (08-roles-and-rls.md):
--   hatcheries.update     — `owner` only        (per-table policies row 1)
--   hatchery_members.*    — `owner` only        (per-table policies row 2)
--   subscriptions.select  — `owner` only        (per-table policies, line 80)
--
-- hatchery_brand stays at hatchery-membership scope because counter_staff
-- legitimately need to update brand assets day-to-day (per persona docs).
-- Tighten that separately if a future story requires it.

-- ============================================================
-- hatcheries: owner only for UPDATE
-- ============================================================

drop policy if exists hatcheries_update on public.hatcheries;
create policy hatcheries_update on public.hatcheries
  for update using (
    id in (
      select hatchery_id from public.hatchery_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- ============================================================
-- hatchery_members: owner only for INSERT and DELETE
-- ============================================================

drop policy if exists members_insert on public.hatchery_members;
create policy members_insert on public.hatchery_members
  for insert with check (
    hatchery_id in (
      select hatchery_id from public.hatchery_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

drop policy if exists members_delete on public.hatchery_members;
create policy members_delete on public.hatchery_members
  for delete using (
    hatchery_id in (
      select hatchery_id from public.hatchery_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- ============================================================
-- subscription_events: owner only for SELECT
-- ============================================================

drop policy if exists subscription_events_select on public.subscription_events;
create policy subscription_events_select on public.subscription_events
  for select using (
    hatchery_id in (
      select hatchery_id from public.hatchery_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

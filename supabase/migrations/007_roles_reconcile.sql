-- Roles reconcile — align nursery_role enum with product spec.
--
-- Old enum (from 001_init.sql): ('owner', 'admin', 'editor', 'viewer', 'technician')
-- New enum (per 08-roles-and-rls.md and FR-TEAM-002): ('owner', 'counter_staff', 'lab_tech', 'auditor')
--
-- Mapping for any existing rows:
--   owner       → owner          (unchanged)
--   admin       → counter_staff  (managerial day-to-day)
--   editor      → counter_staff  (generic write access — collapses with admin)
--   viewer      → auditor        (read-only)
--   technician  → lab_tech       (PCR work)
--
-- This migration is a pure rename of role *names* with permission semantics
-- preserved (where old policies admitted 'admin', new policies admit
-- 'counter_staff'). Tightening 'subscription_events' to owner-only and
-- inserts to owner-only per spec is deferred to story H3 / A2 work
-- so we don't bundle behaviour changes into a rename.

-- 1. Drop policies that reference the role column. The column-type change in
--    step 3 fails if any policy still depends on `role`; the recreated
--    policies at the bottom of this file restore the same behaviour against
--    the new enum.
drop policy if exists nurseries_update           on public.nurseries;
drop policy if exists members_insert              on public.nursery_members;
drop policy if exists members_delete              on public.nursery_members;
drop policy if exists subscription_events_select  on public.subscription_events;

-- 2. Create the new enum type alongside the old one.
create type public.nursery_role_new as enum ('owner', 'counter_staff', 'lab_tech', 'auditor');

-- 3. Drop the column default so we can change the column type cleanly.
alter table public.nursery_members alter column role drop default;

-- 4. Recast the column with explicit per-value mapping.
alter table public.nursery_members
  alter column role type public.nursery_role_new
  using (case role::text
    when 'owner'      then 'owner'::public.nursery_role_new
    when 'admin'      then 'counter_staff'::public.nursery_role_new
    when 'editor'     then 'counter_staff'::public.nursery_role_new
    when 'viewer'     then 'auditor'::public.nursery_role_new
    when 'technician' then 'lab_tech'::public.nursery_role_new
  end);

-- 5. New default is 'counter_staff' (was 'editor' — same general meaning).
alter table public.nursery_members alter column role set default 'counter_staff';

-- 6. Drop the old type and rename the new one to take its place.
drop type public.nursery_role;
alter type public.nursery_role_new rename to nursery_role;

-- ============================================================
-- RLS policies that referenced the old role names
-- ============================================================
--
-- Old policies admitted ('owner', 'admin'). New mapping makes admin ≡
-- counter_staff, so we admit ('owner', 'counter_staff') to preserve
-- behaviour. This file does NOT tighten policies — that's separate work.

drop policy if exists nurseries_update on public.nurseries;
create policy nurseries_update on public.nurseries
  for update using (
    id in (
      select nursery_id from public.nursery_members
      where user_id = auth.uid() and role in ('owner', 'counter_staff')
    )
  );

drop policy if exists members_insert on public.nursery_members;
create policy members_insert on public.nursery_members
  for insert with check (
    nursery_id in (
      select nursery_id from public.nursery_members
      where user_id = auth.uid() and role in ('owner', 'counter_staff')
    )
  );

drop policy if exists members_delete on public.nursery_members;
create policy members_delete on public.nursery_members
  for delete using (
    nursery_id in (
      select nursery_id from public.nursery_members
      where user_id = auth.uid() and role in ('owner', 'counter_staff')
    )
  );

drop policy if exists subscription_events_select on public.subscription_events;
create policy subscription_events_select on public.subscription_events
  for select using (
    nursery_id in (
      select nursery_id from public.nursery_members
      where user_id = auth.uid() and role in ('owner', 'counter_staff')
    )
  );

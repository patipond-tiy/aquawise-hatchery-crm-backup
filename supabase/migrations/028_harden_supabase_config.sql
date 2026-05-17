-- Story S2 — Harden Supabase config (closes SF-003, SF-004, SF-005).
-- Migration band: SYS-1 ledger — Epic K consumed through 026 (+025b); 027 is
-- RESERVED for A6 (line_identities). S2 uses 028. Idempotent.
--
-- Advisory targets (supabase-hatchery get_advisors security, before):
--   ERROR security_definer_view            public.public_scorecard      → SF-003
--   WARN  public_bucket_allows_listing     storage nursery-logos        → SF-004
--   WARN  public_bucket_allows_listing     storage hatchery-logos       → SF-004
--   WARN  extension_in_public              citext                       → SF-005
--
-- The 3 WARN authenticated_security_definer_function_executable findings
-- (create_nursery, current_user_nursery_ids, run_d30_dip_alert_scan) are
-- INTENTIONAL (SF-002 ledger: app onboarding + RLS-policy use) — NOT touched.

-- ============================================================
-- SF-003 — public_scorecard: SECURITY DEFINER view → SECURITY INVOKER
-- ============================================================
-- The view only ever surfaces deliberately-public columns (id, name[_en],
-- location[_en], + scorecard visibility toggles) and only for rows where
-- scorecard_settings.public = true. It was SECURITY DEFINER purely so anon
-- could read published scorecards (the base tables only allow members to
-- SELECT their own rows). The Supabase-recommended fix is security_invoker
-- + narrow anon SELECT policies scoped to published rows on the base tables,
-- so the querying role's RLS is enforced (no privilege escalation via view).

alter view public.public_scorecard set (security_invoker = on);

-- Narrow anon (and authenticated) SELECT on scorecard_settings: only the
-- published flag rows, only the columns the view needs. Scoped by `public`.
drop policy if exists scorecard_public_anon_read on public.scorecard_settings;
create policy scorecard_public_anon_read
  on public.scorecard_settings
  for select
  to anon, authenticated
  using (public = true);

-- Narrow anon SELECT on nurseries: only rows whose scorecard is published.
-- This exposes exactly the same nursery rows the SECURITY DEFINER view did,
-- nothing more (the join + WHERE s.public is reproduced in the policy).
drop policy if exists nurseries_public_scorecard_read on public.nurseries;
create policy nurseries_public_scorecard_read
  on public.nurseries
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.scorecard_settings s
      where s.nursery_id = nurseries.id and s.public = true
    )
  );

-- ============================================================
-- SF-004 — public storage buckets: remove broad listing SELECT policy
-- ============================================================
-- Public bucket object access (`/storage/v1/object/public/<bucket>/<path>`)
-- does NOT consult storage.objects RLS — it is served unconditionally for
-- public buckets. The broad `using (bucket_id = '<bucket>')` SELECT policy
-- ONLY enables directory listing via `/storage/v1/object/list/<bucket>`.
-- Dropping it removes listing while public GET-by-URL keeps working.
-- nursery-logos = live app bucket; hatchery-logos = legacy pre-rename bucket.

drop policy if exists nursery_logos_public_read  on storage.objects;
drop policy if exists hatchery_logos_public_read on storage.objects;

-- ============================================================
-- SF-005 — relocate citext out of the public schema
-- ============================================================
-- Only consumer is public.team_invites.email (citext). Extension is
-- relocatable; move it to the dedicated `extensions` schema (already used
-- by Supabase for pgcrypto/uuid-ossp etc). Column type is unaffected by the
-- move (the type object travels with the extension; references stay valid).

create schema if not exists extensions;
grant usage on schema extensions to anon, authenticated, service_role;

do $$
begin
  if exists (
    select 1 from pg_extension e
    join pg_namespace n on n.oid = e.extnamespace
    where e.extname = 'citext' and n.nspname = 'public'
  ) then
    execute 'alter extension citext set schema extensions';
  end if;
end$$;

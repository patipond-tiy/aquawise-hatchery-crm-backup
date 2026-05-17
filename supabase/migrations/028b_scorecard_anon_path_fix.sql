-- Story S2 (follow-up to 028) — make the SECURITY INVOKER public_scorecard
-- view actually readable by anon.
--
-- Problem: 028 flipped public.public_scorecard to security_invoker (closes
-- SF-003). With an invoker view, anon now evaluates the *base table* RLS on
-- public.nurseries + public.scorecard_settings. Those tables still carry the
-- member-scoped policies `hatcheries_select` / `scorecard_rw` (role `public`)
-- whose USING expression calls public.current_user_nursery_ids(). SF-002
-- (mig 013/014) deliberately REVOKEd EXECUTE on that function from anon, so
-- evaluating that policy for an anon request raises:
--   ERROR 42501: permission denied for function current_user_nursery_ids
-- which makes the whole public_scorecard SELECT fail for anon.
--
-- Fix: scope ONLY the member policies on these two view-backing tables to
-- the `authenticated` role. anon was never meant to satisfy a member policy
-- (it has no tenant); restricting the role means anon only evaluates the
-- function-free `*_public_scorecard_read` policies added in 028, so the
-- public scorecard works again. The other ~30 member policies on other
-- tables are NOT touched (out of scope; no anon path reaches them).
--
-- Recreating each policy with `TO authenticated` and the identical USING
-- expression keeps signed-in behaviour byte-identical. Idempotent.

-- nurseries.hatcheries_select  (member read; was role public)
drop policy if exists hatcheries_select on public.nurseries;
create policy hatcheries_select
  on public.nurseries
  for select
  to authenticated
  using (id in (select public.current_user_nursery_ids()));

-- scorecard_settings.scorecard_rw  (member ALL; was role public)
drop policy if exists scorecard_rw on public.scorecard_settings;
create policy scorecard_rw
  on public.scorecard_settings
  for all
  to authenticated
  using (nursery_id in (select public.current_user_nursery_ids()))
  with check (nursery_id in (select public.current_user_nursery_ids()));

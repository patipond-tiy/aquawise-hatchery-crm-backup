-- 013_db_hardening.sql
-- Non-breaking DB hardening from the WS1 security audit (umbrella
-- docs/temp-docs/SECURITY-FINDINGS.md: NC-11, NC-12, NC-13, NC-20).
--
-- 1. SECURITY DEFINER helper/onboarding functions must not be callable by the
--    anon role. They are only legitimately invoked from authenticated paths
--    (lib/auth/bootstrap.ts after exchangeCodeForSession). REVOKE is safe:
--    authenticated callers retain access via PUBLIC/role grants.
-- 2. Lock search_path on SECURITY DEFINER functions (search_path injection).
--
-- Guarded with to_regprocedure so the migration is idempotent and tolerant of
-- absent/renamed signatures (no-op rather than error).

do $$
begin
  if to_regprocedure('public.create_hatchery(text,text,text)') is not null then
    execute 'revoke execute on function public.create_hatchery(text,text,text) from anon';
    execute 'alter function public.create_hatchery(text,text,text) set search_path = public, pg_temp';
  end if;

  if to_regprocedure('public.current_user_hatchery_ids()') is not null then
    execute 'revoke execute on function public.current_user_hatchery_ids() from anon';
    execute 'alter function public.current_user_hatchery_ids() set search_path = public, pg_temp';
  end if;

  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from anon, authenticated';
    execute 'alter function public.rls_auto_enable() set search_path = public, pg_temp';
  end if;
end $$;

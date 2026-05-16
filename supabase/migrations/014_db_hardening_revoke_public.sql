-- 014_db_hardening_revoke_public.sql
-- Follow-up to 013. The anon exposure of current_user_hatchery_ids() and
-- rls_auto_enable() persisted because EXECUTE is granted via PUBLIC (not a
-- direct anon grant). REVOKE FROM anon is a no-op when PUBLIC still holds it.
--
-- Fix: revoke from PUBLIC entirely, then re-grant only the roles that
-- legitimately need it:
--   * current_user_hatchery_ids()  -> authenticated (used inside RLS policy
--     expressions evaluated for signed-in users; anon never has a tenant).
--   * rls_auto_enable()            -> nobody (DDL helper; service-role/postgres
--     bypass grants via BYPASSRLS/superuser, so no app role needs EXECUTE).
--   * create_hatchery(...)         -> authenticated only (onboarding, post-auth).
--
-- Net effect: anon loses RPC access to all three (closes advisor 0028);
-- authenticated retains exactly what the app uses. Non-breaking.

do $$
begin
  if to_regprocedure('public.current_user_hatchery_ids()') is not null then
    execute 'revoke execute on function public.current_user_hatchery_ids() from public';
    execute 'grant execute on function public.current_user_hatchery_ids() to authenticated';
  end if;

  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public';
  end if;

  if to_regprocedure('public.create_hatchery(text,text,text)') is not null then
    execute 'revoke execute on function public.create_hatchery(text,text,text) from public';
    execute 'grant execute on function public.create_hatchery(text,text,text) to authenticated';
  end if;
end $$;

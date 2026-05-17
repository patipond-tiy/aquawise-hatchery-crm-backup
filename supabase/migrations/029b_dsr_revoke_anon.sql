-- Story S7 (follow-up to 029) — close the anon-exposure advisor on the two
-- DSR SECURITY DEFINER RPCs. Identical mechanism to SF-002's 014: the 029
-- `revoke … from public; grant … to authenticated` left `anon` able to call
-- the function via PostgREST because EXECUTE is held through the PUBLIC
-- default grant, not a direct `public`-role grant — REVOKE FROM <role>
-- public is a no-op while PUBLIC still holds it.
--
-- Fix: revoke from PUBLIC entirely, then re-grant ONLY `authenticated`
-- (the DSR routes always run with a real user session — anon never has a
-- subject to export/erase). Net: advisor 0028 (anon) cleared; advisor 0029
-- (authenticated) remains and is INTENTIONAL — the self-service DSR
-- endpoints MUST be callable by the signed-in subject (DSR-SPEC §3),
-- exactly like create_nursery / current_user_nursery_ids (SF-002 ledger).
-- search_path already locked in 029.

do $$
begin
  if to_regprocedure('public.dsr_rate_check(text)') is not null then
    execute 'revoke execute on function public.dsr_rate_check(text) from public';
    execute 'revoke execute on function public.dsr_rate_check(text) from anon';
    execute 'grant execute on function public.dsr_rate_check(text) to authenticated';
  end if;

  if to_regprocedure('public.dsr_anonymize_user(uuid)') is not null then
    execute 'revoke execute on function public.dsr_anonymize_user(uuid) from public';
    execute 'revoke execute on function public.dsr_anonymize_user(uuid) from anon';
    execute 'grant execute on function public.dsr_anonymize_user(uuid) to authenticated';
  end if;
end $$;

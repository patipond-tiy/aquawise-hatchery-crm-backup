-- Story S7 — PDPA Data Subject Request (DSR) support.
-- Band 029 (027 reserved A6; 028/028b = S2). Conforms to
-- docs/aquawise-updated-docs/DSR-SPEC.md (READ-ONLY mirror).
--
-- Schema reality (important — diverges from S7 AC#5's assumption):
--   * `customers` has NO `created_by`/owner column — customer rows are the
--     NURSERY's business data, scoped only by `nursery_id`. They are a
--     SEPARATE data subject (the farm) per DSR-SPEC §2, not the operator's
--     personal data, so an *operator* DSR must NOT blanket-anonymize the
--     nursery's customer book (that would destroy business data and is not
--     what PDPA §33 requires for the operator subject).
--   * The authenticated DSR subject in nursery-crm is a NURSERY OPERATOR
--     (auth.users row). Their personal data here = `nursery_members`
--     (membership), `team_invites.created_by` (invites they sent),
--     `customer_callbacks.created_by` + the free-text `note` they authored,
--     and `audit_log` actor attribution.
--   * Financial rows (`subscription_events`) + `audit_log` are RETAINED
--     (Thai Revenue 7y / accountability) per DSR-SPEC §4.
--
-- The anonymization is a SECURITY DEFINER RPC so the policy decisions live
-- in the migration, not app code; EXECUTE granted to `authenticated` only,
-- search_path locked (SF-002 hardening pattern).

-- ---- rate-limit ledger (DSR-SPEC §5: 5 / subject / 24h) -----------------
create table if not exists public.dsr_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  kind        text not null check (kind in ('export', 'delete')),
  created_at  timestamptz not null default now()
);

create index if not exists dsr_requests_user_time_idx
  on public.dsr_requests (user_id, created_at desc);

alter table public.dsr_requests enable row level security;

-- A subject may read only their own DSR ledger; inserts go through the
-- SECURITY DEFINER RPC (or the service path), never raw from the client.
drop policy if exists dsr_requests_own_select on public.dsr_requests;
create policy dsr_requests_own_select
  on public.dsr_requests
  for select
  to authenticated
  using (user_id = auth.uid());

-- ---- rate-limit check + record (atomic) ---------------------------------
-- Returns true if the request is allowed (and records it), false if the
-- subject has already made 5 DSRs in the trailing 24h. SECURITY DEFINER so
-- it can write the ledger row regardless of the (restrictive) RLS above.
create or replace function public.dsr_rate_check(p_kind text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_count int;
begin
  if v_uid is null then
    raise exception 'unauthenticated';
  end if;
  if p_kind not in ('export', 'delete') then
    raise exception 'invalid kind';
  end if;

  select count(*) into v_count
  from public.dsr_requests
  where user_id = v_uid
    and created_at > now() - interval '24 hours';

  if v_count >= 5 then
    return false;
  end if;

  insert into public.dsr_requests (user_id, kind) values (v_uid, p_kind);
  return true;
end;
$$;

revoke execute on function public.dsr_rate_check(text) from public;
grant execute on function public.dsr_rate_check(text) to authenticated;

-- ---- erasure RPC (DSR-SPEC §3.2 / §4) -----------------------------------
-- Anonymizes the calling subject's personal data IN THIS REPO:
--   * customer_callbacks.note  → NULL  (subject-authored free text) where
--     they are the author (created_by = subject)
--   * team_invites the subject created that are still pending → deleted
--     (an unconsumed invite carries the invitee email = third-party PII the
--     subject caused to be stored; pending invites have no legal basis to
--     retain post-erasure)
--   * audit_log  → RETAINED (immutable, accountability — DSR-SPEC §4); the
--     row is NOT mutated. UI/export render the actor as `redacted`.
--   * subscription_events / financial → UNTOUCHED (DSR-SPEC §4 carve-out).
-- The subject's auth.users identity + nursery_members are removed by the
-- caller path (membership delete + admin auth deletion is out of a plain
-- RPC's safe scope); this RPC owns the in-schema PII scrub only.
create or replace function public.dsr_anonymize_user(p_user uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_callbacks int := 0;
  v_invites   int := 0;
begin
  if p_user is null then
    raise exception 'p_user required';
  end if;
  -- A subject may only anonymize THEMSELVES (defence in depth — the route
  -- also checks; this prevents an authenticated user passing someone else's
  -- uid). auth.uid() is null for the service path, which is allowed.
  if auth.uid() is not null and auth.uid() <> p_user then
    raise exception 'may only anonymize self';
  end if;

  update public.customer_callbacks
     set note = null
   where created_by = p_user and note is not null;
  get diagnostics v_callbacks = row_count;

  delete from public.team_invites
   where created_by = p_user and accepted_at is null;
  get diagnostics v_invites = row_count;

  return jsonb_build_object(
    'anonymized_at', now(),
    'tables_affected', jsonb_build_array('customer_callbacks', 'team_invites'),
    'customer_callbacks_notes_cleared', v_callbacks,
    'pending_team_invites_deleted', v_invites,
    'tables_retained_for_legal_reason',
      jsonb_build_array('audit_log', 'subscription_events')
  );
end;
$$;

revoke execute on function public.dsr_anonymize_user(uuid) from public;
grant execute on function public.dsr_anonymize_user(uuid) to authenticated;

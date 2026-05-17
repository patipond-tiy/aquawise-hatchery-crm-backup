-- Story A6 — Social sign-in (Google + LINE).
--
-- LINE has no native Supabase Auth provider, so LINE Login is bridged via a
-- custom OIDC callback Route Handler (app/auth/line/callback/route.ts) that
-- resolves/creates the auth.users row server-side (DECISIONS.md D-007). This
-- table maps a verified LINE `sub` (OpenID subject) to that auth user so a
-- returning LINE sign-in is idempotent and never bootstraps a 2nd workspace.
--
-- Migration band: A6 owns 027 (Epic K consumed 025/026; 028+ taken by Epic S).
--
-- RLS: a row is readable only by its own user (user_id = auth.uid()). There is
-- NO end-user INSERT/UPDATE/DELETE policy — every write happens through the
-- service-role bridge inside the callback Route Handler, which bypasses RLS by
-- design (D-007 condition 1). This matches the §14 service-role discipline.

create table if not exists public.line_identities (
  user_id       uuid primary key
                  references auth.users(id) on delete cascade,
  line_sub      text not null unique,
  email_at_link text,
  display_name  text,
  created_at    timestamptz not null default now()
);

comment on table public.line_identities is
  'A6: maps a verified LINE OpenID `sub` to an auth.users row. Writes are '
  'service-role-only via the /auth/line/callback bridge (D-007). RLS: own row '
  'readable by its user; no end-user write policy.';

alter table public.line_identities enable row level security;

-- SELECT: a user may read only their own identity row.
drop policy if exists line_identities_select_own on public.line_identities;
create policy line_identities_select_own
  on public.line_identities
  for select
  to authenticated
  using (user_id = auth.uid());

-- No INSERT / UPDATE / DELETE policy: the service-role bridge is the only
-- writer (it bypasses RLS). Revoke the broad table grants the `authenticated`
-- and `anon` roles get by default so the absence of a policy is fully
-- defence-in-depth (mirrors 014_db_hardening_revoke_public.sql).
revoke all on table public.line_identities from anon;
revoke all on table public.line_identities from authenticated;
grant select on table public.line_identities to authenticated;

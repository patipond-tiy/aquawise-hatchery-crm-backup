-- Team invites: owner-issued, token-based, 7-day expiry.

create extension if not exists "citext";

create table public.team_invites (
  id          uuid primary key default gen_random_uuid(),
  hatchery_id uuid not null references public.hatcheries(id) on delete cascade,
  email       citext not null,
  role        public.hatchery_role not null,
  token       text not null unique,
  created_by  uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz
);

create index team_invites_hatchery_idx on public.team_invites(hatchery_id);
create index team_invites_token_idx    on public.team_invites(token);

alter table public.team_invites enable row level security;

-- Owner-only: all operations scoped to their hatchery.
create policy team_invites_all on public.team_invites for all
  using (
    hatchery_id in (
      select hatchery_id from public.hatchery_members
      where user_id = auth.uid() and role = 'owner'
    )
  )
  with check (
    hatchery_id in (
      select hatchery_id from public.hatchery_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

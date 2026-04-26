-- AquaWise Hatchery CRM — initial schema
-- Multi-tenant: every domain table carries `hatchery_id` for RLS scoping.
-- Stable ULIDs would be nicer than gen_random_uuid() but the latter ships in pgcrypto by default.

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ============================================================
-- Hatcheries (tenants) and members
-- ============================================================

create table public.hatcheries (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  name_en         text,
  location        text,
  location_en     text,
  registration_no text,
  plan            text not null default 'pro',
  created_at      timestamptz not null default now()
);

create type public.hatchery_role as enum ('owner', 'admin', 'editor', 'viewer', 'technician');

create table public.hatchery_members (
  hatchery_id  uuid not null references public.hatcheries(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         public.hatchery_role not null default 'editor',
  created_at   timestamptz not null default now(),
  primary key (hatchery_id, user_id)
);

create index hatchery_members_user_idx on public.hatchery_members(user_id);

-- Helper: hatcheries the calling user can see.
create or replace function public.current_user_hatchery_ids()
returns setof uuid language sql security definer stable as $$
  select hatchery_id from public.hatchery_members where user_id = auth.uid();
$$;

-- ============================================================
-- Customers (farms)
-- ============================================================

create type public.customer_status as enum ('active', 'restock-soon', 'restock-now', 'concern', 'quiet');

create table public.customers (
  id           uuid primary key default gen_random_uuid(),
  hatchery_id  uuid not null references public.hatcheries(id) on delete cascade,
  name         text not null,
  farm         text not null,
  farm_en      text,
  phone        text,
  line_id      text,
  zone         text,
  address      text,
  status       public.customer_status not null default 'active',
  ltv          bigint not null default 0,
  last_buy     date,
  created_at   timestamptz not null default now()
);

create index customers_hatchery_idx on public.customers(hatchery_id);

-- Current cycle snapshot per customer (denormalised for read speed; updated by triggers / jobs).
create table public.customer_cycles (
  customer_id     uuid primary key references public.customers(id) on delete cascade,
  cycle_day       int,
  expected_harvest date,
  d30             int,
  d60             int,
  restock_in      int,
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- Batches
-- ============================================================

create type public.pcr_status as enum ('clean', 'flagged', 'pending');

create table public.batches (
  id           text primary key,            -- human-readable id like B-2604-A
  hatchery_id  uuid not null references public.hatcheries(id) on delete cascade,
  source       text not null,
  pl_produced  bigint not null default 0,
  pl_sold      bigint not null default 0,
  date         date not null,
  pcr          public.pcr_status not null default 'pending',
  mean_d30     int,
  dist         jsonb not null default '[0,0,0,0,0,0,0,0,0,0]'::jsonb,
  created_at   timestamptz not null default now()
);

create index batches_hatchery_idx on public.batches(hatchery_id);

create table public.batch_buyers (
  batch_id     text not null references public.batches(id) on delete cascade,
  customer_id  uuid not null references public.customers(id) on delete cascade,
  pl_purchased bigint not null default 0,
  d30          int,
  created_at   timestamptz not null default now(),
  primary key (batch_id, customer_id)
);

create table public.pcr_results (
  id          uuid primary key default gen_random_uuid(),
  batch_id    text not null references public.batches(id) on delete cascade,
  disease     text not null,                -- WSSV, EHP, IHHNV, TSV
  status      text not null,                -- pass, flagged
  lab         text,
  tested_on   date,
  file_url    text,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- Alerts
-- ============================================================

create type public.alert_severity as enum ('high', 'medium', 'low');

create table public.alerts (
  id              uuid primary key default gen_random_uuid(),
  hatchery_id     uuid not null references public.hatcheries(id) on delete cascade,
  sev             public.alert_severity not null,
  title           text not null,
  description     text,
  batch_id        text references public.batches(id) on delete set null,
  action          text,
  closed          boolean not null default false,
  closed_reason   text,
  closed_by       uuid references auth.users(id),
  closed_at       timestamptz,
  created_at      timestamptz not null default now()
);

create index alerts_hatchery_idx on public.alerts(hatchery_id);
create index alerts_open_idx on public.alerts(hatchery_id, closed) where not closed;

create table public.alert_farms (
  alert_id     uuid not null references public.alerts(id) on delete cascade,
  customer_id  uuid not null references public.customers(id) on delete cascade,
  primary key (alert_id, customer_id)
);

-- ============================================================
-- Settings (per hatchery)
-- ============================================================

create table public.scorecard_settings (
  hatchery_id    uuid primary key references public.hatcheries(id) on delete cascade,
  public         boolean not null default true,
  show_d30       boolean not null default true,
  show_pcr       boolean not null default true,
  show_retention boolean not null default true,
  show_volume    boolean not null default true,
  show_reviews   boolean not null default false,
  updated_at     timestamptz not null default now()
);

create table public.notification_settings (
  hatchery_id  uuid primary key references public.hatcheries(id) on delete cascade,
  restock      boolean not null default true,
  low_d30      boolean not null default true,
  disease      boolean not null default true,
  line_reply   boolean not null default false,
  weekly       boolean not null default true,
  price_move   boolean not null default true,
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- Audit log
-- ============================================================

create table public.audit_log (
  id           bigserial primary key,
  hatchery_id  uuid not null references public.hatcheries(id) on delete cascade,
  user_id      uuid references auth.users(id) on delete set null,
  action       text not null,
  payload      jsonb,
  created_at   timestamptz not null default now()
);

create index audit_log_hatchery_idx on public.audit_log(hatchery_id, created_at desc);

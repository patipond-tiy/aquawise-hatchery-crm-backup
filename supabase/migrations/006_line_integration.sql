-- LINE × Hatchery-CRM integration — Phase 1: identity bind + outbound push.
-- Adds three tables. Strictly additive; no changes to existing schema.
-- Companion: docs/line-integration-strategy.md

-- ============================================================
-- Hatchery brand (per-tenant logo + color for co-branded Flex headers)
-- ============================================================

create table public.hatchery_brand (
  hatchery_id      uuid primary key references public.hatcheries(id) on delete cascade,
  display_name_th  text not null,
  display_name_en  text not null,
  logo_url         text,
  brand_color      text not null default '#1F6FEB',
  updated_at       timestamptz not null default now()
);

-- ============================================================
-- Customer bind tokens (one-shot LIFF bind links)
-- ============================================================

create table public.customer_bind_tokens (
  token                   text primary key,                 -- ULID, 26 chars
  hatchery_id             uuid not null references public.hatcheries(id) on delete cascade,
  customer_id             uuid not null references public.customers(id) on delete cascade,
  created_by              uuid not null references auth.users(id) on delete cascade,
  created_at              timestamptz not null default now(),
  expires_at              timestamptz not null,
  consumed_at             timestamptz,
  consumed_line_user_id   text
);

create index customer_bind_tokens_hatchery_idx on public.customer_bind_tokens(hatchery_id, customer_id);
create index customer_bind_tokens_open_idx on public.customer_bind_tokens(expires_at) where consumed_at is null;

-- ============================================================
-- Outbound LINE events (CRM → bot worker → LINE push API)
-- ============================================================

create type public.line_event_status as enum ('pending', 'sending', 'sent', 'failed', 'dead');
create type public.line_event_kind   as enum ('template_push', 'chat_nudge');

create table public.line_outbound_events (
  id              uuid primary key default gen_random_uuid(),
  hatchery_id     uuid not null references public.hatcheries(id) on delete cascade,
  customer_id     uuid not null references public.customers(id) on delete cascade,
  line_user_id    text not null,
  kind            public.line_event_kind not null default 'template_push',
  template        text not null,                            -- e.g. 'larvae_ready', 'chat_nudge'
  payload         jsonb not null,
  status          public.line_event_status not null default 'pending',
  attempts        int not null default 0,
  last_error      text,
  scheduled_for   timestamptz not null default now(),
  sent_at         timestamptz,
  created_at      timestamptz not null default now(),
  created_by      uuid references auth.users(id) on delete set null
);

create index line_outbound_events_hatchery_idx on public.line_outbound_events(hatchery_id, created_at desc);
create index line_outbound_events_dispatch_idx on public.line_outbound_events(status, scheduled_for) where status in ('pending', 'failed');

-- Idempotency for cron-driven templates: one pending/sent event per (customer, template, cycle).
create unique index line_outbound_events_cycle_dedupe_idx
  on public.line_outbound_events (customer_id, template, (payload->>'cycle_id'))
  where status in ('pending', 'sending', 'sent')
    and template in ('restock_reminder', 'harvest_window');

-- Idempotency for disease alerts: one pending/sent event per (customer, alert).
create unique index line_outbound_events_alert_dedupe_idx
  on public.line_outbound_events (customer_id, (payload->>'alert_id'))
  where status in ('pending', 'sending', 'sent')
    and template = 'disease_alert';

-- ============================================================
-- Row-Level Security
-- ============================================================

alter table public.hatchery_brand          enable row level security;
alter table public.customer_bind_tokens    enable row level security;
alter table public.line_outbound_events    enable row level security;

-- hatchery_brand: scoped by hatchery membership
create policy hatchery_brand_rw on public.hatchery_brand for all
  using (hatchery_id in (select public.current_user_hatchery_ids()))
  with check (hatchery_id in (select public.current_user_hatchery_ids()));

-- customer_bind_tokens: hatchery staff can mint + read; consumption happens via service-role from the LIFF bind endpoint.
create policy customer_bind_tokens_rw on public.customer_bind_tokens for all
  using (hatchery_id in (select public.current_user_hatchery_ids()))
  with check (hatchery_id in (select public.current_user_hatchery_ids()));

-- line_outbound_events:
--   * hatchery staff INSERT + SELECT for their hatchery
--   * status transitions (sending/sent/failed/dead) happen via service-role from the bot worker
create policy line_outbound_events_select on public.line_outbound_events
  for select using (hatchery_id in (select public.current_user_hatchery_ids()));

create policy line_outbound_events_insert on public.line_outbound_events
  for insert with check (hatchery_id in (select public.current_user_hatchery_ids()));

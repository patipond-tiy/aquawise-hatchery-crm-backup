-- WS2 Epic G + H — LINE messaging + Settings/ops production tables.
-- Strictly additive. Migration band 024 (020–023 used by Epic D/E).
--
-- Adds:
--   * line_users          (G1 consume — LINE profile per bound customer)
--   * chat_threads        (G1 consume — schema placeholder for H3 two-way chat)
--   * line_message_logs   (G3p — inbound farmer-reply log; not surfaced in CRM)
--   * notification_settings.quiet_hours_start/end  (H4)
--   * line_outbound_events.is_manual               (H4 — manual rep sends bypass quiet hours)
--   * data_exports        (H2 — export audit trail)

-- ============================================================
-- G1 — line_users (LINE profile, upserted on bind consume)
-- ============================================================

create table if not exists public.line_users (
  line_user_id  text primary key,
  nursery_id    uuid not null references public.nurseries(id) on delete cascade,
  customer_id   uuid references public.customers(id) on delete set null,
  display_name  text,
  picture_url   text,
  status_message text,
  last_seen_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists line_users_nursery_idx on public.line_users(nursery_id);
create index if not exists line_users_customer_idx on public.line_users(customer_id);

-- ============================================================
-- G1 — chat_threads (schema placeholder for H3 two-way inbox; created on bind)
-- ============================================================

create table if not exists public.chat_threads (
  id            uuid primary key default gen_random_uuid(),
  nursery_id    uuid not null references public.nurseries(id) on delete cascade,
  customer_id   uuid not null references public.customers(id) on delete cascade,
  line_user_id  text not null,
  last_message_at timestamptz,
  created_at    timestamptz not null default now(),
  unique (customer_id)
);

create index if not exists chat_threads_nursery_idx on public.chat_threads(nursery_id);

-- ============================================================
-- G3p — line_message_logs (inbound farmer replies; logged, not surfaced)
-- ============================================================

create table if not exists public.line_message_logs (
  id            uuid primary key default gen_random_uuid(),
  nursery_id    uuid references public.nurseries(id) on delete cascade,
  line_user_id  text not null,
  direction     text not null check (direction in ('inbound', 'outbound')),
  kind          text,
  body          jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists line_message_logs_user_idx on public.line_message_logs(line_user_id, created_at desc);

-- ============================================================
-- H4 — quiet hours + manual-send flag
-- ============================================================

alter table public.notification_settings
  add column if not exists quiet_hours_start time not null default '21:00:00',
  add column if not exists quiet_hours_end   time not null default '07:00:00';

alter table public.line_outbound_events
  add column if not exists is_manual boolean not null default false;

-- ============================================================
-- H2 — data_exports (export audit trail)
-- ============================================================

create table if not exists public.data_exports (
  id            uuid primary key default gen_random_uuid(),
  nursery_id    uuid not null references public.nurseries(id) on delete cascade,
  kind          text not null check (kind in ('customers_csv', 'pcr_zip', 'full_backup')),
  requested_by  uuid references auth.users(id) on delete set null,
  file_url      text,
  completed_at  timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists data_exports_nursery_idx on public.data_exports(nursery_id, created_at desc);

-- ============================================================
-- Row-Level Security
-- ============================================================

alter table public.line_users        enable row level security;
alter table public.chat_threads      enable row level security;
alter table public.line_message_logs enable row level security;
alter table public.data_exports      enable row level security;

-- line_users / chat_threads / line_message_logs: nursery-scoped SELECT for
-- members; all writes happen via service-role (bind consume / worker), which
-- bypasses RLS. No INSERT/UPDATE policy → members cannot mutate directly.
drop policy if exists line_users_select on public.line_users;
create policy line_users_select on public.line_users
  for select using (nursery_id in (select public.current_user_nursery_ids()));

drop policy if exists chat_threads_select on public.chat_threads;
create policy chat_threads_select on public.chat_threads
  for select using (nursery_id in (select public.current_user_nursery_ids()));

drop policy if exists line_message_logs_select on public.line_message_logs;
create policy line_message_logs_select on public.line_message_logs
  for select using (nursery_id in (select public.current_user_nursery_ids()));

-- data_exports: members see + record their nursery's export history. The
-- export route resolves the caller's nursery scope from the session and
-- writes one audit row per export; an INSERT policy scoped to the caller's
-- nursery (mirrors customer_callbacks_ins) keeps it tenant-isolated without
-- depending on a service-role JWT in a cookie-bound server client.
drop policy if exists data_exports_select on public.data_exports;
create policy data_exports_select on public.data_exports
  for select using (nursery_id in (select public.current_user_nursery_ids()));

drop policy if exists data_exports_ins on public.data_exports;
create policy data_exports_ins on public.data_exports
  for insert with check (nursery_id in (select public.current_user_nursery_ids()));

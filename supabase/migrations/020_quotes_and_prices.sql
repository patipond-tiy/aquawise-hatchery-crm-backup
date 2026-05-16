-- D2: quotes + prices (real one-tap quote send).
-- Applied to live supabase-hatchery via apply_migration (band 020).
-- prices: nursery-scoped price list rows used to pre-fill the quote modal.
create table if not exists public.prices (
  id             uuid primary key default gen_random_uuid(),
  nursery_id     uuid not null references public.nurseries(id) on delete cascade,
  size_label     text not null,
  unit_price     numeric not null check (unit_price > 0),
  currency       text not null default 'THB',
  effective_date date not null default current_date,
  created_at     timestamptz not null default now()
);
create index if not exists prices_nursery_idx on public.prices(nursery_id, effective_date desc);

-- quotes: one row per quote sent to a customer.
create table if not exists public.quotes (
  id           uuid primary key default gen_random_uuid(),
  nursery_id   uuid not null references public.nurseries(id) on delete cascade,
  customer_id  uuid not null references public.customers(id) on delete cascade,
  items        jsonb not null,
  note         text,
  status       text not null default 'sent'
                 check (status in ('sent','accepted','declined','expired')),
  valid_until  timestamptz,
  sent_at      timestamptz not null default now(),
  decided_at   timestamptz,
  created_by   uuid references auth.users(id) on delete set null
);
create index if not exists quotes_customer_idx
  on public.quotes (nursery_id, customer_id, sent_at desc);

-- Idempotency: prevents duplicate in-flight quotes for the same items.
create unique index if not exists quotes_inflight_dedupe_idx
  on public.quotes (nursery_id, customer_id, md5(items::text))
  where status = 'sent';

alter table public.prices enable row level security;
alter table public.quotes enable row level security;

-- prices: nursery-scoped read/write for members.
drop policy if exists prices_rw on public.prices;
create policy prices_rw on public.prices for all
  using (nursery_id in (select public.current_user_nursery_ids()))
  with check (nursery_id in (select public.current_user_nursery_ids()));

-- quotes: nursery-scoped read for members; insert/update gated by membership
-- (role enforcement is in the server action via can(role,'customer:write')).
drop policy if exists quotes_select on public.quotes;
create policy quotes_select on public.quotes for select
  using (nursery_id in (select public.current_user_nursery_ids()));

drop policy if exists quotes_insert on public.quotes;
create policy quotes_insert on public.quotes for insert
  with check (nursery_id in (select public.current_user_nursery_ids()));

drop policy if exists quotes_update on public.quotes;
create policy quotes_update on public.quotes for update
  using (nursery_id in (select public.current_user_nursery_ids()))
  with check (nursery_id in (select public.current_user_nursery_ids()));

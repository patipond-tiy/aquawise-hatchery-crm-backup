-- Billing — 30-day app-side trial + Stripe subscription state
-- Adds trial + Stripe columns to hatcheries, plus an idempotency log of webhook events.

alter table public.hatcheries
  add column trial_ends_at                   timestamptz default (now() + interval '30 days'),
  add column stripe_customer_id              text unique,
  add column stripe_subscription_id          text unique,
  add column subscription_status             text not null default 'trialing'
    check (subscription_status in (
      'trialing','trial_expired','active','past_due','canceled','incomplete'
    )),
  add column subscription_current_period_end timestamptz,
  add column subscription_cancel_at_period_end boolean not null default false;

create index hatcheries_stripe_customer_idx     on public.hatcheries(stripe_customer_id);
create index hatcheries_stripe_subscription_idx on public.hatcheries(stripe_subscription_id);

-- ============================================================
-- Webhook event log (idempotency + audit trail)
-- ============================================================

create table public.subscription_events (
  id              bigserial primary key,
  hatchery_id     uuid references public.hatcheries(id) on delete set null,
  stripe_event_id text not null unique,
  type            text not null,
  payload         jsonb,
  created_at      timestamptz not null default now()
);

create index subscription_events_hatchery_idx on public.subscription_events(hatchery_id, created_at desc);

alter table public.subscription_events enable row level security;

create policy subscription_events_select on public.subscription_events
  for select using (
    hatchery_id in (
      select hatchery_id from public.hatchery_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- INSERT/UPDATE only via service role; no policy means RLS denies authenticated users.

-- ============================================================
-- Update create_hatchery RPC to be explicit about trial defaults.
-- (The column defaults already cover it, but explicit is better for the audit trail.)
-- ============================================================

create or replace function public.create_hatchery(
  p_name text,
  p_name_en text default null,
  p_location text default null
) returns uuid
language plpgsql security definer as $$
declare
  v_uid uuid := auth.uid();
  v_id  uuid;
begin
  if v_uid is null then
    raise exception 'must be signed in';
  end if;

  insert into public.hatcheries (
    name, name_en, location,
    subscription_status, trial_ends_at
  ) values (
    p_name, p_name_en, p_location,
    'trialing', now() + interval '30 days'
  )
  returning id into v_id;

  insert into public.hatchery_members (hatchery_id, user_id, role)
  values (v_id, v_uid, 'owner');

  insert into public.scorecard_settings (hatchery_id) values (v_id);
  insert into public.notification_settings (hatchery_id) values (v_id);

  return v_id;
end $$;

revoke all on function public.create_hatchery(text, text, text) from public;
grant execute on function public.create_hatchery(text, text, text) to authenticated;

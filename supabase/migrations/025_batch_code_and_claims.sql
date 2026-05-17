-- WS4 Epic K — K1 (batch-code/claims/crm-event-log schema) + K3 (claim_batch RPC).
-- Conforms to docs/aquawise-updated-docs/K-INTEGRATION-CONTRACT.md §4 (batch_code
-- regex/alphabet), §5 (read ladder), §6 (claim idempotency + audit_log real
-- columns), §1 (crm_event_log idempotency key).
--
-- Migration band 025 (013–024b used by prior epics; SYS-1 ledger superseded by
-- the live ledger in docs/temp-docs/MOCK-TO-PROD.md §10: next free band = 025).
-- The K1/K3 stories say "013" — the CONTRACT + live ledger win; this is 025.
-- Strictly additive. RLS enabled on every new table before any data path.

-- ============================================================
-- §4 mint_batch_code() — 6-char from 32-char confusable-free alphabet
--   (excludes 0 O 1 I l). ~2^30 entropy; retry-on-collision ≤5×.
-- ============================================================
create or replace function public.mint_batch_code()
returns text
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; -- = aquawise-core BATCH_CODE_ALPHABET (no 0 O 1 I L)
  v_len      constant int  := length(v_alphabet);
  v_code     text;
  v_attempt  int := 0;
  v_exists   bool;
begin
  loop
    v_attempt := v_attempt + 1;
    v_code := 'B-';
    for _i in 1..6 loop
      v_code := v_code || substr(v_alphabet, 1 + floor(random() * v_len)::int, 1);
    end loop;
    select exists(select 1 from public.batches where batch_code = v_code) into v_exists;
    if not v_exists then
      return v_code;
    end if;
    if v_attempt >= 5 then
      raise exception 'mint_batch_code: 5 consecutive collisions, aborting';
    end if;
  end loop;
end;
$$;

-- mint_batch_code() only ever runs as the batches.batch_code column DEFAULT
-- (executed by the table owner during INSERT). No client role may call it via
-- PostgREST RPC — revoke from every client role.
revoke all on function public.mint_batch_code() from public, anon, authenticated;

-- ============================================================
-- §4/§5 batches: claim code, validity window, publish gate,
--   frozen nursery-contact snapshot, first-claim signal.
-- ============================================================
alter table public.batches
  add column if not exists batch_code text;

-- Back-fill existing rows, then enforce NOT NULL + DEFAULT + UNIQUE.
update public.batches set batch_code = public.mint_batch_code()
  where batch_code is null;

alter table public.batches
  alter column batch_code set default public.mint_batch_code(),
  alter column batch_code set not null;

alter table public.batches
  add constraint batches_batch_code_key unique (batch_code);

alter table public.batches
  add constraint batches_batch_code_format_chk
  check (batch_code ~ '^B-[A-CDEFGHJKMNPQRSTUVWXYZ23456789]{6}$');

alter table public.batches
  add column if not exists valid_until timestamptz
    not null default (now() + interval '30 days');

alter table public.batches
  add constraint batches_valid_until_cap_chk
  check (valid_until <= created_at + interval '90 days');

alter table public.batches
  add column if not exists published_at timestamptz;

alter table public.batches
  add column if not exists nursery_contact_snapshot jsonb;

alter table public.batches
  add column if not exists first_claimed_at timestamptz;

-- ============================================================
-- §6 batch_claims — one row per (batch, line_user_id). Farmer is NOT a
--   customer/member — only this row + a line_profile snapshot crosses.
-- ============================================================
create table if not exists public.batch_claims (
  batch_id        text        not null references public.batches(id) on delete cascade,
  line_user_id    text        not null,
  claimed_at      timestamptz not null default now(),
  line_profile    jsonb,
  pond_id         text,
  correlation_id  uuid        not null,
  nursery_id      uuid        not null references public.nurseries(id) on delete cascade,
  primary key (batch_id, line_user_id)
);

create index if not exists batch_claims_batch_id_idx   on public.batch_claims (batch_id);
create index if not exists batch_claims_line_user_idx   on public.batch_claims (line_user_id);
create index if not exists batch_claims_nursery_id_idx   on public.batch_claims (nursery_id);

-- ============================================================
-- §1/§7 crm_event_log — outbound webhook ledger. correlation_id UNIQUE
--   is the cross-product idempotency key.
-- ============================================================
create table if not exists public.crm_event_log (
  id              uuid        primary key default gen_random_uuid(),
  correlation_id  uuid        not null unique,
  event_type      text        not null,
  batch_id        text        not null references public.batches(id) on delete cascade,
  severity        text        not null check (severity in ('info','warning','critical')),
  payload         jsonb       not null,
  posted_at       timestamptz not null default now(),
  delivered_at    timestamptz,
  attempts        integer     not null default 0,
  last_error      text,
  nursery_id      uuid        not null references public.nurseries(id) on delete cascade
);

create index if not exists crm_event_log_batch_sev_idx
  on public.crm_event_log (batch_id, severity);
create index if not exists crm_event_log_undelivered_idx
  on public.crm_event_log (delivered_at) where delivered_at is null;
create index if not exists crm_event_log_nursery_id_idx
  on public.crm_event_log (nursery_id);

-- ============================================================
-- RLS — SELECT scoped to nursery_members; INSERT/UPDATE service-role only
--   (service_role bypasses RLS by definition; no write policy = no write
--   for authenticated/anon).
-- ============================================================
alter table public.batch_claims  enable row level security;
alter table public.crm_event_log enable row level security;

create policy batch_claims_select_own on public.batch_claims
  for select to authenticated
  using (nursery_id in (select public.current_user_nursery_ids()));

create policy crm_event_log_select_own on public.crm_event_log
  for select to authenticated
  using (nursery_id in (select public.current_user_nursery_ids()));

-- ============================================================
-- §8 nurseries public-contact columns (frozen into
--   batches.nursery_contact_snapshot at first publish).
-- ============================================================
alter table public.nurseries
  add column if not exists line_oa_id text;
alter table public.nurseries
  add constraint nurseries_line_oa_id_chk
  check (line_oa_id is null or line_oa_id ~ '^@[a-zA-Z0-9_.-]{1,49}$');

alter table public.nurseries
  add column if not exists contact_phone_public text;
alter table public.nurseries
  add constraint nurseries_contact_phone_public_chk
  check (contact_phone_public is null or contact_phone_public ~ '^0[0-9]{9}$');

-- ============================================================
-- §6 claim_batch() RPC — atomic: ladder check → INSERT ON CONFLICT
--   (idempotent, never overwrites original correlation_id/claimed_at) →
--   first_claimed_at set on first claim → audit_log row. Returns the
--   resolution so the route maps status codes.
-- ============================================================
create or replace function public.claim_batch(
  p_code            text,
  p_line_user_id    text,
  p_pond_id         text,
  p_line_profile    jsonb,
  p_correlation_id  uuid,
  p_iss             text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_batch        record;
  v_existing     record;
  v_claimed_at   timestamptz;
  v_is_repeat    bool := false;
begin
  select id, nursery_id, published_at, valid_until, first_claimed_at
    into v_batch
    from public.batches
    where batch_code = p_code;

  if not found then
    return jsonb_build_object('status', 'batch_not_found');
  end if;
  if v_batch.published_at is null then
    return jsonb_build_object('status', 'batch_not_found'); -- no draft leak
  end if;
  if v_batch.valid_until <= now() then
    return jsonb_build_object('status', 'batch_expired',
                              'expired_at', to_char(v_batch.valid_until at time zone 'UTC',
                                'YYYY-MM-DD"T"HH24:MI:SS"Z"'));
  end if;

  -- Existing claim by THIS user → idempotent retry (preserve original).
  select claimed_at into v_existing
    from public.batch_claims
    where batch_id = v_batch.id and line_user_id = p_line_user_id;
  if found then
    v_is_repeat := true;
    v_claimed_at := v_existing.claimed_at;
  else
    -- Conflict: batch already claimed by a DIFFERENT line_user_id.
    if exists (select 1 from public.batch_claims
               where batch_id = v_batch.id and line_user_id <> p_line_user_id) then
      return jsonb_build_object('status', 'claimed_by_other');
    end if;

    insert into public.batch_claims
      (batch_id, line_user_id, claimed_at, line_profile, pond_id,
       correlation_id, nursery_id)
    values
      (v_batch.id, p_line_user_id, now(), p_line_profile, p_pond_id,
       p_correlation_id, v_batch.nursery_id)
    returning claimed_at into v_claimed_at;

    if v_batch.first_claimed_at is null then
      update public.batches set first_claimed_at = now()
        where id = v_batch.id and first_claimed_at is null;
    end if;
  end if;

  insert into public.audit_log (nursery_id, user_id, action, payload)
  values (
    v_batch.nursery_id, null,
    case when v_is_repeat then 'batch_claim_repeat' else 'batch_claim' end,
    jsonb_build_object(
      'line_user_id', p_line_user_id,
      'correlation_id', p_correlation_id,
      'batch_id', v_batch.id,
      'actor', 'line-bot:' || p_iss
    )
  );

  return jsonb_build_object(
    'status', case when v_is_repeat then 'repeat' else 'ok' end,
    'batch_id', v_batch.id,
    'claimed_at', to_char(v_claimed_at at time zone 'UTC',
      'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  );
end;
$$;

revoke all on function public.claim_batch(text, text, text, jsonb, uuid, text)
  from public, anon, authenticated;
grant execute on function public.claim_batch(text, text, text, jsonb, uuid, text)
  to service_role;

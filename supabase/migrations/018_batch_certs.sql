-- 018_batch_certs.sql
-- C4 (print-or-send-pcr-certificate): re-downloadable PCR certificate records,
-- one per batch (unique index → idempotent re-download). Also adds the
-- cert-send idempotency index on line_outbound_events (006 has no
-- (batch_id,customer_id) index — cert sends embed batch_id in the payload).
--
-- Migration band 018 (015 rename, 016 cycle_history, 017 callbacks). Applied
-- to the live `supabase-hatchery` project via apply_migration. `batches.id`
-- is text (human-readable like B-2605-A) — FK is text, not uuid.

create table if not exists public.batch_certs (
  id uuid primary key default gen_random_uuid(),
  batch_id text not null references public.batches(id) on delete cascade,
  pdf_url text not null,
  generated_at timestamptz not null default now(),
  generated_by uuid references auth.users(id) on delete set null
);

create unique index if not exists batch_certs_batch_id_idx
  on public.batch_certs (batch_id);

alter table public.batch_certs enable row level security;

create policy batch_certs_rw on public.batch_certs for all
  using (
    batch_id in (
      select id from public.batches
      where nursery_id in (select public.current_user_nursery_ids())
    )
  )
  with check (
    batch_id in (
      select id from public.batches
      where nursery_id in (select public.current_user_nursery_ids())
    )
  );

revoke all on public.batch_certs from anon;

-- Cert-send idempotency: no (batch_id,customer_id) index exists in 006.
-- Cert sends embed batch_id in the JSON payload.
create unique index if not exists line_outbound_events_cert_dedupe_idx
  on public.line_outbound_events (customer_id, (payload->>'batch_id'))
  where status in ('pending','sending','sent') and template = 'pcr_certificate';

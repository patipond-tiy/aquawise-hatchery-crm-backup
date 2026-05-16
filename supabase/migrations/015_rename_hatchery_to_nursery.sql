-- 015_rename_hatchery_to_nursery.sql
--
-- Foundational mock→prod fix (WS2 Epic A).
--
-- The live Supabase project (pajnnfrlrqthdcywoemk) was provisioned from a
-- PRE-rename schema snapshot: it carries `hatchery_*` objects while the app
-- code, repo migrations 001–014, and lib/database.types.ts all expect
-- `nursery_*`. Every live PostgREST/RPC call therefore failed.
--
-- This migration renames every live object to the `nursery_*` names the code
-- already uses. It is a pure rename (no data change; the live DB had 0 rows).
-- ALTER ... RENAME cascades to dependent FKs, indexes, and RLS policy bodies
-- automatically, so the policies that referenced `hatchery_id` /
-- `current_user_hatchery_ids()` / `hatchery_role` continue to work unchanged
-- under the new names.
--
-- Idempotent: every step is guarded so a re-run (or a run against an already
-- correct fresh DB built from 001–014) is a no-op.

do $$
begin
  -- ---- enum type ---------------------------------------------------------
  if exists (select 1 from pg_type t join pg_namespace n on n.oid=t.typnamespace
             where n.nspname='public' and t.typname='hatchery_role')
     and not exists (select 1 from pg_type t join pg_namespace n on n.oid=t.typnamespace
             where n.nspname='public' and t.typname='nursery_role') then
    alter type public.hatchery_role rename to nursery_role;
  end if;

  -- ---- tables ------------------------------------------------------------
  if to_regclass('public.hatcheries') is not null
     and to_regclass('public.nurseries') is null then
    alter table public.hatcheries rename to nurseries;
  end if;

  if to_regclass('public.hatchery_members') is not null
     and to_regclass('public.nursery_members') is null then
    alter table public.hatchery_members rename to nursery_members;
  end if;

  if to_regclass('public.hatchery_brand') is not null
     and to_regclass('public.nursery_brand') is null then
    alter table public.hatchery_brand rename to nursery_brand;
  end if;

  -- ---- hatchery_id -> nursery_id columns (every tenant-scoped table) -----
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='nurseries' and column_name='id') then
    -- nurseries.id is the PK; child tables carry hatchery_id.
    perform 1;
  end if;
end $$;

-- Column renames (one statement each so each is independently idempotent).
do $$
declare
  r record;
begin
  for r in
    select table_name
    from information_schema.columns
    where table_schema='public' and column_name='hatchery_id'
  loop
    execute format('alter table public.%I rename column hatchery_id to nursery_id', r.table_name);
  end loop;
end $$;

-- ---- functions -----------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
             where n.nspname='public' and p.proname='current_user_hatchery_ids')
     and not exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
             where n.nspname='public' and p.proname='current_user_nursery_ids') then
    alter function public.current_user_hatchery_ids() rename to current_user_nursery_ids;
  end if;

  if exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
             where n.nspname='public' and p.proname='create_hatchery')
     and not exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
             where n.nspname='public' and p.proname='create_nursery') then
    alter function public.create_hatchery(text, text, text) rename to create_nursery;
  end if;
end $$;

-- The renamed create_nursery() body still references the (now renamed)
-- nurseries / nursery_members tables by their NEW names because ALTER TABLE
-- RENAME rewrites stored function dependencies. Re-assert the canonical body
-- (matches 002_rls.sql + 004_billing.sql) so a fresh DB and the live DB are
-- byte-identical regardless of provenance.
create or replace function public.create_nursery(
  p_name text,
  p_name_en text default null,
  p_location text default null
) returns uuid
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_id  uuid;
begin
  if v_uid is null then
    raise exception 'must be signed in';
  end if;

  insert into public.nurseries (
    name, name_en, location,
    subscription_status, trial_ends_at
  ) values (
    p_name, p_name_en, p_location,
    'trialing', now() + interval '30 days'
  )
  returning id into v_id;

  insert into public.nursery_members (nursery_id, user_id, role)
  values (v_id, v_uid, 'owner');

  insert into public.scorecard_settings (nursery_id) values (v_id);
  insert into public.notification_settings (nursery_id) values (v_id);

  return v_id;
end $$;

revoke all on function public.create_nursery(text, text, text) from public;
revoke all on function public.create_nursery(text, text, text) from anon;
grant execute on function public.create_nursery(text, text, text) to authenticated;

create or replace function public.current_user_nursery_ids()
returns setof uuid
language sql stable security definer
set search_path = public, pg_temp
as $$
  select nursery_id from public.nursery_members where user_id = auth.uid();
$$;

-- ---- explicit constraint renames (cosmetic parity with fresh 001–014) ----
-- PG keeps the old constraint names after a table/column rename; align them
-- so dumps match a from-scratch build. Guarded individually.
do $$
declare
  r record;
begin
  for r in
    select conname, conrelid::regclass::text as tbl
    from pg_constraint
    where connamespace='public'::regnamespace and conname like '%hatcher%'
  loop
    execute format('alter table %s rename constraint %I to %I',
      r.tbl, r.conname, replace(replace(r.conname,'hatchery','nursery'),'hatcheries','nurseries'));
  end loop;
end $$;

-- ---- nursery-logos storage bucket (migration 012 parity) -----------------
-- The pre-rename live snapshot had zero storage buckets. A3 logo upload needs
-- this bucket + tenant-scoped RLS. Mirrors 012_storage_logos.sql.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'nursery-logos', 'nursery-logos', true, 2097152,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists nursery_logos_public_read on storage.objects;
create policy nursery_logos_public_read on storage.objects
  for select using (bucket_id = 'nursery-logos');

drop policy if exists nursery_logos_insert on storage.objects;
create policy nursery_logos_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'nursery-logos'
    and (storage.foldername(name))[1]::uuid in (select public.current_user_nursery_ids())
  );

drop policy if exists nursery_logos_update on storage.objects;
create policy nursery_logos_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'nursery-logos'
    and (storage.foldername(name))[1]::uuid in (select public.current_user_nursery_ids())
  );

drop policy if exists nursery_logos_delete on storage.objects;
create policy nursery_logos_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'nursery-logos'
    and (storage.foldername(name))[1]::uuid in (select public.current_user_nursery_ids())
  );

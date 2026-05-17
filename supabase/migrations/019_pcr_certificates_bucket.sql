-- 019_pcr_certificates_bucket.sql
-- C4 (print-or-send-pcr-certificate): private Storage bucket for generated PCR
-- certificate PDFs, folder-prefixed by {batch_id}. Tenant-scoped RLS mirrors
-- the nursery-logos pattern from 015 but the bucket is PRIVATE (cert URLs are
-- signed, 1-hour TTL, per K2 contract) — no public-read policy.
--
-- Migration band 019 (015 rename … 018 batch_certs). Applied to the live
-- `supabase-hatchery` project via apply_migration.
--
-- Guard: skipped when storage schema is absent (pgtap/bare-DB CI). On a real
-- Supabase project storage is always present — behaviour unchanged.

do $$
begin
  if to_regclass('storage.buckets') is null then
    raise notice '019_pcr_certificates_bucket: storage schema absent — skipping (pgtap/bare-DB mode)';
    return;
  end if;

  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'pcr-certificates', 'pcr-certificates', false, 5242880,
    array['application/pdf']
  )
  on conflict (id) do nothing;

  execute $p$ drop policy if exists pcr_certificates_select on storage.objects $p$;
  execute $p$
    create policy pcr_certificates_select on storage.objects
      for select to authenticated
      using (
        bucket_id = 'pcr-certificates'
        and exists (
          select 1 from public.batches b
          where b.id = (storage.foldername(name))[1]
            and b.nursery_id in (select public.current_user_nursery_ids())
        )
      )
  $p$;

  execute $p$ drop policy if exists pcr_certificates_insert on storage.objects $p$;
  execute $p$
    create policy pcr_certificates_insert on storage.objects
      for insert to authenticated
      with check (
        bucket_id = 'pcr-certificates'
        and exists (
          select 1 from public.batches b
          where b.id = (storage.foldername(name))[1]
            and b.nursery_id in (select public.current_user_nursery_ids())
        )
      )
  $p$;

  execute $p$ drop policy if exists pcr_certificates_update on storage.objects $p$;
  execute $p$
    create policy pcr_certificates_update on storage.objects
      for update to authenticated
      using (
        bucket_id = 'pcr-certificates'
        and exists (
          select 1 from public.batches b
          where b.id = (storage.foldername(name))[1]
            and b.nursery_id in (select public.current_user_nursery_ids())
        )
      )
  $p$;
end $$;

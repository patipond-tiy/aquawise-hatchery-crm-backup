-- Storage bucket for nursery logos (A3 — Set up nursery profile).
-- Companion code: lib/supabase/storage.ts (BUCKET = 'nursery-logos', path '{nurseryId}/logo.{ext}')

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'nursery-logos',
  'nursery-logos',
  true,
  2097152, -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Public SELECT — bucket is public so logos render without auth.
create policy "nursery_logos_public_read"
  on storage.objects for select
  using (bucket_id = 'nursery-logos');

-- Tenant-scoped writes — first folder segment must be a nursery the user belongs to.
create policy "nursery_logos_tenant_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'nursery-logos'
    and (storage.foldername(name))[1]::uuid in (select public.current_user_nursery_ids())
  );

create policy "nursery_logos_tenant_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'nursery-logos'
    and (storage.foldername(name))[1]::uuid in (select public.current_user_nursery_ids())
  )
  with check (
    bucket_id = 'nursery-logos'
    and (storage.foldername(name))[1]::uuid in (select public.current_user_nursery_ids())
  );

create policy "nursery_logos_tenant_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'nursery-logos'
    and (storage.foldername(name))[1]::uuid in (select public.current_user_nursery_ids())
  );

-- Storage bucket for hatchery logos (A3 — Set up hatchery profile).
-- Companion code: lib/supabase/storage.ts (BUCKET = 'hatchery-logos', path '{hatcheryId}/logo.{ext}')

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hatchery-logos',
  'hatchery-logos',
  true,
  2097152, -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Public SELECT — bucket is public so logos render without auth.
create policy "hatchery_logos_public_read"
  on storage.objects for select
  using (bucket_id = 'hatchery-logos');

-- Tenant-scoped writes — first folder segment must be a hatchery the user belongs to.
create policy "hatchery_logos_tenant_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'hatchery-logos'
    and (storage.foldername(name))[1]::uuid in (select public.current_user_hatchery_ids())
  );

create policy "hatchery_logos_tenant_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'hatchery-logos'
    and (storage.foldername(name))[1]::uuid in (select public.current_user_hatchery_ids())
  )
  with check (
    bucket_id = 'hatchery-logos'
    and (storage.foldername(name))[1]::uuid in (select public.current_user_hatchery_ids())
  );

create policy "hatchery_logos_tenant_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'hatchery-logos'
    and (storage.foldername(name))[1]::uuid in (select public.current_user_hatchery_ids())
  );

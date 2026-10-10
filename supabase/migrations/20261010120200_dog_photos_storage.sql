-- Storage bucket for dog photos.
--
-- Public bucket: files are served by URL without auth (fast, cacheable). Paths are
-- <shelter_id>/<dog_id>/<random uuid>.webp, so URLs can't be guessed; the gallery and
-- API stop listing a photo as soon as its dog is no longer available.
-- Photos are resized to WebP in the browser before upload, so 2 MB is generous.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dog-photos', 'dog-photos', true, 2097152, array['image/webp', 'image/jpeg', 'image/png']);

-- Staff may only write inside their own shelter's folder; the admin anywhere.
-- (Public reads of a public bucket don't go through these policies.)

create policy "Staff upload dog photos to their shelter folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'dog-photos'
  and (
    (storage.foldername(name))[1] = (select private.current_shelter_id())::text
    or (select private.is_platform_admin())
  )
);

-- Needed by the storage API to look up objects before deleting them.
create policy "Staff list dog photos in their shelter folder"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'dog-photos'
  and (
    (storage.foldername(name))[1] = (select private.current_shelter_id())::text
    or (select private.is_platform_admin())
  )
);

create policy "Staff delete dog photos in their shelter folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'dog-photos'
  and (
    (storage.foldername(name))[1] = (select private.current_shelter_id())::text
    or (select private.is_platform_admin())
  )
);

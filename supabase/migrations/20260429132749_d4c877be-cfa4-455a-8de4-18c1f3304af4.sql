drop policy if exists "Public read slide uploads" on storage.objects;

-- Files can still be fetched by their full URL (storage CDN serves them via the
-- service role internally), but no client can enumerate the bucket.
create policy "Owners can list own slide uploads"
on storage.objects for select
to authenticated
using (
  bucket_id = 'slide-uploads'
  and auth.uid()::text = (storage.foldername(name))[1]
);
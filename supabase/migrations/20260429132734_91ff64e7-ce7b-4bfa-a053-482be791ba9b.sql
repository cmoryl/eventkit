insert into storage.buckets (id, name, public)
values ('slide-uploads', 'slide-uploads', true)
on conflict (id) do nothing;

create policy "Public read slide uploads"
on storage.objects for select
using (bucket_id = 'slide-uploads');

create policy "Users upload to own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'slide-uploads'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users update own slide uploads"
on storage.objects for update
to authenticated
using (
  bucket_id = 'slide-uploads'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users delete own slide uploads"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'slide-uploads'
  and auth.uid()::text = (storage.foldername(name))[1]
);
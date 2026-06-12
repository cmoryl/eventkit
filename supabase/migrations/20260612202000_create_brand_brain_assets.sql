-- Brand Brain persistence layer
-- Stores each brand's reusable guide assets in Supabase Storage + metadata tables.
-- The frontend still supports local-only mode when Supabase is not configured.

create extension if not exists pgcrypto;

create table if not exists public.brand_brains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid null,
  brand_profile_id text not null,
  brand_name text not null,
  profile_snapshot jsonb not null default '{}'::jsonb,
  generation_notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, brand_profile_id)
);

create table if not exists public.brand_brain_assets (
  id text primary key,
  brand_brain_id uuid not null references public.brand_brains(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid null,
  brand_profile_id text not null,
  name text not null,
  file_name text not null,
  mime_type text not null,
  storage_path text not null,
  asset_type text not null,
  usage_role text not null,
  tags text[] not null default '{}'::text[],
  notes text null,
  is_primary boolean not null default false,
  locked boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists brand_brains_user_brand_idx on public.brand_brains (user_id, brand_profile_id);
create index if not exists brand_brain_assets_brain_idx on public.brand_brain_assets (brand_brain_id);
create index if not exists brand_brain_assets_user_brand_idx on public.brand_brain_assets (user_id, brand_profile_id);
create index if not exists brand_brain_assets_usage_idx on public.brand_brain_assets (usage_role, asset_type);
create unique index if not exists brand_brain_assets_one_primary_logo_idx
  on public.brand_brain_assets (brand_brain_id)
  where is_primary = true and usage_role = 'logo-overlay';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_brand_brains_updated_at on public.brand_brains;
create trigger set_brand_brains_updated_at
before update on public.brand_brains
for each row execute function public.set_updated_at();

drop trigger if exists set_brand_brain_assets_updated_at on public.brand_brain_assets;
create trigger set_brand_brain_assets_updated_at
before update on public.brand_brain_assets
for each row execute function public.set_updated_at();

alter table public.brand_brains enable row level security;
alter table public.brand_brain_assets enable row level security;

-- User-owned policies. workspace_id is included for a future team sharing layer,
-- but the current safe default keeps access scoped to auth.uid().
drop policy if exists "Users can read own brand brains" on public.brand_brains;
create policy "Users can read own brand brains"
on public.brand_brains for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own brand brains" on public.brand_brains;
create policy "Users can insert own brand brains"
on public.brand_brains for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own brand brains" on public.brand_brains;
create policy "Users can update own brand brains"
on public.brand_brains for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own brand brains" on public.brand_brains;
create policy "Users can delete own brand brains"
on public.brand_brains for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read own brand brain assets" on public.brand_brain_assets;
create policy "Users can read own brand brain assets"
on public.brand_brain_assets for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own brand brain assets" on public.brand_brain_assets;
create policy "Users can insert own brand brain assets"
on public.brand_brain_assets for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own brand brain assets" on public.brand_brain_assets;
create policy "Users can update own brand brain assets"
on public.brand_brain_assets for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own brand brain assets" on public.brand_brain_assets;
create policy "Users can delete own brand brain assets"
on public.brand_brain_assets for delete
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brand-brain-assets',
  'brand-brain-assets',
  false,
  52428800,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can read own brand brain files" on storage.objects;
create policy "Users can read own brand brain files"
on storage.objects for select
using (bucket_id = 'brand-brain-assets' and auth.uid() = owner);

drop policy if exists "Users can upload own brand brain files" on storage.objects;
create policy "Users can upload own brand brain files"
on storage.objects for insert
with check (bucket_id = 'brand-brain-assets' and auth.uid() = owner);

drop policy if exists "Users can update own brand brain files" on storage.objects;
create policy "Users can update own brand brain files"
on storage.objects for update
using (bucket_id = 'brand-brain-assets' and auth.uid() = owner)
with check (bucket_id = 'brand-brain-assets' and auth.uid() = owner);

drop policy if exists "Users can delete own brand brain files" on storage.objects;
create policy "Users can delete own brand brain files"
on storage.objects for delete
using (bucket_id = 'brand-brain-assets' and auth.uid() = owner);

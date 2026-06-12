-- Brand Brain creative direction layer
-- Stores full-set style system selections and brand-specific prompt overrides.

create table if not exists public.brand_style_system_selections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid null,
  brand_profile_id text not null,
  style_system_ids text[] not null default '{}'::text[],
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, brand_profile_id)
);

create table if not exists public.brand_prompt_overrides (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid null,
  brand_profile_id text not null,
  scope text not null,
  name text not null,
  version integer not null default 1,
  status text not null default 'draft' check (status in ('draft', 'approved', 'archived')),
  strategy_notes text null,
  hierarchy_rules text[] not null default '{}'::text[],
  layout_rules text[] not null default '{}'::text[],
  imagery_rules text[] not null default '{}'::text[],
  motif_rules text[] not null default '{}'::text[],
  typography_rules text[] not null default '{}'::text[],
  production_rules text[] not null default '{}'::text[],
  negative_rules text[] not null default '{}'::text[],
  qa_rules text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists brand_style_system_selections_user_brand_idx on public.brand_style_system_selections (user_id, brand_profile_id);
create index if not exists brand_prompt_overrides_user_brand_idx on public.brand_prompt_overrides (user_id, brand_profile_id);
create index if not exists brand_prompt_overrides_scope_status_idx on public.brand_prompt_overrides (scope, status);

alter table public.brand_style_system_selections enable row level security;
alter table public.brand_prompt_overrides enable row level security;

drop trigger if exists set_brand_style_system_selections_updated_at on public.brand_style_system_selections;
create trigger set_brand_style_system_selections_updated_at
before update on public.brand_style_system_selections
for each row execute function public.set_updated_at();

drop trigger if exists set_brand_prompt_overrides_updated_at on public.brand_prompt_overrides;
create trigger set_brand_prompt_overrides_updated_at
before update on public.brand_prompt_overrides
for each row execute function public.set_updated_at();

drop policy if exists "Users can read own brand style systems" on public.brand_style_system_selections;
create policy "Users can read own brand style systems"
on public.brand_style_system_selections for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own brand style systems" on public.brand_style_system_selections;
create policy "Users can insert own brand style systems"
on public.brand_style_system_selections for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own brand style systems" on public.brand_style_system_selections;
create policy "Users can update own brand style systems"
on public.brand_style_system_selections for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own brand style systems" on public.brand_style_system_selections;
create policy "Users can delete own brand style systems"
on public.brand_style_system_selections for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read own brand prompt overrides" on public.brand_prompt_overrides;
create policy "Users can read own brand prompt overrides"
on public.brand_prompt_overrides for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own brand prompt overrides" on public.brand_prompt_overrides;
create policy "Users can insert own brand prompt overrides"
on public.brand_prompt_overrides for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own brand prompt overrides" on public.brand_prompt_overrides;
create policy "Users can update own brand prompt overrides"
on public.brand_prompt_overrides for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own brand prompt overrides" on public.brand_prompt_overrides;
create policy "Users can delete own brand prompt overrides"
on public.brand_prompt_overrides for delete
using (auth.uid() = user_id);

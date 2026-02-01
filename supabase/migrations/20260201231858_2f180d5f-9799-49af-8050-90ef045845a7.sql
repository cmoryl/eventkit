-- Add comprehensive brand intelligence fields to brand_styles
ALTER TABLE public.brand_styles
ADD COLUMN IF NOT EXISTS photography_style text,
ADD COLUMN IF NOT EXISTS photography_dos text[],
ADD COLUMN IF NOT EXISTS photography_donts text[],
ADD COLUMN IF NOT EXISTS logo_clear_space text,
ADD COLUMN IF NOT EXISTS logo_min_size text,
ADD COLUMN IF NOT EXISTS logo_placement_rules text[],
ADD COLUMN IF NOT EXISTS logo_backgrounds text[],
ADD COLUMN IF NOT EXISTS social_handles jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS hashtags text[],
ADD COLUMN IF NOT EXISTS tagline text,
ADD COLUMN IF NOT EXISTS mission text,
ADD COLUMN IF NOT EXISTS archetype text,
ADD COLUMN IF NOT EXISTS approved_layouts text[],
ADD COLUMN IF NOT EXISTS restricted_elements text[];
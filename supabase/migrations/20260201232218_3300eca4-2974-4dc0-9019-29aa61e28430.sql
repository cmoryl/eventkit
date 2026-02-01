-- Add comprehensive imagery storage to brand_styles
ALTER TABLE public.brand_styles
ADD COLUMN IF NOT EXISTS all_imagery jsonb DEFAULT '{}'::jsonb;
-- Add BrandHub link fields to brands table
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS brandhub_share_token text,
ADD COLUMN IF NOT EXISTS brandhub_last_synced timestamp with time zone,
ADD COLUMN IF NOT EXISTS brandhub_auto_sync boolean DEFAULT false;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_brands_brandhub_token ON public.brands(brandhub_share_token) WHERE brandhub_share_token IS NOT NULL;
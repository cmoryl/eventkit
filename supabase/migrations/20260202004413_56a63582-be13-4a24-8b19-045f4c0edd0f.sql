-- Add applied_brand_id column to profiles table to persist user's theme preference
ALTER TABLE public.profiles 
ADD COLUMN applied_brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX idx_profiles_applied_brand ON public.profiles(applied_brand_id);

-- Comment for documentation
COMMENT ON COLUMN public.profiles.applied_brand_id IS 'The brand whose theme is currently applied to the UI for this user';
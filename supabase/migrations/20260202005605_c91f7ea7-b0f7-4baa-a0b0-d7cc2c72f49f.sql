-- Add brand_adherence_mode to projects table
-- Controls how strictly brand guidelines are followed during asset generation
-- Values: 'strict' (exact compliance), 'inspired' (brand-influenced but flexible), 'none' (ignore brand)
ALTER TABLE public.projects 
ADD COLUMN brand_adherence_mode text DEFAULT 'inspired' CHECK (brand_adherence_mode IN ('strict', 'inspired', 'none'));

-- Add comment for documentation
COMMENT ON COLUMN public.projects.brand_adherence_mode IS 'Controls brand guideline strictness: strict (exact compliance), inspired (flexible interpretation), none (ignore brand)';
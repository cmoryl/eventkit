-- Add brand_id column to projects table for per-project brand themes
ALTER TABLE public.projects 
ADD COLUMN brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX idx_projects_brand ON public.projects(brand_id);

-- Comment for documentation
COMMENT ON COLUMN public.projects.brand_id IS 'The brand associated with this project for theming and asset generation';
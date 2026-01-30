-- Create storage bucket for print templates
INSERT INTO storage.buckets (id, name, public)
VALUES ('print-templates', 'print-templates', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for print-templates bucket
CREATE POLICY "Users can upload their own templates"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'print-templates' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own templates"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'print-templates' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own templates"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'print-templates' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create print_templates table for storing template metadata and specs
CREATE TABLE public.print_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Extracted specifications
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Quick access fields extracted from specs
  width_inches DECIMAL(10,4),
  height_inches DECIMAL(10,4),
  bleed_inches DECIMAL(10,4),
  safe_zone_inches DECIMAL(10,4),
  resolution_dpi INTEGER DEFAULT 300,
  color_mode TEXT DEFAULT 'CMYK',
  
  -- Die line and special features
  has_die_lines BOOLEAN DEFAULT false,
  has_fold_lines BOOLEAN DEFAULT false,
  has_perforation BOOLEAN DEFAULT false,
  
  -- Metadata
  source_vendor TEXT,
  asset_type TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.print_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own templates"
ON public.print_templates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
ON public.print_templates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
ON public.print_templates FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
ON public.print_templates FOR DELETE
USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_print_templates_user_id ON public.print_templates(user_id);
CREATE INDEX idx_print_templates_project_id ON public.print_templates(project_id);
CREATE INDEX idx_print_templates_asset_type ON public.print_templates(asset_type);

-- Trigger for updated_at
CREATE TRIGGER update_print_templates_updated_at
BEFORE UPDATE ON public.print_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create editable_templates table for persisting all template configs
CREATE TABLE public.editable_templates (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  asset_type TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'universal',
  vendor_id TEXT,
  thumbnail TEXT,
  preview_url TEXT,
  background JSONB NOT NULL DEFAULT '{}'::jsonb,
  dimensions JSONB NOT NULL DEFAULT '{}'::jsonb,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_fonts JSONB NOT NULL DEFAULT '{}'::jsonb,
  default_colors JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags TEXT[],
  is_premium BOOLEAN DEFAULT false,
  is_system_template BOOLEAN DEFAULT true,
  color_mode TEXT DEFAULT 'CMYK',
  dpi INTEGER DEFAULT 300,
  source TEXT DEFAULT 'config',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_editable_templates_asset_type ON public.editable_templates(asset_type);
CREATE INDEX idx_editable_templates_category ON public.editable_templates(category);

-- Enable RLS
ALTER TABLE public.editable_templates ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view system templates and their own
CREATE POLICY "Anyone can view system templates"
  ON public.editable_templates FOR SELECT
  USING (is_system_template = true OR auth.uid() = created_by);

-- Users can create their own templates
CREATE POLICY "Users can create own templates"
  ON public.editable_templates FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_system_template = false);

-- Users can update own templates; admins can update any
CREATE POLICY "Users can update own templates"
  ON public.editable_templates FOR UPDATE
  USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));

-- Users can delete own; admins can delete any
CREATE POLICY "Users can delete own templates"
  ON public.editable_templates FOR DELETE
  USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert system templates
CREATE POLICY "Admins can insert system templates"
  ON public.editable_templates FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Auto-update updated_at
CREATE TRIGGER update_editable_templates_updated_at
  BEFORE UPDATE ON public.editable_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
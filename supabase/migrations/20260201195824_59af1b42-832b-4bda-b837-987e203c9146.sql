-- Create brand management system for multi-brand support

-- Brand profiles table for storing multiple brands per user
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  logo_monochrome_url TEXT,
  logo_reversed_url TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Brand style configurations
CREATE TABLE public.brand_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
  
  -- Color System
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  color_palette JSONB DEFAULT '[]'::jsonb,
  
  -- Typography
  heading_font TEXT,
  body_font TEXT,
  accent_font TEXT,
  typography_scale JSONB DEFAULT '{}'::jsonb,
  
  -- Voice & Tone
  brand_voice TEXT[],
  tone_keywords TEXT[],
  writing_style TEXT,
  
  -- Visual Style
  mood_keywords TEXT[],
  imagery_style TEXT,
  pattern_style TEXT,
  icon_style TEXT,
  
  -- Cultural & Audience
  target_audience TEXT,
  cultural_context TEXT,
  industry TEXT,
  
  -- Advanced Settings
  print_color_mode TEXT DEFAULT 'CMYK',
  preferred_render_engine TEXT,
  custom_prompts JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Studio configurations for customizing each creation studio
CREATE TABLE public.studio_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  studio_type TEXT NOT NULL,
  
  -- Studio preferences
  default_brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  layout_preference TEXT DEFAULT 'grid',
  auto_generate BOOLEAN DEFAULT true,
  show_advanced_options BOOLEAN DEFAULT false,
  
  -- Production defaults
  default_export_format TEXT DEFAULT 'png',
  default_resolution INTEGER DEFAULT 300,
  include_bleed BOOLEAN DEFAULT true,
  include_crop_marks BOOLEAN DEFAULT false,
  
  -- AI preferences
  preferred_model TEXT,
  generation_quality TEXT DEFAULT 'high',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id, studio_type)
);

-- Studio asset templates (pre-configured assets per studio)
CREATE TABLE public.studio_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_type TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  
  -- Template info
  template_name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  
  -- Production specs
  width_px INTEGER,
  height_px INTEGER,
  width_inches NUMERIC,
  height_inches NUMERIC,
  resolution_dpi INTEGER DEFAULT 300,
  bleed_inches NUMERIC DEFAULT 0.125,
  safe_zone_inches NUMERIC DEFAULT 0.25,
  color_mode TEXT DEFAULT 'CMYK',
  
  -- Output settings
  output_formats TEXT[] DEFAULT ARRAY['png', 'pdf'],
  is_print_ready BOOLEAN DEFAULT true,
  is_digital_optimized BOOLEAN DEFAULT true,
  
  -- Prompt configuration
  base_prompt TEXT,
  prompt_variables TEXT[],
  style_modifiers TEXT[],
  
  -- Metadata
  category TEXT,
  tags TEXT[],
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brands
CREATE POLICY "Users can view their own brands"
  ON public.brands FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own brands"
  ON public.brands FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brands"
  ON public.brands FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brands"
  ON public.brands FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for brand_styles (via brand ownership)
CREATE POLICY "Users can view their brand styles"
  ON public.brand_styles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.brands 
    WHERE brands.id = brand_styles.brand_id 
    AND brands.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their brand styles"
  ON public.brand_styles FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.brands 
    WHERE brands.id = brand_styles.brand_id 
    AND brands.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their brand styles"
  ON public.brand_styles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.brands 
    WHERE brands.id = brand_styles.brand_id 
    AND brands.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their brand styles"
  ON public.brand_styles FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.brands 
    WHERE brands.id = brand_styles.brand_id 
    AND brands.user_id = auth.uid()
  ));

-- RLS Policies for studio_configs
CREATE POLICY "Users can view their studio configs"
  ON public.studio_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their studio configs"
  ON public.studio_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their studio configs"
  ON public.studio_configs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their studio configs"
  ON public.studio_configs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for studio_templates (system templates viewable by all, user templates by owner)
CREATE POLICY "Anyone can view system templates"
  ON public.studio_templates FOR SELECT
  USING (is_system = true);

-- Add updated_at triggers
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brand_styles_updated_at
  BEFORE UPDATE ON public.brand_styles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_studio_configs_updated_at
  BEFORE UPDATE ON public.studio_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_studio_templates_updated_at
  BEFORE UPDATE ON public.studio_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
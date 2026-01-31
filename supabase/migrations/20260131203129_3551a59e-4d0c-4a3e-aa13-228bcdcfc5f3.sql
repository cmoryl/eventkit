-- AI Brain: Learning & Memory System
-- Stores successful generations, user feedback, and learned preferences

-- Render engine configurations (user API keys for different providers)
CREATE TABLE public.render_engines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL, -- 'lovable', 'openai', 'stability', 'replicate', 'midjourney'
  display_name TEXT NOT NULL,
  api_key_encrypted TEXT, -- null for 'lovable' (uses built-in)
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}', -- provider-specific settings
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Learning: Store successful generations for training
CREATE TABLE public.ai_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  prompt_used TEXT NOT NULL,
  style_description TEXT,
  color_palette JSONB,
  location TEXT,
  cultural_context TEXT,
  result_image_url TEXT,
  render_engine TEXT DEFAULT 'lovable',
  generation_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User feedback on generations (for learning)
CREATE TABLE public.ai_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  generation_id UUID REFERENCES public.ai_generations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_type TEXT, -- 'thumbs_up', 'thumbs_down', 'edited', 'regenerated', 'accepted'
  feedback_text TEXT,
  edits_made JSONB, -- what changes user made after generation
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Knowledge Base: Learned patterns and preferences
CREATE TABLE public.ai_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID, -- null for global knowledge
  knowledge_type TEXT NOT NULL, -- 'style_preference', 'prompt_pattern', 'asset_template', 'cultural_mapping'
  category TEXT, -- asset type, location, style category
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.5, -- 0-1 how confident we are
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(3,2) DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Prompt templates that work well
CREATE TABLE public.prompt_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_type TEXT NOT NULL,
  template_name TEXT NOT NULL,
  prompt_template TEXT NOT NULL,
  variables JSONB DEFAULT '[]', -- list of variables like {eventName}, {colorPalette}
  success_rate DECIMAL(3,2) DEFAULT 0.5,
  usage_count INTEGER DEFAULT 0,
  is_system BOOLEAN DEFAULT false, -- system templates vs user-created
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.render_engines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for render_engines
CREATE POLICY "Users can view their own render engines" ON public.render_engines
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own render engines" ON public.render_engines
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own render engines" ON public.render_engines
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own render engines" ON public.render_engines
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ai_generations
CREATE POLICY "Users can view their own generations" ON public.ai_generations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own generations" ON public.ai_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_feedback
CREATE POLICY "Users can view their own feedback" ON public.ai_feedback
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own feedback" ON public.ai_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_knowledge (users see their own + global)
CREATE POLICY "Users can view own and global knowledge" ON public.ai_knowledge
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can create own knowledge" ON public.ai_knowledge
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own knowledge" ON public.ai_knowledge
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for prompt_templates (users see system + own)
CREATE POLICY "Users can view system and own templates" ON public.prompt_templates
  FOR SELECT USING (is_system = true OR auth.uid() = created_by);
CREATE POLICY "Users can create own templates" ON public.prompt_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by AND is_system = false);
CREATE POLICY "Users can update own templates" ON public.prompt_templates
  FOR UPDATE USING (auth.uid() = created_by AND is_system = false);

-- Triggers for updated_at
CREATE TRIGGER update_render_engines_updated_at
  BEFORE UPDATE ON public.render_engines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_knowledge_updated_at
  BEFORE UPDATE ON public.ai_knowledge
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prompt_templates_updated_at
  BEFORE UPDATE ON public.prompt_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default system prompt templates
INSERT INTO public.prompt_templates (asset_type, template_name, prompt_template, variables, is_system) VALUES
('SOCIAL_POST', 'Modern Social', 'Create a {aspectRatio} social media post for "{eventName}". Style: {styleDescription}. Colors: {colorPalette}. {culturalContext}', '["aspectRatio", "eventName", "styleDescription", "colorPalette", "culturalContext"]', true),
('BANNER', 'Event Banner', 'Design a professional event banner for "{eventName}". Dimensions: {dimensions}. Style: {styleDescription}. Include event branding prominently. {culturalContext}', '["eventName", "dimensions", "styleDescription", "culturalContext"]', true),
('STEP_AND_REPEAT', 'Media Wall', 'Create a step and repeat media wall backdrop with repeating logo pattern. Logo arrangement: diagonal grid with consistent spacing. Event: "{eventName}". {styleDescription}', '["eventName", "styleDescription"]', true),
('NAME_TAG', 'Professional Badge', 'Design a professional name badge/tag for "{eventName}". Include space for name and title. Style: {styleDescription}. Colors: {colorPalette}', '["eventName", "styleDescription", "colorPalette"]', true),
('TSHIRT', 'Event Tee', 'Create a t-shirt design for "{eventName}". Style: {styleDescription}. The design should work well on fabric and be print-ready. {culturalContext}', '["eventName", "styleDescription", "culturalContext"]', true);
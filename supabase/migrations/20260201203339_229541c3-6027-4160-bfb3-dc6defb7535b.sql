-- Create hero_content table for user-customizable hero sections
CREATE TABLE public.hero_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_text TEXT DEFAULT '100+ Asset Types',
  headline_start TEXT DEFAULT 'Create Stunning',
  headline_highlight TEXT DEFAULT 'Event Design Kits',
  description TEXT DEFAULT 'From banners to merchandise — upload your logo, describe your style, and generate a complete professional branding package in minutes.',
  cta_text TEXT DEFAULT 'Get Started',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_hero UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own hero content" 
ON public.hero_content 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own hero content" 
ON public.hero_content 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hero content" 
ON public.hero_content 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hero content" 
ON public.hero_content 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_hero_content_updated_at
BEFORE UPDATE ON public.hero_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
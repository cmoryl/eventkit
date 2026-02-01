-- Create app_settings table for site-wide configuration like logo
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read app settings (they're public site settings)
CREATE POLICY "App settings are publicly readable" 
ON public.app_settings 
FOR SELECT 
USING (true);

-- Only authenticated users can modify (will add admin check in app)
CREATE POLICY "Authenticated users can update app settings" 
ON public.app_settings 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert app settings" 
ON public.app_settings 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Insert default logo setting
INSERT INTO public.app_settings (key, value) 
VALUES ('logo', '{"type": "default", "url": null, "iconUrl": null}');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table to store user's event design projects
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  event_details JSONB NOT NULL DEFAULT '{}',
  color_palette JSONB DEFAULT '[]',
  logos JSONB DEFAULT '[]',
  generated_assets JSONB DEFAULT '[]',
  folders JSONB DEFAULT '[]',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_assets table for individual asset storage (optional for large projects)
CREATE TABLE public.project_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  folder_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assets ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view their own projects" 
ON public.projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Project assets policies
CREATE POLICY "Users can view their own project assets" 
ON public.project_assets 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_assets.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create assets in their own projects" 
ON public.project_assets 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_assets.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update assets in their own projects" 
ON public.project_assets 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_assets.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete assets in their own projects" 
ON public.project_assets 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_assets.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_assets_updated_at
BEFORE UPDATE ON public.project_assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX idx_project_assets_project_id ON public.project_assets(project_id);
CREATE INDEX idx_project_assets_asset_type ON public.project_assets(asset_type);
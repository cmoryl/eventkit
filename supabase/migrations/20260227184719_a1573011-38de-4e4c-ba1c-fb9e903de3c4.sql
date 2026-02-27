
-- 1. Fix app_settings: restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "App settings are publicly readable" ON public.app_settings;
CREATE POLICY "Authenticated users can read app settings"
  ON public.app_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 2. Fix app_settings: restrict INSERT/UPDATE to admins via user_roles
-- First create the role system if not exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles table itself
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Replace permissive app_settings write policies with admin-only
DROP POLICY IF EXISTS "Authenticated users can insert app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Authenticated users can update app settings" ON public.app_settings;

CREATE POLICY "Only admins can insert app settings"
  ON public.app_settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update app settings"
  ON public.app_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Fix prompt_templates: require authentication for reading system templates
DROP POLICY IF EXISTS "Users can view system and own templates" ON public.prompt_templates;
CREATE POLICY "Authenticated users can view system and own templates"
  ON public.prompt_templates FOR SELECT
  USING (auth.uid() IS NOT NULL AND (is_system = true OR auth.uid() = created_by));

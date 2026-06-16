CREATE TABLE public.user_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime TEXT,
  kind TEXT NOT NULL DEFAULT 'image',
  size INTEGER,
  width INTEGER,
  height INTEGER,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_media TO authenticated;
GRANT ALL ON public.user_media TO service_role;

ALTER TABLE public.user_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own media"
  ON public.user_media FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own media"
  ON public.user_media FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media"
  ON public.user_media FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media"
  ON public.user_media FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_user_media_updated_at
  BEFORE UPDATE ON public.user_media
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_user_media_user_created ON public.user_media (user_id, created_at DESC);
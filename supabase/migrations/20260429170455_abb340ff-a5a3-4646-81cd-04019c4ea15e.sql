CREATE TABLE public.deck_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  source_kind text NOT NULL CHECK (source_kind IN ('preview', 'deck')),
  palette jsonb NOT NULL DEFAULT '{}'::jsonb,
  theme_prompt text,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  thumbnail text,
  is_shared boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.deck_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own or shared deck templates"
  ON public.deck_templates FOR SELECT
  USING (auth.uid() = user_id OR is_shared = true);

CREATE POLICY "Insert own deck templates"
  ON public.deck_templates FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (is_shared = false OR has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Update own deck templates"
  ON public.deck_templates FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (
    (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role))
    AND (is_shared = false OR has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Delete own deck templates"
  ON public.deck_templates FOR DELETE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER deck_templates_updated_at
  BEFORE UPDATE ON public.deck_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX deck_templates_user_id_idx ON public.deck_templates(user_id);
CREATE INDEX deck_templates_shared_idx ON public.deck_templates(is_shared) WHERE is_shared = true;
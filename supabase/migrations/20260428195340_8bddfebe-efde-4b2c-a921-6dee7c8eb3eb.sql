-- 1) Agent prompt presets (the SUGGESTIONS chips on /agent/powerpoint).
-- Read by all authenticated users; only admins can manage.
CREATE TABLE public.agent_prompt_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_key TEXT NOT NULL DEFAULT 'powerpoint',
  label TEXT NOT NULL,
  prompt TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_prompt_presets_agent ON public.agent_prompt_presets(agent_key, sort_order);

ALTER TABLE public.agent_prompt_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read agent prompt presets"
ON public.agent_prompt_presets
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can insert agent prompt presets"
ON public.agent_prompt_presets
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update agent prompt presets"
ON public.agent_prompt_presets
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete agent prompt presets"
ON public.agent_prompt_presets
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_agent_prompt_presets_updated_at
BEFORE UPDATE ON public.agent_prompt_presets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the 4 PowerPoint Agent suggestions
INSERT INTO public.agent_prompt_presets (agent_key, label, prompt, sort_order) VALUES
  ('powerpoint', 'B2B SaaS pitch', 'Pitch deck for a B2B SaaS launching AI scheduling tool', 0),
  ('powerpoint', 'Investor update', 'Investor update for Q3 — revenue, growth, key wins', 1),
  ('powerpoint', 'Design systems workshop', 'Workshop deck: Intro to design systems, 12 slides', 2),
  ('powerpoint', 'Sales kickoff', 'Sales kickoff: 2026 strategy & territory plan', 3);

-- 2) Deck outline archive — every generated deck outline is persisted so users
-- can re-open, re-edit, and re-render later without losing work.
CREATE TABLE public.deck_outlines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  outline JSONB NOT NULL,
  download_url TEXT,
  filename TEXT,
  source_kind TEXT,
  brand_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_deck_outlines_user ON public.deck_outlines(user_id, updated_at DESC);

ALTER TABLE public.deck_outlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deck outlines"
ON public.deck_outlines
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deck outlines"
ON public.deck_outlines
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deck outlines"
ON public.deck_outlines
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deck outlines"
ON public.deck_outlines
FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER trg_deck_outlines_updated_at
BEFORE UPDATE ON public.deck_outlines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
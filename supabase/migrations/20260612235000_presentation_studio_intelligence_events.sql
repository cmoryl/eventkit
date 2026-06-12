-- Presentation Studio Intelligence persistence
-- Tracks first-party presentation events and intelligence snapshots so the studio can
-- provide an enterprise-ready audit trail around generation, brand decisions, QA, review, and export.

CREATE TABLE public.presentation_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  artifact_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  actor_role TEXT NOT NULL DEFAULT 'system',
  actor_name TEXT,
  summary TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_presentation_events_user_artifact
ON public.presentation_events(user_id, artifact_id, created_at DESC);

CREATE INDEX idx_presentation_events_type
ON public.presentation_events(event_type, created_at DESC);

ALTER TABLE public.presentation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own presentation events"
ON public.presentation_events
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own presentation events"
ON public.presentation_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presentation events"
ON public.presentation_events
FOR DELETE
USING (auth.uid() = user_id);

CREATE TABLE public.presentation_intelligence_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  artifact_id TEXT NOT NULL,
  status TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  creation_mode TEXT,
  deck_style TEXT,
  slide_count INTEGER NOT NULL DEFAULT 0,
  agent_qa JSONB NOT NULL DEFAULT '{}'::jsonb,
  export_fidelity JSONB NOT NULL DEFAULT '{}'::jsonb,
  event_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_presentation_intelligence_snapshots_user_artifact
ON public.presentation_intelligence_snapshots(user_id, artifact_id, updated_at DESC);

ALTER TABLE public.presentation_intelligence_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own presentation intelligence snapshots"
ON public.presentation_intelligence_snapshots
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own presentation intelligence snapshots"
ON public.presentation_intelligence_snapshots
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presentation intelligence snapshots"
ON public.presentation_intelligence_snapshots
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presentation intelligence snapshots"
ON public.presentation_intelligence_snapshots
FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER trg_presentation_intelligence_snapshots_updated_at
BEFORE UPDATE ON public.presentation_intelligence_snapshots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

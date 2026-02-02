-- Create queue analytics table to track generation metrics
CREATE TABLE public.queue_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID,
  asset_type TEXT NOT NULL,
  job_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'failed')),
  duration_ms INTEGER,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  render_engine TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.queue_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can insert their own analytics"
ON public.queue_analytics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics"
ON public.queue_analytics
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytics"
ON public.queue_analytics
FOR DELETE
USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_queue_analytics_user_asset ON public.queue_analytics(user_id, asset_type);
CREATE INDEX idx_queue_analytics_created ON public.queue_analytics(created_at DESC);

-- Enable realtime for live dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_analytics;
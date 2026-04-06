
-- Add auto-sync tracking column to brands
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS brandhub_last_checked timestamp with time zone DEFAULT NULL;

-- Create push log table for two-way sync
CREATE TABLE public.brandhub_push_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  brandhub_token text NOT NULL,
  assets_pushed jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.brandhub_push_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own push logs"
  ON public.brandhub_push_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own push logs"
  ON public.brandhub_push_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push logs"
  ON public.brandhub_push_log FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_brandhub_push_log_updated_at
  BEFORE UPDATE ON public.brandhub_push_log
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create a table to track generation progress in real-time
CREATE TABLE public.generation_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  user_id UUID NOT NULL,
  total_assets INTEGER NOT NULL DEFAULT 0,
  completed_assets INTEGER NOT NULL DEFAULT 0,
  current_asset_name TEXT,
  current_asset_type TEXT,
  phase TEXT NOT NULL DEFAULT 'preparing',
  estimated_seconds_remaining INTEGER DEFAULT 0,
  completed_ai_calls INTEGER NOT NULL DEFAULT 0,
  estimated_ai_calls INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.generation_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own generation progress
CREATE POLICY "Users can view their own generation progress" 
ON public.generation_progress 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own generation progress
CREATE POLICY "Users can insert their own generation progress" 
ON public.generation_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own generation progress
CREATE POLICY "Users can update their own generation progress" 
ON public.generation_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own generation progress
CREATE POLICY "Users can delete their own generation progress" 
ON public.generation_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_generation_progress_updated_at
BEFORE UPDATE ON public.generation_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.generation_progress;

-- Create index for faster lookups
CREATE INDEX idx_generation_progress_session ON public.generation_progress(session_id);
CREATE INDEX idx_generation_progress_user ON public.generation_progress(user_id);
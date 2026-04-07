
CREATE TABLE public.logo_placements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_type TEXT NOT NULL,
  x NUMERIC NOT NULL DEFAULT 0,
  y NUMERIC NOT NULL DEFAULT 0,
  scale NUMERIC NOT NULL DEFAULT 0.18,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, asset_type)
);

ALTER TABLE public.logo_placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own logo placements"
ON public.logo_placements FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own logo placements"
ON public.logo_placements FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logo placements"
ON public.logo_placements FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logo placements"
ON public.logo_placements FOR DELETE
USING (auth.uid() = user_id);

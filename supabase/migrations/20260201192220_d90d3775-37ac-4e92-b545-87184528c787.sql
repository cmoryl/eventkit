-- Allow DELETE on prompt_templates for users who created them
CREATE POLICY "Users can delete own templates"
ON public.prompt_templates
FOR DELETE
USING (auth.uid() = created_by);

-- Allow system templates to be created/updated when created_by is set
DROP POLICY IF EXISTS "Users can create own templates" ON public.prompt_templates;
CREATE POLICY "Users can create templates"
ON public.prompt_templates
FOR INSERT
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update own templates" ON public.prompt_templates;
CREATE POLICY "Users can update templates"
ON public.prompt_templates
FOR UPDATE
USING (auth.uid() = created_by);

-- Allow DELETE on ai_knowledge for owners
CREATE POLICY "Users can delete own knowledge"
ON public.ai_knowledge
FOR DELETE
USING (auth.uid() = user_id);
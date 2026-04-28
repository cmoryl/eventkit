INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-decks', 'generated-decks', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read generated decks"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-decks');

CREATE POLICY "Authenticated users can upload decks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'generated-decks');

CREATE POLICY "Service role can manage decks"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'generated-decks')
WITH CHECK (bucket_id = 'generated-decks');
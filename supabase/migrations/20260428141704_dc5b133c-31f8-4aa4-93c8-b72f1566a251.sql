-- Tighten read policy: deny LIST (no path), allow only direct file reads
DROP POLICY IF EXISTS "Public can read generated decks" ON storage.objects;

CREATE POLICY "Public can read individual generated decks"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'generated-decks'
  AND (storage.foldername(name))[1] IS NOT NULL
);

-- ============================================================
-- 1. STORAGE: Tighten asset-images bucket policies
-- ============================================================
-- Drop overly broad policies that let any authenticated user
-- delete/update/upload any file in the bucket.
DROP POLICY IF EXISTS "Authenticated users can update in asset-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from asset-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to asset-images" ON storage.objects;

-- Add an ownership-scoped UPDATE policy (the existing ownership-scoped INSERT/DELETE/SELECT remain).
CREATE POLICY "Users can update their own asset images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'asset-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'asset-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- ============================================================
-- 2. STORAGE: Make generated-decks private + owner-only reads
-- ============================================================
UPDATE storage.buckets SET public = false WHERE id = 'generated-decks';

DROP POLICY IF EXISTS "Public can read individual generated decks" ON storage.objects;

-- Re-write upload/read so only the owning user (folder = uid) can read/write.
DROP POLICY IF EXISTS "Authenticated users can upload decks" ON storage.objects;

CREATE POLICY "Users can upload their own decks"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'generated-decks'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can read their own decks"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'generated-decks'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own decks"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'generated-decks'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- ============================================================
-- 3. brandhub_push_log: Hide brandhub_token from clients
-- ============================================================
-- Revoke column-level SELECT on the sensitive token; clients should
-- never receive the raw integration token. Server (service role) keeps full access.
REVOKE SELECT (brandhub_token) ON public.brandhub_push_log FROM anon, authenticated;

-- ============================================================
-- 4. SECURITY DEFINER functions: lock down EXECUTE
-- ============================================================
-- handle_new_user is a trigger-only function, no client should call it.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

-- has_role is used inside RLS policies (auth.uid passed). Limit to authenticated only.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;

-- ============================================================
-- 5. Realtime: scope channel subscriptions by auth context
-- ============================================================
-- Realtime requires authenticated users. Only allow subscribing to
-- topics that include the user's own uid (e.g. "user:<uid>" or "<uid>:...").
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can subscribe to own topics" ON realtime.messages;

CREATE POLICY "Authenticated users can subscribe to own topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() LIKE '%' || (auth.uid())::text || '%'
);

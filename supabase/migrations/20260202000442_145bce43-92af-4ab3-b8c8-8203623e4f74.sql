-- Add policy to allow authenticated users to upload to site/ folder in asset-images bucket
CREATE POLICY "Allow authenticated users to upload site assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'asset-images' AND (storage.foldername(name))[1] = 'site');

-- Add policy to allow authenticated users to update site assets
CREATE POLICY "Allow authenticated users to update site assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'asset-images' AND (storage.foldername(name))[1] = 'site');

-- Add policy to allow authenticated users to delete site assets
CREATE POLICY "Allow authenticated users to delete site assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'asset-images' AND (storage.foldername(name))[1] = 'site');
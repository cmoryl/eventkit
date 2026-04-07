
-- Allow authenticated users to upload files to asset-images bucket
CREATE POLICY "Authenticated users can upload to asset-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'asset-images');

-- Allow authenticated users to update their own files in asset-images
CREATE POLICY "Authenticated users can update in asset-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'asset-images');

-- Allow authenticated users to delete their own files in asset-images
CREATE POLICY "Authenticated users can delete from asset-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'asset-images');

-- Create storage bucket for saved asset images
INSERT INTO storage.buckets (id, name, public)
VALUES ('asset-images', 'asset-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload asset images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'asset-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to view their own images
CREATE POLICY "Users can view their own asset images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'asset-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access for asset images (for display in UI)
CREATE POLICY "Public can view asset images"
ON storage.objects FOR SELECT
USING (bucket_id = 'asset-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own asset images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'asset-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
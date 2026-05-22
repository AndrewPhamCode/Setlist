-- Add image_url to shows
ALTER TABLE shows ADD COLUMN IF NOT EXISTS image_url text;

-- Create show-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('show-images', 'show-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view show images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'show-images');

CREATE POLICY "Authenticated users can upload show images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'show-images'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own show images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'show-images'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own show images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'show-images'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

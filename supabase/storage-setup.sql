-- Run this in the Supabase SQL Editor to set up storage

-- Create storage bucket for lead photos (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('lead-photos', 'lead-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for authenticated users
CREATE POLICY "Authenticated users can upload lead photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'lead-photos');

CREATE POLICY "Authenticated users can view lead photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'lead-photos');

CREATE POLICY "Authenticated users can delete lead photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'lead-photos');

-- Allow public read access for photos (so they display in portal)
CREATE POLICY "Public can view lead photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'lead-photos');

-- Allow service role to upload (for contact form submissions)
-- Note: Service role bypasses RLS so no explicit policy needed

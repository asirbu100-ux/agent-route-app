-- ============================================================
-- 003_storage_policies.sql
-- Supabase Storage bucket + policies for visit photos
-- Run AFTER creating the bucket "visit-photos" in the dashboard
-- (or it will be created automatically on first use)
-- ============================================================

-- Create bucket (idempotent via insert ignore)
INSERT INTO storage.buckets (id, name, public)
VALUES ('visit-photos', 'visit-photos', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Agents can upload to their own folder: {uid}/...
CREATE POLICY "agents_upload_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'visit-photos'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Agents can read their own uploads
CREATE POLICY "agents_read_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'visit-photos'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Managers can read all visit photos
CREATE POLICY "managers_read_all" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'visit-photos'
    AND (auth.jwt() ->> 'user_role') = 'manager'
  );

-- Agents can delete their own uploads (for replacing a photo)
CREATE POLICY "agents_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'visit-photos'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

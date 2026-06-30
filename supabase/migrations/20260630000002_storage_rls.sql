-- =============================================================================
-- EMLAKIE STORAGE BUCKET POLICIES — listing-photos
-- =============================================================================
-- The listing-photos bucket stores files at:
--   {userId}/originals/{filename}      ← raw upload before processing
--   {userId}/thumb/{filename}.webp     ← 800px variant
--   {userId}/medium/{filename}.webp    ← 1920px variant
--   {userId}/full/{filename}.webp      ← full-res variant
--   {userId}/photos/.keep              ← vault placeholder
--   {userId}/documents/.keep
--   {userId}/media/.keep
--
-- Rules:
--   READ  — public can read any file (listing photos are public on the site)
--   WRITE — only the owner of the folder prefix can upload/delete their own files
--           Service role (used by process-image, init-vault, backfill) bypasses these.
-- =============================================================================

-- Public read on all objects in listing-photos
DROP POLICY IF EXISTS "public_read_listing_photos" ON storage.objects;
CREATE POLICY "public_read_listing_photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-photos');

-- Authenticated users can upload only to their own folder (prefix = their user id)
DROP POLICY IF EXISTS "owner_upload_listing_photos" ON storage.objects;
CREATE POLICY "owner_upload_listing_photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can update (upsert) only their own files
DROP POLICY IF EXISTS "owner_update_listing_photos" ON storage.objects;
CREATE POLICY "owner_update_listing_photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'listing-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete only their own files
DROP POLICY IF EXISTS "owner_delete_listing_photos" ON storage.objects;
CREATE POLICY "owner_delete_listing_photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'listing-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

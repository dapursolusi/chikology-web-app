-- =====================================================================
-- book_chapter_rls_and_bucket.sql
-- =====================================================================
-- Phase 3 Slice 2 — Issue #15.
-- RLS policies + storage bucket for the E-Book system.
--
-- Apply manually via Supabase SQL editor or `psql $DATABASE_URL -f`.
-- drizzle-kit push does NOT execute this file (per HANDOFFS D-023).
-- Idempotent: safe to re-run.
-- =====================================================================


-- ---------------------------------------------------------------------
-- Storage bucket: book-chapters (private)
-- ---------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-chapters', 'book-chapters', false)
ON CONFLICT (id) DO NOTHING;


-- ---------------------------------------------------------------------
-- book_chapters
-- ---------------------------------------------------------------------
ALTER TABLE book_chapters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read book_chapters" ON book_chapters;
CREATE POLICY "Public can read book_chapters" ON book_chapters
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can insert book_chapters" ON book_chapters;
CREATE POLICY "Admins can insert book_chapters" ON book_chapters
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update book_chapters" ON book_chapters;
CREATE POLICY "Admins can update book_chapters" ON book_chapters
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete book_chapters" ON book_chapters;
CREATE POLICY "Admins can delete book_chapters" ON book_chapters
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ---------------------------------------------------------------------
-- chapter_purchases (immutable per issue spec)
-- ---------------------------------------------------------------------
ALTER TABLE chapter_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own purchases" ON chapter_purchases;
CREATE POLICY "Users can read own purchases" ON chapter_purchases
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own purchases" ON chapter_purchases;
CREATE POLICY "Users can insert own purchases" ON chapter_purchases
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Intentionally no UPDATE or DELETE policy — purchases are immutable.


-- ---------------------------------------------------------------------
-- app_settings
-- ---------------------------------------------------------------------
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read app_settings" ON app_settings;
CREATE POLICY "Public can read app_settings" ON app_settings
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can insert app_settings" ON app_settings;
CREATE POLICY "Admins can insert app_settings" ON app_settings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update app_settings" ON app_settings;
CREATE POLICY "Admins can update app_settings" ON app_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ---------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own row" ON users;
CREATE POLICY "Users can read own row" ON users
  FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins can update users" ON users;
CREATE POLICY "Admins can update users" ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ---------------------------------------------------------------------
-- storage.objects — book-chapters bucket
-- ---------------------------------------------------------------------
-- No public SELECT policy. Reads must go through server-action-generated
-- signed URLs (5-min expiry). Only admins can upload/update/delete.

DROP POLICY IF EXISTS "Admins can upload to book-chapters" ON storage.objects;
CREATE POLICY "Admins can upload to book-chapters" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'book-chapters'
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update book-chapters" ON storage.objects;
CREATE POLICY "Admins can update book-chapters" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'book-chapters'
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete from book-chapters" ON storage.objects;
CREATE POLICY "Admins can delete from book-chapters" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'book-chapters'
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

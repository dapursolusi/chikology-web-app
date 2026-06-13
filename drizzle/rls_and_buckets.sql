-- =====================================================================
-- rls_and_buckets.sql
-- =====================================================================
-- RLS policies + storage buckets for the Chikology system.
--
-- Run:  cat drizzle/rls_and_buckets.sql | psql $DATABASE_URL
-- Or:   bun run db:rls
-- Or:   paste into Supabase SQL editor
--
-- RLS is NOT managed by Drizzle migrations (Drizzle only handles
-- table schema). This script must be run once per environment AND
-- after any `drizzle-kit push` that creates new tables, because
-- newly created tables have RLS disabled by default.
--
-- Idempotent — safe to re-run anytime.
-- =====================================================================


-- =====================================================================
-- STORAGE BUCKETS
-- =====================================================================

-- book-chapters: PDF files (private — accessed via server-side signed URLs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-chapters', 'book-chapters', false)
ON CONFLICT (id) DO NOTHING;

-- payment-proofs: uploaded proof images (private — accessed via server)
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;


-- =====================================================================
-- TABLE: users
-- =====================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own row" ON users;
CREATE POLICY "Users can read own row" ON users
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins can read all users" ON users;
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update users" ON users;
CREATE POLICY "Admins can update users" ON users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );


-- =====================================================================
-- TABLE: book_chapters
-- =====================================================================
ALTER TABLE book_chapters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read book_chapters" ON book_chapters;
CREATE POLICY "Public can read book_chapters" ON book_chapters
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert book_chapters" ON book_chapters;
CREATE POLICY "Admins can insert book_chapters" ON book_chapters
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update book_chapters" ON book_chapters;
CREATE POLICY "Admins can update book_chapters" ON book_chapters
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can delete book_chapters" ON book_chapters;
CREATE POLICY "Admins can delete book_chapters" ON book_chapters
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );


-- =====================================================================
-- TABLE: chapter_purchases
-- =====================================================================
ALTER TABLE chapter_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own purchases" ON chapter_purchases;
CREATE POLICY "Users can read own purchases" ON chapter_purchases
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can read all purchases" ON chapter_purchases;
CREATE POLICY "Admins can read all purchases" ON chapter_purchases
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can insert own purchases" ON chapter_purchases;
CREATE POLICY "Users can insert own purchases" ON chapter_purchases
  FOR INSERT WITH CHECK (user_id = auth.uid());


-- =====================================================================
-- TABLE: payment_proofs
-- =====================================================================
ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own payment proofs" ON payment_proofs;
CREATE POLICY "Users can read own payment proofs" ON payment_proofs
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can read all payment proofs" ON payment_proofs;
CREATE POLICY "Admins can read all payment proofs" ON payment_proofs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can insert own payment proofs" ON payment_proofs;
CREATE POLICY "Users can insert own payment proofs" ON payment_proofs
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can update payment proofs" ON payment_proofs;
CREATE POLICY "Admins can update payment proofs" ON payment_proofs
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );


-- =====================================================================
-- TABLE: journal_entries
-- =====================================================================
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own journal entries" ON journal_entries;
CREATE POLICY "Users can read own journal entries" ON journal_entries
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own journal entries" ON journal_entries;
CREATE POLICY "Users can insert own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own journal entries" ON journal_entries;
CREATE POLICY "Users can update own journal entries" ON journal_entries
  FOR UPDATE USING (user_id = auth.uid());

-- Soft-delete is done via server action (SET deleted_at), not via DELETE
-- SQL — no DELETE policy needed.


-- =====================================================================
-- TABLE: questionnaire_responses
-- =====================================================================
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own questionnaire responses"
  ON questionnaire_responses;
CREATE POLICY "Users can read own questionnaire responses"
  ON questionnaire_responses
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own questionnaire responses"
  ON questionnaire_responses;
CREATE POLICY "Users can insert own questionnaire responses"
  ON questionnaire_responses
  FOR INSERT WITH CHECK (user_id = auth.uid());


-- =====================================================================
-- TABLE: scan_usage
-- =====================================================================
ALTER TABLE scan_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own scan usage" ON scan_usage;
CREATE POLICY "Users can read own scan usage" ON scan_usage
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own scan usage" ON scan_usage;
CREATE POLICY "Users can insert own scan usage" ON scan_usage
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own scan usage" ON scan_usage;
CREATE POLICY "Users can update own scan usage" ON scan_usage
  FOR UPDATE USING (user_id = auth.uid());


-- =====================================================================
-- TABLE: app_settings
-- =====================================================================
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read app_settings" ON app_settings;
CREATE POLICY "Public can read app_settings" ON app_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert app_settings" ON app_settings;
CREATE POLICY "Admins can insert app_settings" ON app_settings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update app_settings" ON app_settings;
CREATE POLICY "Admins can update app_settings" ON app_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );


-- =====================================================================
-- TABLE: chapter_access_logs
-- =====================================================================
ALTER TABLE chapter_access_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can READ audit logs. All INSERTS go through server-side
-- code (service_role) which bypasses RLS entirely.
DROP POLICY IF EXISTS "Admins can read all access logs"
  ON chapter_access_logs;
CREATE POLICY "Admins can read all access logs"
  ON chapter_access_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );


-- =====================================================================
-- STORAGE BUCKET POLICIES
-- =====================================================================

-- book-chapters: only admins can manage files (reads via server-side
-- signed URLs / service_role download).
DROP POLICY IF EXISTS "Admins can upload to book-chapters"
  ON storage.objects;
CREATE POLICY "Admins can upload to book-chapters"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'book-chapters'
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update book-chapters"
  ON storage.objects;
CREATE POLICY "Admins can update book-chapters"
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'book-chapters'
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete from book-chapters"
  ON storage.objects;
CREATE POLICY "Admins can delete from book-chapters"
  ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'book-chapters'
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- payment-proofs: users can upload their own proof files; admins can
-- read/delete all (for verification).
DROP POLICY IF EXISTS "Users can upload payment proofs"
  ON storage.objects;
CREATE POLICY "Users can upload payment proofs"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs'
  );

DROP POLICY IF EXISTS "Admins can read payment proofs"
  ON storage.objects;
CREATE POLICY "Admins can read payment proofs"
  ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete payment proofs"
  ON storage.objects;
CREATE POLICY "Admins can delete payment proofs"
  ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

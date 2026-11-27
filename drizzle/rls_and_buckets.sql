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
-- HELPERS
-- =====================================================================
-- SECURITY DEFINER so the role lookup bypasses RLS. Without this, any
-- policy that queries `users` from inside a `users` policy recurses
-- ("infinite recursion detected in policy for relation users").
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;


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
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can update users" ON users;
CREATE POLICY "Admins can update users" ON users
  FOR UPDATE USING (
    public.is_admin()
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
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can update book_chapters" ON book_chapters;
CREATE POLICY "Admins can update book_chapters" ON book_chapters
  FOR UPDATE USING (
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can delete book_chapters" ON book_chapters;
CREATE POLICY "Admins can delete book_chapters" ON book_chapters
  FOR DELETE USING (
    public.is_admin()
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
    public.is_admin()
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
    public.is_admin()
  );

DROP POLICY IF EXISTS "Users can insert own payment proofs" ON payment_proofs;
CREATE POLICY "Users can insert own payment proofs" ON payment_proofs
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can update payment proofs" ON payment_proofs;
CREATE POLICY "Admins can update payment proofs" ON payment_proofs
  FOR UPDATE USING (
    public.is_admin()
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
-- TABLE: scan_results
-- =====================================================================
ALTER TABLE scan_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own scan results"
  ON scan_results;

CREATE POLICY "Users can read own scan results"
  ON scan_results
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));


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
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can update app_settings" ON app_settings;
CREATE POLICY "Admins can update app_settings" ON app_settings
  FOR UPDATE USING (
    public.is_admin()
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
    public.is_admin()
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
    AND public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can update book-chapters"
  ON storage.objects;
CREATE POLICY "Admins can update book-chapters"
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'book-chapters'
    AND public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can delete from book-chapters"
  ON storage.objects;
CREATE POLICY "Admins can delete from book-chapters"
  ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'book-chapters'
    AND public.is_admin()
  );

-- payment-proofs: users can upload their own proof files; admins can
-- read/delete all (for verification).
-- The folder check matters: uploads are stored as <user_id>/<file>, so
-- a bucket-only check would let any user write into another user's
-- folder. Permissive policies OR together, so this must be the only
-- insert policy on this bucket.
DROP POLICY IF EXISTS "Users can upload payment proofs"
  ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own payment proofs"
  ON storage.objects;
CREATE POLICY "Users can upload their own payment proofs"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "Admins can read payment proofs"
  ON storage.objects;
CREATE POLICY "Admins can read payment proofs"
  ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can delete payment proofs"
  ON storage.objects;
CREATE POLICY "Admins can delete payment proofs"
  ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND public.is_admin()
  );

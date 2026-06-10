-- =====================================================================
-- 0004_supabase_keepalive_cron.sql
-- =====================================================================
-- Issue #64 — pg_cron job to prevent Supabase free-tier pausing.
--
-- Supabase free tier pauses projects after 7 days of inactivity.
-- This job runs every 6 days to keep the database alive.
--
-- Cron:    "0 0 */6 * *"  (min=0, hour=0 UTC, every 6 days)
-- Behavior: Recurring. Runs SELECT 1 indefinitely.
--
-- Apply manually via Supabase SQL editor or `psql $DATABASE_URL -f`.
-- drizzle-kit push does NOT execute this file (per HANDOFFS D-023).
-- Idempotent: safe to re-run.
-- =====================================================================


-- ---------------------------------------------------------------------
-- Extension: pg_cron
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_cron;


-- ---------------------------------------------------------------------
-- Idempotency guard: drop any pre-existing job with our name.
-- ---------------------------------------------------------------------
DO $guard$
BEGIN
  IF EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'supabase-keep-alive-6d'
  ) THEN
    PERFORM cron.unschedule('supabase-keep-alive-6d');
  END IF;
END
$guard$;


-- ---------------------------------------------------------------------
-- Schedule recurring keep-alive every 6 days at midnight UTC.
-- ---------------------------------------------------------------------
SELECT cron.schedule(
  'supabase-keep-alive-6d',
  '0 0 */6 * *',
  'SELECT 1'
);

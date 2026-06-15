-- =====================================================================
-- 0003_ebook_live_cron.sql
-- =====================================================================
-- Phase 3 Slice 6D — pg_cron job to auto-flip EBOOK_LIVE feature flag.
--
-- Target:  2026-06-16 10:00:00+07 (Asia/Jakarta)
--         = 2026-06-16 03:00:00 UTC
-- Cron:    "0 3 16 6 *"  (min=0, hour=3 UTC, dom=16, mon=6, dow=*)
-- Behavior: One-shot. The command body sets ebook_live='true' and then
--           calls cron.unschedule() on itself, so the job disappears
--           after firing — no annual re-flip, no leftover schedule.
--
-- Apply manually via Supabase SQL editor or `psql $DATABASE_URL -f`.
-- drizzle-kit push does NOT execute this file (per HANDOFFS D-023).
-- Idempotent: safe to re-run.
-- =====================================================================


-- ---------------------------------------------------------------------
-- Extension: pg_cron
-- ---------------------------------------------------------------------
-- Required for cron.schedule() / cron.unschedule() / cron.job.
-- On Supabase hosted, the postgres role can CREATE EXTENSION this.
CREATE EXTENSION IF NOT EXISTS pg_cron;


-- ---------------------------------------------------------------------
-- Idempotency guard: drop any pre-existing job with our name.
-- ---------------------------------------------------------------------
-- cron.unschedule() raises an error when the named job does not exist,
-- which would break the first-ever run of this migration. Wrap the
-- unschedule in an EXISTS check so the migration is safely re-runnable.
DO $guard$
BEGIN
  IF EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'flip-ebook-live-2026-06-16'
  ) THEN
    PERFORM cron.unschedule('flip-ebook-live-2026-06-16');
  END IF;
END
$guard$;


-- ---------------------------------------------------------------------
-- Schedule the one-shot launch flip.
-- ---------------------------------------------------------------------
-- cron.schedule(name, schedule, command)
--   name     = stable identifier (used by cron.unschedule above + below)
--   schedule = standard unix-cron expression in UTC
--   command  = SQL string, executed by the pg_cron background worker
--
-- The command is a DO block so we can run two statements (UPDATE +
-- unschedule) atomically. The PERFORM inside the DO block is the
-- PL/pgSQL way to call a function and discard the result.
SELECT cron.schedule(
  'flip-ebook-live-2026-06-16',
  '0 3 16 6 *',
  $cmd$
    DO $do$
    BEGIN
      UPDATE app_settings
        SET value      = 'true',
            updated_at = now()
        WHERE key = 'ebook_live';

      PERFORM cron.unschedule('flip-ebook-live-2026-06-16');
    END
    $do$;
  $cmd$
);

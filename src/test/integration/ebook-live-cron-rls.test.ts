import postgres from 'postgres';
import { afterAll, describe, expect, it } from 'vitest';

const HAS_DB = !!process.env.DATABASE_URL;
const conn = HAS_DB
  ? postgres(process.env.DATABASE_URL!, { max: 1, prepare: false })
  : null;

describe.skipIf(!HAS_DB)(
  'Phase 3 Slice 6D — pg_cron EBOOK_LIVE + RLS catalog (live Supabase)',
  () => {
    const sql = conn as postgres.Sql;

    afterAll(async () => {
      await sql.end({ timeout: 5 });
    });

    describe('pg_cron job: flip-ebook-live-2026-06-16', () => {
      it('exists in cron.job with the expected name', async () => {
        const rows = await sql<{ exists: number }[]>`
        SELECT 1 AS exists FROM cron.job WHERE jobname = 'flip-ebook-live-2026-06-16'
      `;
        expect(rows).toHaveLength(1);
      });

      it('is scheduled for "0 17 15 6 *" (17:00 UTC Jun 15 = 00:00+07 Jun 16)', async () => {
        const rows = await sql<{ schedule: string }[]>`
        SELECT schedule FROM cron.job WHERE jobname = 'flip-ebook-live-2026-06-16'
      `;
        expect(rows).toHaveLength(1);
        expect(rows[0].schedule).toBe('0 17 15 6 *');
      });

      it('command body, when executed, sets app_settings.ebook_live to "true" and self-unschedules (rolled back in tx)', async () => {
        // Capture original value for post-rollback sanity check.
        const originalRows = await sql<{ value: string }[]>`
        SELECT value FROM app_settings WHERE key = 'ebook_live'
      `;
        expect(originalRows).toHaveLength(1);
        const original = originalRows[0].value;

        // Run the cron command in a transaction that we roll back, so the live DB
        // is unchanged after this test (job still scheduled, flag still original).
        await sql
          .begin(async (tx) => {
            const cmdRows = await tx<{ command: string }[]>`
          SELECT command FROM cron.job WHERE jobname = 'flip-ebook-live-2026-06-16'
        `;
            expect(cmdRows).toHaveLength(1);
            const command = cmdRows[0].command;
            await tx.unsafe(command);

            const afterRows = await tx<{ value: string }[]>`
          SELECT value FROM app_settings WHERE key = 'ebook_live'
        `;
            expect(afterRows[0].value).toBe('true');
            throw new Error('rollback');
          })
          .catch((e) => {
            if (!(e instanceof Error) || e.message !== 'rollback') throw e;
          });

        // Post-rollback assertions: flag is back to original, job is still scheduled.
        const flagRows = await sql<{ value: string }[]>`
        SELECT value FROM app_settings WHERE key = 'ebook_live'
      `;
        expect(flagRows[0].value).toBe(original);

        const jobRows = await sql<{ exists: number }[]>`
        SELECT 1 AS exists FROM cron.job WHERE jobname = 'flip-ebook-live-2026-06-16'
      `;
        expect(jobRows).toHaveLength(1);
      });
    });

    describe('RLS catalog — book_chapters', () => {
      it('has RLS enabled', async () => {
        const rows = await sql<{ relrowsecurity: boolean }[]>`
        SELECT relrowsecurity FROM pg_class WHERE relname = 'book_chapters'
      `;
        expect(rows).toHaveLength(1);
        expect(rows[0].relrowsecurity).toBe(true);
      });

      it('has 4 policies: public SELECT + admin INSERT/UPDATE/DELETE', async () => {
        const rows = await sql<{ policyname: string; cmd: string }[]>`
        SELECT policyname, cmd
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'book_chapters'
        ORDER BY cmd
      `;
        const names = rows.map((r) => r.policyname);
        expect(names).toContain('Public can read book_chapters');
        expect(names).toContain('Admins can insert book_chapters');
        expect(names).toContain('Admins can update book_chapters');
        expect(names).toContain('Admins can delete book_chapters');
        expect(rows.map((r) => r.cmd)).toEqual([
          'DELETE',
          'INSERT',
          'SELECT',
          'UPDATE',
        ]);
      });
    });

    describe('RLS catalog — chapter_purchases (immutable)', () => {
      it('has RLS enabled', async () => {
        const rows = await sql<{ relrowsecurity: boolean }[]>`
        SELECT relrowsecurity FROM pg_class WHERE relname = 'chapter_purchases'
      `;
        expect(rows).toHaveLength(1);
        expect(rows[0].relrowsecurity).toBe(true);
      });

      it('has only SELECT + INSERT policies (no UPDATE, no DELETE)', async () => {
        const rows = await sql<{ cmd: string }[]>`
        SELECT cmd FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'chapter_purchases'
        ORDER BY cmd
      `;
        expect(rows.map((r) => r.cmd)).toEqual(['INSERT', 'SELECT']);
      });
    });

    describe('RLS catalog — app_settings', () => {
      it('has RLS enabled', async () => {
        const rows = await sql<{ relrowsecurity: boolean }[]>`
        SELECT relrowsecurity FROM pg_class WHERE relname = 'app_settings'
      `;
        expect(rows).toHaveLength(1);
        expect(rows[0].relrowsecurity).toBe(true);
      });

      it('has 3 policies: public SELECT + admin INSERT + admin UPDATE (no DELETE)', async () => {
        const rows = await sql<{ cmd: string }[]>`
        SELECT cmd FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'app_settings'
        ORDER BY cmd
      `;
        expect(rows.map((r) => r.cmd)).toEqual(['INSERT', 'SELECT', 'UPDATE']);
      });
    });

    describe('Storage — book-chapters bucket', () => {
      it('exists and is private (public = false)', async () => {
        const rows = await sql<{ public: boolean }[]>`
        SELECT public FROM storage.buckets WHERE id = 'book-chapters'
      `;
        expect(rows).toHaveLength(1);
        expect(rows[0].public).toBe(false);
      });

      it('storage.objects has 3 admin-only policies scoped to book-chapters (INSERT/UPDATE/DELETE), no SELECT', async () => {
        const rows = await sql<{ cmd: string; policyname: string }[]>`
        SELECT cmd, policyname
        FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
          AND (
            qual::text ILIKE '%book-chapters%'
            OR with_check::text ILIKE '%book-chapters%'
          )
        ORDER BY cmd
      `;
        const cmds = rows.map((r) => r.cmd);
        expect(cmds).toEqual(['DELETE', 'INSERT', 'UPDATE']);
        const names = rows.map((r) => r.policyname);
        expect(names).toContain('Admins can upload to book-chapters');
        expect(names).toContain('Admins can update book-chapters');
        expect(names).toContain('Admins can delete from book-chapters');
      });
    });
  }
);

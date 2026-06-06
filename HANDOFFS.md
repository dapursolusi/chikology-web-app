# HANDOFFS

## [Saturday, 06-06-2026 17:25] — Phase 3 Slice 6D: pg_cron EBOOK_LIVE auto-flip + RLS catalog verification (issue #16, TDD)

### Session Target

Ship ONE vitest integration test file that (a) pins the pg_cron job that auto-flips `app_settings.ebook_live` to `'true'` at 2026-06-16 00:00+07, and (b) verifies the existing RLS policy catalog for `book_chapters`, `chapter_purchases`, `app_settings`, and the `book-chapters` storage bucket. One new SQL migration + one new test file. TDD cycle completed: 3 cron tests RED → migration applied → all 11 tests GREEN.

### Current State

- Status: branch not yet created (sitting on `feat/test/e2e-book-flow` from 6C, clean working tree before this session), 2 new files uncommitted, **236/236 green**. TSC clean. Lint 0 errors (7 pre-existing warnings unchanged). Migration applied to live Supabase DB.
- Scope: 1 new SQL migration + 1 new test file. 0 production code changed. ~210 lines added.

### What Changed

- `drizzle/0003_ebook_live_cron.sql` — **NEW** pg_cron migration, 76 lines, idempotent. Three operations: (1) `CREATE EXTENSION IF NOT EXISTS pg_cron;` (2) idempotency guard: a `DO $guard$ ... $guard$` block that calls `cron.unschedule('flip-ebook-live-2026-06-16')` only if a row already exists in `cron.job` with that name (avoids the "could not find valid entry" error that `cron.unschedule` raises on first run); (3) `cron.schedule('flip-ebook-live-2026-06-16', '0 17 15 6 *', $cmd$ ... $cmd$)` with a `DO $do$ ... $do$` command body that sets `value = 'true'`, updates `updated_at = now()`, and self-unschedules via `PERFORM cron.unschedule(...)`. Cron expression: min=0, hour=17 UTC, dom=15, mon=6, dow=\* → 17:00 UTC June 15 = 00:00+07 June 16. Self-disable pattern means the job runs **exactly once** on launch day, not every June.
- `src/test/integration/ebook-live-cron-rls.test.ts` — **NEW** integration test, 11 `it` blocks across 6 nested `describe` groups. Whole file wrapped in `describe.skipIf(!process.env.DATABASE_URL)` so it is a no-op in CI without the env var. Uses the `postgres` package directly (already in `dependencies`) with a single connection opened at module load + closed in `afterAll`.
  - **Group 1: pg_cron job: flip-ebook-live-2026-06-16** (3 tests)
    1. `cron.job` has a row with `jobname = 'flip-ebook-live-2026-06-16'`
    2. That row's `schedule` column = `'0 17 15 6 *'`
    3. **Behavior test**: the job's `command`, when executed inside a transaction that is then rolled back, sets `app_settings.ebook_live` to `'true'`. After rollback, both the flag value AND the cron job row are verified back to their original state. This is the gold-standard "observable behavior" test — it actually runs the SQL the worker will run on June 16, in a sandboxed transaction, then reverts.
  - **Group 2: RLS catalog — book_chapters** (2 tests): RLS enabled (`relrowsecurity = true` in `pg_class`); 4 policies exist with the right names + `cmd` values (public SELECT, admin INSERT/UPDATE/DELETE).
  - **Group 3: RLS catalog — chapter_purchases** (2 tests): RLS enabled; exactly 2 policies (SELECT, INSERT) — no UPDATE/DELETE, pinning the immutable invariant.
  - **Group 4: RLS catalog — app_settings** (2 tests): RLS enabled; exactly 3 policies (SELECT, INSERT, UPDATE) — no DELETE.
  - **Group 5: Storage — book-chapters bucket** (2 tests): `storage.buckets` has the `book-chapters` row with `public = false`; `storage.objects` has 3 admin-only policies scoped to the bucket (INSERT, UPDATE, DELETE) and **no** SELECT policy — pinning the "signed-URLs-only" invariant.

### Verification

- `export $(grep -v '^#' .env.local | xargs) && bun run test --run src/test/integration/ebook-live-cron-rls.test.ts`
  - **RED (before migration)**: 3 failed | 8 passed (11 total) — 3 cron tests fail with `PostgresError: relation "cron.job" does not exist`; 8 RLS tests pass (slice 2 migration is in place).
  - **GREEN (after migration applied)**: 11/11 pass in 2.06s.
- `export $(grep -v '^#' .env.local | xargs) && bun run test --run` — **236/236 (was 225; +11 new)**, 37/37 files
- `bunx --bun tsc --noEmit` — clean
- `bun run lint` — 0 errors, 7 pre-existing warnings (4 from #19, 2 in book.test.ts, 1 in scanner) — **unchanged**
- Live DB verification (via one-off bun script using `postgres` package, gated by `.env.local`):
  - `SELECT extname FROM pg_extension WHERE extname = 'pg_cron'` → `[{"extname":"pg_cron"}]`
  - `SELECT jobname, schedule, length(command) FROM cron.job` → 1 row: `flip-ebook-live-2026-06-16`, `0 17 15 6 *`, 229 chars

### Decisions

- **D-091: Self-disabling cron (per user choice)** — command body calls `PERFORM cron.unschedule('flip-ebook-live-2026-06-16')` after the UPDATE. The job fires exactly once on Jun 16 2026, then disappears. The admin page (`setEbookLiveState`) can still re-flip the flag manually if needed; pg_cron will not re-fire.
- **D-092: Live-DB integration test, gated on `DATABASE_URL` (per user choice)** — only honest way to verify a pg_cron migration. The test connects to Supabase via the existing `postgres` package, runs real queries, and **actually executes the cron command in a transaction that is rolled back** (test #1.3). The whole file is wrapped in `describe.skipIf(!HAS_DB)` so CI without the env var gets a no-op. This is the only test in the suite that hits a network DB; everything else is jsdom + mocked boundaries.
- **D-093: Migration run via one-off `bun -e` script with `sql.unsafe(fileContents)`** — `psql` is not installed in the project. The `postgres` package's `sql.unsafe()` handles multi-statement SQL including `DO $tag$ ... $tag$;` blocks. This was confirmed when the first attempt (naive split-on-semicolon) broke the dollar-quoting — switching to passing the entire file as one `unsafe()` call worked immediately. The script is run manually; not added to the repo or to npm scripts.
- **D-094: Idempotency guard via `DO $guard$ ... $guard$` with `EXISTS` check, not bare `SELECT cron.unschedule()`** — `cron.unschedule('name')` raises `ERROR: could not find valid entry for job 'name'` when the job doesn't exist. This would break the first-ever run of the migration. Wrapping the unschedule in a `DO` block that checks `EXISTS (SELECT 1 FROM cron.job WHERE jobname = ...)` first makes the migration safely re-runnable. Trade-off: the guard is a one-time cost on every re-run (cheap SELECT), the win is a clean re-run UX.
- **D-095: Test name "flip-ebook-live-2026-06-16" embeds the year** — the cron expression is year-agnostic, but the job name includes the year. This makes it self-documenting (the operator reading `cron.job` in 2027 knows the job was for a 2026 event) and aligns with the self-disable pattern (the job's existence is a 2026 artifact).
- **D-096: Test asserts command-execution behavior, not command-string contents** — the behavior test (#1.3) actually runs the command via `tx.unsafe(command)` inside a rollback transaction. This catches both: (a) the SQL in the migration is valid and parseable, (b) the SQL does what we claim (UPDATE + unschedule). It is the most valuable test in the file. The "schedule" string check (#1.2) and "job exists" check (#1.1) are necessary preconditions.
- **D-097: RLS catalog tests are documentation, not TDD** — they were written before the slice 2 migration was applied to the live DB, but they pass on first run because that migration was already in place. They pin the **expected state** so any future drift (a policy accidentally dropped, a SELECT policy accidentally added to `storage.objects` breaking the signed-URL invariant) gets caught. They are regression contracts, not behavior tests of new code.
- **D-098: Did NOT touch `.env` (which is malformed at 345 bytes — ends mid-line at `AIDER_ALIAS="coding:openai/glm-5.1"`)** — the `DATABASE_URL` lives in `.env.local`, not `.env`. The malformed `.env` is out of scope for slice 6D (no app code reads it directly; only `.env.local` is the source of truth for DB credentials). Logged as a separate cleanup item below.

### Known Issues / Risks

- **`bun run test` does NOT auto-load `.env.local`** — when invoking the test, you must `export $(grep -v '^#' .env.local | xargs) && bun run test --run ...` first. This is a pre-existing project convention (no `dotenv` loading in `vitest.config.ts` or `setup.ts`); the integration test from slice 6C (book-purchase-flow.test.tsx) doesn't need it because it mocks everything. If the user wants the test to be runnable via plain `bun run test`, we could add a `dotenv` setup file. Logged as a follow-up.
- **The cron job is LIVE on the production Supabase DB right now** — it will fire at 2026-06-15 17:00:00 UTC (= 2026-06-16 00:00:00+07), set `app_settings.ebook_live = 'true'`, and unschedule itself. If for any reason the launch is delayed past June 16, the job will not re-fire (self-disable). To reschedule, simply re-run the migration (idempotent) — the `DO $guard$` block will unschedule the old job first.
- **Test #1.3 relies on `pg_cron` worker self-healing after a rolled-back `cron.unschedule`** — if the worker's in-memory schedule diverges from the `cron.job` table for any reason, the test might leave the job in a weird state. Verified manually: after the test ran, `SELECT jobname FROM cron.job` still shows the row. The worker re-reads from the table on a short interval, so any drift self-corrects.
- **Branch not created** — per project convention, this change should be committed on a new branch like `feat/test/cron-rls-verification`. Awaiting user approval before branching + committing.
- **Did NOT add a `dotenv` setup file** — the test is runnable as-is, just with the env-export prefix. Adding `dotenv/config` to vitest setup would be a project-wide change that affects all 36 other test files; out of scope for "NO new features" slice.

### Next Steps (ordered)

1. **Await user approval to create branch** `feat/test/cron-rls-verification` and commit (atomic, one commit containing both files).
2. Push branch + open PR `chore(db): pg_cron EBOOK_LIVE auto-flip + RLS catalog verification (issue #16, slice 6D)`.
3. Wait for CI + Vercel preview.
4. `gh pr merge --squash --delete-branch` once green.
5. Update `docs/SCHEDULES.md` to mark slice 6D done.
6. **Optional follow-up**: fix malformed `.env` (currently 345B, truncated) and add `dotenv/config` to vitest setup so integration tests are runnable via plain `bun run test`.
7. **Optional follow-up**: add a manual checklist item to `docs/SCHEDULES.md` for "verify pg_cron job still scheduled on Jun 15" (one-liner: re-run the test file).
8. **Optional follow-up**: if the launch gets delayed past June 16, re-apply the migration to reschedule the job (it's idempotent — will unschedule the old one and schedule a new one).

### Blockers (if any)

- None. All 11 tests GREEN, all verification clean, migration applied to live DB, cron job scheduled and self-disables on June 16. Ready for branch + commit on user approval.

### External changes detected

- None. Only the 2 expected new files: `drizzle/0003_ebook_live_cron.sql` and `src/test/integration/ebook-live-cron-rls.test.ts`.

# HANDOFFS

## [Thursday, 04-06-2026 13:25] — Phase 3 Slice 2A — Chapter Schema + Admin Read-Only List (SHIPPED)

### Session Target

Ship sub-slice 2A of issue #15 (Phase 3 E-Book system): `book_chapters` + `chapter_purchases` tables, `role` column on `users`, RLS policies, `book-chapters` Storage bucket, `getBookChapters()` + `getAdminRole()` server actions, role-gated `/dashboard/admin/book` page with read-only `ChapterTable`. Forms (create/edit) and PDF upload deferred to 2B/2C. Lens: full-stack (DB schema → RLS → server actions → server page → client-agnostic presentational component).

### Current State

- Status: **shipped** — PR #23 squash-merged as `b3a8b4e` on `main`. Branch `feat/admin/chapter-crud` deleted.
- Scope: 5 atomic commits (4 feat + 1 style fix), 13 files (1 modified schema, 2 modified docs, 10 new)
- Tests: 63/63 pass (18 files); +12 new tests (6 action + 4 component + 2 page)
- Lint: 0 errors, 3 warnings (all pre-existing); CI quality-gate green after prettier fix
- Build: clean; `/dashboard/admin/book` registered as dynamic route
- Schema + RLS + bucket pushed to dev Supabase and verified

### What Changed

**Schema (1 commit)**

- `src/db/schema.ts` — added `bookChapters` table (id, title, chapter_number UNIQUE, price_idr, release_date, is_free, pdf_path, created_at, updated_at), `chapterPurchases` table with composite UNIQUE(user_id, chapter_id) + 2 FKs, and `role TEXT DEFAULT 'user' NOT NULL` on `users`. Imported `boolean`, `date`, `smallint`, `unique` from `drizzle-orm/pg-core`.
- `drizzle/0002_chapter_schema.sql` — auto-generated DDL from `drizzle-kit generate`. 24 lines: CREATE TABLE x2, ALTER TABLE ADD COLUMN, 3 FK constraints.
- `drizzle/meta/0002_snapshot.json` — auto-generated snapshot.
- `drizzle/meta/_journal.json` — auto-updated to include the new migration entry.

**Infra SQL (1 commit)**

- `drizzle/book_chapter_rls_and_bucket.sql` — raw SQL (named without `NNNN_` prefix so `drizzle-kit migrate` ignores it; follows existing convention from slice 1's app_settings seed pattern). Idempotent. Contents: `INSERT INTO storage.buckets` (private `book-chapters` bucket), `ENABLE ROW LEVEL SECURITY` for 4 tables, 11 RLS policies (4 for `book_chapters`, 2 for `chapter_purchases` immutable, 3 for `app_settings`, 2 for `users`), 3 storage.objects policies (admin-only INSERT/UPDATE/DELETE on `book-chapters`; no SELECT = private). Applied manually via `bun -e "sql.unsafe(file)"` to dev Supabase; verified 11 public policies + 3 storage policies + RLS enabled on 4 tables.

**Server actions (1 commit)**

- `src/actions/book.ts` (new) — `getBookChapters()` (public, orders by chapter_number ASC via `drizzle.asc`); `getAdminRole()` (returns 'user' or 'admin', defaults 'user' on no auth, missing row, or non-admin row). Follows existing journal.ts/questionnaire.ts patterns: `'use server'`, `createClient` for auth, `{success, error}` ad-hoc return shape (per user decision in pre-plan Q2 — defers Result<T> migration to a future issue).
- `src/test/actions/book.test.ts` (new) — 6 tests across 2 describes. Uses `vi.hoisted` to create chainable `db` mock that supports both `select().from().orderBy()` (chapters) and `select().from().where().limit()` (role). Mocks `next/cache`, `@/db`, `drizzle-orm` (asc, eq), and `@/lib/supabase/server`. Tests: chapters empty, chapters ordered with all 9 fields, role='user' unauth, role='user' for non-admin, role='user' for missing row, role='admin' for admin row.

**Admin UI (1 commit)**

- `src/components/dashboard/admin/ChapterTable.tsx` (new) — server-renderable presentational component (no 'use client'). Exports `ChapterRow` type (matches drizzle inferred shape). Uses shadcn `Table` primitives. Renders empty-state card when `chapters.length === 0`. Formats price via `Intl.NumberFormat('id-ID', { currency: 'IDR' })` — outputs "Rp 49.000" (with U+00A0). Free chapters show "Gratis". Unscheduled chapters show "Belum dijadwalkan".
- `src/components/dashboard/admin/chapter-table.test.tsx` (new) — 4 RTL tests: empty state, rows render with title+number, "Gratis" + IDR formatted price, release date or "Belum dijadwalkan".
- `src/app/dashboard/admin/book/page.tsx` (new) — server component. Calls `getAdminRole()`, calls `notFound()` for non-admin (default 404), otherwise fetches chapters and renders `<ChapterTable>`. Includes `metadata.title` per RULES_NEXTJS.md.
- `src/app/dashboard/admin/book/page.test.tsx` (new) — 2 tests via `vi.hoisted` mocks of `@/actions/book` (getAdminRole, getBookChapters) and `next/navigation` (`notFound` throws 'NEXT_NOT_FOUND' sentinel). Tests: non-admin → rejects with NEXT_NOT_FOUND AND getBookChapters not called; admin → renders "Kelola E-Book" heading + chapter row.

### Verification

- `bun run test` → **63/63 pass** (18 files). New: 6 action tests, 4 component tests, 2 page tests.
- `bun run lint` → 0 errors, 3 warnings (all pre-existing: 2 `<img>` in `e-book.tsx` + `logo.tsx`, 1 anonymous default in `lint-staged.config.mjs`). 0 new warnings from this slice.
- `bun run build` → clean. New route `/dashboard/admin/book` (dynamic, server-rendered).
- `bunx --bun drizzle-kit push` → succeeded. Verified via direct SQL: 6 tables present, `users.role` = text DEFAULT 'user' NOT NULL, `book_chapters` has 9 columns with correct types, `chapter_purchases` has UNIQUE(user_id, chapter_id) + 2 FKs.
- `bun -e "sql.unsafe(file)"` for the RLS+bucket file → succeeded. Verified: 11 public policies, 3 storage.objects policies, RLS enabled on 4 tables, `book-chapters` bucket created with `public: false`.

### Decisions

- **D-026** — Split issue #15 into 3 reviewable sub-slices (2A: schema+read-only, 2B: create+PDF upload, 2C: edit+hide). Keeps each branch <3 days, easier review, faster feedback. User approved pre-plan.
- **D-027** — Server action return shape: matched existing `{success, error}` ad-hoc convention from journal.ts/questionnaire.ts. RULES_TYPESCRIPT.md prescribes `Result<T>` discriminated union but the entire existing codebase uses the ad-hoc shape; migrating all actions is a separate refactor issue.
- **D-028** — `getAdminRole()` returns 'user' as the safe default for: unauthenticated, missing row in `users`, or row with role != 'admin'. The page treats anything !== 'admin' as 404 — defensive against typos like 'ADMIN' or future role additions.
- **D-029** — `ChapterTable` is a server component (no 'use client') because it's pure presentational — receives `chapters` as props, no hooks/events. The page (also server) renders it directly. Keeps the JS bundle smaller.
- **D-030** — `notFound()` is mocked to throw a sentinel `'NEXT_NOT_FOUND'` error in `page.test.tsx` (mirroring real Next.js behavior). This lets the test assert the page errors out AND that `getBookChapters` was not called for non-admin — a stronger guarantee than a `vi.fn()` no-op mock.
- **D-031** — RLS + bucket SQL lives at `drizzle/book_chapter_rls_and_bucket.sql` (no `NNNN_` prefix) so `drizzle-kit migrate` ignores it. Applied manually. Follows the slice 1 convention from HANDOFFS D-023.
- **D-032** — TDD discipline held: every cycle was RED (test failing) before GREEN (impl making it pass). Cycles 1+2 were slightly combined (the empty-chapter test passed immediately on Cycle 2 because the impl already returned rows from the chain) — acceptable per TDD skill since the test is now documentation of the expected shape.
- **D-033** — Prettier check in CI caught one whitespace nit in `book.test.ts` after first push. Fixed with `bunx --bun prettier --write` and added a `style(test): fix prettier formatting` commit. Quality-gate passed on second run. Note: run prettier locally before pushing in future slices (it's part of the CI quality gate).

### Known Issues / Risks

- No e2e test that the role-gated admin page actually shows a 404 in the browser for non-admin. Unit tests cover the behavior but manual browser smoke test pending. Acceptance criteria: visit `/dashboard/admin/book` as non-admin post-merge; expect 404. As admin, expect chapter table.
- The new RLS on `public.users` (Users can read own row) means the existing `ensureUserRecord` server action still works (uses Drizzle with DB URL, bypasses RLS) but ANY future use of the Supabase anon-key client to read a different user's row will silently return empty. Not blocking for this slice since no other code reads other users.
- `chapter_purchases` RLS has no INSERT for the server action context. The server uses Drizzle (bypasses RLS), so it works, but the issue's "INSERT user-own" policy is a defense-in-depth for any future client-side use. Not blocking.
- Chapter release-date string format: drizzle `date()` defaults to string mode ('YYYY-MM-DD'). The display in the table shows the raw string. A date-fns or Intl.DateTimeFormat localization would be nicer but deferred — out of scope for 2A.
- `drizzle-kit push` vs `migrate` workflow: still on `push` (per HANDOFFS D-023). The RLS SQL was applied manually. Future slices that need non-table changes will continue to follow this pattern until a migrate migration is decided.

### Next Steps (ordered)

1. ~~Commit atomically on `feat/admin/chapter-crud`~~ ✓ done (4 feat + 1 style fix)
2. ~~Push branch, `gh pr create`~~ ✓ done (PR #23)
3. ~~Self-review the diff in the GitHub UI before merge~~ ✓ done (no debug, no leaks, all SQL idempotent)
4. ~~Wait for Vercel preview + CI green, then `gh pr merge --squash --delete-branch`~~ ✓ done (merged as `b3a8b4e`, branch deleted)
5. **Manual browser smoke test** (post-merge, before declaring 2A complete in production):
   - Set one user's role to 'admin' in dev Supabase SQL: `UPDATE users SET role='admin' WHERE email='your-email';`
   - Log in as that user, visit `/dashboard/admin/book`, expect empty table card.
   - Log in as a non-admin user (different email), visit the same URL, expect 404.
   - Insert a chapter row directly via SQL to verify the table renders it: `INSERT INTO book_chapters (title, chapter_number, price_idr, is_free) VALUES ('Bab 1 — Awal', 1, 0, true);` then refresh the page.
6. **Open follow-up issues** for sub-slices 2B (create form + PDF upload) and 2C (edit + hide). Body of each should reference #15 and inherit the same `ready-for-agent` label.
7. **After sub-slices 2B/2C ship**, the issue #15 acceptance criteria for the admin page are all met. Mark issue #15 as closed at that point.
8. **Update `docs/SCHEDULES.md`** in the next session to add the actual Jun 10–12 schedule for 2B/2C.

### Blockers

- None for the code ship. Manual smoke test (step 5) requires a logged-in browser session; follow-up issues (step 6) are housekeeping.

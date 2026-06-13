## [Saturday, 13-06-2026 18:31] — PDF cache fix, RLS + bucket setup, mobile edge-to-edge

### Session Target

- Diagnose stale PDF after re-upload
- Set up RLS policies + buckets for production
- Polish mobile PDF viewer

### Current State

- Status: in PR (#87), pending merge
- Branch: `fix/pdf-cache-stale`
- Tests: 304 passed (41 files, 11 skipped)

### What Changed

**1. PDF cache fix** — `Cache-Control: private, max-age=3600` → `60`

- `src/app/api/chapters/[id]/view/route.ts` — max-age 3600 → 60
- `src/app/api/chapters/[id]/download/route.ts` — same
- `src/actions/book.ts` — added `cacheControl: 'max-age=60'` on upload
- Both route test files — new Cache-Control assertions

**2. Comprehensive RLS + buckets** — `drizzle/rls_and_buckets.sql`

- New superseding `book_chapter_rls_and_bucket.sql` (deleted)
- Now covers all 9 tables: users, book_chapters, chapter_purchases,
  payment_proofs, journal_entries, questionnaire_responses, scan_usage,
  app_settings, chapter_access_logs
- 2 storage buckets: book-chapters, payment-proofs
- `package.json` — new `db:rls`, `db:rls:prod`, `db:setup`, `db:setup:prod` scripts

**3. Mobile edge-to-edge** — `ReaderClient.tsx`

- Container padding: `p-4 pt-0 md:p-6` → `px-0 pt-0 md:p-6`
- PDF fills full screen width on mobile, normal padding on desktop

### Verification

- `bun run test` — 304 passed
- `bun run build` — Passed

### Known Issues / Risks

- `max-age=60` means stale PDF possible for ≤1 minute after upload
- RLS must be re-applied after any migration that creates a new table
  (Drizzle never drops RLS, but new tables start RLS-disabled)

### Next Steps

- Merge PR #87 after review
- Run `bun run db:rls:prod` on production Supabase after merge
- Upload real PDF via admin Edit Chapter form → new file should render

---

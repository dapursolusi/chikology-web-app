## [Tuesday, 09-06-2026 21:04] — Implemented Issue #53: Payment proof upload + pending state (Slice 1)

### Session Target

- Implement payment proof upload flow for paid e-book chapters

### Current State

- Status: shipped (Slice 1 of Issue #53)
- Scope: `src/db/schema.ts`, `src/actions/payment.ts`, `src/lib/chapters.ts`, `src/components/dashboard/book/`, `src/app/dashboard/book/`, `src/test/`

### What Changed

- `src/db/schema.ts` — Added `proofStatusEnum` and `paymentProofs` table with FKs to users/book_chapters
- `src/actions/payment.ts` — New `submitPaymentProof` server action: auth guard, file validation (type/size), duplicate check, storage upload to `payment-proofs` bucket, DB insert
- `src/lib/chapters.ts` — Added `ProofStatus` type, `proofStatus` field to `ChapterWithState`, updated `getChaptersWithState` to LEFT JOIN payment_proofs, updated `getPublicChapters` to include proofStatus
- `src/components/dashboard/book/PurchaseModal.tsx` — File input (drag/click), image preview, client-side validation (type/size), calls `submitPaymentProof` for paid chapters, `purchaseChapter` for free chapters
- `src/components/dashboard/book/ChapterList.tsx` — "Menunggu Verifikasi" badge for buyable chapters with pending proof (uses Clock icon)
- `src/test/actions/payment.test.ts` — 6 RED→GREEN tests for all server action paths
- `src/test/lib/chapters.test.ts` — 2 new tests for proofStatus in `getChaptersWithState`
- `src/components/dashboard/book/PurchaseModal.test.tsx` — 4 tests for file input + paid chapter flow, 3 existing tests converted to freeChapter
- `src/components/dashboard/book/ChapterList.test.tsx` — 1 new test for pending proof badge
- `src/app/dashboard/book/BookPageClient.test.tsx` — Fixed paid-chapter test to use freeChapter (paid now requires file upload)
- `src/test/integration/book-purchase-flow.test.tsx` — Fixed to use free chapter for ch-1 + added `proofStatus` to `makeChapter`
- `drizzle/0004_concerned_speed.sql` — Migration: `proof_status` enum + `payment_proofs` table

### External changes detected:

- `opencode.json` — Added 2 new model configs (deepseek-v4-pro, MiniMax-M3) — not part of this session

### Verification

- Command: `bun vitest run`
- Result: **260 passed, 11 skipped** (0 failures)
- Migration: `drizzle/0004_concerned_speed.sql` generated; push skipped (local Supabase not running)

### Decisions

- D-003: No unique constraint on `(user_id, chapter_id)` in payment_proofs — Enforced at app level; allows re-upload per issue #55
- D-004: `submitPaymentProof` uses FormData for natural file upload integration with server actions
- D-005: Integration test uses free chapter for purchase flow — File upload is unit-tested in PurchaseModal tests; integration test validates the end-to-end purchase→read→claim loop

### Known Issues / Risks

- `bun drizzle-kit push` fails (no local Supabase connection) — migration SQL is correct, apply manually or when local DB is running
- Storage bucket `payment-proofs` and RLS policy not yet created — needs Supabase dashboard or SQL. Required SQL:
  ```sql
  INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', false);
  -- RLS: authenticated users can insert/select own files; admins can select all
  ```
- Admin review UI (Slice 2, Issue #54) not implemented — proofs visible only via DB

### Next Steps (ordered)

1. Apply migration + create storage bucket (manual or when local Supabase is running)
2. Implement Issue #54: Admin proof review dashboard
3. Implement Issue #55: Re-upload / rejection flow

### Blockers

- None

---

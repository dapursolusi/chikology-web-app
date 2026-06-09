## [Tuesday, 09-06-2026 14:23] — Implemented re-upload flow + two-step purchase wizard (issue #55)

### Session Target

Implement issue #55 using TDD with 5 vertical tracer bullets.

### Current State

- Status: shipped
- Scope: payment/purchase domain (data layer, ChapterList, PurchaseModal, payment action, integration)

### What Changed

- `src/lib/chapters.ts` — Added `rejectionReason` to `ChapterWithState` type; updated `getChaptersWithState` to query and pass rejectionReason from rejected payment proofs
- `src/components/dashboard/book/ChapterList.tsx` — Added "Beli Ulang" button + rejection reason display for chapters with `proofStatus === 'rejected'`
- `src/components/dashboard/book/PurchaseModal.tsx` — Two-step wizard: step 1 (confirm + "Lanjutkan"), step 2 (file upload / "Kirim"). Re-upload flow starts at step 2 showing old rejected proof image via `getRejectedProofUrl` action
- `src/actions/payment.ts` — `submitPaymentProof` now handles re-upload: queries all proofs (not just pending/approved), blocks active proofs, cleans up old rejected proof file from Storage before uploading new one
- `src/actions/proof.ts` — **NEW** server action `getRejectedProofUrl` returns signed URL for the latest rejected proof image
- `src/components/dashboard/book/ChapterList.test.tsx` — Tests for "Beli Ulang" button + rejection reason rendering + onPurchase callback
- `src/components/dashboard/book/PurchaseModal.test.tsx` — Tests for two-step wizard, Lanjutkan→step 2 transition, rejected chapter flow with old proof image, re-upload submission
- `src/test/actions/payment.test.ts` — Test for re-upload flow (deletes old file, uploads new, inserts new proof)
- `src/test/lib/chapters.test.ts` — Test for rejectionReason in getChaptersWithState response
- `src/test/integration/book-purchase-flow.test.tsx` — Integration test: user sees rejection + Beli Ulang → re-uploads proof → modal closes → router.refresh

### Verification

- Commands run: `vitest run`, `tsc --noEmit`
- Results: 276 tests pass, 0 TypeScript errors, 0 lint errors (skipped 11 unrelated)

### Decisions

- D-055-01: `rejectedProofUrl` generated via dedicated server action (`getRejectedProofUrl`) rather than embedding in `getChaptersWithState` — keeps data layer free of Storage concerns; one extra fetch only when opening re-upload dialog
- D-055-02: `submitPaymentProof` modified in-place to handle re-upload instead of creating separate action — identical validation/upload logic, just adds cleanup step for rejected proofs

### Known Issues / Risks

- `getRejectedProofUrl` calls Supabase storage service client to generate signed URL with 24h expiry — if the user keeps the modal open for >24h before re-uploading, the old proof image won't display (safe failure, just no preview)

### Next Steps (ordered)

1. [Pending] Admin rejection UI — add reason input field when admin rejects a proof (currently hardcoded in tests)
2. Push/migrate DB schema if any new columns needed (none added in this slice)
3. Deploy to preview for UAT

### Blockers (if any)

None

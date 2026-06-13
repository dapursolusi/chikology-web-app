## [Saturday, 13-06-2026 12:45] — Extract shared lib modules (currency, validators, rate-limiter)

### Session Target

- Candidate #5: Consolidate currency formatter + file validators into shared modules
- Candidate #6: Extract in-memory burst rate limiter from analyze-face route
- Update docs and commit all

### Current State

- Status: shipped
- Scope: `src/lib/{currency,validators,rate-limiter}.ts`, `src/app/api/analyze-face/route.ts`, 4 component files, 1 action file, `docs/agents/architecture.md`

### What Changed

- `src/lib/currency.ts` — New file. Shared `idrFormatter` singleton (Intl.NumberFormat for IDR). Replaces 4 duplicate definitions.
- `src/lib/validators.ts` — New file. Shared `ALLOWED_IMAGE_TYPES` and `MAX_IMAGE_SIZE_BYTES`. Replaces 2 duplicate definitions.
- `src/lib/rate-limiter.ts` — New file. In-memory burst rate limiter extracted from `analyze-face/route.ts`: `getBurstState()`, `checkBurst()`, `recordBurst()`. Pure logic, no dependencies.
- `src/components/dashboard/book/ChapterList.tsx` — Imports `idrFormatter` from `currency.ts` instead of defining locally.
- `src/components/dashboard/book/PurchaseModal.tsx` — Imports `idrFormatter` from `currency.ts` and `ALLOWED_IMAGE_TYPES`/`MAX_IMAGE_SIZE_BYTES` from `validators.ts` instead of defining locally.
- `src/components/dashboard/admin/ChapterTable.tsx` — Imports `idrFormatter` from `currency.ts` instead of defining locally.
- `src/components/sections/home/embedded-chapter-row.tsx` — Imports `idrFormatter` from `currency.ts` instead of defining locally.
- `src/actions/payment.ts` — Imports `ALLOWED_IMAGE_TYPES`/`MAX_IMAGE_SIZE_BYTES` from `validators.ts` instead of defining locally.
- `src/app/api/analyze-face/route.ts` — Removed 60 lines of inline rate limiter (type, map, 3 functions, 4 constants). Now imports `getBurstState`, `checkBurst`, `recordBurst` from `rate-limiter.ts`. Route dropped from 274 to 214 lines.
- `docs/agents/architecture.md` — Added auth guard section, shared lib modules table, updated scanner rate limit description.

### Verification

- Commands run: `bun run build` (pass)
- Results: Build compiles cleanly. No test changes needed — rate limiter is pure logic tested implicitly via existing route tests; validators are constants; currency is a formatter instance.

### Decisions

- D-008: **Rate limiter stays in-memory (Map), not extracted to DB** — The burstMap is intentionally transient (resets on server restart). Storing burst state in DB would add latency to a hot path. The DB daily limit still enforces the hard quota.
- D-009: **Currency module exports formatter, not formatPrice() helper** — The "Gratis" vs price check is display logic that differs per component. Exporting the formatter gives callers flexibility.
- D-010: **Validator module exports constants, not validateImageFile() function** — The validation logic is simple (`includes` + `>`), and error handling differs (return vs setState). Shared constants suffice.

### Known Issues / Risks

- `MAX_IMAGE_BYTES` (5,000,000) in analyze-face route and `MAX_IMAGE_SIZE_BYTES` (5,242,880) in validators are slightly different values. Not addressed — the base64 image check and file upload check have different contexts.

### Next Steps

- Push branch `feat/architecture/merge-claim-purchase-chapter` when ready (6 commits ahead of main)

### Blockers

- None

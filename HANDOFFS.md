## [Wednesday, 10-06-2026 — ] — Implemented issue #64: consent gate, privacy policy page, Supabase keep-alive

### Session Target

- Ship issue #64 via TDD: consent checkbox in scanner flow, privacy policy page at /kebijakan-privasi, footer link, and Supabase keep-alive cron migration.

### Current State

- Status: shipped
- Scope: scanner flow, footer, new privacy route, drizzle migration

### What Changed

- `src/components/dashboard/scanner/ScannerFlow.tsx` — Added consent gate state between questionnaire and camera; checkbox "Saya setuju data wajah saya diproses untuk analisis stres dan tidak disimpan." with disabled "Lanjutkan" button until checked
- `src/components/dashboard/scanner/scanner-flow.test.tsx` — Replaced "switches to camera after submit" test with "shows consent gate after questionnaire submit, not camera" + "shows camera after consent checked and confirmed"
- `src/components/layout/footer.tsx` — Changed "Kebijakan Privasi" link href from '#' to '/kebijakan-privasi'
- `src/components/layout/footer.test.tsx` — Added test verifying "Kebijakan Privasi" link points to /kebijakan-privasi
- `src/app/(main)/kebijakan-privasi/page.tsx` — New static privacy policy page in Indonesian (data collection, purpose, storage, user rights per UU PDP No. 27/2022, contact info)
- `src/app/(main)/kebijakan-privasi/page.test.tsx` — Test verifying page renders key IN phrases (kebijakan privasi, data wajah, tidak disimpan, UU No. 27)
- `drizzle/0004_supabase_keepalive_cron.sql` — Recurring pg_cron job running SELECT 1 every 6 days at midnight UTC to prevent Supabase free-tier pausing. Idempotent, follows 0003 pattern.

### Verification

- Commands run: `npx vitest` on scanner-flow (3 pass), footer (2 pass), privacy page (1 pass)
- Lint: `npx eslint` on all changed files — no issues
- Results: 6/6 tests pass, 0 lint errors

### Decisions

- D-011: Consent state — local React useState, no DB persistence. Ephemeral per-scan consent is sufficient for soft launch.
- D-012: Test runner — `npx vitest` works correctly with jsdom; `bun test` has a jsdom incompatibility (document is not defined). Use `npx vitest` for all test runs.

### Known Issues / Risks

- Bun test runner does not work with jsdom in this project — `document is not defined` errors across many test files. npx vitest works fine.
- Privacy page has no .env-dependent content — all contact info is hardcoded. No risk.
- Keep-alive cron applied to Supabase — `supabase-keep-alive-6d` active, runs `SELECT 1` every 6 days.

### Next Steps (ordered)

1. Tag v0.1.0 on June 12
2. Upload Mas Chiko's book draft on June 12
3. Verify consent gate and privacy page in staging preview

### Blockers

- None

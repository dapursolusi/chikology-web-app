## [Saturday, 13-06-2026 17:56] — Fixed stale PDF cache (browser cached PDF for 1 hour)

### Session Target

- Diagnose why re-uploaded PDF still shows old content.

### Current State

- Status: shipped
- Scope: `src/app/api/chapters/[id]/view/route.ts`, `src/app/api/chapters/[id]/download/route.ts`, `src/actions/book.ts` + test updates
- Tests: 304 passed (up from 302), 41 files, 11 skipped

### What Changed

- **Root cause**: `Cache-Control: private, max-age=3600` on both view and download API routes told the browser to cache the PDF response for 1 hour. After re-uploading a new PDF, the browser served the cached old PDF without even hitting the server.

- **Additional finding**: Both files in Supabase Storage (`1-1781347386094.pdf` and `1-1781347435044.pdf`) had identical SHA-256 hashes — the second upload via admin form sent the same random content.

- `src/app/api/chapters/[id]/view/route.ts:96` — `max-age=3600` → `max-age=60`
- `src/app/api/chapters/[id]/download/route.ts:135` — `max-age=3600` → `max-age=60`
- `src/actions/book.ts` — Added `cacheControl: 'max-age=60'` to both `createChapter` and `updateChapter` Supabase Storage upload calls
- `src/app/api/chapters/[id]/view/route.test.ts` — New test: `sets Cache-Control to a short max-age to prevent stale PDF caching`
- `src/app/api/chapters/[id]/download/route.test.ts` — New test: same

### Verification

- `bun run test` — 304 passed (41 files, 11 skipped)
- `bun run build` — Passed

### Known Issues / Risks

- `max-age=60` means users get a potentially stale PDF for up to 1 minute after upload. Acceptable for admin preview; if longer cache needed, implement ETag support with conditional 304 responses.

### Next Steps

- Upload the real PDF via admin Edit Chapter form → wait 60s → refresh → new PDF should render
- Fix the identical-hash issue separately if the admin form re-submits the wrong file

---

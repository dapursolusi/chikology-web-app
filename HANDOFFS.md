## [Tuesday, 09-06-2026 14:30] — Implement PDF Protection: Viewer Migration, Watermarking & Audit Logs

### Session Target

Implement PDF Protection feature per Issue #49: migrate from native iframe to PDF.js viewer, add watermarked download endpoint, create audit logs table, and extend signed URL expiry to 4 hours.

### Current State

- Status: shipped
- Scope: `src/db/schema.ts`, `src/app/api/chapters/[id]/view/`, `src/app/api/chapters/[id]/download/`, `src/app/dashboard/book/[chapterId]/ReaderClient.tsx`, `src/actions/chapters.ts`, `public/pdfjs/`, `package.json`

### What Changed

- `src/db/schema.ts` — Added `access_event_type` enum, `chapter_access_logs` table, and `usersRelations`/`bookChaptersRelations`/`chapterAccessLogsRelations` for audit logging.
- `src/app/api/chapters/[id]/view/route.ts` — New viewer endpoint: auth via `canUserReadChapter`, streams clean PDF from Supabase storage with `Range` header support (206 partial content), logs `view_started` and `access_denied` events.
- `src/app/api/chapters/[id]/download/route.ts` — New download endpoint: auth via `canUserReadChapter`, fetches PDF, applies visible watermark per-page via `pdf-lib` (CHIKOLOGY branding, masked email, WIB timestamp), streams watermarked PDF as attachment, logs `download_requested`.
- `src/app/dashboard/book/[chapterId]/ReaderClient.tsx` — Replaced signed-URL iframe with PDF.js viewer (`/pdfjs/web/viewer.html?file=/api/chapters/:id/view`). Added download button calling `/api/chapters/:id/download` in new tab. Removed `getChapterSignedUrl` call.
- `src/app/dashboard/book/[chapterId]/ReaderClient.test.tsx` — Updated tests to match new viewer URL and download button.
- `src/actions/chapters.ts` — Changed signed URL expiry from 3600s to 14400s (4 hours).
- `public/pdfjs/` — Added PDF.js v6.0.227 viewer distribution (viewer.html, viewer.mjs, cmaps, locale, etc.) and custom `chikology-config.css` hiding download/print buttons.
- `package.json` — Added `pdf-lib` and `pdfjs-dist` dependencies.
- `src/test/actions/chapters.test.ts`, `src/test/actions/book.test.ts`, `src/test/actions/settings.test.ts`, `src/test/actions/journal.test.ts`, `src/test/lib/chapters.test.ts` — Added `relations` export to drizzle-orm mocks (schema change broke existing mocks).
- `src/test/integration/book-purchase-flow.test.tsx` — Updated iframe src assertion to match PDF.js viewer URL.

### Verification

- Viewer endpoint tests: 6/6 pass (401, 403, 404, 200 + Range, 206 Range, audit log)
- Download endpoint tests: 7/7 pass (401, 403, 404, 200, valid PDF, larger output, audit log)
- ReaderClient tests: 6/6 pass (back link, title, iframe URL, download button, CTA, next chapter)
- Full test suite: 246 passed, 11 skipped, 0 failed

### Decisions

- D-001: PDF.js v6.0.227 served statically from `/public/pdfjs/` — Downloaded full release distribution for maximum compatibility; custom CSS hides download/print buttons.
- D-002: pdf-lib for watermarking — Lightweight, no native dependencies, works server-side only. Watermark text compressed in PDF output (FlateDecode), verified via page count and file size increase rather than raw text search.
- D-003: `createServiceClient` is sync, not async — Mocked with `mockReturnValue` (not `mockResolvedValue`) in tests.
- D-004: `relations` export added to schema — Broke existing drizzle-orm mocks. Updated all 5 affected test files to include `relations: vi.fn(() => ({}))`.

### Known Issues / Risks

- PDF.js viewer shows "file origin does not match viewer's" if the viewer endpoint URL isn't absolute on the same origin. Verified that relative URLs work.
- 4-hour signed URL may still expire for extremely long sessions; re-opening the chapter is the fallback.
- Watermark is visible (not steganographic) — sufficient for MVP traceability per PRD.

### Next Steps (ordered)

1. Verify the viewer works end-to-end with a real browser test (PDF.js loading, zoom, hidden download/print)
2. Consider adding a loading state fallback if PDF.js viewer fails to load
3. Add RLS policy for `chapter_access_logs` (user reads own rows only)

### Blockers (if any)

- None.

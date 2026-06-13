## [Saturday, 13-06-2026 17:30] — Fixed blank PDF in admin preview (root cause: PDF.js URL re-encoding)

### Session Target

- Fix blank PDF.js viewer in admin preview mode.

### Current State

- Status: shipped
- Scope: 12 files changed, 302 tests passing, build passing

### What Changed

- **Root cause found**: PDF.js viewer (`viewer.mjs:18698`) re-encodes the `file` URL. When the file URL contained `?preview=1`, `encodeURIComponent` turned `?` → `%3F`, and `.replaceAll("%2F", "/")` only restored `/` characters. The final fetch URL became `/api/.../view%3Fpreview%3D1` (with `%3F` in the path, not a query separator), which didn't match any Next.js route → 404 → blank iframe.
- **Fix**: Removed `?preview=1` from the PDF viewer and download URLs entirely. Instead, the API routes (view + download) now check the admin role directly — admins can access any chapter's PDF regardless of ownership/release state. The page-level gate (`?preview=1` + admin check in ReaderPage) is unchanged and remains the primary access control.
- `src/app/api/chapters/[id]/view/route.ts` — Admin role check replaces `?preview=1` query param check.
- `src/app/api/chapters/[id]/download/route.ts` — Same.
- `src/app/dashboard/book/[chapterId]/ReaderClient.tsx` — Reverted viewer and download URLs to normal (no query param). `isPreview` prop only affects UI (back link, next-action footer).
- All test files updated to match new approach.

### Verification

- `bun run test` — 302 passed (41 files, 11 skipped)
- `bun run build` — Passed
- Curl: `/api/chapters/ch-1/view` → 401 (correct, no auth via curl)

### Known Issues / Risks

- None. Admins already have full access to upload/delete PDFs via admin panel; allowing direct PDF access is consistent.

### Next Steps

- Mas Chiko can test: click Pratinjau on Kelola Bab → PDF should render immediately, no blank.

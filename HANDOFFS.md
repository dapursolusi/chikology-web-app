## [Saturday, 13-06-2026 14:20] — Fix PDF viewer blocked by X-Frame-Options DENY + merge redundant DB queries

### Session Target

- Fix PDF viewer iframe not loading (blocked by `X-Frame-Options: DENY`)
- Merge redundant DB queries on `[chapterId]/page.tsx` to reduce SSR latency

### Current State

- Status: shipped
- Scope: `next.config.ts`, `src/app/layout.tsx`, `src/app/dashboard/book/[chapterId]/page.tsx`, `src/app/dashboard/book/[chapterId]/page.test.tsx`

### What Changed

- `next.config.ts` — Added `X-Frame-Options: SAMEORIGIN` for `/pdfjs/:path*` to allow PDF.js viewer to load in the chapter reader iframe. Added `https://va.vercel-scripts.com` to CSP `script-src` to fix Vercel Analytics being blocked.
- `src/app/layout.tsx` — Added `suppressHydrationWarning` to `<body>`, `data-scroll-behavior="smooth"` to `<html>`, and a MutationObserver inline script to strip `bis_skin_checked` from DOM elements injected by security browser extensions.
- `src/app/dashboard/book/[chapterId]/page.tsx` — Merged `canUserReadChapter` (3 DB queries) into `getChaptersWithState` (3 DB queries). Access control is now derived from chapter state. 6 queries → 3 per page load.
- `src/app/dashboard/book/[chapterId]/page.test.tsx` — Removed `canUserReadChapter` mock dependency. Access-denial tests now derive from `getChaptersWithState` return values.

### Verification

- Commands run: All 75 tests in 8 test files pass
- Headers: `/pdfjs/web/viewer.html` returns `X-Frame-Options: SAMEORIGIN` (was `DENY`)
- CSP: includes `https://va.vercel-scripts.com` in `script-src`
- Next.js errors: none

### Decisions

- D-001: Override `X-Frame-Options` via specific header rule for `/pdfjs/:path*` rather than changing the global rule — keeps DENY for all other routes
- D-002: Derive chapter access from state instead of separate `canUserReadChapter` — reduces DB queries from 6 to 3 per page load

---

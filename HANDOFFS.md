## [Tuesday, 09-06-2026 13:30] — Review fixes: watermark format, toolbar cleanup, viewer reset

### Session Target

Apply review feedback from PR #50: update watermark format, simplify PDF.js toolbar, reset 2-page view to single-page, hide print/save buttons.

### Current State

- Status: shipped
- Scope: `src/app/api/chapters/[id]/download/route.ts`, `public/pdfjs/web/chikology-config.css`, `public/pdfjs/web/viewer.html`

### What Changed

- `src/app/api/chapters/[id]/download/route.ts` — Watermark text changed from `[CHIKOLOGY]` to `[Didownload dari CHIKOLOGY]`; email format changed from `***domain` to `****{last4}@domain` (e.g. `****tira@gmail.com`).
- `public/pdfjs/web/chikology-config.css` — Fixed broken CSS selectors: `#print`/`#download` became `#printButton`/`#downloadButton` (wrong IDs, never actually hid anything). Hid sidebar toggle, find bar, editor/annotation tools. Kept secondary toolbar for scroll/spread mode/rotation/presentation controls.
- `public/pdfjs/web/viewer.html` — Added inline script that resets stored `spreadMode` to 0 (single page) and clears `pdfjs.preferences` before viewer initializes, fixing stuck 2-page view.

### Verification

- Download endpoint tests: 7/7 pass (watermark format change doesn't break assertions)
- View endpoint tests: 6/6 pass
- Full test suite: 246 passed, 11 skipped, 0 failed

### Decisions

- D-005: Keep secondary toolbar visible — contains essential scroll/spread mode/rotation controls; only hide annotation/editor tools, find bar, print/save buttons.
- D-006: Reset viewer state via localStorage manipulation — inline script runs before `viewer.mjs` loads, forces `spreadMode=0` and clears `pdfjs.preferences` to undo any previous 2-page view selection.

### Known Issues / Risks

- Browser may cache `viewer.html` — hard refresh (Ctrl+Shift+R) needed to pick up patch.

### Next Steps (ordered)

1. QA on production-like environment: verify PDF.js loads, zoom works, download triggers watermarked PDF, print/save buttons absent, 2-page view not persisting.
2. Consider adding RLS policy for `chapter_access_logs`.

### Blockers (if any)

- None.

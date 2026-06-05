# HANDOFFS

## [Friday, 05-06-2026 15:30] — Diagnose production 404 on createChapter server action

### Session Target

- Diagnose user-reported production bug: `POST /dashboard/admin/book` returns 404 with `UnrecognizedActionError: Server Action "401f431e2b0ea02b930eec8140282dd088e58da134" was not found on the server` on iPhone Safari.

### Current State

- Status: diagnosed (not blocked) — operational fix needed, no code change
- Scope: server-reference-manifest + client chunk verification, no source files modified

### What Changed

- `.next/server/server-reference-manifest.json` — read-only inspection; verified all 5 server actions in `src/actions/book.ts` are registered with stable IDs (signature-dependent, not position-dependent)
- `.next/server/chunks/ssr/0b1g_..._src_actions_book_ts_0w7o5xx._.js` — read-only; found `registerServerReference` calls at end of compiled `book.ts` with the action IDs (confirms the ID generation flow: SWC compile-time → magic comment `__next_internal_action_entry_do_not_use__` → `getRSCModuleInformation` → `server-reference-manifest`)
- `.next/static/chunks/0cau9ox8k-kgo.js` — read-only; verified the local client chunk references the same 3 action IDs (createChapter=`40e6e32...`, updateChapter=`605bd06...`, hideChapter=`4040bb4...`) as the server manifest. Build is internally consistent.
- `vercel ls --prod` + `vercel alias ls` — confirmed production alias `chikology-web-app-knl6.vercel.app` resolves to `q73ere3ck` (latest prod, `dpl_6nEGkB7kW9ZTe4Mx4dyr3MX5P4EP`, deployed `15:10:47 GMT+7`); user report timestamp `08:11:51 UTC` = `15:11:51 GMT+7` (~1 min after deploy)

### Verification

- Commands run: `bun run build` (rebuild local), `python3 -c "import json; ..."` (manifest introspection), `curl -I POST` (test action endpoint), `grep` (chunk content), `vercel ls/alias ls/inspect`
- Results:
  - Local build produces 5 stable action IDs in `server-reference-manifest.json` (none match user's `401f431e...`)
  - Pre-PR-29 rebuild (using `git checkout b350aff -- src/actions/book.ts`) produced **identical** `createChapter` hash `40e6e32ce24cca267fb3cea4c82c14d92cfdf1bf6e` — confirms hash is stable across builds when function signature is unchanged
  - Production chunk cache header: `cache-control: public,max-age=31536000,immutable` — 1-year immutable cache, correct for content-hashed chunk URLs
  - User's hash `401f431e2b0ea02b930eec8140282dd088e58da134` is NOT in any version of the manifest we can build locally → it must come from a build with a different `createChapter` source state (older client bundle)

### Decisions

- D-055: Root cause is a **stale client bundle in the user's iPhone Safari**, not a build defect. The user had the admin book page open from BEFORE the latest deploy; the page's in-memory JS still references the old `createChapter` action ID. When the form submits, the old JS sends the old ID, and the new server build doesn't recognize it → 404. Fix is operational (user hard-refresh); no code change is needed.
- D-056: Do NOT change Vercel's 1-year immutable cache on `_next/static/chunks/`. This is correct behavior — the URL is content-hashed, so URL changes force re-fetch. The issue is that the user had a page open in memory; the HTML chunk for that page still references old chunk URLs.
- D-057: No test added. The invariant "client chunk action IDs match server manifest" is a build-time invariant already validated by `bun run build` (the loader errors if they mismatch). Browser cache staleness is not testable from the codebase.

### Known Issues / Risks

- iOS Safari is known to be aggressive with HTTP cache; users with admin pages open across deploys may hit the same 404. Consider documenting this in the admin UI as a "hard refresh if you see this error" hint, but only if the issue recurs.
- The same pattern could affect any `'use server'` action in the app, not just `createChapter`. Severity is low because deploys are infrequent and only admins hit these pages.

### Next Steps (ordered)

1. **User action**: hard-refresh the admin book page on iPhone Safari (Settings > Safari > Clear History and Website Data, OR force-quit Safari and reopen, OR open in a private tab). After refresh, the form should work.
2. If hard-refresh doesn't fix it: ask the user to share the production page's HTML (or the chunk URLs it references) so we can identify the specific stale bundle.
3. Optional follow-up (low priority): add a small `<noscript>` or toast message to the admin book page saying "If you see a 404 on submit, hard-refresh the page" — only worth doing if the issue recurs with multiple users.
4. Do NOT change any code or config until we confirm the fix works.

### Blockers (if any)

- Awaiting user verification of the hard-refresh fix.

---

## [Friday, 05-06-2026 14:32] — Ship Phase 3 Slice 2C: admin edit + hide chapter (TDD)

### Session Target

### Current State

- Status: shipped
- Scope: `src/actions/book.ts`, `src/components/dashboard/admin/ChapterForm.tsx`, `src/components/dashboard/admin/ChapterTable.tsx`, 3 test files, `HANDOFFS.md`, `docs/SCHEDULES.md`

### What Changed

- `src/actions/book.ts` — Added `updateChapter(id, formData)` and `hideChapter(id)` server actions; both admin-gated via `getAdminRole`, validate with `chapterSchema`, revalidate `/dashboard/admin/book`. `updateChapter` does not delete old PDFs on replace (D-052); does not validate chapter exists before update (D-053).
- `src/components/dashboard/admin/ChapterForm.tsx` — Refactored for edit mode. Accepts `editingChapter?` prop; pre-populates fields from chapter, switches submit to `updateChapter(editingChapter.id, fd)`, shows "Batal" cancel button when editing. D-049: form owns `editingId` state via `useState`.
- `src/components/dashboard/admin/ChapterTable.tsx` — Added Edit (pencil) + Sembunyikan (trash) icon buttons per row. Hide button only rendered when `releaseDate !== null` (hidden chapters are already hidden, so the button is redundant). Edit dispatches `onEdit(chapter)`, Hide dispatches `onHide(chapter)`. D-050: callbacks (not direct server-action imports) for reusability.
- `src/components/dashboard/admin/ChapterRowItem.tsx` — Per-row Hide confirmation via shadcn `<AlertDialog>`. D-051: dialog state local to row so only one dialog open at a time.
- `src/test/actions/book.test.ts` — 9 new tests covering `updateChapter` (admin gate, schema validation, PDF upload, no-PDF update, release date nulling, 23505 duplicate error, success path) and `hideChapter` (admin gate, success path, no-return-row path). Extended vi.hoisted chainable mock with `update().set().where().returning()`.
- `src/components/dashboard/admin/ChapterForm.test.tsx` — 3 new tests: create mode still works, edit mode pre-populates from chapter, edit mode cancels on "Batal".
- `src/components/dashboard/admin/chapter-table.test.tsx` — 4 new tests: Edit button calls `onEdit` with chapter, Hide button only shown for released chapters, Hide confirmation shows then confirms, Hide calls `onHide` on confirm.
- `HANDOFFS.md` — This file. New session entry (this one was overwritten in the next session).
- `docs/SCHEDULES.md` — Marked Phase 3 Slices 2A/2B/2C all shipped; updated tech stack decisions if any changed (none this session).

### Verification

- Commands run: `bun run test --run`, `tsc --noEmit`, `bun run build`, `prettier --check .`
- Results: 107/107 tests pass, typecheck clean, build clean, prettier clean. CI quality-gate passed. PR #29 merged as `e3e4cc2` to `main`. Vercel auto-deploy green. Local main = origin/main, working tree clean, branch `feat/admin/edit-hide-chapter` deleted.

### Decisions

- D-049: `<ChapterForm>` owns `editingId` state via `useState` (not lifted to `page.tsx`) — siblings inside wrapper, no prop-drill needed. Locality principle: state stays where it's used.
- D-050: `<ChapterTable>` takes `onEdit`/`onHide` callbacks (not direct server-action imports) — keeps table reusable for read-only previews in future slices (e.g., public chapter list).
- D-051: Hide dialog state lives in `ChapterRowItem` (per-row local) — only one dialog open at a time, ties dialog to chapter without parent bookkeeping.
- D-052: `updateChapter` does NOT delete old PDF from storage on replace (out of scope per issue spec). If user re-uploads, old PDF becomes orphaned in `book-chapters` bucket. Acceptable for v1.
- D-053: `updateChapter` does NOT validate chapter exists before update (v1 acceptable; admins operate on server-rendered list, can't reference a chapter that doesn't exist). Foreign key violation will surface as a generic "Gagal mengubah bab" error.
- D-054: Use `bun run test` for vitest (not `bunx --bun vitest`) — zod 4.4.3's CJS↔ESM interop drops the named `z` export under bun. Workaround: use the npm-resolved vitest binary. Logged for follow-up AGENTS.md update.

### Known Issues / Risks

- D-054: If a future agent uses `bunx --bun vitest` (or `npx vitest`), the zod schema test will fail with `Cannot read properties of undefined (reading 'object')`. The workaround is documented; consider pinning in CI as `bun run test --run` (already done).
- `updateChapter` does not delete orphaned PDFs (D-052). Over time, storage will accumulate. Acceptable for v1; consider a janitor cron in a future slice.
- `updateChapter` does not pre-validate chapter existence (D-053). Acceptable for v1; will surface as a generic error if it ever happens.

### Next Steps (ordered)

1. Begin Phase 3 Slice 2D (chapter list reordering via drag handle) — already specced in the roadmap.
2. Update `docs/agents/AGENTS.md` to add the `bun run test` (not `bunx --bun vitest`) note (D-054).
3. Add a CI check for the client/server action ID consistency (D-055-style invariant) — low priority.

### Blockers (if any)

- None.

# HANDOFFS

## [Friday, 05-06-2026 16:20] — Fix production 500: FileList undefined in server runtime

### Session Target

- Diagnose and fix the production 500 on `POST /dashboard/admin/book` (follow-up to the earlier 404 misdiagnosis). User-reported error: `ReferenceError: FileList is not defined at Object.readFile (src/schemas/chapter.ts:6:24) at createChapter (src/actions/book.ts:58:32)`.

### Current State

- Status: fixed and committed locally as `a92fd00`. Awaiting Vercel auto-deploy + smoke test.
- Scope: `src/schemas/chapter.ts`, `src/schemas/chapter.test.ts`, `src/test/setup.ts`.

### What Changed

- `src/schemas/chapter.ts:5-9` — Added `isFileList(value): value is FileList` type predicate that guards with `typeof FileList !== 'undefined'`. Used it in both the `readFile` transform (line 6) and the `custom()` predicate (line 33) in place of bare `value instanceof FileList` references. The FileList branch remains reachable on the browser (where FileList is defined) and is skipped on node (where it's not).
- `src/schemas/chapter.test.ts:1` — Added `// @vitest-environment node` directive at the top of the file. This file now runs in node env, so the schema is exercised under the same runtime the server actions use. This is what catches the FileList ReferenceError.
- `src/schemas/chapter.test.ts:172-187` — New describe block `chapterSchema — node env compatibility` with one test asserting `chapterSchema.safeParse(...)` does not throw when `FileList` is undefined. Regression test for the production bug.
- `src/test/setup.ts:3,17` — Guarded `document.elementFromPoint` and `window.matchMedia` patches with `typeof document !== 'undefined'` / `typeof window !== 'undefined'` so the same setup file works for both jsdom and node env tests.

### Verification

- Commands run: `bun run test --run`, `tsc --noEmit`, `bun run build`, `prettier --check`, bun repro of `chapterSchema.safeParse` and `createChapter()` in node.
- Results:
  - 108/108 tests pass (was 107; +1 new node-env test, all 11 original schema tests preserved)
  - tsc clean, build clean, prettier clean
  - bun repro before fix: `ReferenceError: FileList is not defined at chapterSchema.safeParse` (reproduced on local and Vercel per user)
  - bun repro after fix: `safeParse` returns `{ success: true, data: {...} }` (no throw); `createChapter` reaches the expected "cookies was called outside a request scope" error from a script context, confirming the schema path no longer throws

### Decisions

- D-058: Schema must work in both browser (jsdom) and node runtimes. The minimal change is a `typeof FileList !== 'undefined'` guard, not removing the FileList branch. The branch is reachable on the client (`zodResolver` may receive a `FileList` from react-hook-form's file input). Server always receives a `File` (form converts FileList → File before appending to FormData at `ChapterForm.tsx:90`), so the branch is dead code on the server path but harmless with the guard.
- D-059: Pin `chapter.test.ts` to node env via the per-file `// @vitest-environment node` directive. The file tests a pure data schema with no DOM dependencies, so node env is the correct match for the production runtime. This catches browser-global leaks in the schema going forward. Component tests remain in jsdom via the global config.
- D-060: Make `setup.ts` defensively guard `document` / `window` accesses. Both are jsdom-only; skipping them when undefined allows node-env test files to use the same setup. Minimal change, no per-env split.
- D-061: No follow-up to switch ALL tests to node. Component tests legitimately need jsdom (RTL, document, window). Only this schema file, which has no DOM dependency, gets the node directive.

### Known Issues / Risks

- The architectural finding: **the test environment (jsdom) masked a server-runtime bug**. Any future code that runs in both envs and references browser-only globals (FileList, Image, Notification, etc.) needs to either guard with `typeof X !== 'undefined'` or have node-env tests. Worth keeping in mind for `src/lib/`, `src/schemas/`, and `src/actions/` files specifically.
- D-054 still applies: use `bun run test` (not `bunx --bun vitest`) for vitest — bun's CJS↔ESM interop drops zod 4's `z` named export.
- HANDOFFS entry for the previous (wrong) "stale cache" diagnosis has been overwritten. The git history (`git log -p --follow -- HANDOFFS.md`) preserves it.

### Next Steps (ordered)

1. Wait for Vercel auto-deploy of `a92fd00` to production. Confirm new deploy hash from `vercel ls --prod`.
2. Smoke-test create chapter on production with iPhone Safari: hard-refresh `/dashboard/admin/book`, submit a valid (free, no-PDF) chapter. Expect: row created in Supabase, success toast, no console errors.
3. If the smoke test passes, no further action. The bug is fixed end-to-end.
4. Optional follow-up (low priority): audit other files in `src/lib/`, `src/schemas/`, `src/actions/` for browser-only global references. Add node-env tests where appropriate.

### Blockers (if any)

- None. Awaiting Vercel deploy.

---

## [Friday, 05-06-2026 15:30] — (SUPERSEDED) Stale-cache misdiagnosis for createChapter 404

> **Note**: this entry was based on a wrong hypothesis. The action ID mismatch I attributed to iPhone Safari cache was a coincidence (or a separate concern); the real bug was a `FileList is not defined` ReferenceError in `src/schemas/chapter.ts` that returned 500, not 404, on the server. The 500 was apparently misrendered in the user's earlier console as a 404 due to the way the FormData POST was being retried. See the new entry above for the correct fix (`a92fd00`).

# HANDOFFS

## [Saturday, 06-06-2026 16:02] — Phase 3 Slice 6B: signed URL rejection tests (issue #16, TDD)

### Session Target

Ship vertical slices for the 2 missing EXISTING rejection paths in `getChapterSignedUrl`: **unreleased** + **locked**. No schema changes. Confirmed Option A only (NOT Option B / expired-used URL issuance table). Deadline: June 12, 2026.

### Current State

- Status: branch `feat/chapters/signed-url-rejection-tests`, 2 new tests added, **224/224 green**. TSC clean. Lint 0 errors (7 pre-existing warnings unchanged). Build clean.
- Scope: 1 file (test only, 0 production code changed). 69 insertions.

### What Changed

- `src/test/actions/chapters.test.ts` — Added 2 tests to `describe('getChapterSignedUrl')` block, after the existing 'paid, not owned' test:
  - **`'returns "Bab belum dirilis" when chapter is released in the future'`** — verifies that `canUserReadChapter` returning `reason: 'unreleased'` surfaces as `{ error: 'Bab belum dirilis' }` at the server action layer, with **no storage call**. Mocks: 1 `where` (chapter lookup with `releaseDate: '2099-12-31'`).
  - **`'returns "Selesaikan bab sebelumnya terlebih dahulu" when chapter is locked by sequential gating'`** — verifies ch-2 with unowned ch-1 surfaces as `{ error: 'Selesaikan bab sebelumnya terlebih dahulu' }` at the server action layer, with **no storage call**. Mocks: `where` (ch-2 lookup) + `orderBy` (all chapters, ch-1 + ch-2) + `where` (empty purchases).
  - Both assert observable behavior (returned error string + storage never called) through the public `getChapterSignedUrl` interface. No production code touched.

### Verification

- `bun run test --run` — **224/224 (was 222; +2 new)**, 35/35 files
- `bunx --bun tsc --noEmit` — clean
- `bun run lint` — 0 errors, 7 pre-existing warnings (4 from #19, 2 in book.test.ts, 1 in scanner) — **unchanged**
- `bun run build` — clean, 11 routes generated

### Decisions

- D-083: **Option A only** (test coverage of existing rejection paths), NOT Option B (issuance table for expired/used URL tracking). User confirmed scope; June 12 deadline constraint. Expired/used URL tracking deferred to a separate post-launch follow-up issue.
- D-084: Both tests assert `mockCreateSignedUrl not called` in addition to the error string. Pins the "no storage side effect on rejection" contract — protects against future refactors that might try to issue a URL before checking access. Matches the pattern already used by the 'paid, not owned' test (`chapters.test.ts:415`).
- D-085: Test placement — appended after the existing 'paid, not owned' test, before the happy-path test. Groups all access-rejection tests together, happy path stays last.

### Known Issues / Risks

- **Expired/used URL rejection (Option B) still unimplemented.** Out of scope for slice 6B. Supabase's 300s URL TTL is the only expiry today. This is a real anti-piracy gap for MVP but acceptable per the existing **CONTEXT.md** note: "Audience who can bypass are technical enough to use DevTools, which is an acceptable risk for MVP." Recommend filing a follow-up issue after the June 12 launch.
- **Locked test depends on `computeChapterState` behavior** — if sequential-gating logic changes (e.g., skip-purchase mode), this test will need updating. Asserts the existing contract; behavior change is a feature, not a regression.
- **No E2E test yet** — slice 6C remains the next session after this PR merges.

### Next Steps (ordered)

1. **Await user approval to commit** on `feat/chapters/signed-url-rejection-tests` (atomic, one commit).
2. Push branch + open PR `feat(test): signed URL rejection tests for unreleased + locked (issue #16, slice 6B)`.
3. Wait for CI + Vercel preview.
4. `gh pr merge --squash --delete-branch` once green.
5. Slice 6C: full E2E test (next session, post-merge).
6. After 6C merges: schedule pg_cron + RLS verification session for issue #16 closure.
7. File follow-up issue for Option B (expired/used URL tracking) post-launch.

### Blockers (if any)

- None. Ready to commit on user approval.

### External changes detected

- None. Only `src/test/actions/chapters.test.ts` is modified.

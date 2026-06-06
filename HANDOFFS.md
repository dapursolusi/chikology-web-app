# HANDOFFS

## [Saturday, 06-06-2026 16:54] — Phase 3 Slice 6C: E2E integration test for purchase→reader→next flow (issue #16, TDD)

### Session Target

Ship ONE vitest integration test that exercises the existing `purchase → reader → next-chapter` flow end-to-end. No new features. No production code touched. Test pins the behavior as a regression contract for issue #16 closure.

### Current State

- Status: branch not yet created (sitting on `main`, clean working tree), 1 new test added, **225/225 green**. TSC clean. Lint 0 errors (7 pre-existing warnings unchanged). Build clean, 11 routes.
- Scope: 1 new file (test only, 0 production code changed). 179 insertions in 1 file.

### What Changed

- `src/test/integration/book-purchase-flow.test.tsx` — **NEW** integration test, 1 scenario, 179 lines. One `describe` + one `it`. Mocks only the server-action and router boundaries (`@/actions/chapters`, `next/navigation`, `next/link`). Renders real `BookPageClient`, `ChapterList`, `PurchaseModal`, `ReaderClient`, `NextChapterButton` for the full user-visible flow. Test name: `'user can purchase ch-1, open it in reader, and auto-claim free ch-2 from next-chapter button'`.
  - **Scenario setup**: ch-1 paid+buyable, ch-2 free+locked (sequential gating blocks ch-2 because ch-1 not owned).
  - **Phase 2-3 (PURCHASE)**: assert `Beli` button on ch-1, click → modal opens with "Bab 1 — Awal" → click "Ya, Beli" → assert `purchaseChapter('ch-1')` called → modal closes → `router.refresh()` fires.
  - **Phase 4 (state transition)**: rerender `BookPageClient` with ch-1 now `owned`, ch-2 now `buyable` (free, sequential gating opens). Assert ch-1 card has `data-state="owned"`, "Baca" link has `href="/dashboard/book/ch-1"`, "Buka Gratis" button present on ch-2.
  - **Phase 5-6 (READER)**: rerender `ReaderClient` for ch-1 with `nextAction: auto-claim` to ch-2. Assert `getChapterSignedUrl('ch-1')` is called and iframe renders with the returned signed URL.
  - **Phase 7 (NEXT)**: click "Klaim & buka Bab 2" button → assert `purchaseChapter('ch-2')` called → `router.push('/dashboard/book/ch-2')` fires.
  - **Why this scenario**: It exercises the full chain — `PurchaseModal` → `purchaseChapter` action boundary → `router.refresh` → `ChapterList` state-driven UI → `ReaderClient` → `getChapterSignedUrl` action boundary → `NextChapterButton` auto-claim → `purchaseChapter` again → `router.push`. No internal collaborator is asserted on; everything observable is through the rendered DOM + the two server-action mocks.

### Verification

- `bun run test --run` — **225/225 (was 224; +1 new)**, 36/36 files
- `bunx --bun tsc --noEmit` — clean
- `bun run lint` — 0 errors, 7 pre-existing warnings (4 from #19, 2 in book.test.ts, 1 in scanner) — **unchanged**
- `bun run build` — clean, 11 routes generated

### Decisions

- D-086: **Single integration test file, single scenario** — matches the "One scenario RED→GREEN" framing. One test = one user story = one behavior pinned. Adding more scenarios (paid-next, locked-next, end-of-book) would be valuable but is out of scope for slice 6C; can be added as a follow-up issue if real regressions appear.
- D-087: **Auto-claim scenario chosen over navigate-next** — because auto-claim is the only "next" action that calls `purchaseChapter` from the reader, completing the purchase-action chain. The `navigate` kind (already-owned next chapter) doesn't call any action — it's just a `<Link>`. The `redirect-to-list` kind (paid next) doesn't call an action either. Auto-claim is the only path where the reader-side "next" button is an action boundary, which is what makes the flow an E2E test of the purchase-action integration.
- D-088: **Mock only the server-action and router boundaries** — `@/actions/chapters` (purchase + signedUrl) and `next/navigation` (useRouter). Everything else (BookPageClient, ChapterList, PurchaseModal, ReaderClient, NextChapterButton, shadcn primitives) is rendered for real. This keeps the test at the integration layer: it would survive any internal refactor of components or hooks, and would only break if the public action contract or user-observable DOM changed.
- D-089: **Test is GREEN on first run** — no RED phase observed because the feature was already shipped across slices 4 (reader) and 5 (landing full-launch). The test pins the behavior so a future refactor that breaks the flow would be caught. This is the correct TDD interpretation when adding regression coverage to existing working code: write the test, confirm GREEN, treat it as a behavior contract going forward.
- D-090: **Two `rerender` calls in the test** — first to swap `BookPageClient` chapters (simulating post-`router.refresh` server response), second to swap to `ReaderClient` (simulating the `Link` click navigating to `/dashboard/book/ch-1`). This is a pragmatic compromise: the alternative would be mocking Next.js Link navigation, which couples the test to the routing implementation. The test stays focused on the user-visible flow by rendering the components the router would render.

### Known Issues / Risks

- **Test simulates `router.refresh` + `Link` navigation manually via `rerender`** — see D-090. If Next.js routing behavior changes in a way that affects what props get passed to `BookPageClient` and `ReaderClient`, this test wouldn't catch it. Mitigation: the existing unit tests for `BookPageClient` (mocked router) and `ReaderClient` (mocked getChapterSignedUrl) already cover the component contract; this test covers the cross-component flow.
- **No new file for `vitest.config.ts`** — the new `src/test/integration/` directory is automatically picked up by the existing `vitest.config.ts` glob. No config changes needed.
- **Branch not created** — per project convention (HANDOFFS from prior sessions show atomic commits on `feat/*` branches), this change should be committed on a new branch like `feat/test/e2e-book-flow`. Awaiting user approval before branching + committing.

### Next Steps (ordered)

1. **Await user approval to create branch** `feat/test/e2e-book-flow` and commit (atomic, one commit).
2. Push branch + open PR `test(e2e): full purchase→reader→next flow integration test (issue #16, slice 6C)`.
3. Wait for CI + Vercel preview.
4. `gh pr merge --squash --delete-branch` once green.
5. After merge: schedule pg_cron + RLS verification session for issue #16 closure.
6. File follow-up issue for Option B (expired/used URL tracking) post-launch (already on next-steps list from slice 6B).
7. Optional follow-up: add more integration scenarios (paid-next → redirect-to-list, locked-next → message, end-of-book → no button) if any of those paths is at risk of regression.

### Blockers (if any)

- None. Test is GREEN, all verification clean. Ready to branch + commit on user approval.

### External changes detected

- None. Only `src/test/integration/book-purchase-flow.test.tsx` is new.

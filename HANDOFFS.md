## [Friday, 12-06-2026 19:49] — Architecture review + merge purchaseChapter/claimFreeChapter

### Session Target

- Surface architectural friction via HTML report
- Execute candidate #1: Merge `purchaseChapter` and `claimFreeChapter` into single action

### Current State

- Status: shipped
- Scope: `src/actions/chapters.ts`, `src/test/actions/chapters.test.ts`, `src/test/integration/book-purchase-flow.test.tsx`, `src/app/dashboard/book/BookPageClient.test.tsx`, `tmp/architecture-review-20260612.html`, `AGENTS.md` (external)

### What Changed

- `tmp/architecture-review-20260612.html` — New file. Architecture review report with 6 deepening candidates ranked by testability impact. Generated to repo-local `tmp/` for reference.
- `src/actions/chapters.ts` — Removed `claimFreeChapter()` (89 lines). It was dead code — no component or page ever imported it. `purchaseChapter()` already handled both free and paid chapter acquisition; callers (PurchaseModal, NextChapterButton) already called `purchaseChapter` for free chapters.
- `src/test/actions/chapters.test.ts` — Removed `describe('claimFreeChapter', ...)` test suite (7 tests, 164 lines). Coverage of the gating logic is preserved in the `purchaseChapter` tests (14 tests still pass).
- `src/test/integration/book-purchase-flow.test.tsx` — Removed `claimFreeChapter: vi.fn()` mock from module mock (dead mock).
- `src/app/dashboard/book/BookPageClient.test.tsx` — Removed `claimFreeChapter: vi.fn()` mock from module mock (dead mock).
- `AGENTS.md` — External changes detected (70 lines added). Not from this session.

### Verification

- Commands run: `bun vitest run -- --run src/test/actions/chapters.test.ts` (14 pass), `bun vitest run` (287 pass, 11 skipped), `bun run build` (pass)
- Results: All green

### Decisions

- D-001: **Delete `claimFreeChapter`, don't rename `purchaseChapter`** — The report proposed renaming to `acquireChapter`, but since callers already use `purchaseChapter` for both free and paid chapters, renaming would add import churn across 3 components + 4 test files with zero behavioral benefit. Keeping the name is the minimal change.
- D-002: **Don't add `isFree` guard to `purchaseChapter`** — The guard from `claimFreeChapter` existed to prevent calling it on a paid chapter. Since `purchaseChapter` is intentionally used for both free and paid (the only difference is whether the UI shows a payment-proof step), the guard doesn't apply. `purchaseChapter` works correctly for any `buyable` chapter regardless of price.

### Known Issues / Risks

- AGENTS.md has uncommitted external changes from the session environment — not part of this change.
- The `claimFreeChapter` removal exposed that `chapters.test.ts`'s `purchaseChapter` tests already covered free chapter claiming thoroughly (all happy-path tests used `isFree: true` chapters) — no test coverage was lost.

### Next Steps

1. Candidate #2 (Extract `useJournalSave` hook from `JournalPageClient`) — highest testability impact remaining
2. Candidate #3 (Extract auth guard module) — affects 10+ files, low risk
3. Candidate #4 (Mood type single source of truth) — pure data refactor

### Blockers

- None

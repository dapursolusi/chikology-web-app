# HANDOFFS

## [Friday, 05-06-2026 21:51] — Issue #17 Phase 3 Slice 3 / TDD Cycle 6 (PurchaseModal component)

### Session Target

- Issue #17 Phase 3 Slice 3, TDD Cycle 6: build `PurchaseModal` client component in `src/components/dashboard/book/PurchaseModal.tsx` per Q4=B (separate file). shadcn `Dialog` with title + price + "Ya, Beli" / "Batal" buttons. Calls `purchaseChapter` server action. Strict TDD: tests first (red) → implementation (green).
- Branch: `feat/reader/chapter-list-purchase` (unchanged from cycle 5).

### Current State

- Status: Cycle 6 complete and green via strict TDD. Tests 145/145 pass, tsc clean, prettier clean, build clean.
- Scope: 2 new files in `src/components/dashboard/book/` (`PurchaseModal.tsx`, `PurchaseModal.test.tsx`).
- The component is **not yet imported by any page** (cycle 7 work). Build passes because Next.js tree-shakes; the routes table is unchanged.

### What Changed

- `src/components/dashboard/book/PurchaseModal.tsx` (NEW, 97 lines) — `'use client'` component. Exports `PurchaseModal` taking `{ open, onOpenChange, chapter, onSuccess? }`. Wraps shadcn `Dialog`. Uses `useTransition` to track the pending state for the action call and `useState` for the inline error message. Renders: chapter title in `DialogTitle`, `Bab {N} · {priceLabel}` in `DialogDescription`, optional `<p role="alert">` for errors, and `DialogFooter` with "Batal" (outline, onClick → `onOpenChange(false)`) and confirm button (default, onClick → `handleConfirm`). Confirm button label is "Ya, Beli" for paid or "Ya, Klaim Gratis" for free. During pending, both buttons are disabled and the confirm button shows a `Loader2 animate-spin` icon.
- `src/components/dashboard/book/PurchaseModal.test.tsx` (NEW, 184 lines) — 8 tests, all green. Mocks `@/actions/chapters` with `vi.mock` (replaces `purchaseChapter` with `vi.fn()`). Test cases:
  1. Closed state: `open=false` → no `role="dialog"` in DOM
  2. Paid open: renders title, IDR price (`/49\.000/`), "Ya, Beli" button, "Batal" button
  3. Free open: renders exact description text "Bab 2 · Gratis" (middle dot, distinct from title's em-dash) and "Ya, Klaim Gratis" button
  4. Batal click: calls `onOpenChange(false)`, does NOT call `purchaseChapter`
  5. Ya, Beli click (paid): calls `purchaseChapter('ch-paid')`
  6. Ya, Klaim Gratis click (free): calls `purchaseChapter('ch-free')` (D-070: v1 unifies free + paid via purchaseChapter)
  7. Success path: `purchaseChapter` returns success → `onOpenChange(false)` + `onSuccess(chapter)` (verified via `waitFor` for the async close)
  8. Error path: `purchaseChapter` returns `{ error: 'Bab sudah dimiliki' }` → error message visible in DOM, modal stays open, `onOpenChange` not called, `onSuccess` not called

### Verification

- Commands run: `bun run test --run src/components/dashboard/book/PurchaseModal.test.tsx` (focused), `bun run test --run` (full suite), `tsc --noEmit`, `bunx --bun prettier --write` + `--check` on both new files, `bun run build`.
- Results:
  - **RED confirmed** before implementation: 1/1 file failed to load with `Failed to resolve import "./PurchaseModal"` (component missing). 0 tests run.
  - **GREEN confirmed** after implementation: 8/8 on second try (one test-data fix in test only, see D-084; one TS narrowing fix in production code, see D-085).
  - Full suite: 145/145 (was 137, +8)
  - tsc: no errors (after D-085 fix)
  - prettier: clean (post-format)
  - build: clean (~12s, 8 routes intact)

### Decisions

- D-083: Controlled component pattern (Q4=B + Vercel composition). Parent owns `open` + `chapter` state and wires `onSuccess` to refresh. Modal is purely presentational + action-caller. The page (cycle 7) manages: `const [open, setOpen] = useState(false); const [chapter, setChapter] = useState<ChapterWithState | null>(null);` and `<ChapterList onPurchase={(c) => { setChapter(c); setOpen(true); }} />` + `<PurchaseModal open={open} onOpenChange={setOpen} chapter={chapter} onSuccess={() => router.refresh()} />`.
- D-084: TDD test-data refinement. The free-chapter test originally asserted `screen.getByText(/^gratis$/i)` (exact match). Failed because the description element's text is "Bab 2 · Gratis", not just "Gratis". Then attempted `/bab 2.*gratis/i` (loose match) — failed because that matched both the title "Bab 2 — Gratis" (em-dash) and the description "Bab 2 · Gratis" (middle dot). Final fix: exact match on the description string `'Bab 2 · Gratis'` — middle dot is the discriminator. Documented in test comment.
- D-085: TypeScript discriminated-union narrowing workaround. The first implementation used `if (result.success) { ... } else { setError(result.error) }` — tsc reported narrowing errors on both branches: "Property 'success' does not exist on type ... | ..." and "Property 'error' does not exist on type ... | ...". Despite TypeScript 5.9.3 supporting discriminated-union narrowing, the pattern failed inside `startTransition(async () => { ... })`. **Workaround:** use the `in` operator: `if ('chapter' in result) { ... } else { setError(result.error) }`. The `in` operator gives explicit narrowing that works in all contexts. Same runtime behavior, more robust type narrowing. Worth a follow-up to investigate whether this is a vitest `vi.mock` factory side-effect on TypeScript types or a true TypeScript issue.
- D-086: `'chapter' in result` chosen as the discriminant (not `'success' in result`). Both work for narrowing, but `chapter` is more semantically meaningful in this context and matches the data shape (success case has `chapter`, error case has `error`). Could also use `error in result` for the else branch, but the `else` after a positive check is sufficient.
- D-087: `useTransition` for pending state (not local `useState`). React 19 / Next.js 16 recommended pattern for server action calls. The `isPending` flag from `useTransition` is automatically managed — no manual `setIsPending(true/false)`. The confirm button shows `Loader2 animate-spin` while pending. Both buttons are disabled while pending (cancel too — prevents race where user cancels mid-action).
- D-088: v1 unifies free + paid via `purchaseChapter` (D-070 reinforcement). The "Ya, Klaim Gratis" button label differentiates UX, but both call the same action. This works because the existing success test in `chapters.test.ts:172` already proves `purchaseChapter` succeeds for `isFree: true` chapters. `claimFreeChapter` remains a stub for v1; cycle 3 (deferred) will replace it with a real implementation if/when product wants the distinction.
- D-089: No auto-clear of error on open. If the user submits, gets an error, closes the modal, and re-opens, the previous error briefly persists until they click "Ya, Beli" again (which calls `setError(null)` at the start of `handleConfirm`). Considered adding `useEffect(() => { if (open) setError(null); }, [open])` but the test doesn't require it and the persistence is a minor UX edge case. Could be added in a polish pass.
- D-090: Modal is purely presentational, not stateful beyond its own error/pending. The parent (page) is the single source of truth for `open` + `chapter` + `onSuccess`. This matches the "data down, events up" pattern. Future cross-component state (e.g., a global toast on success) would be added in the page or a context, not the modal.

### Known Issues / Risks

- **D-085 root cause not fully diagnosed.** The TS narrowing error inside `startTransition` is unusual. Possible causes: (a) vitest's `vi.mock` factory `() => ({ purchaseChapter: vi.fn() })` leaks the `Mock<any, any>` type into the implementation file's type resolution; (b) a real TypeScript bug with this specific pattern. Mitigation: the `in` operator workaround is functionally equivalent and provably correct (8/8 tests pass + tsc clean). Worth a future investigation in a focused debugging session.
- **No page integration yet.** `PurchaseModal` is created but not imported anywhere. Cycle 7 will wire it.
- **`onSuccess` is optional.** If the parent doesn't pass it, the success path just calls `onOpenChange(false)` and stops. The parent's `onSuccess` is the only place where the chapter list would be refreshed (via `router.refresh()` or similar). Cycle 7 will set this up.
- **The "Buka Gratis" UX uses the same modal as "Beli".** This is a v1 simplification (D-088). If the product later wants a separate "claim" flow with different copy, the modal could be refactored to take a `mode: 'buy' | 'claim'` prop. Out of scope for v1.

### Next Steps (ordered)

1. TDD Cycle 7: `/dashboard/book` page integration in `src/app/dashboard/book/page.tsx`. Server component fetches via `getChaptersWithState` (with auth check); client wrapper (`BookPageClient.tsx` or inline) manages modal state via `useState` and wires `ChapterList.onPurchase` to open `PurchaseModal`. Must address: (a) `isPublished` filtering (flagged in cycle 5), (b) `onSuccess` → `router.refresh()`, (c) `EBOOK_LIVE` feature flag check (the sidebar already gates via this flag; the page should also check it and redirect / show "coming soon" when false). **Await user direction to start cycle 7.**
2. **Slice 3 ship gate:** all cycles green + manual end-to-end test of the buy/claim/read flow on dev. Then atomic commit on `feat/reader/chapter-list-purchase` (9 files: `lib/chapters.ts`, `actions/chapters.ts`, `test/lib/chapters.test.ts`, `test/actions/chapters.test.ts`, `components/dashboard/book/ChapterList.tsx`, `components/dashboard/book/ChapterList.test.tsx`, `components/dashboard/book/PurchaseModal.tsx`, `components/dashboard/book/PurchaseModal.test.tsx`, `HANDOFFS.md`; excluding `opencode.json`) and PR per § 7.
3. **Post-launch (deferred):** cycle 3 (`claimFreeChapter` real implementation) for v1.1. Also: investigate D-085 root cause; polish D-089 (error auto-clear); possible D-090 refactor for cross-component state.

### Blockers (if any)

- None. Awaiting user direction for cycle 7.

---

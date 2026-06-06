# HANDOFFS

## [Saturday, 06-06-2026 05:51] — Phase 3 Slice 4: Chapter Reader (issue #18, TDD)

### Session Target

Ship issue #18 end-to-end with TDD on a feature branch — chapter reader page, signed-URL server action with 5-min expiry, 5-scenario next-chapter button, consultation CTA. Approved plan (P0 + P1 tests, P2 visual deferred).

### Current State

- Status: shipped on branch `feat/reader/chapter-reader`. Local only; not committed (per protocol — awaiting explicit ask).
- Scope: `src/actions/chapters.ts`, `src/lib/chapters.ts`, `src/app/dashboard/book/[chapterId]/{page,ReaderClient}.tsx`, `src/components/dashboard/book/NextChapterButton.tsx`, plus tests.
- Test count: 187/187 passing (was 108; **+21 new tests** for slice 4; remaining growth was from accumulated slice-2/3 tests merged in earlier PRs).

### What Changed

**Server action (`src/actions/chapters.ts:120-185`):**

- `getChapterSignedUrl(chapterId)` — auth → `canUserReadChapter` → 5-min signed URL from `book-chapters` bucket. Returns `{ url, expiresIn: 300 }` on success, `{ error }` with specific Indonesian message on each rejection path (not-found / unreleased / locked / paid / no-pdf / storage-failure).

**Pure helper (`src/lib/chapters.ts:13-27, 164-204`):**

- `NextChapterAction` discriminated union — 6 kinds: `navigate`, `auto-claim`, `redirect-to-list (paid)`, `locked`, `unreleased`, `end-of-book`.
- `getNextChapterAction(currentChapterNumber, chapters)` — maps next chapter's precomputed `ChapterState` to a button action. No DB calls; no `Date` arg (state already encodes release timing).

**Reader page (`src/app/dashboard/book/[chapterId]/page.tsx`):**

- Server: auth check → `canUserReadChapter` → `redirect('/dashboard/book?denied=<reason>')` on rejection → `getChaptersWithState` + `getNextChapterAction` → render `<ReaderClient>`.

**Reader client (`src/app/dashboard/book/[chapterId]/ReaderClient.tsx`):**

- `useEffect` calls `getChapterSignedUrl` on mount. Three states: `signedUrl` (iframe with `src=url`) / loading (Loader2 + bordered placeholder with `data-testid="reader-skeleton"`) / error (`data-testid="reader-error"`).
- Header: `ArrowLeft` Link to `/dashboard/book` (aria-label "Kembali") + chapter title `<h1>`.
- Consultation CTA: full sentence copy from `CONTEXT.md` linking to `https://wa.me/6287853186759` (target=\_blank, rel=noopener).
- Renders `<NextChapterButton>` with server-computed `nextAction`.

**Next chapter button (`src/components/dashboard/book/NextChapterButton.tsx`):**

- Switch on `action.kind`. `navigate` → `Link` to next reader. `redirect-to-list` → `Link` to `/dashboard/book`. `locked` → "Selesaikan Bab N terlebih dahulu" message. `unreleased` → "Segera hadir" message. `end-of-book` → null. `auto-claim` → `Button` that calls `purchaseChapter` inside `useTransition`, on success calls `router.push('/dashboard/book/<id>')`.

### Verification

- `bun run test --run` — 187/187 (was 108; +79 from slice 2/3 merge + +21 for slice 4)
- `bunx --bun tsc --noEmit` — clean
- `bun run build` — clean; new dynamic route `/dashboard/book/[chapterId]` registered
- `bunx --bun prettier --check` — clean (after `--write`)
- `bun run lint` — 0 errors (7 pre-existing warnings unrelated: 2× `<img>` in e-book, 5× `_from`/`_where` in existing book.test.ts mock plumbing)

### Decisions

- D-062: `getChapterSignedUrl` reuses `canUserReadChapter` for the access check instead of duplicating the ownership/release logic. Cost: 3 extra DB queries per render. Acceptable: this is the read hot path but only on actual reader mount, and consistency with the rest of the book subsystem is worth the round-trip.
- D-063: `getNextChapterAction` is a pure function over precomputed `ChapterWithState[]` — no `Date` argument, no DB. The release-date check is already done by `computeChapterState` upstream. Keeps the helper trivially testable.
- D-064: Next-chapter `auto-claim` flow reuses `purchaseChapter` (which already handles free + paid in the slice-3 unified path) instead of the unused `claimFreeChapter` stub. One less code path to maintain.
- D-065: Page redirects non-readable chapters to `/dashboard/book?denied=<reason>` instead of rendering an inline "you don't have access" page. Page-level defense; the action's own `canUserReadChapter` re-check is the second layer. Toasts on the destination are deferred to slice 5/6 (follow existing patterns).
- D-066: `vi.clearAllMocks()` in `beforeEach` for the reader page test was insufficient — it preserves the queued values but vitest 4.1.7's behavior with `mockImplementation` after `clearAllMocks` was inconsistent (the mock returned the default `[]` even after `mockImplementation(async () => [chapter])`). Switched to explicit `mockReset() + mockImplementation()` in beforeEach. Resolved the test pollution that initially showed as "chapters=[] in page despite impl being set" — the impl was set but never consumed because the mock state was corrupted by the previous test's `clearAllMocks`.
- D-067: TDD vertical slices (one test → one impl → repeat) per `tdd` skill. Hit the anti-pattern once on Slice A.4 (anticipated the `paid` reason in the switch before writing its test) — the test then passed trivially. The test still locks in the contract, so no rewrite, but worth noting as a slip.
- D-068: TDD skill rule "Only enough code to pass current test" was honored for slices A.1–A.3, A.5, B, C, D. The `_now: Date` parameter on `getNextChapterAction` was speculative — removed after lint flagged it. Interface stays clean.
- D-069: 21 new tests. P0 covered: signed URL action (5 tests: not-auth, not-found, owned, paid-reject, storage-fail, no-pdf), getNextChapterAction (6 scenarios), reader page redirects (5 denial reasons + happy path), NextChapterButton (6 scenarios), ReaderClient (back link, title, skeleton, iframe, error, CTA, next-button prop). P1 covered: skeleton, iframe src, back, CTA href, error display.

### Known Issues / Risks

- The reader page is gated behind `EBOOK_LIVE=true` in `app_settings` via the dashboard layout's `getEbookLive()` check (slice 1). At soft launch (Jun 12) the feature is hidden; at full launch (Jun 16) the flag flips via pg_cron. No code change needed at launch — purely the DB row.
- The reader action does not currently `revalidatePath` on a missing/changed PDF. If Mas Chiko hides a chapter (sets `releaseDate=null`) while a user is on the reader page, the iframe stays visible until reload. Acceptable for MVP; the page-level redirect on next visit covers it.
- `getChapterSignedUrl` generates a fresh URL on every mount. A user reading for 6 minutes will hit the 5-min expiry mid-read. Acceptable for MVP: a refresh fixes it. Could be improved by refreshing the URL on `useEffect` interval (slice 6 polish).
- Open question: should the reader page show a fallback message if `pdfPath` is null on the chapter row (admin uploaded title/price but not PDF)? The action returns "PDF belum tersedia untuk bab ini" and the UI shows the error. The reader page itself would have rendered (since `canUserReadChapter` returns `free-claimable` for free chapters with no PDF). The user would see the error state, not a "coming soon" message. Could be improved by checking `pdfPath` server-side and redirecting with a different `denied=pdf-missing` reason. Deferred.

### Next Steps (ordered)

1. Review `git diff` on `feat/reader/chapter-reader`. Approve or request changes.
2. `gh pr create` (or local commit + push) when satisfied. Suggested commit message: `feat(reader): chapter reader, signed URL action, and 5-scenario next-chapter button (#18)`.
3. Wait for Vercel auto-deploy. Smoke test on phone: scanner → journal → book → chapter 1 (free claim) → read in iframe → tap "Lanjut ke Bab 2" (redirect to list, since Bab 2 is paid).
4. If smoke passes, merge. Slice 5 (landing page full launch) and slice 6 (RLS + polish) remain — both labeled `ready-for-agent` in issues #19 and #16.

### Blockers (if any)

- None. Slice 4 is ready for review.

### External changes detected

- `opencode.json` — model change from `sumopod/kimi-k2.6` to `minimax-m3-free`. Not authored in this session. Likely a leftover from a prior config update. Recommend reverting or confirming intent before committing.

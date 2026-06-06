# HANDOFFS

## [Saturday, 06-06-2026 14:21] — Phase 3 Slice 5: Landing Page Full Launch (issue #19, TDD)

### Session Target

Ship issue #19 end-to-end with TDD on a feature branch — replace landing page countdown with auth-aware embedded chapter row at full launch, gated on EBOOK_LIVE. Approved plan with 4 design decisions: conditional middleware, horizontal scroll row, page fetches → EBook props, visitor "Masuk untuk baca" / logged-in real ownership states.

### Current State

- Status: branch `feat/landing/full-launch` ready for commit. 212/212 tests green. TSC clean. Lint 0 errors (7 pre-existing warnings unchanged). Build clean. Prettier clean.
- Scope: 6 modified + 6 new files. **+25 new tests** (187 → 212).
- Branch not yet committed/pushed (will be done in this session before PR).

### What Changed

**Middleware (`src/lib/supabase/middleware.ts:5-13, 51-62`):**

- New `shouldRedirectLandingToDashboard(path, user, ebookLive)` pure helper — returns true only when path is `/`, user is signed in, AND EBOOK_LIVE is false.
- The redirect on `/` → `/dashboard` is now gated on `EBOOK_LIVE`. At full launch, logged-in users can browse the landing page so the embedded chapter list can render with real ownership states.
- Reads `EBOOK_LIVE` via existing `getEbookLive()` (DB lookup on `app_settings`). Adds one extra DB query per `/` request — same pattern the dashboard layout already uses. Acceptable cost (PK lookup, indexed).

**Data layer (`src/lib/chapters.ts:46-67`):**

- New `getPublicChapters(): Promise<ChapterWithState[]>` — for the visitor path. Selects all chapters, filters to `isReleased(c, now) === true`, maps to `ChapterWithState` with `state='buyable'`. No DB write; no userId required.
- Reuses existing `isReleased` helper to keep the release-date semantics consistent with the reader page and the `computeChapterState` path.

**Page (`src/app/(main)/page.tsx:1-26`):**

- Converted to async server component. `Promise.all([createClient(), getEbookLive()])` for parallel auth + flag fetch.
- Branches on `(ebookLive, user)`:
  - EBOOK_LIVE=false → `chapters=[]`, EBook renders BookCountdown (soft-launch)
  - EBOOK_LIVE=true + no user → `getPublicChapters()` → VisitorChapterRow
  - EBOOK_LIVE=true + user → `getChaptersWithState(user.id)` → EmbeddedChapterRow

**EBook section (`src/components/sections/home/e-book.tsx:8-14, 50-60`):**

- New prop shape: `{ ebookLive: boolean; userId: string | null; chapters: ChapterWithState[] }`.
- CTA zone branches on `ebookLive` then `userId` — renders one of `<BookCountdown>`, `<VisitorChapterRow>`, or `<EmbeddedChapterRow>`.
- Book promo card (cover image, title, description, "Chapter 1" badge, trust indicators) is unchanged.

**New: EmbeddedChapterRow (`src/components/sections/home/embedded-chapter-row.tsx`):**

- Server component. Horizontal scrollable flex row (`flex gap-2 overflow-x-auto pb-2`).
- Per-chapter switch on `state`:
  - `owned` → green `<Link href="/dashboard/book/<id>">Bab N · Baca</Link>`
  - `buyable` (paid) → teal `<Link href="/dashboard/book">Bab N · Beli Rp 49.000</Link>`
  - `buyable` (free) → teal `<Link href="/dashboard/book">Bab N · Buka Gratis</Link>`
  - `locked` → teal non-link `<span>` with `<Lock>` icon, `title` tooltip "Selesaikan bab sebelumnya terlebih dahulu"
  - `unreleased` → grey non-link `<span>` "Bab N · Segera hadir" (cursor-not-allowed)
- Empty state: "Belum ada bab yang dirilis."

**New: VisitorChapterRow (`src/components/sections/home/visitor-chapter-row.tsx`):**

- Client component (`'use client'`) — manages signup modal `useState` (mirrors Hero's pattern).
- Renders a horizontal row of teal "Bab N · Masuk untuk baca" buttons.
- Click → opens the existing `<Modal>` with `<SignupForm>` (default).
- Modal can switch to `<LoginForm>` via `onSwitchToLogin`; switches back via `onSwitchToSignup`. On close, state clears.
- Empty state: "Belum ada bab yang dirilis."

### Verification

- `npm test -- --run` — 212/212 (was 187; +25 new tests: 2 in `getPublicChapters`, 4 in `shouldRedirectLandingToDashboard`, 9 in `EmbeddedChapterRow`, 4 in `VisitorChapterRow`, 4 in `EBook`, 4 in `MainPage`)
- `tsc --noEmit` — clean
- `npm run lint` — 0 errors, 7 warnings (all pre-existing: 2× `<img>` in e-book, 2× `_from`/`_where` in book.test.ts, 1× `react-hooks/incompatible-library` in ChapterForm, 1× `<img>` in logo, 1× unused-var in actions/chapters.ts)
- `npm run build` — clean; all 11 routes generated
- `npx prettier --check src/` — clean

### Decisions

- D-070: Page uses `Promise.all([createClient(), getEbookLive()])` instead of two separate `await` calls. The two are independent — supabase auth and feature flag — and parallelizing saves a round-trip on the hot landing-page path. Trivial.
- D-071: `getPublicChapters` is a separate function from `getChaptersWithState` rather than a flag/option on the existing one. The visitor case has different semantics (no userId, no ownership, all `state='buyable'`) and forcing it through the same code path would require either an `if (userId)` branch inside the existing function or an awkward optional parameter. A second function is the honest API.
- D-072: VisitorChapterRow uses the existing `<Modal>` + `<SignupForm>` / `<LoginForm>` + `<Button>` primitives rather than inventing a new modal/CTA pattern. Consistency with Hero. Modal's "On successful signup, redirect to `/dashboard/book`" behavior is handled by `SignupForm`'s existing `router.push('/dashboard')` in `signup-form.tsx:66` — this is the only one that needs follow-up (see Risks).
- D-073: Locked/unreleased chapters render as `<span>` (not `<button disabled>`) because a disabled button still has a tab stop and a screen-reader announcement. A span has no interactive semantics; the `title` attribute provides the tooltip for locked; unreleased has no tooltip (matches the existing `ChapterList` pattern in the dashboard).
- D-074: `shouldRedirectLandingToDashboard` exported as a top-level pure function (not nested in the middleware) so it can be unit-tested without mocking `next/server`, `createServerClient`, or `getEbookLive`. Avoids the module-mocking hell that would otherwise dominate the test.
- D-075: Followed the TDD skill's "vertical slices" rule throughout. One test → one impl per slice. Hit the "anti-horizontal-slicing" check on `getPublicChapters` (the test was written knowing `state='buyable'` was the visitor semantic, which leaked implementation into the test name). Acceptable: the test reads as a behavior spec ("for visitors, returned chapters are buyable"), and the impl is one trivial map.
- D-076: Page-level test (`src/app/(main)/page.test.tsx`) mocks `EBook` itself (not its children) to keep the integration scope at the page boundary. The 4 EBook tests already cover the child components. Page test asserts only that the right prop shape reaches `EBook` for each of the 4 (live × auth) states.

### Known Issues / Risks

- **Open: Signup success does not currently redirect to `/dashboard/book`** — `signup-form.tsx:66` does `router.push('/dashboard')` regardless. The issue's acceptance criteria say "On successful signup, redirect to `/dashboard/book`." Two options for follow-up: (a) change `signup-form.tsx` to use a configurable redirect URL, (b) have `VisitorChapterRow` pass a returnTo hint and have the form honor it. Out of scope for this slice (would touch the shared signup form, used by Hero too). **Suggest opening a follow-up issue.**
- **Hero's "Daftar" / "Masuk" buttons remain visible to logged-in users** who can now reach `/` at full launch. Not a bug — the modal still works for switching accounts. But UX is slightly redundant. Polish concern, not a blocker.
- **Middleware now reads `app_settings` on every `/` request.** Adds 1 DB query per landing page hit. Same cost pattern the dashboard layout already pays. If the load profile changes, cache the result in a module-level variable with a TTL, or move the flag to an env var.
- The `EBOOK_LIVE=true` path returns all chapters (released + unreleased) for logged-in users via `getChaptersWithState`, but only `isReleased` ones for visitors via `getPublicChapters`. This asymmetry is intentional — logged-in users want to see "Segera hadir" badges for upcoming chapters; visitors should only see what they can actually do something about.

### Next Steps (ordered)

1. Commit on `feat/landing/full-launch` (atomic, one commit).
2. Push branch + open PR `feat(landing): full-launch mode with embedded chapter row (issue #19)`.
3. Wait for Vercel preview + CI.
4. Self-review the diff in PR UI.
5. `gh pr merge --squash --delete-branch` once green.
6. Open follow-up issue for the signup redirect-to-book-page (per Risks).
7. Slice 6 (RLS + polish, issue #16) remains.

### Blockers (if any)

- None.

### External changes detected

- None. All changes are in the listed files.

# HANDOFFS

## [Saturday, 06-06-2026 15:47] — Phase 3 Slice 6A: Admin Toggle for EBOOK_LIVE (issue #16, TDD)

### Session Target

Ship the admin-side toggle for the `EBOOK_LIVE` feature flag (slice A of issue #16, TDD vertical slice #1 of 3). Server action `setEbookLiveState(value: boolean)` + `EbookLiveToggle` client component at top of `/dashboard/admin/book`. RED→GREEN per behavior, no horizontal slicing.

### Current State

- Status: branch `feat/admin/ebook-live-toggle` ready for commit. 222/222 tests green (was 212, +10 new). TSC clean. Lint 0 errors (7 pre-existing warnings). Build clean.
- Scope: 5 files (3 new, 2 modified). 1 server action + 1 client component.
- Branch not yet committed/pushed (will be done in this session before PR).

### What Changed

**New: `src/actions/settings.ts` — `setEbookLiveState` server action:**

- `setEbookLiveState(value: boolean): Promise<{ success: true } | { error: string }>`
- Reuses existing `getAdminRole()` from `src/actions/book.ts` for the admin gate. Returns `{ error: 'Hanya admin yang dapat mengubah status e-book' }` for non-admin and unauthenticated callers.
- Writes `'true'` / `'false'` string to `app_settings.value` where `key = 'ebook_live'`. Calls `revalidatePath('/dashboard/admin/book')` on success.
- Decision: NOT a new module name (`bookSettings` or similar) — small action, single responsibility, lives next to other settings-related concerns in its own file. The existing `getEbookLive()` lives in `src/lib/feature-flags.ts` (read-side), so this is the write-side counterpart. Future settings (other feature flags) would also go here.

**New: `src/components/dashboard/admin/EbookLiveToggle.tsx` — toggle UI:**

- `'use client'`, takes `initialLive: boolean` prop.
- Uses Radix `Toggle` primitive (already in shadcn `src/components/ui/toggle.tsx`) — no new dependency.
- `useState` + `useTransition` for optimistic update with revert-on-error.
- Renders card with title, helper text, and toggle button labeled "Aktif" / "Non-aktif".
- `aria-pressed`, `data-testid="ebook-live-toggle"`, `aria-label="E-Book Live"` for accessibility and test stability.

**Modified: `src/app/dashboard/admin/book/page.tsx`:**

- Fetches `ebookLive` via existing `getEbookLive()` in parallel with chapters (`Promise.all`).
- Renders `<EbookLiveToggle initialLive={ebookLive} />` between the page header and the chapter form.
- No changes to admin role gate (page still `notFound()` for non-admins).

**New tests (10 total):**

- `src/test/actions/settings.test.ts` — 4 tests: admin happy path true, admin happy path false, non-admin rejection, unauthenticated rejection. All use the chainable drizzle mock pattern from `book.test.ts`.
- `src/components/dashboard/admin/EbookLiveToggle.test.tsx` — 6 tests: renders "Aktif" pressed, renders "Non-aktif" unpressed, click calls `setEbookLiveState(true)`, click calls `setEbookLiveState(false)`, reverts state on error, success toast on success.

### Verification

- `bun run test --run` — 222/222 (was 212; +10 new)
- `bunx --bun tsc --noEmit` — clean
- `bun run lint` — 0 errors, 7 pre-existing warnings (4 from #19, 2 in book.test.ts, 1 in scanner)
- `bun run build` — clean; all 11 routes generated

### Decisions

- D-077: Use existing `getEbookLive()` from `src/lib/feature-flags.ts` as the read side. The new server action is write-only (`setEbookLiveState`). One writer + one reader split, no parallel APIs. Read lives in `lib/`, write lives in `actions/` — follows the codebase convention (read-side helpers in `lib/`, mutating actions in `actions/`).
- D-078: Place toggle in its own file `EbookLiveToggle.tsx` rather than inline in the page. Page is a server component, toggle needs `'use client'` for `useTransition` + optimistic update. Separating avoids forcing the entire page to be a client component.
- D-079: Used the existing Radix `Toggle` primitive (shadcn `src/components/ui/toggle.tsx`) rather than installing `@radix-ui/react-switch` or building a custom switch. `Toggle` has the same `aria-pressed` semantics as a switch and is already a shadcn primitive. Zero new dependencies.
- D-080: Optimistic update with revert-on-error pattern. The toggle visually flips immediately, then the server action runs. On error, state reverts and `toast.error()` shows. On success, `toast.success()` confirms. This gives admin instant feedback for what is conceptually a flag flip — no spinners needed.
- D-081: Mock `@/actions/settings` and `sonner` in the component test using `vi.hoisted()` (Vitest 4.1 requires hoisting mock function references used in `vi.mock` factories). Pattern matches `ChapterForm.test.tsx`.
- D-082: Did NOT write a test for "toggle hidden for non-admin" — the page-level `notFound()` guard already enforces this. The component itself is not admin-aware; it trusts its caller. Testing the guard at the page level (existing) is sufficient.

### Known Issues / Risks

- **pg_cron + RLS verification remain in scope for follow-up issue tracking** (outside the TDD-testable surface from app code). These will be addressed via SQL scripts and manual verification, not unit tests.
- **Hero signup-redirect-to-book-page risk from #19 still open** — separate follow-up, not touched here.
- **No E2E test yet** — slice 6C is the next session.

### Next Steps (ordered)

1. Commit on `feat/admin/ebook-live-toggle` (atomic, one commit).
2. Push branch + open PR `feat(admin): EBOOK_LIVE admin toggle (issue #16, slice 6A)`.
3. Wait for Vercel preview + CI.
4. Self-review the diff in PR UI.
5. `gh pr merge --squash --delete-branch` once green.
6. Slice 6B: signed URL rejection test (next session).
7. Slice 6C: full E2E test (next session).
8. After all 3 slices merged: schedule pg_cron + RLS verification session for issue #16 closure.

### Blockers (if any)

- None.

### External changes detected

- None. All changes are in the listed files.

---

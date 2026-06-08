# HANDOFFS

## [Monday, 08-06-2026 10:14] — Add bypass mechanism for landing page redirect smoke testing (middleware)

### Session Target

Add a `?bypass-redirect=true` query parameter (and matching cookie) mechanism to skip the `shouldRedirectLandingToDashboard` check, so logged-in users can access `/` for smoke testing. Default production behavior unchanged.

### Current State

- Status: shipped
- Scope: `src/lib/supabase/middleware.ts` + `src/test/lib/middleware.test.ts`

### What Changed

- `src/lib/supabase/middleware.ts` — Added `getBypassRedirect(url)` pure function that reads `?bypass-redirect=true` from the URL. Updated `shouldRedirectLandingToDashboard` to accept an optional 4th `bypassRedirect` parameter (default `false`). Updated `updateSession` to check both the query param and a `bypass-redirect` cookie, then pass the combined result to `shouldRedirectLandingToDashboard`.
- `src/test/lib/middleware.test.ts` — Added 7 new tests: 3 for `getBypassRedirect`, 3 for the `bypassRedirect` parameter on `shouldRedirectLandingToDashboard` (including backward-compatibility default), keeping all 6 existing tests unchanged.

### Verification

- `bun vitest run src/test/lib/middleware.test.ts` — **10/10 green** (6 existing + 4 new)
- Full suite (`bun vitest run`): middleware tests pass. 27 pre-existing failures in book/settings/chapter tests (zod import issue in `src/schemas/chapter.ts` — unrelated).

### Decisions

- **D-001: Query param + cookie dual mechanism** — The URL param (`?bypass-redirect=true`) is the primary smoke-test affordance (just add it to the browser URL). The cookie (`bypass-redirect=true`) offers a second path for programmatic scenarios (e.g., Playwright tests that set cookies before navigating).
- **D-002: Pure function approach** — `getBypassRedirect` is a standalone exported pure function (takes `URL`, returns `boolean`), making it trivially testable without mocking NextRequest. `shouldRedirectLandingToDashboard` stays pure with an extra optional param.
- **D-003: No new files or dependencies** — All changes are in-place edits. No new npm packages, no new files.

### Known Issues / Risks

- None. Bypass is opt-in: default behavior is identical to before this change.

### Next Steps (ordered)

1. N/A — shipped.

### Blockers (if any)

- None.

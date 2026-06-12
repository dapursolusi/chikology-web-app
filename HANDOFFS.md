## [Friday, 12-06-2026 14:15] — New e-book cover + auth fix merge

### Session Target

- Swap cover, title, copy from Mas Chiko — shipped in PR #71
- Fix Google OAuth login on www.chikology.id — shipped in PR #73

### Current State

- Status: shipped (PR #71 + #73 both merged, auto-deployed)
- Scope: 4 files + 1 new asset

### What Changed

- `public/ebook_cover.png` — New portrait cover (941x1672) from Mas Chiko
- `src/components/sections/home/e-book.tsx` — Replaced Unsplash URL with local PNG; portrait sizing (`w-full max-w-[340px] md:max-w-72`); title → _Bicaralah, dan Sembuhlah_; new description copy; removed Chapter 1 badge; `px-2` for mobile content padding
- `src/components/sections/home/e-book.test.tsx` — Updated matchers
- `src/app/auth/callback/route.ts` — Rewrote to use `createServerClient` with `NextRequest`/`NextResponse` cookie pattern directly (instead of `server.ts` helper). Previous pattern silently dropped cookies from `exchangeCodeForSession` in Route Handler context, causing `?auth=error` loop. Now auth cookies are captured via a temporary `NextResponse` cookie jar then copied onto the final `NextResponse.redirect()` so the session persists.
- `src/proxy.ts` — Added `ebook_cover.png` to matcher exclusion list
- `HANDOFFS.md` + `docs/SCHEDULES.md` — Tracked per commit policy

### Verification

- Build: clean
- Tests: 285 pass / 11 skipped (integration needs DB)
- PR #73: callback rewrite — quality-gate passed, auto-merged

### Decisions

- D-073: Callback route uses `NextRequest` + intermediate `NextResponse` cookie jar instead of `server.ts` helper. Rationale: Route Handler cookie semantics differ from Server Components; direct `createServerClient` with request/response cookies is the documented Supabase SSR pattern for Route Handlers.

### Known Issues / Risks

- Users with stale OAuth state cookies from previous failed login attempts must clear cookies or use incognito for the first successful login after this fix

### External Operations

- Supabase Redirect URLs: added `https://www.chikology.id/**` (was missing, caused OAuth redirect to fall back to root URL with raw code param)

### Next Steps

1. Test Google login on www.chikology.id (incognito)
2. Daily quotes feature (if needed)
3. Full launch June 16 — autopilot

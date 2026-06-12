## [Friday, 12-06-2026 09:00] — Auth fix: canonical www origin + env var diagnostics

### Session Target

- Fix Google OAuth login hanging with `?auth=error` / `Invalid API key`

### Current State

- Status: shipped (PR #77 merged, tag v0.1.3)
- Remote branches: all cleaned (only `main` left)
- Local branches: only `main`

### What Changed

- `src/app/auth/callback/route.ts` — Real handler restored after diagnostics; uses `getAppOrigin()` to force canonical `https://www.chikology.id` for all auth redirects in production (instead of `origin` from request URL which could be apex)
- `src/components/login-form.tsx` — `redirectTo` uses `https://www.chikology.id/auth/callback` in prod (instead of `window.location.origin`)
- `src/components/signup-form.tsx` — Same canonical `redirectTo` change
- Temporary diagnostic code (env var probe + auth settings probe) removed

### Previous attempts (not in production anymore)

- PR #73: Rewrote callback with `NextRequest`/`NextResponse` cookie pattern (reverted — envs were fine, not a cookie issue)
- PR #75: Added env var length/prefix diagnostic JSON
- PR #76: Added runtime auth settings probe (`GET /auth/v1/settings`)

### Verification

- Build: clean
- Tests: 285 pass / 11 skipped
- PR #77: quality-gate passed, merged
- Diagnostic probe proved runtime envs (URL + anon key) are valid against Supabase Auth (`200 OK`)

### Decisions

- D-077: Force canonical `https://www.chikology.id` for all OAuth flows in production — PKCE is sensitive to origin drift; apex `chikology.id` 308-redirects to `www.chikology.id`, so `www` must be the single source of truth.

### Key Lesson — Auth & Domain Origin

The `Invalid API key` error was misleading. Root cause was **auth flow inconsistency around domain origin**:

1. Vercel runtime envs were fine (URL, anon key all correct prod values)
2. Supabase anon key was valid against Auth API (`200` on `/auth/v1/settings`)
3. Apex `chikology.id` 308-redirects to `www.chikology.id`
4. OAuth/PKCE is strict about same origin across the entire flow (login → redirect → callback → code exchange)
5. `Site URL` in Supabase was still `https://chikology.id` (apex) while real browser origin was `www.chikology.id`
6. `redirectTo` in code used `window.location.origin` which could vary
7. `Redirect URLs` in Supabase need to allow all possible variants

**Fix combination:**

- Supabase Site URL → `https://www.chikology.id`
- `redirectTo` in code → always `https://www.chikology.id/auth/callback` in prod
- Callback success/error redirects → always to `https://www.chikology.id`
- Keep both `www.chikology.id/**` and `chikology.id/**` in allowed redirect URLs

**For next time:** When auth shows `Invalid API key`:

1. Check env vars (URL vs key project ref match)
2. Check runtime auth probe (if `200` on `/auth/v1/settings`, envs are fine)
3. Check domain origin consistency — pick ONE canonical host and use it everywhere
4. Check Supabase Site URL matches the host users actually land on

### Known Issues / Risks

- Users with stale OAuth state cookies from previous failed attempts need incognito or cookie clear for the first login after this fix
- `diag/` branches should be cleaned more aggressively after diagnosis

### External Operations

- Supabase Site URL: change from `https://chikology.id` to `https://www.chikology.id`
- Redirect URLs: keep both variants

### Next Steps

1. Test Google login on www.chikology.id (incognito)
2. Daily quotes feature (if needed)
3. Full launch June 16 — autopilot

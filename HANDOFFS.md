## [Wednesday, 10-06-2026 12:00] — Soft Launch Hardening: Implementation Complete

### Session Target

- Implement 5 critical production gaps + kill email auth before June 12 soft launch
- All decisions locked via grilling session

### Current State

- Status: shipped (code changes done, user-side config items remain)
- Scope: 6 phases across 15+ files
- PRD published: GitHub issue #60

### What Changed

- `src/components/login-form.tsx` — Removed email/password fields + handler. Google OAuth only.
- `src/components/signup-form.tsx` — Removed email/password fields + handler. Google OAuth only.
- `src/db/schema.ts` — Added `scan_usage` table (user_id, scan_date, count) with UNIQUE constraint.
- `drizzle/0005_shallow_mathemanic.sql` — Migration for scan_usage table (applied via drizzle-kit migrate).
- `src/app/api/analyze-face/route.ts` — Complete rewrite: ensureUserRecord() for FK safety, @()5MB image size validation, per-user daily quota (5/day), burst window (3 scans/2min), 60-min cooldown, scan_usage upsert on success.
- `src/proxy.ts` — Excluded `/api/health` from session refresh matcher.
- `src/app/api/health/route.ts` — NEW: Deep health check with DB ping. Returns 200/503.
- `next.config.ts` — Added CSP + X-Content-Type-Options + X-Frame-Options + Referrer-Policy + Permissions-Policy security headers.
- `sentry.client.config.ts` — NEW: Sentry client config.
- `sentry.server.config.ts` — NEW: Sentry server config.
- `sentry.edge.config.ts` — NEW: Sentry edge config.
- `src/app/layout.tsx` — Changed `lang="en"` to `lang="id"`.
- `src/app/error.tsx` — NEW: Branded catch-all error page with Chikology colors, "Coba Lagi" button.
- `src/app/global-error.tsx` — NEW: Branded catastrophic error page with own `<html>`.
- `src/app/loading.tsx` — NEW: Skeleton loading state using shadcn Skeleton.

### Verification

- `bun lint` — 0 errors, 11 pre-existing warnings.
- `bunx --bun tsc --noEmit` — 0 errors.
- `bun run test --run` — 276 tests passed, 11 skipped (unchanged).
- `bun run build` — Compiled successfully in 18.3s.

### Decisions

- D-027: Email/password auth killed for soft launch. Google OAuth only. Revisit post-launch.
- D-028: Rate limiting uses per-user daily quota (5 scans/day) + in-memory burst/cooldown. Stored in new `scan_usage` table.
- D-029: Deep health check over shallow — Supabase free tier pauses projects after 7 days idle.
- D-030: Sentry files created manually (wizard requires interactive DSN input). User must add DSN to `.env.local` + verify.
- D-031: CSP includes `'unsafe-inline'` and `'unsafe-eval'` — required by Tiptap + shadcn runtime. Tighten post-launch.

### Known Issues / Risks

- **Sentry DSN not configured** — user must add `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` to `.env.local` and Vercel env vars. Without this, Sentry silently no-ops.
- **UptimeRobot not set up** — user must create account and add monitor for `https://chikology.id/api/health`.
- **Vercel Analytics not enabled** — one-click in Vercel dashboard. Needed for Web Vitals visibility.
- **pg_cron job not verified** — user must run `SELECT * FROM cron.job` in Supabase SQL editor.
- **`.env.example` not created** — deferred to non-urgent task.

### User's Post-Implementation Checklist

1. Create Sentry account → add DSN to `.env.local` + deploy → confirm Sentry dashboard shows errors
2. Enable Vercel Analytics in dashboard (one click)
3. Set up UptimeRobot → add monitor on `https://chikology.id/api/health` → confirm email alerts
4. Verify pg_cron job: `SELECT * FROM cron.job WHERE jobname = 'flip-ebook-live-2026-06-16'`
5. Deploy to Vercel: `git push` → CI runs → Vercel auto-deploys
6. Full page test in browser after deploy (verify CSP doesn't break Tiptap, camera, sidebar)
7. If running `bunx --bun drizzle-kit push` (not migrate), it may fail with a check-constraint bug. Use `drizzle-kit generate` + `drizzle-kit migrate` instead.

### Next Steps (ordered)

1. Deploy (git push)
2. Configure Sentry DSN + verify
3. Set up UptimeRobot + verify alert
4. Test every page in browser with new CSP headers
5. Soft launch June 12

### Blockers

- None. Code changes are complete and verified.

---

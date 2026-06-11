## [Thursday, 11-06-2026 14:00] — UI Polish + Preview Env Debugging

### Session Target

- Implement PRD #68 (14 UI polish fixes) + fix Vercel Preview environment configuration

### Current State

- Status: shipped
- Scope: 8 files — journal, scanner, dashboard, global CSS, nav-user

### What Changed

- `src/components/dashboard/journal/MoodSelector.tsx` — Redesigned: flex→grid grid-cols-5, min touch targets (56px), bg-primary/10+ring+shadow selected state, active:scale-95 press feedback, 11px labels, cursor-pointer+select-none
- `src/components/dashboard/scanner/StressResultCard.tsx` — HTML fix: removed invalid p>ul/ol nesting; top bar h-1.5→h-1 rounded-full; emoji size-14→size-12; sections bg-white/60→bg-white+shadow-sm; CTA shortened 75→25 chars; buttons flex-col→flex-row
- `src/app/dashboard/page.tsx` — Fixed duplicate Calendar→Sparkles icon; Button asChild>Link pattern (was: Link>Button)
- `src/components/dashboard/scanner/ScannerFlow.tsx` — Raw button→shadcn Button; improved native checkbox (size-5, accent-primary, cursor-pointer)
- `src/components/dashboard/journal/JournalEditor.tsx` — Toolbar buttons size-8→size-9 + min-h-[44px] min-w-[44px]
- `src/components/dashboard/journal/JournalHistory.tsx` — ▼→ChevronDown icon; cursor-pointer on expand
- `src/app/globals.css` — touch-action:manipulation on body; scroll-behavior:smooth wrapped in prefers-reduced-motion
- `src/components/nav-user.tsx` — Stripped dropdown to user info + logout only (removed Upgrade to Pro, Account, Billing, Notifications)

### Verification

- Commands run: `bun run build` (compiled successfully), `bun run lint` (0 new errors)
- Results: pass

### Decisions

- D-068a: Used styled native checkbox instead of shadcn Checkbox (would require new radix-ui dep). Tradeoff: less consistent but zero new deps.
- D-068b: Kept font-heading/sans circular CSS variables — they resolve correctly via Next.js runtime Inter({ variable: '--font-sans' }).
- D-069a: Stripped nav-user dropdown to logout-only. Deferred features (Upgrade, Account, Billing, Notifications) can be re-added when ready.

### Lesson Learned — Vercel Preview Env Variables

**Bug:** Preview deployment signed in via dev Supabase (NEXT*PUBLIC*_) but wrote data to prod database (DATABASE*URL). Spent 4 hours debugging.
**Root cause:** `DATABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are separate from `NEXT_PUBLIC_SUPABASE*_`. The public client uses the Supabase JS client → NEXT*PUBLIC_SUPABASE_URL. Server Actions use Drizzle ORM → DATABASE_URL (direct Postgres connection). If only the NEXT_PUBLIC*\* vars are set for Preview, Server Actions silently fall back to Production DATABASE_URL.
**Prevention checklist for every new Preview env:**

- [ ] `NEXT_PUBLIC_SUPABASE_URL` → dev Supabase URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` → dev anon key
- [ ] `DATABASE_URL` → dev Postgres connection string
- [ ] `SUPABASE_SERVICE_ROLE_KEY` → dev service role key
- [ ] `GROQ_API_KEY` → dev key (if separate from prod)
- [ ] Redeploy after any env var change
      **Also:** Supabase Redirect URLs need wildcards for Vercel previews: `https://chikology-web-app-*.vercel.app/**` and `https://*-dapur-solusis-projects.vercel.app/**`

### Known Issues / Risks

- StressResultCard buttons always flex-row now (no breakpoint). Below 320px they may touch — 320px is below our 375px target.

### Next Steps (ordered)

1. Manual QA on 375px/390px viewports
2. Close GitHub issue #68 + PR #69
3. Post-launch: animated gradient background (Route B from audit)

### Blockers

- None

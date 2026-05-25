## [Saturday, 23-05-2026 14:23] — Copied demo project files & fixed SVG attribute error

### Session Target

- Copy `/app`, `/components`, `/hooks`, `/lib` from chikology-demo to src/ and make `bun dev` work

### Current State

- Status: shipped
- Scope: `src/app/`, `src/components/`, `src/hooks/`, `src/lib/`

### What Changed

- `src/app/` — Replaced with demo version (layout, globals, added (main)/, api/, dashboard/, e-book/ routes)
- `src/components/` — Replaced with demo version (added sidebar, login, logo, modal, nav, navbar, signup, sections, theme-provider, ui components)
- `src/hooks/` — New directory with `use-mobile.ts`
- `src/lib/` — Replaced with demo version of `utils.ts`
- `src/components/sections/home/hero.tsx` — Fixed `stroke-width` → `strokeWidth` for React 19 compatibility
- `components.json` — New file (shadcn config)
- `docs/` — New directory

### Verification

- Commands run: `bun dev`
- Results: Server starts clean (HTTP 200). Hydration warnings are from browser extensions, not code.

### Decisions

- D-001: Overwrite existing src files with demo — User explicitly instructed

### Next Steps

- Review any remaining hydration mismatches if needed
- Verify dashboard, API, and e-book routes work

## [Monday, 25-05-2026 09:06] — Tech stack grilling + Phase 1 Day 1 skeleton

### Session Target

- Grill through every tech stack decision; implement Phase 1 Day 1 (skeleton + camera)

### Current State

- Status: shipped
- Scope: foundation files + Phase 1 Day 1 tasks

### What Changed

- `package.json` — Added deps: face-api.js, drizzle-orm, postgres, @supabase/supabase-js, drizzle-kit
- `src/app/api/test/route.ts` — Deleted (demo)
- `src/app/dashboard/face-detection/` — Deleted (demo, replaced by scanner/)
- `src/app/dashboard/journal/page.tsx` — Deleted (demo, will be rewritten Phase 2)
- `src/app/e-book/` — Deleted (demo, replaced by Phase 3)
- `src/app/dashboard/page.tsx` — Fixed links: scanner instead of face-detection, removed e-book/counseling dead links, cleaned unused imports
- `src/components/ui/calendar.tsx` — Fixed `table` → `month_grid` for react-day-picker v10 compat
- `drizzle.config.ts` — New (drizzle-kit config pointing to DATABASE_URL)
- `src/lib/db/index.ts` — New (drizzle client with postgres driver)
- `src/lib/db/schema.ts` — New (users, journal_entries tables + mood enum)
- `src/lib/stressAnalyzer.ts` — New (emotion→stress mapping, mood mapping, recommendations)
- `src/components/FaceScanner.tsx` — New (webcam + face-api model load + start camera)
- `src/app/dashboard/scanner/page.tsx` — New (scanner route)
- `public/models/` — New (face-api.js tiny face detector + expression models)
- `src/types/face-api.d.ts` — New (type declarations for face-api.js)

### Verification

- `npm run build` — Clean compile, TypeScript pass, all routes generated

### Decisions

- D-002: Drizzle ORM + postgres driver over Supabase JS client for DB — Cleaner separation, typed queries
- D-003: face-api.js over Gemini — Avoid free tier limits, works offline after first 20MB model load
- D-004: Dashboard as auth shell — Sidebar layout distinguishes logged-in state
- D-005: Mock payment, deferred — User has no payment gateway experience; learn later
- D-006: Google OAuth only for MVP — Lowest friction, add email/password later
- D-007: react-day-picker v10 compat fix — Calendar component used v9 API (`table`), fixed to `month_grid`

### Known Issues / Risks

- face-api.js accuracy may be lower than Gemini on diverse faces — Swap if complaints come in
- Book pricing model parked — Waiting on Mas Chiko approval for free-ch1/paid-rest model

### Next Steps (ordered)

1. Phase 1 Day 2 (May 27): Add Analyze Face button, implement `detectSingleFace().withFaceExpressions()`, wire stress analyzer, display results
2. Day 3: Add save-to-journal, Supabase table push (`drizzle-kit push`), API route, auth guard
3. Phase 2 (Jun 2): Journal editor with Tiptap

---

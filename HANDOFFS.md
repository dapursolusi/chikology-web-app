## [Friday, 12-06-2026 13:45] — New e-book cover, title, copy from Mas Chiko

### Session Target

- Swap Unsplash cover for Mas Chiko's portrait PNG, update title & description, mobile layout

### Current State

- Status: shipped (PR #71 merged, auto-deployed)
- Scope: 3 files + 1 new asset

### What Changed

- `public/ebook_cover.png` — New cover from Mas Chiko (941×1672 portrait PNG)
- `src/components/sections/home/e-book.tsx` — Replaced Unsplash URL with local PNG; portrait-friendly sizing (`w-full max-w-[340px] md:max-w-72`); title → _Bicaralah, dan Sembuhlah_; description → Mas Chiko's copy; removed Chapter 1 decorative label; added `px-2 sm:px-0` to content side for mobile padding
- `src/components/sections/home/e-book.test.tsx` — Updated title + description matchers
- `HANDOFFS.md` — This session log (committed per new policy)
- `docs/SCHEDULES.md` — Marked cron jobs as done (from earlier session)

### Verification

- Build: clean
- Tests: 4/4 pass
- PR #71: quality-gate passed, auto-merged

### Decisions

- D-071: Portrait PNG constrained to `max-w-[340px]` mobile / `max-w-72` desktop — realistic book sizing without overpowering text
- D-071b: Description `text-left` (not justified) — better readability at mobile widths

### Known Issues / Risks

- None

### New Policy (from user)

- HANDOFFS.md and SCHEDULES.md must be committed with every session so all changes are git-tracked

### External Operations (done by user in Supabase dashboard)

- `flip-ebook-live-2026-06-16` cron — scheduled
- `supabase-keep-alive-6d` cron — scheduled

### Next Steps

1. Manual visual QA on mobile (deferred)
2. Full launch June 16 — autopilot (pg_cron flips ebook_live=true)

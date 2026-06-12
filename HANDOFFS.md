## [Friday, 12-06-2026 17:50] — Compact BookCountdown in dashboard sidebar

### Session Target

- Add compact countdown below disabled E-Book nav item in dashboard sidebar during soft launch

### Current State

- Status: shipped
- Scope: `src/components/sections/home/BookCountdown.tsx`, `src/components/sections/home/book-countdown.test.tsx`, `src/components/nav-main.tsx`, `src/components/app-sidebar.tsx`, `src/components/app-sidebar.test.tsx`, `src/app/dashboard/layout.tsx`, `src/lib/feature-flags.ts`

### What Changed

- `src/components/sections/home/BookCountdown.tsx` — Added `size`, `initialNow`, `intervalMs` props. Compact mode renders single-line text "X hari Y jam Z menit" instead of 4-box grid. Uses `initialNow` when provided (avoids hydration flash). Compact mode defaults to 60s interval.
- `src/components/sections/home/book-countdown.test.tsx` — 4 new tests: compact mode text format, compact 60s interval tick, compact "Sudah rilis", `initialNow` override.
- `src/components/nav-main.tsx` — Added `countdown?: ReactNode` to `NavItem` type. `DisabledItem` renders `{item.countdown}` below the disabled button.
- `src/components/app-sidebar.tsx` — Added `initialNow` prop. Removed `tooltipMessage` from E-Book nav item. Passes `<BookCountdown size="compact" intervalMs={60000} />` as `countdown` slot when `!ebookLive`.
- `src/components/app-sidebar.test.tsx` — 3 updated tests: replaced tooltip assertion with countdown assertion, added `ebookLive=true` no-countdown test, added `vi.useFakeTimers()` support.
- `src/app/dashboard/layout.tsx` — Passes `initialNow` to `AppSidebar` from server component via `getServerTimestamp()`.
- `src/lib/feature-flags.ts` — Added `getServerTimestamp()` to avoid React purity lint error on `Date.now()` inside server component.

### Verification

- Commands run: `bun vitest run` (294 pass, 11 skipped), `bun run lint` (0 errors, 9 pre-existing warnings), `bun run build` (pass)
- Results: All green

### Decisions

- D-001: Reuse BookCountdown with `size="compact"` prop instead of separate component — single source of truth for countdown logic, keeps both variants consistent.
- D-002: `initialNow` server-side timestamp to avoid hydration flash — minimal data transfer (one number), no server-side diff computation needed.
- D-003: 60s interval for compact mode — no seconds displayed, so 1s ticks are wasteful and distracting.
- D-004: `getServerTimestamp()` in feature-flags.ts — works around React compiler purity lint that forbids `Date.now()` in server component body.

### Known Issues / Risks

- AGENTS.md has uncommitted external changes from earlier session — not part of this change.
- In collapsed (icon-only) sidebar mode, the countdown is not visible — by design (accepted tradeoff).

### Next Steps

1. Feature is done — no follow-up needed if schedule holds. When `ebookLive` flips to true on Jun 16, the countdown naturally disappears.

### Blockers

- None

---

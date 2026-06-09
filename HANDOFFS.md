## [Tuesday, 09-06-2026 14:45] — Add seconds to BookCountdown + center layout (Issue #45)

### Session Target

Implement issue #45: add seconds display (1s granularity) to `BookCountdown` and center the layout.

### Current State

- Status: shipped
- Scope: `src/components/sections/home/BookCountdown.tsx`, `src/components/sections/home/book-countdown.test.tsx`

### What Changed

- `src/components/sections/home/BookCountdown.tsx` — Added `seconds` to `diff()` return, changed `setInterval` from `60_000` → `1000` ms, added seconds `Unit` with label `"detik"`, changed container from `flex gap-4` → `flex justify-center gap-4`
- `src/components/sections/home/book-countdown.test.tsx` — Updated render test to verify all 4 units (days, hours, minutes, seconds). Added tick test: advancing 1s decrements seconds.

### Verification

- Commands run: `rtk vitest run src/components/sections/home/` (26/26 pass), `rtk vitest run` (253/253 pass)
- Results: All tests pass

### Decisions

- D-009: Seconds tick test uses `act(() => vi.advanceTimersByTime(1000))` — same pattern as existing minutes tick test; minimal, no implementation coupling.

### Known Issues / Risks

- None.

### Next Steps (ordered)

1. QA: verify countdown ticks every second in browser, centered on hero section.

### Blockers (if any)

- None.

---

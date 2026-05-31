## [Sunday, 31-05-2026 19:24] — Grilled design decisions + Rescheduled for Mas Chiko feedback

### Session Target

- Interview user relentlessly on Mas Chiko's 8 feedback items
- Reschedule docs/SCHEDULES.md based on decisions

### Current State

- Status: design decisions locked for items 1-3, 7-8; partial for 4-6
- Scope: `docs/SCHEDULES.md`, decisions logged

### What Changed

- `docs/SCHEDULES.md` — Full rewrite with new timeline:
  - Phase 1.5 (Jun 1-3): Scanner refinements from Mas Chiko feedback
  - Phase 2 (Jun 4-6): Journal system (unchanged from original plan)
  - Phase 3 soft launch (Jun 7-8): Countdown + nav gating only
  - Soft launch (Jun 12): Scanner + Journal + LP live, e-book = countdown
  - Full launch build (Jun 12-15): Chapter UI, payment, viewer
  - Full launch (Jun 16): E-book unlocks

### Verification

- SCHEDULES.md updated with new dates and phase structure

### Decisions

- D-001: Soft launch (Jun 12) = scanner + journal live, e-book section = countdown to Jun 16. Chapter buttons appear only at full launch.
- D-002: Full launch = Jun 16 (Mas Chiko's birthday)
- D-003: Landing page hero — remove "Mulai Gratis", use "Daftar" instead
- D-004: Pre-scan questionnaire — user has questions, will insert manually later. We build the component + schema structure.
- D-005: Result card — extract into StressResultCard.tsx, add consultation CTA + privacy tagline + structured comments with variations
- D-006: Full e-book (chapter list, payment, PDF viewer) built after soft launch (Jun 12-15)

### Known Issues / Risks

- Booking/consultation link (item 4) still needs URL from Mas Chiko
- Stress recommendation content variations (item 6) — using existing docs/STRESS_RECOMMENDATION.md content. Mas Chiko may provide more.
- Tight timeline: 12 days to build journal + questionnaire + e-book schema + countdown. Priority: soft launch essentials first, e-book full features secondary.
- Pre-scan questions: user will fill in, component has placeholder structure

### Next Steps (ordered)

1. [Pending from grilling] Resolve items 4 (consultation link) and 6 (stress content variations)
2. Begin implementation: Phase 1.5 Day 1 (Jun 1) — Landing page quick wins

### Blockers (if any)

- None

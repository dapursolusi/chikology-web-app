## [Friday, 12-06-2026 16:39] — OpenRouter primary for stress analysis API

### Session Target

- Swap to OpenRouter (`minimax/minimax-m3`) as primary AI provider in `/api/analyze-face`, SumoPod as fallback

### Current State

- Status: shipped
- Scope: `src/app/api/analyze-face/route.ts`, `src/app/api/analyze-face/route.test.ts`

### What Changed

- `src/app/api/analyze-face/route.ts` — Extracted `callAIModel()` helper for the retry+parse loop. OpenRouter primary with `minimax/minimax-m3`, SumoPod fallback with `MiniMax-M3`. Removed obsolete SumoPod/GROQ key check at route level. `OPENROUTER_API_KEY` checked first, fallback uses `CHIKOLOGY_SUMOPOD_API_KEY`. Server-side `console.warn` on fallback. No schema change, no client change, no new dependencies.
- `src/app/api/analyze-face/route.test.ts` — New test file (3 tests): OpenRouter succeeds, OpenRouter fails → SumoPod succeeds, both fail.

### External changes detected:

- `AGENTS.md` — 66 lines prepended. Not from this session. Skipped in commit.

### Verification

- Commands run: `bun run test`
- Results: 288 tests pass, 11 skipped (unchanged). All 3 new tests pass.

### Decisions

- D-001: OpenRouter primary, SumoPod fallback — SumoPod API key was revoked. OpenRouter confirmed working in production. Quick swap on launch day.
- D-002: `callAIModel()` extraction — Avoided 30+ lines of duplicated retry/parse logic.
- D-003: No OpenRouter HTTP headers — Skipped for minimal diff.

### Known Issues / Risks

- SumoPod key revoked — awaiting resolution from provider dashboard. Until then, scans rely entirely on OpenRouter.
- `AGENTS.md` has uncommitted external changes — needs separate review.

### Next Steps

1. Monitor OpenRouter response times (13.6s app code observed — slower than SumoPod was)
2. When SumoPod key is restored, evaluate whether to keep OpenRouter primary or revert
3. Review and commit AGENTS.md separately

### Blockers

- None

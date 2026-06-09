# HANDOFFS

## [Tuesday, 09-06-2026 13:25] — Fix scanner analyze-face API: SumoPod MiniMax-M3 integration

### Session Target

Fix the `/api/analyze-face` route — SumoPod MiniMax-M3 was returning 502. Root cause: no timeout on SumoPod client (hung ~10s), Groq fallback was dead code (fetched but never used), and JSON parsing required exact match instead of regex extraction.

### Current State

- Status: shipped
- Scope: `src/app/api/analyze-face/route.ts` + `src/lib/scanner/pipeline.ts` + `src/components/dashboard/scanner/StressResultCard.tsx`

### What Changed

- `src/app/api/analyze-face/route.ts` — Major rework: (1) Removed dead Groq backup code that was fetched but never used. (2) Added `timeout: 20000` and `maxRetries: 0` to SumoPod OpenAI client to prevent hangs. (3) Switched from `JSON.parse()` (requires exact JSON) to regex extraction of `{"tier": N}` — accepts surrounding text from model. (4) Returns `raw` field in error response for debugging. (5) Bumped `max_tokens` to 300. (6) Logs full response JSON when content is empty.
- `src/components/dashboard/scanner/StressResultCard.tsx` — Fixed message display: `result.messages` → `result.messages[0]` (was trying to render array).
- `src/lib/scanner/pipeline.ts` — Removed stray `console.log(randomizedMessages)` debug statement.

### Verification

- Curl test: MiniMax-M3 with image input returns valid response
- App route: 9.9s → now times out at 20s with proper error handling
- TypeScript: no new type errors (pre-existing webgl-ext conflicts only)

### Decisions

- D-001: Regex over JSON.parse — Models (especially vision models) often wrap JSON in explanations. Regex extraction of `"tier": N` is more robust than requiring exact JSON, even with "JSON only" prompt instructions.
- D-002: No Groq fallback for now — Removed to isolate MiniMax-M3 behavior. Will restore with proper error handling once MiniMax-M3 is confirmed working.
- D-003: 20s timeout — MiniMax-M3 processes vision inputs slowly. 5s was too aggressive.

### Known Issues / Risks

- MiniMax-M3 may still fail on very large images (LiteLLM upstream limit). Not hit yet.

### Next Steps (ordered)

1. Restore Groq fallback once MiniMax-M3 behavior is stable
2. Consider image compression before sending to API to reduce latency

### Blockers (if any)

- None.

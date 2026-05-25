## [Monday, 25-05-2026 15:30] — Swapped stress detection engine from Gemini to Groq

### Session Target

- Replace Gemini 2.0 Flash with Groq (Llama 3.2 Vision 11B) in the `/api/analyze-face` route to fix 429 rate-limit errors and improve flat-face detection

### Current State

- Status: shipped
- Scope: `src/app/api/analyze-face/route.ts`, `package.json`, `bun.lock`

### What Changed

- `src/app/api/analyze-face/route.ts` — Rewrote from raw Gemini fetch to Groq SDK with `llama-3.2-11b-vision-preview`. Prompt redesigned for micro-expression / muscle tension cues on flat/neutral faces. Same contract (`{ tier }`) — zero UI changes.
- `package.json` — Added `groq-sdk@1.2.0`
- `bun.lock` — Updated lockfile

### Verification

- Commands run: `bun run build` (pass), `bun run lint` (0 errors, pre-existing warnings only)
- Manual testing needed: open `/dashboard/scanner` and verify analysis returns a tier

### Decisions

- D-011: Groq over Gemini — Groq free tier (~30 RPM) eliminates 429 errors and is faster. If accuracy on flat faces is insufficient, next step is self-hosted DeepFace/MediaPipe Python backend.

### Known Issues / Risks

- Groq Llama 3.2 Vision may still struggle with very subtle micro-expressions — flag after manual testing
- If Groq free tier limits become an issue (30 RPM, 1k req/day), will need paid tier or self-hosted ML

### Next Steps (ordered)

1. Manual testing: capture screenshots of flat-faced expressions, verify tier mapping
2. If accuracy insufficient → build Python microservice (FastAPI + DeepFace) and deploy alongside Next.js

### Blockers (if any)

- None

---

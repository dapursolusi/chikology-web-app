## Runtime

Use `bun` for everything — install, run scripts, execute packages.
Always use `bunx --bun` instead of `bunx` or `npx`.
Fallback to `npm`/`npx` only if `bun` fails multiple times.
Lockfile: `bun.lock` (never `package-lock.json` or `yarn.lock`).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Agent skills

### Issue tracker

Issues live on GitHub (`dapursolusi/chikology-web-app`). See `docs/agents/issue-tracker.md`.

### Triage labels

Uses default label names. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo. See `docs/agents/domain.md`.

### Schedule tracking

Update `docs/SCHEDULES.md` after every session — mark tasks done/blocked/skipped, adjust dates if schedule drifts, and update tech stack decisions if they change. The schedule is the source of truth for what's shipped vs pending.

## Data Mutation

Prefer Next.js Server Actions (`'use server'` in `src/actions/`) over API routes (`src/app/api/`) for all data mutations. Server Actions are simpler (no route boilerplate), safer (auth check inside the function), and support `revalidatePath()` natively. Reserve API routes for third-party proxies (e.g., `analyze-face` → Groq) where a server-side API key must be hidden from the client.

## UI / UX

### Components

All components must use shadcn, try to find it first, or modify what available instead of installing any new dependendcies

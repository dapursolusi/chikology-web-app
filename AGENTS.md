## Specific Rules:

Only read and follow these rule files exactly if touching/writing on specific domain:

- [TypeScript](./docs/rules/RULES_TYPESCRIPT.md)
- [React](./docs/rules/RULES_REACT.md)
- [Next.js](./docs/rules/RULES_NEXTJS.md)
- [Git & Branching](./docs/rules/RULES_GIT.md)

## Universal Guardrails (Always Active)

- No new files/folders unless explicitly asked.
- No renaming core types or restructuring modules.
- No new npm packages without asking.
- Prefer the smallest change that satisfies the requirement.
- Output format: plan (5 lines max) → files affected → code → self-review checklist.

## Reference Component Anchor

Canonical reference for all new components:
→ /components/[YourBestComponent]/index.tsx
Copy its prop typing, layout patterns, and Tailwind usage for consistency.

## Runtime

Use `bun` for everything — install, run scripts, execute packages.
Always use `bunx --bun` instead of `bunx` or `npx`.
Fallback to `npm`/`npx` only if `bun` fails multiple times.
Lockfile: `bun.lock` (never `package-lock.json` or `yarn.lock`).

## Versioning Strategy

| Tag      | Date          | Meaning                                        |
| -------- | ------------- | ---------------------------------------------- |
| `v0.1.0` | June 12, 2026 | Soft launch — scanner + journal, e-book gated  |
| `v0.1.x` | June 12–15    | Cosmetic fixes only, batched 1-2x per week     |
| `v1.0.0` | June 16, 2026 | Full launch — e-book live, all features active |
| `v1.0.x` | Post-June 16  | Bug fixes                                      |
| `v1.x.0` | Post-June 16  | New features (profile, analytics, etc.)        |
| `v2.0.0` | TBD           | Major redesign or mobile app exists            |

Mobile app: separate repo (`chikology-mobile-app`), starts at its own `v0.1.0`. Independent versioning.

## Tech Stack (Locked)

| Layer           | Choice                                |
| --------------- | ------------------------------------- |
| Framework       | Next.js (App Router)                  |
| UI              | Tailwind CSS v4 + shadcn/ui           |
| Database        | Supabase (Postgres)                   |
| ORM             | Drizzle ORM + postgres driver         |
| Auth            | Supabase Auth (Google OAuth only)     |
| Face Detection  | Groq (Llama 4 Scout) server-side      |
| Storage         | Supabase Storage (book PDFs, Phase 3) |
| PDF Rendering   | PDF.js v6.0.227 (self-hosted viewer)  |
| PDF Watermark   | pdf-lib v1.17.1 (server-side only)    |
| Deploy          | Vercel                                |
| Payment         | Mock (real gateway deferred)          |
| Book Pricing    | Waiting on Mas Chiko                  |
| Email Marketing | Deferred until 500+ users             |
| Package Manager | bun — `bunx --bun`, not npx           |

## Canonical File Structure

```
src/
├── app/                         # Next.js app router pages
│   ├── (main)/                  # Public pages (landing page)
│   ├── api/analyze-face/       # Groq proxy (server-side API key)
│   ├── dashboard/               # Auth-protected pages (sidebar layout)
│   │   ├── layout.tsx          # Dashboard auth shell + sidebar
│   │   └── scanner/page.tsx    # Scanner page (uses ScannerFlow)
│   └── auth/                    # Supabase auth callbacks
├── actions/                     # Next.js Server Actions
│   ├── journal.ts
│   └── questionnaire.ts
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── layout/                 # Header, Footer
│   ├── dashboard/
│   │   └── scanner/            # Scanner domain components
│   │       ├── PreScanQuestionnaire.tsx
│   │       ├── ScannerFlow.tsx
│   │       └── StressResultCard.tsx
│   ├── sections/home/           # Landing page sections (Hero, EBook, Features)
│   ├── FaceScanner.tsx         # Camera + Groq analysis (root scanner)
│   └── ...
├── db/
│   ├── index.ts                # Drizzle client instance
│   └── schema.ts               # All table definitions
├── lib/
│   ├── stressAnalyzer.ts        # Stress level data (messages, interventions)
│   └── utils.ts
└── test/                       # Vitest + RTL test setup
    └── setup.ts + __mocks__/
```

Key rules:

- Feature-specific components live under `src/components/<domain>/`
- Server Actions in `src/actions/`
- Schema at `src/db/schema.ts` (NOT `src/lib/db/`)
- API routes for third-party proxies only (`/api/`)

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

Update `docs/SCHEDULES.md` after every session — mark tasks done/blocked/skipped and adjust dates if schedule drifts. The schedule is the source of truth for what's shipped vs pending.

## Data Mutation

Prefer Next.js Server Actions (`'use server'` in `src/actions/`) over API routes (`src/app/api/`) for all data mutations. Server Actions are simpler (no route boilerplate), safer (auth check inside the function), and support `revalidatePath()` natively. Reserve API routes for third-party proxies (e.g., `analyze-face` → Groq) where a server-side API key must be hidden from the client.

## UI / UX

### Components

All components must use shadcn, try to find it first, or modify what available instead of installing any new dependencies.

### Component folder convention

Feature-specific components live under `src/components/<domain>/`. Shared/generic components (layout, ui) stay in their current locations. Examples:

- `src/components/dashboard/scanner/` — scanner flow components (ScannerFlow, PreScanQuestionnaire, StressResultCard)
- `src/components/dashboard/journal/` — journal components (JournalEditor, MoodSelector, JournalHistory)

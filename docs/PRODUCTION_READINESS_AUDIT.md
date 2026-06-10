# Chikology.id — 14-Layer Production Readiness Audit

**Audit Date:** Wednesday, 10 June 2026
**Auditor:** Code Review Agent + Manual Source Verification
**Soft Launch:** Friday, 12 June 2026 (T−2 days)
**Full Launch:** Monday, 16 June 2026 (T−6 days)
**Overall Risk Rating:** 🟡 **MEDIUM**

---

## Executive Summary

Core user flows (scanner → journal, chapter purchase → view → download, auth) work end-to-end. 276 tests pass, CI is green, RLS policies are proper, and the architecture is clean. However, the app ships without critical operational infrastructure: **no rate limiting on the AI endpoint (financial risk), no error monitoring (operational blindness), no health check (outage invisibility), no security headers (XSS vector via Tiptap), and no loading/error states on pages (poor UX).**

You can launch on June 12 — but fix the 🔴 items first. A ~2-hour sprint covers 4 of 5 critical gaps.

---

## Layer 1 — Frontend (UI/UX, State, Forms, Accessibility, Bundle)

**Status:** 🟡 **Needs Work**

### What's Working

- **Mobile-first design** with 56px touch targets (`globals.css:312-317`), `--sidebar-width: 20rem` on mobile (`globals.css:326-328`)
- **Full Indonesian copy** throughout — Hero, ScannerFlow, E-Book sections, error messages
- **Zod validation** on admin chapter forms (`src/schemas/chapter.ts`) with `react-hook-form`
- **Clean domain-based component structure** at `src/components/dashboard/scanner/`, `journal/`, `book/`, `admin/`
- **Tiptap rich text editor** with bold/italic/list toolbar (`src/components/dashboard/journal/JournalEditor.tsx`)
- **Optimistic UI updates** in JournalHistory after save (`src/components/dashboard/journal/JournalHistory.tsx`)
- **Accessible** MoodSelector with `aria-label` on emoji buttons (`src/components/dashboard/journal/MoodSelector.tsx`)
- **Sonner toasts** for success/error feedback (`src/app/layout.tsx:37`)
- **Sheet-responsive sidebar** with `<SidebarProvider>` (`src/components/app-sidebar.tsx`)

### What's Missing / Needs Fix

| Severity | Issue                                                           | Location                                        | Recommendation                                                                                                                                 |
| -------- | --------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔴       | `lang="en"` instead of `lang="id"`                              | `src/app/layout.tsx:25`                         | Change to `lang="id"` — Indonesian users get wrong screen-reader pronunciation                                                                 |
| 🔴       | **No `error.tsx` anywhere**                                     | `src/app/`                                      | Add `src/app/error.tsx` (catch-all) + `src/app/global-error.tsx` (catastrophic). Default Next.js crash screen for soft launch is unacceptable. |
| 🔴       | **No `loading.tsx` anywhere**                                   | `src/app/`                                      | Add `src/app/loading.tsx` with skeleton. Server components suspend rendering; without a loading file, users see frozen UI.                     |
| 🟡       | **No `metadata` export on root layout**                         | `src/app/layout.tsx`                            | No title template, description, or Open Graph tags. WhatsApp/LINE link sharing shows blank preview.                                            |
| 🟡       | **Dark mode CSS is dead code**                                  | `globals.css:119-152` + `theme-provider.tsx:15` | `forcedTheme="light"` makes the entire `.dark {}` block (33 declarations) ship unused. ~1.5KB wasted CSS.                                      |
| 🟡       | `waitUntil` racing pattern for getEbookLive in redirect         | `src/lib/supabase/middleware.ts:82`             | Currently `await getEbookLive()` blocks every request on pre-ebook-launch users. Cached in-memory with 60s TTL could help.                     |
| 💭       | Footer links (`/fitur`, `/harga`, `/tentang-kami`) point to `#` | `src/components/layout/footer.tsx:10-23`        | No-op links. Acceptable for soft launch, add pages for full launch.                                                                            |
| 💭       | Hero "What's new → Read more" links to `#`                      | `src/components/sections/home/hero.tsx:38`      | Same as above.                                                                                                                                 |

### Bundle Analysis

- Dependencies include full shadcn/ui component set (~25 primitives) + Tiptap + lucide icons
- No obvious bundle bloat; tree-shaking handled by Next.js
- React Compiler enabled (`next.config.ts:5`) for automatic memoization

---

## Layer 2 — API & Backend Logic

**Status:** 🟡 **Needs Work**

### What's Working

- **Server Actions for all mutations** (`src/actions/`) — correct Next.js App Router pattern
- **API routes isolated** to third-party proxies (`/api/analyze-face`) and PDF serving (`/api/chapters/[id]/view`, `/api/chapters/[id]/download`) — correct separation
- **Zod validation on admin chapter input** (`src/schemas/chapter.ts`)
- **Payment proof validation**: file type (JPEG/PNG/WebP only), max 5MB (`src/actions/payment.ts:17-18,74-80`)
- **Sequential chapter gating**: `computeChapterState()` at `src/lib/chapters.ts:136-162` ensures users must own chapter N−1 before accessing chapter N
- **Watermarked PDF downloads** with masked email, timestamp WIB, and audit log (`src/app/api/chapters/[id]/download/route.ts:82-113`)
- **HTTP range request support** for PDF.js viewer (`src/app/api/chapters/[id]/view/route.ts:59-73`)
- **Access audit logs**: `chapter_access_logs` records view, download, and denied events
- **Consistent error return shape**: `{ error: string }` or `{ success: true }` on all server actions
- **Soft delete on journal entries** (`src/actions/journal.ts:104-113`)

### What's Missing / Needs Fix

| Severity | Issue                                                                          | Location                                              | Recommendation                                                                                                                                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------ | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔴       | **No input size validation on `/api/analyze-face`**                            | `src/app/api/analyze-face/route.ts:24-26`             | Base64 image accepted unbounded. A large image can crash the Vercel function (10s timeout on Hobby, 60s on Pro). Add `if (image.length > 5_000_000) return 413`.                                                                                                                                      |
| 🔴       | **No idempotency on `purchaseChapter()`**                                      | `src/actions/chapters.ts:87-90`                       | The `UNIQUE(user_id, chapter_id)` constraint prevents duplicates, but the error is unhandled. Two concurrent clicks: both pass the `ownedChapterIds.has()` check at line 72, one fails with raw DB error. Wrap insert in try/catch for `code === '23505'` and return graceful `'Bab sudah dimiliki'`. |
| 🟡       | **`claimFreeChapter()` returns `"Not implemented"`**                           | `src/actions/chapters.ts:104-121`                     | `canUserReadChapter()` can return `reason: 'free-claimable'`, but claiming a free chapter doesn't actually create a purchase record. Free chapter progression is broken.                                                                                                                              |
| 🟡       | **`deleteJournalEntry()` returns `{ success: true }` even if no rows matched** | `src/actions/journal.ts:94-119`                       | If the journal entry ID is invalid or belongs to another user, the soft-delete silently updates zero rows but returns success. Check `rowCount` or use `.returning()` to verify.                                                                                                                      |
| 💭       | `console.warn('Analysis tier:', result.tier)` in client component              | `src/components/dashboard/scanner/FaceScanner.tsx:48` | Leaks user stress data to browser console. Remove in production.                                                                                                                                                                                                                                      |
| 💭       | `maskEmail()` displays last 4 chars unmasked                                   | `src/app/api/chapters/[id]/download/route.ts:11-16`   | Truncated email like `****doe@gmail.com` — sufficient for identification, but IP + timestamp combination means it's essentially identifiable. Consider removing the last-4 reveal.                                                                                                                    |

### Error Handling Patterns

API routes use try/catch with `console.error` + `NextResponse.json({ error: '...' }, { status: N })`:

```ts
// src/app/api/analyze-face/route.ts:102-107
} catch (error) {
  console.error('API Error:', error);
  return NextResponse.json(
    { error: 'Failed to process request' },
    { status: 500 }
  );
}
```

Server actions return structured error objects:

```ts
// src/actions/chapters.ts:72-73
if (ownedChapterIds.has(chapterId)) {
  return { error: 'Bab sudah dimiliki' };
}
```

The Groq/SumoPod call has two fallback paths: primary (SumoPod) → fallback console.error log → return 502. The SumoPod call itself has `maxRetries: 0` — a single transient failure returns 502 immediately with no retry logic.

---

## Layer 3 — Database & Storage

**Status:** 🟢 **Ready** (minor notes)

### What's Working

- **Clean Drizzle schema** with 7 tables at `src/db/schema.ts`:
  - `users` — soft-delete (`deletedAt`), role-based (`role TEXT DEFAULT 'user'`)
  - `book_chapters` — sequential numbering, `release_date` nullable for hide/unreleased
  - `chapter_purchases` — `UNIQUE(user_id, chapter_id)` prevents duplicates
  - `payment_proofs` — status enum (`pending | approved | rejected`), rejection reason
  - `journal_entries` — soft-delete, mood enum
  - `questionnaire_responses` — JSONB for flexible pre-scan answers
  - `app_settings` — feature flags (e.g., `ebook_live`)
  - `chapter_access_logs` — audit trail with JSONB metadata
- **Proper foreign key relationships** with `relations()` declarations
- **Supabase RLS on all tables** — `book_chapter_rls_and_bucket.sql` covers:
  - `book_chapters`: public SELECT, admin-only write
  - `chapter_purchases`: user reads/inserts own rows only, immutable (no UPDATE/DELETE policy)
  - `app_settings`: public SELECT, admin-only write
  - `users`: user reads own row, admin updates all
  - `storage.objects` (book-chapters bucket): authenticated admin-only INSERT/UPDATE/DELETE, no public SELECT
- **pg_cron one-shot job** (`drizzle/0003_ebook_live_cron.sql`) — scheduled Jun 15 17:00 UTC (Jun 16 00:00 WIB), idempotent, self-unschedules after execution
- **Storage buckets are private**: `book-chapters` and `payment-proofs`
- **Signed URL access only**: 4-hour expiry for chapters (`src/actions/chapters.ts:163 + createSignedUrl(pdfPath, 14400)`), 24-hour for payment proofs (`src/actions/payment.ts:135`)

### What's Missing / Needs Verifying

| Severity | Issue                                                                            | Recommendation                                                                                                                       |
| -------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 🟡       | **pg_cron job not verified** — cannot confirm it's scheduled on Supabase project | Run `SELECT * FROM cron.job WHERE jobname = 'flip-ebook-live-2026-06-16'` in Supabase SQL editor                                     |
| 🟡       | **No backup restore drill** ever performed                                       | Supabase Pro provides 7-day PITR + daily backups, but restore procedure is untested                                                  |
| 🟡       | **No integration tests against real DB**                                         | Tests mock Supabase entirely (`vitest.config.ts` has no DB URL). If RLS is misconfigured, tests won't catch it.                      |
| 💭       | `NEXT_PUBLIC_SUPABASE_URL` includes `/rest/v1/` path — unusual for @supabase/ssr | `src/lib/supabase/base-url.ts` — verify this works correctly with Supabase SSR auth (typically expects base URL without `/rest/v1/`) |

### Connection

```ts
// src/db/index.ts — postgres-js direct connection (pooled)
const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

Uses Supabase pooler on port 6543 (configured in `.env.local` `DATABASE_URL`). No application-level pool config — `postgres-js` manages its own connection lifecycle.

### Migrations

All migrations in `drizzle/` directory, versioned via `_journal.json`. Last migration: `0004_concerned_speed.sql`. The `book_chapter_rls_and_bucket.sql` file is NOT managed by Drizzle Kit (per design decision D-023) — must be applied manually via Supabase SQL editor.

---

## Layer 4 — Auth & Permissions

**Status:** 🟢 **Ready**

### What's Working

- **Supabase SSR auth** with cookie-based session management (`@supabase/ssr`)
- **Session refresh in proxy** (`src/proxy.ts`) — every request (except static assets + `/api/analyze-face`) refreshes the Supabase session via `updateSession()` (`src/lib/supabase/middleware.ts`)
- **Route protection at proxy level**: `/dashboard/*` → redirect to `/?auth=login` if no user (`middleware.ts:62-67`)
- **Route protection at layout level**: Dashboard layout checks `getUser()` and calls `redirect('/?auth=login')` as second safety layer (`src/app/dashboard/layout.tsx:23-25`)
- **Landing redirect logic**: authenticated users redirected to `/dashboard` when `ebookLive === false` (pre-full-launch). Supports `?bypass-redirect=true` query param or cookie for smoke testing (`middleware.ts:69-89`)
- **Role-based access control**: `getUserRole()` → admin vs user. Checked in server actions (`getAdminRole()` at `src/actions/book.ts:10`), admin pages, sidebar navigation
- **Auth callback sync**: OAuth callback at `src/app/auth/callback/route.ts:31-44`:
  - Calls `ensureUserRecord()` to upsert user into `public.users`
  - Syncs DB role back to `user_metadata` for client-side admin nav detection
- **Google OAuth + email/password** authentication
- **Sign out** via `supabase.auth.signOut()` in `NavUser` dropdown (`src/components/nav-user.tsx`)

### What's Missing

| Severity | Issue                                                                                           | Location                         |
| -------- | ----------------------------------------------------------------------------------------------- | -------------------------------- |
| 💭       | No MFA (acceptable — Google handles MFA on its side)                                            | —                                |
| 💭       | `NEXT_PUBLIC_SUPABASE_ANON_KEY!` non-null assertion — app crashes at startup if env var missing | `src/lib/supabase/server.ts:12`  |
| 💭       | No session revocation UI (log out only)                                                         | —                                |
| 💭       | No rate limiting on auth callback from brute force                                              | `src/app/auth/callback/route.ts` |

---

## Layer 5 — Hosting & Deployment

**Status:** 🟡 **Needs Work**

### What's Working

- **Vercel hosting** with automatic Git integration
- **Production build passes** in CI (`bun run build`)
- **Next.js 16.2.6** with React Compiler enabled
- **Environment split**: `.env` (AI model config) + `.env.local` (infrastructure keys)

### What's Missing / Needs Fix

| Severity | Issue                                                                            | Recommendation                                                                                                                            |
| -------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 🟡       | **No `.env.example` file**                                                       | Environment variables must be reverse-engineered from source code. Create `.env.example` documenting all required vars (values redacted). |
| 🟡       | **No rollback procedure documented**                                             | Vercel has instant rollback via CLI (`vercel rollback`) or dashboard, but no runbook. Document in `docs/deploy.md`.                       |
| 🟡       | **No preview deployments for PRs**                                               | Vercel supports `vercel deploy --preview` but not configured in CI. Not blocking for soft launch.                                         |
| 💭       | `NEXT_PUBLIC_SUPABASE_ANON_KEY!` and `DATABASE_URL!` crash at startup if missing | Add runtime env-var validation with clear error messages.                                                                                 |

### Required Environment Variables

Derived from source code analysis:

| Variable                        | Where Used                                                | Purpose                                         |
| ------------------------------- | --------------------------------------------------------- | ----------------------------------------------- |
| `DATABASE_URL`                  | `src/db/index.ts`                                         | Postgres connection (Supabase pooler on 6543)   |
| `NEXT_PUBLIC_SUPABASE_URL`      | `src/lib/supabase/base-url.ts`                            | Supabase project URL (~/.rest/v1/ suffix noted) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `src/lib/supabase/client.ts`, `server.ts`                 | Public anon JWT for browser client              |
| `SUPABASE_SERVICE_ROLE_KEY`     | `src/lib/supabase/server.ts` (as `createServiceClient()`) | Server-only for signed URLs, storage bypass RLS |
| `GROQ_API_KEY`                  | `src/app/api/analyze-face/route.ts`                       | Fallback AI provider (also used in CI build)    |
| `CHIKOLOGY_SUMOPOD_API_KEY`     | `src/app/api/analyze-face/route.ts`                       | Primary AI provider (SumoPod/MiniMax-M3)        |
| `OPENAI_BASE_URL`               | `src/app/api/analyze-face/route.ts`                       | SumoPod proxy endpoint                          |
| `OPENAI_API_KEY`                | Inferred (not directly referenced in code)                | For OpenAI-compatible client                    |

### Vercel Configuration Notes

- No custom domains documented — assumes `chikology.vercel.app` or user-provided domain
- No `headers()` config in `next.config.ts` — relies on Vercel default headers
- No ISR/`revalidate` config — pages are fully dynamic
- `bodySizeLimit: '50mb'` set for admin PDF uploads

---

## Layer 6 — Cloud & Compute

**Status:** 🟢 **Ready**

### What's Working

- **Vercel serverless functions** auto-scale horizontally — no container management
- **Supabase pooled connection** (port 6543) prevents connection exhaustion from Vercel's serverless architecture
- **`bodySizeLimit: '50mb'`** for admin chapter PDF uploads (`next.config.ts:7-9`)
- **AI API timeout**: Groq/SumoPod call has `timeout: 20000` and `maxRetries: 0` (`src/app/api/analyze-face/route.ts:47-48`)
- **Edge function for session refresh**: proxy runs at edge (fast, minimal cold start)

### Cost Considerations

| Resource            | Cost Driver                     | Risk                                                  |
| ------------------- | ------------------------------- | ----------------------------------------------------- |
| Groq/SumoPod AI API | Per-image analysis              | 🔴 No rate limiting — unbounded cost                  |
| Vercel Pro          | Function invocations, bandwidth | Low for soft launch (free tier may suffice initially) |
| Supabase Pro        | DB size, storage bandwidth, MAU | Low — schema is < 10 tables, storage is < 100MB       |

---

## Layer 7 — CI/CD & Version Control

**Status:** 🟢 **Ready**

### CI Pipeline (`.github/workflows/ci.yaml`)

```yaml
Triggers: PR → main, push → main & development
Steps:
  1. actions/checkout@v4
  2. oven-sh/setup-bun@v2 (latest)
  3. bun install
  4. bunx --bun prettier --check .    # Format check
  5. bun lint                          # ESLint
  6. bunx --bun tsc --noEmit          # TypeScript check
  7. bun run test --run --passWithNoTests  # Vitest (~276 tests)
  8. bun run build                      # Production build (GROQ_API_KEY secret)
```

### What's Working

- **Multi-stage quality gate**: formatting → linting → types → tests → build
- **Husky + lint-staged**: pre-commit formatting + linting, commitlint for conventional commits
- **276 tests passing** (last verification), 0 TypeScript errors, 0 lint errors
- **Vitest + React Testing Library** for component and action tests
- **Action tests** cover: book, chapters, journal, payment, settings
- **Integration tests** cover: book-purchase-flow, ebook-live-cron-rls
- **Component tests** cover: scanner, journal, book, admin, landing page sections, layout

### What's Missing

| Severity | Issue                                                                                             | Recommendation                                                                  |
| -------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 🟡       | **No deploy step in CI** — Vercel Git integration handles deployment, but it's opaque to CI       | Add `vercel deploy` step or at minimum a status check                           |
| 🟡       | **Build requires `GROQ_API_KEY`** but no `DATABASE_URL`                                           | Works because Next.js doesn't make DB calls at build time, but this is implicit |
| 💭       | **No branch protection rules** documented                                                         | Ensure GitHub branch protection on `main` requires CI passing                   |
| 💭       | **`zod` alias in vitest.config.ts**: `zod: path.resolve(__dirname, 'node_modules/zod/index.cjs')` | Indicates a CJS/ESM compatibility issue with Zod v4                             |

### Test Coverage Notes

- Actions tests mock Supabase — they validate business logic, not DB integration
- No E2E tests (Playwright/Cypress) — all tests are Vitest + RTL at component/action level
- Test setup at `src/test/setup.ts` provides jsdom, matchMedia mock, elementFromPoint mock

---

## Layer 8 — Security & RLS

**Status:** 🟡 **Needs Work**

### What's Working

- **Row-Level Security on all tables** (see Layer 3 for details)
- **Private storage buckets**: `book-chapters` and `payment-proofs` — no public SELECT
- **Signed URL access only** for PDFs and proof images
- **Service role key never exposed to client**: `createServiceClient()` is server-only (`src/lib/supabase/server.ts:32-47`)
- **All server actions validate auth** before mutations
- **PDF watermarking**: masked email + timestamp on every page (`src/app/api/chapters/[id]/download/route.ts:82-113`)
- **Audit logging**: all chapter view/download/denial events logged to `chapter_access_logs`
- **Zod validation on admin forms** (`src/schemas/chapter.ts`)
- **File type and size validation** on payment proof uploads (`src/actions/payment.ts:74-80`)
- **Soft deletes**: journal entries set `deletedAt` — rows are never hard-deleted
- **Server Actions have built-in CSRF protection** (Next.js hidden form token)

### What's Missing / Needs Fix

| Severity | Issue                                                               | Location                            | Recommendation                                                                                                          |
| -------- | ------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 🔴       | **No CSP headers configured**                                       | `next.config.ts`                    | Add `async headers()` with Content-Security-Policy. Tiptap editor is an XSS vector if content contains `<script>` tags. |
| 🔴       | **No security headers at all**                                      | `next.config.ts`                    | Missing: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`. Add all.                 |
| 🟡       | **No `.env.example`** — secrets must be reverse-engineered          | Root                                | Creates risk of secret misconfiguration or accidental commit                                                            |
| 🟡       | **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** in both `.env` and `.env.local` | Root                                | Not listed in `.gitignore` — risk of accidental commit. (Confirmed not git-tracked currently.)                          |
| 🟡       | **`users` table `deletedAt` has no RLS policy for soft-delete**     | `book_chapter_rls_and_bucket.sql`   | Users can read their own row, but `deletedAt` is app-level only — RLS doesn't filter deleted users                      |
| 💭       | **`console.warn` leaks stress tier to browser**                     | `FaceScanner.tsx:48`                | Remove for production                                                                                                   |
| 💭       | **OAuth error_description may contain tokens**                      | `src/app/auth/callback/route.ts:15` | Logged via `console.error(OAuth error:, error, errorDescription)` — potential token leak                                |

### Recommended Security Headers

```ts
// Add to next.config.ts
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(self), microphone=()' },
      { key: 'Content-Security-Policy', value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self' https://*.supabase.co https://api.groq.com https://*.sumopod.com",
        "font-src 'self'",
        "frame-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ') },
    ],
  }];
}
```

---

## Layer 9 — Rate Limiting & Quotas

**Status:** 🔴 **Critical Gap**

### What's Working

**Nothing.** Zero rate limiting exists anywhere in the codebase.

### Audit of All Entry Points

| Endpoint                 | Type          | Unbounded?                       | Risk                                                                       |
| ------------------------ | ------------- | -------------------------------- | -------------------------------------------------------------------------- |
| `POST /api/analyze-face` | API route     | **🔴 Yes**                       | **Financial.** AI API cost per call. A script could burn $100s in minutes. |
| `saveJournalEntry()`     | Server action | **🔴 Yes**                       | Abuse: bot-spam journal entries filling DB                                 |
| `submitPaymentProof()`   | Server action | **🔴 Yes**                       | Abuse: fill storage bucket with garbage images                             |
| `purchaseChapter()`      | Server action | **🔴 Yes**                       | Minimal risk (per-user, sequential gate)                                   |
| Auth callback            | API route     | **🔴 Yes**                       | Brute force OAuth code exchange                                            |
| Root page + dashboard    | Pages         | 🟡 Soft (Vercel edge protection) | Vercel's infrastructure provides basic DDoS protection                     |

### Risk Assessment

**Financial risk is the most urgent.** The `/api/analyze-face` endpoint:

1. Accepts base64 images from any authenticated (or potentially unauthenticated — check) user
2. Sends to SumoPod/MiniMax-M3 (paid AI API) with no usage cap
3. Has `maxRetries: 0` and `timeout: 20000` — but these are stability settings, not cost controls
4. Returns a single integer (tier 1-5)

At typical AI vision API pricing ($0.002-0.01/image), a simple script sending 1000 requests/minute could cost $2-10/min. Over an hour: $120-600.

### Minimal Fix (2 hours)

```ts
// In-memory rate limiter for /api/analyze-face
// Add to src/app/api/analyze-face/route.ts
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}
```

**Additional immediate steps:**

1. Enable **Vercel Firewall** (Pro plan) — add rate limit rule for `/api/*` to 100 req/min per IP
2. Set **Groq/SumoPod usage alerts** in their respective dashboards (email notification at $10, $50)

### Post-Launch Improvement

- `@upstash/ratelimit` with Redis for distributed rate limiting across Vercel regions
- User-based quota per tier (free: 5 scans/day, etc.)
- Graceful degradation: show "Terlalu banyak permintaan" toast instead of blocking

---

## Layer 10 — Caching & CDN

**Status:** 🟢 **Ready** (appropriate for launch)

### What's Working

- **Vercel Edge Network** automatically serves all static assets (JS, CSS, images) from global CDN
- **`Cache-Control: private, max-age=3600`** on PDF endpoints (`src/app/api/chapters/[id]/view/route.ts:90`, `src/app/api/chapters/[id]/download/route.ts:129`)
- **`revalidatePath()`** called after all server actions — dashboard, journal, book paths
- **Tailwind v4 + shadcn/ui** tree-shaken at build time
- **Next.js automatic static optimization** for pages with no dynamic data

### What's Missing

| Severity | Detail                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------- |
| 💭       | No ISR (`revalidate` config) — pages are fully dynamic. Acceptable for SaaS with per-user data. |
| 💭       | No `stale-while-revalidate` pattern — minor optimization. Not needed for launch traffic.        |

### Caching Strategy Notes

- Pages are dynamic (per-user auth state → server-side data fetch). Caching at browser level would serve stale data to wrong users. This is correct for a dashboard app.
- `getEbookLive()` queries `app_settings` on every request — low overhead for Postgres, but adds ~5ms to every page load. Could cache with 60s TTL in-memory.
- The face scanner result is never cached (each scan is unique).

---

## Layer 11 — Load Balancing & Scaling

**Status:** 🟢 **Ready**

### What's Working

- **Vercel serverless auto-scaling**: each request runs in its own function instance. No load balancer configuration needed.
- **Supabase pooler** (port 6543): connection pooling at database level prevents connection exhaustion from serverless functions
- **`postgres-js` driver**: single-connection-per-function pattern. Each Vercel function creates a new connection, but Supabase pooler handles multiplexing.
- **No sticky sessions**: all state lives in cookies (Supabase sessions) or database — functions are stateless
- **`bodySizeLimit: '50mb'`**: allows admin PDF uploads without hitting Vercel's default 4.5MB body limit

### What's Missing

| Severity | Detail                                                                                                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 💭       | **No application-level connection pool**. `postgres-js` manages its own lifecycle. If 100 concurrent users hit at once, 100 connections hit the pooler. This is fine for Supabase pooler (up to 200 connections on Pro). |
| 💭       | **No graceful shutdown handling** — serverless functions terminate at will. Not a concern.                                                                                                                               |

### Scaling Projections

| Metric            | Soft Launch (est.) | Scaling Strategy                                |
| ----------------- | ------------------ | ----------------------------------------------- |
| Concurrent users  | 10-50              | Single Vercel instance, Supabase pooler handles |
| Peak requests/min | 100-500            | Auto-scales sideways                            |
| DB connections    | 5-20               | Supabase pooler (200 max on Pro)                |
| Storage bandwidth | < 1GB              | Supabase Pro (50GB transfer)                    |

---

## Layer 12 — Error Tracking & Logs

**Status:** 🔴 **Critical Gap**

### What's Working

**Basic `console.error` usage** — 7 locations identified:

| File                                | Line  | Context                                                                               |
| ----------------------------------- | ----- | ------------------------------------------------------------------------------------- |
| `src/app/api/analyze-face/route.ts` | 75-78 | `console.error('MiniMax-M3 empty content, full response:', JSON.stringify(response))` |
| `src/app/api/analyze-face/route.ts` | 81    | `console.error('SumoPod call failed:', e)`                                            |
| `src/app/api/analyze-face/route.ts` | 103   | `console.error('API Error:', error)`                                                  |
| `src/app/auth/callback/route.ts`    | 15    | `console.error('OAuth error:', error, errorDescription)`                              |
| `src/app/auth/callback/route.ts`    | 50    | `console.error('Session exchange error:', exchangeError)`                             |
| `src/app/auth/callback/route.ts`    | 52    | `console.error('Callback handler error:', e)`                                         |
| `src/actions/payment.ts`            | 65    | `console.error('Failed to remove old proof file:', removeError.message)`              |

### What's Missing

| Severity | Issue                                                                                     | Impact                                                                           |
| -------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 🔴       | **No error tracking service** (no Sentry, LogRocket, Datadog)                             | If a user hits an error in production, you will never know unless they report it |
| 🔴       | **No structured logging** (no request IDs, user IDs, correlation IDs)                     | Debugging production issues requires guessing                                    |
| 🔴       | **No log aggregation** — Vercel function logs expire after 3 days (free) or 30 days (Pro) | Cannot search historical errors                                                  |
| 🔴       | **PII in logs**: OAuth `error_description` may contain tokens                             | `auth/callback/route.ts:15`                                                      |
| 🔴       | **No request tracing**: cannot correlate a user's request across auth → API → DB          | Each error is an island                                                          |

### Minimal Fix (2 hours)

1. **Install Sentry:**

   ```bash
   bun add @sentry/nextjs
   bunx --bun @sentry/wizard@latest -i nextjs
   ```

   The wizard auto-configures:
   - `sentry.client.config.ts`
   - `sentry.server.config.ts`
   - `sentry.edge.config.ts`
   - Updates `next.config.ts` with source maps

2. **Add PII scrubbing in `sentry.server.config.ts`:**

   ```ts
   beforeSend(event) {
     if (event.request?.headers?.['authorization']) {
       event.request.headers['authorization'] = '[redacted]';
     }
     return event;
   }
   ```

3. **Replace `console.error` with `Sentry.captureException()`** in critical paths:
   - `analyze-face/route.ts:81` — AI API failures
   - `auth/callback/route.ts:52` — Auth callback crashes

### Post-Launch Improvement

- Add `pino` or `winston` for structured JSON logging
- Enable Vercel Log Drains to send logs to persistent storage
- Add `@sentry/tracing` for performance monitoring

---

## Layer 13 — Availability & Recovery

**Status:** 🟡 **Needs Work**

### What's Working

- **Supabase daily backups** (all plans) and 7-day PITR (Pro plan)
- **Vercel instant rollback** for deployments (last 10 deployments retained)
- **pg_cron job is idempotent**: `PERFORM cron.unschedule('flip-ebook-live-2026-06-16')` after execution — safe to re-run
- **Drizzle migrations in version control**: all migrations in `drizzle/` directory, full rollback capability
- **Database-level constraints prevent data corruption**: `UNIQUE(user_id, chapter_id)`, proper foreign keys

### What's Missing

| Severity | Issue                                      | Recommendation                                                                                         |
| -------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| 🟡       | **No backup restore drill ever performed** | Create `docs/disaster-recovery.md` with SQL restore procedure. Run a restore to a staging environment. |
| 🟡       | **No disaster recovery runbook**           | Document exact steps for: "Supabase project deleted," "Vercel project removed," "pg_cron job failed."  |
| 🟡       | **No data export feature for users**       | Users cannot export journal data. Not legally required for soft launch but good practice.              |
| 💭       | **No RPO/RTO defined**                     | What's the acceptable data loss window? What's the acceptable downtime?                                |

### Recommended DR Runbook Outline

```
# Disaster Recovery Runbook — Chikology.id

## Scenario 1: Database deleted / corrupted
1. Go to Supabase Dashboard → Database → Backups
2. Select latest backup (PITR available within 7 days on Pro)
3. Restore to new project
4. Update DATABASE_URL in Vercel environment variables
5. Verify: run SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM journal_entries;
6. Re-apply RLS policies from drizzle/book_chapter_rls_and_bucket.sql

## Scenario 2: Vercel project removed
1. Clone repo: git clone git@github.com:dapursolusi/chikology-web-app.git
2. Install: bun install
3. Deploy: vercel deploy --prod
4. Set all env vars from .env.example
5. Verify health: GET /api/health

## Scenario 3: pg_cron job failed (ebook_live not flipped on Jun 16)
1. Run: UPDATE app_settings SET value = 'true' WHERE key = 'ebook_live';
2. Or: SELECT cron.schedule(
>     'flip-ebook-live-manual',
>     '0 0 16 6 *',
>     $$UPDATE app_settings SET value = 'true' WHERE key = 'ebook_live'$$
>   );
```

---

## Layer 14 — Observability & Monitoring

**Status:** 🔴 **Critical Gap**

### What's Working

**Nothing structured.** Zero monitoring, zero alerting, zero dashboards. The app has no way to signal its own health.

### What's Missing

| Severity | Issue                                                                | Impact                                                            |
| -------- | -------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 🔴       | **No health check endpoint**                                         | Vercel and external uptime checkers cannot verify app is running  |
| 🔴       | **No uptime monitoring** (no UptimeRobot, Better Uptime, or similar) | If app goes down at 2AM, you won't know until a user messages you |
| 🔴       | **No Vercel Analytics** — no Web Vitals data                         | No visibility into real user performance (LCP, CLS, INP)          |
| 🔴       | **No alerting** of any kind                                          | No Slack, email, or SMS alerts for errors or downtime             |
| 🔴       | **No cost monitoring** on Groq/SumoPod                               | Abuse burns money silently                                        |
| 🔴       | **No SLO/SLI defined**                                               | No target for uptime or response time                             |

### Minimal Fix (2 hours)

1. **Add health check endpoint:**

   ```ts
   // src/app/api/health/route.ts
   import { NextResponse } from 'next/server';

   export const dynamic = 'force-dynamic';
   export async function GET() {
     return NextResponse.json(
       {
         status: 'ok',
         timestamp: Date.now(),
         version: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
       },
       { status: 200 }
     );
   }
   ```

2. **Set up UptimeRobot** (free tier):
   - Create free account at uptimerobot.com
   - Add monitor: `https://chikology.id/api/health`
   - Interval: 5 minutes
   - Alert contacts: email, SMS

3. **Enable Vercel Analytics** (one click in Vercel Dashboard → Project → Analytics):
   - Tracks real user metrics (LCP, CLS, INP, TTFB)
   - Free on Hobby tier
   - Install `@vercel/analytics` for automatic instrumentation

4. **Enable Vercel Speed Insights** (same page):
   - Tracks page load timings per route
   - Identifies slow pages for Indonesian mobile users

5. **Set Groq/SumoPod usage alerts** in their respective dashboards:
   - Email notification at $10 threshold
   - Hard cap at $50 (or whatever monthly budget is)

### Post-Launch Improvement

- **Sentry alerting**: set error rate alerts (if > 10 errors in 5 minutes, notify)
- **Vercel Log Drains**: stream logs to Axiom, Datadog, or Grafana
- **SLO definition**: 99.5% uptime, < 3s p95 page load (Indonesian mobile)
- **Sentry Performance**: add `@sentry/tracing` for transaction monitoring
- **Dashboard**: Grafana or Axiom dashboard showing:
  - Active users (daily/weekly)
  - API error rate by route
  - AI API usage + cost
  - Page load times (p50, p95)
  - Auth success/failure rate

---

## Summary: Action Items

### 🔴 Top 5 Must-Fix Before Soft Launch (June 12)

| Priority | Layer  | What                                                             | Time   | Impact if Skipped                                          |
| -------- | ------ | ---------------------------------------------------------------- | ------ | ---------------------------------------------------------- |
| 1        | **9**  | Rate limit `/api/analyze-face` (in-memory limiter, 5 req/min/IP) | 30 min | **Financial.** Unbounded AI API costs from abuse           |
| 2        | **12** | Install Sentry (`@sentry/nextjs` wizard)                         | 15 min | **Blind.** Silent production failures you never know about |
| 3        | **14** | Add `/api/health` endpoint + UptimeRobot                         | 15 min | **Blind.** App goes down, you find out from users          |
| 4        | **1**  | Add `error.tsx` + `loading.tsx` + fix `lang="id"`                | 30 min | **UX.** Crash screen on errors, frozen UI, wrong language  |
| 5        | **8**  | Add CSP + security headers to `next.config.ts`                   | 15 min | **Vulnerability.** XSS via Tiptap editor, clickjack risk   |

**Total: ~1.45 hours**

### 🟡 Top 5 Fix Before Full Launch (June 16)

| Priority | Layer  | What                                                                          | Time   |
| -------- | ------ | ----------------------------------------------------------------------------- | ------ |
| 1        | **2**  | Implement `claimFreeChapter()` — free chapter progression broken              | 15 min |
| 2        | **2**  | Fix race condition on `purchaseChapter()` — catch UNIQUE violation gracefully | 15 min |
| 3        | **3**  | Verify pg_cron job is scheduled in Supabase SQL editor                        | 5 min  |
| 4        | **5**  | Create `.env.example` + deploy runbook (`docs/deploy.md`)                     | 30 min |
| 5        | **13** | Run backup restore drill + create DR doc (`docs/disaster-recovery.md`)        | 45 min |

### 💭 Nice-to-Have (Post-Launch, Before Full Launch)

| Layer | What                                               | Why                                      |
| ----- | -------------------------------------------------- | ---------------------------------------- |
| 1     | Add `metadata` export with Open Graph tags         | WhatsApp/LINE link sharing shows preview |
| 2     | Fix `deleteJournalEntry()` to verify affected rows | Prevents silent no-ops                   |
| 2     | Remove `console.warn` from FaceScanner.tsx         | Privacy — leaks stress tier to console   |
| 8     | Refine CSP to remove `unsafe-inline`               | Stronger XSS protection                  |
| 10    | Cache `getEbookLive()` with 60s in-memory TTL      | Reduces DB queries on every request      |

---

## Appendices

### A. Test Coverage Map

```
src/
├── app/(main)/page.test.tsx                     # Landing page render
├── app/dashboard/layout.test.tsx                # Dashboard auth gate
├── app/dashboard/breadcrumb.test.ts             # Breadcrumb labels
├── app/dashboard/book/page.test.tsx             # Book page
├── app/dashboard/book/BookPageClient.test.tsx   # Book client
├── app/dashboard/book/[chapterId]/page.test.tsx # Chapter reader
├── app/dashboard/book/[chapterId]/ReaderClient.test.tsx
├── app/dashboard/admin/book/page.test.tsx       # Admin book page
├── components/app-sidebar.test.tsx              # Sidebar
├── components/app-sidebar-links.test.tsx
├── components/dashboard/book/ChapterList.test.tsx
├── components/dashboard/book/NextChapterButton.test.tsx
├── components/dashboard/book/PurchaseModal.test.tsx
├── components/dashboard/journal/MoodSelector.test.tsx
├── components/dashboard/journal/journal-editor.test.tsx
├── components/dashboard/journal/journal-history.test.tsx
├── components/dashboard/scanner/pre-scan-questionnaire.test.tsx
├── components/dashboard/scanner/scanner-flow.test.tsx
├── components/dashboard/scanner/stress-result-card.test.tsx
├── components/dashboard/admin/ChapterForm.test.tsx
├── components/dashboard/admin/chapter-table.test.tsx
├── components/dashboard/admin/EbookLiveToggle.test.tsx
├── components/layout/footer.test.tsx
├── components/sections/home/hero.test.tsx
├── components/sections/home/e-book.test.tsx
├── components/sections/home/book-countdown.test.tsx
├── components/sections/home/embedded-chapter-row.test.tsx
├── components/sections/home/visitor-chapter-row.test.tsx
├── schemas/chapter.test.ts
├── test/actions/book.test.ts
├── test/actions/chapters.test.ts
├── test/actions/journal.test.ts
├── test/actions/payment.test.ts
├── test/actions/settings.test.ts
├── test/lib/chapters.test.ts
├── test/lib/middleware.test.ts
├── test/integration/book-purchase-flow.test.tsx
└── test/integration/ebook-live-cron-rls.test.ts
```

### B. Key Files Reference

| File                                          | Lines | Purpose                                                        |
| --------------------------------------------- | ----- | -------------------------------------------------------------- |
| `src/app/layout.tsx`                          | 42    | Root layout — `lang="en"` (needs fix), theme provider, toaster |
| `src/proxy.ts`                                | 13    | Next.js 16 proxy — session refresh on every request            |
| `src/db/index.ts`                             | 7     | Drizzle + postgres-js connection                               |
| `src/db/schema.ts`                            | 174   | All 7 table definitions, enums, relations                      |
| `src/lib/supabase/middleware.ts`              | 92    | Session refresh + route protection logic                       |
| `src/lib/supabase/server.ts`                  | 47    | Server client (anon) + service client (service role)           |
| `src/lib/chapters.ts`                         | 256   | Chapter state machine, access control, next-chapter logic      |
| `src/lib/feature-flags.ts`                    | 16    | `getEbookLive()` — reads from `app_settings`                   |
| `src/actions/chapters.ts`                     | 170   | Purchase, claim (stub), signed URL generation                  |
| `src/actions/payment.ts`                      | 194   | Proof upload, admin verification                               |
| `src/actions/journal.ts`                      | 119   | Save, get, soft-delete journal entries                         |
| `src/app/api/analyze-face/route.ts`           | 109   | Groq/SumoPod AI proxy                                          |
| `src/app/api/chapters/[id]/download/route.ts` | 135   | Watermarked PDF download                                       |
| `src/app/api/chapters/[id]/view/route.ts`     | 97    | PDF viewer with range requests                                 |
| `src/app/auth/callback/route.ts`              | 57    | OAuth callback handler                                         |
| `next.config.ts`                              | 13    | React Compiler, 50MB body limit                                |
| `drizzle/book_chapter_rls_and_bucket.sql`     | 163   | RLS policies for entire e-book system                          |
| `.github/workflows/ci.yaml`                   | 40    | CI pipeline (format → lint → tsc → test → build)               |

### C. Risk Assessment Matrix

| Scenario                              | Likelihood | Impact        | Risk | Mitigation                        |
| ------------------------------------- | ---------- | ------------- | ---- | --------------------------------- |
| AI API cost spike from abuse          | Low        | **Very High** | 🔴   | Rate limit `/api/analyze-face`    |
| Production crash without notification | Medium     | **High**      | 🔴   | Install Sentry                    |
| App downtime at night                 | Low        | **High**      | 🟡   | Health check + UptimeRobot        |
| XSS via journal content               | Low        | **High**      | 🟡   | Add CSP headers                   |
| Slow pages on Indonesian mobile       | Medium     | Medium        | 🟡   | Vercel Analytics + Speed Insights |
| pg_cron job fails Jun 16              | Low        | **High**      | 🟡   | Verify job, document manual flip  |
| Free chapter progression broken       | High       | Low           | 🟡   | Implement `claimFreeChapter()`    |
| OAuth callback brute force            | Very Low   | Medium        | 💭   | Rate limit auth path              |

---

_Document generated 10 June 2026. Based on code-reviewer agent audit + manual source code verification across 14 production readiness layers._

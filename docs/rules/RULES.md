Here are four separate, drop-in rule files tailored to your stack. Each is self-contained so your agent can reference them individually or you can combine them into a master `AGENT_RULES.md`.

---

---

## `RULES_NEXTJS.md`

```markdown
# Next.js Rules (App Router)

## Server-First (Default)

- Server Components by default. Add `"use client"` only when the component needs:
  - Event handlers (onClick, onChange, onSubmit)
  - useState, useEffect, useRef
  - Browser-only APIs (window, document)
  - Third-party client-only libraries
- Never add `"use client"` to a layout or page that can stay server-side.
- Keep client components leaf-level: server page fetches → passes props down.

## Project Structure
```

/app
/(auth)/login/ # Route group: public auth routes
/(dashboard)/ # Route group: protected routes
/invoices/
page.tsx # Server Component (data fetch here)
loading.tsx # Route-level skeleton
error.tsx # Route-level error boundary
/actions.ts # Server Actions for this segment
/api/ # Route Handlers (external callers only)
/components/ # Shared UI
/hooks/ # Custom hooks
/lib/ # Utilities, configs, env
/schemas/ # Zod schemas
/types/ # Shared TypeScript types
/supabase/ # Client factories + query functions

```

## Data Fetching
- Server Components: `async/await` directly in component body.
- Client Components: React Query — never `useEffect` fetch.
- Pass fetched data down as props — do not re-fetch in child components.
- Use `cache: 'no-store'` for user-specific data; `next: { revalidate: N }` for shared data.
- Co-locate `loading.tsx`, `error.tsx`, `not-found.tsx` for every route segment that fetches data.

## Server Actions
- All mutations go through Server Actions (co-located `actions.ts` or `/app/actions/`).
- Mark with `"use server"` at the top of the file.
- Validate input with Zod at the top of every action before touching the DB.
- Return typed `Result<T>` — never throw from a Server Action.
- After mutation: explicitly call `revalidatePath` or `revalidateTag`.
- For post-mutation navigation: use `redirect()` from `next/navigation` inside the action — not `useRouter().push()`.

## Route Handlers (`/app/api/`)
- Export named handlers: `GET`, `POST`, `PUT`, `DELETE`.
- Validate request body with Zod.
- Return structured `{ data, error }` response.
- Use Supabase server client for DB access.

## Middleware
- Use `/middleware.ts` for auth checks and redirects only.
- Keep it thin — no business logic.
- Supabase session refresh via `@supabase/ssr` cookie handling.

## Performance
- Images: always `next/image` with explicit `width`/`height` or `fill` + `sizes`.
- Fonts: always `next/font` — no external `<link>` font imports.
- Heavy client components: `dynamic(() => import(...), { ssr: false })`.

## Metadata
- Every page exports a `metadata` object or `generateMetadata` function.

## Environment Variables
- Never hardcode env values.
- Client-side vars must be prefixed with `NEXT_PUBLIC_`.
- Type-safe wrapper in `/lib/env.ts`.

## STOP & ASK
- New route segment or layout: STOP, confirm URL structure and layout nesting first.
- Changing a Server Action used by multiple pages: STOP, list all callers.
- Adding middleware logic: STOP, propose the matcher pattern and logic.
- New route group: STOP, confirm grouping strategy.
```

---

## `RULES_SUPABASE.md`

```markdown
# Supabase Rules

## Schema & Migrations (MANUAL — Agent Never Touches)

- Schema changes, RLS policies, relationships, indexes, and constraints are written by the user only.
- Migrations live in `/supabase/migrations/` and are committed to version control.
- Agent may PROPOSE migration SQL in a code block but must NOT apply it or create the file.
- If a feature requires a schema change: STOP immediately, output proposed SQL, wait for user review.
- Always include `created_at` (timestamptz, default now()), `updated_at` columns.
- Use UUID for primary keys.
- Enforce invariants in DB (unique constraints, foreign keys, check constraints) — not in app code.

## Row Level Security (RLS)

- RLS is ALWAYS ON. No exceptions.
- Policies: one per operation per table (SELECT, INSERT, UPDATE, DELETE).
- Name policies descriptively: `invoices_select_own_org`, `invoices_insert_member`.
- RLS is the primary security boundary — app logic is convenience, not enforcement.
- Do NOT replicate RLS logic in application code as a substitute.
- New RLS policy: STOP, describe the access rule in plain English, wait for user to write the SQL.

## Client Instantiation

- One client per context:
  - Server Components / Server Actions / Route Handlers: `createServerClient` from `@supabase/ssr`
  - Client Components: `createBrowserClient` from `@supabase/ssr`
- Client factory lives in `/supabase/client.ts` (server) and `/supabase/browser.ts` (client).
- Never import the browser client in a Server Component.
- Never instantiate inline — always use the factory.
- NEVER use service role key on client side.

## Query Layer (`/supabase/queries/`)

- All DB access goes through typed query functions — no raw `.from()` calls in components or actions.
- Every query function returns typed `Result<T>`.
- Always select explicit columns — no `.select('*')` in production code.
- Prefer explicit named functions (`listInvoicesByOrg(orgId)`) over configurable mega-functions.
- Use `.throwOnError()` only in scripts/seeds, not in app code.

## Auth

- Session handling via middleware using `@supabase/ssr` cookie refresh.
- Never store session/user in global state — read from `supabase.auth.getUser()` server-side.
- Auth checks happen server-side (middleware or server action) — never trust client-side auth state for access control.

## Storage

- Signed URLs for private buckets — never expose bucket paths directly.
- File upload functions live in `/supabase/storage.ts` — not inline in components.
- New storage bucket or policy: STOP, ask for bucket name, public/private, and access rules.

## Realtime

- Realtime subscriptions are client-side only.
- Wrap in `useEffect` with cleanup: `return () => { channel.unsubscribe() }`.
- Handle connection errors gracefully (reconnect logic or user notification).
- Use only where genuinely needed (notifications, live collaboration) — not for regular data display.

## STOP & ASK

- Any request that implies a schema change: STOP, output proposed SQL, wait.
- New RLS policy: STOP, describe in plain English, wait for user.
- New storage bucket or policy: STOP, ask for details.
- Changing query functions used by multiple features: STOP, list all callers.
```

---

## How to Wire Them Together

Create a master file in your project root or `.cursor/rules/`:

```markdown
# AGENT_RULES.md

Read and follow these rule files exactly:

- [TypeScript](./RULES_TYPESCRIPT.md)
- [React](./RULES_REACT.md)
- [Next.js](./RULES_NEXTJS.md)
- [Supabase](./RULES_SUPABASE.md)

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
```

---

## Your Pre-Handoff Checklist (Before Any Task)

```
[ ] TypeScript: Did I define the interfaces/types?
[ ] Supabase: Did I write the schema/RLS myself?
[ ] React: Did I sketch the component tree or provide a reference?
[ ] Next.js: Did I confirm the route structure?
[ ] Logic: Did I write the function signature and contract?
→ All yes? Hand off. Any "no"? Do it yourself first.
```

---

The Supabase rules are the most critical to enforce manually — the "STOP on schema" constraint is where tech debt is born or killed. Replace the `[YourBestComponent]` anchor with whatever component you're happiest with, and the agent will use it as a template for everything new. Want me to also generate a condensed single-page version for pasting directly into your agent's system prompt?

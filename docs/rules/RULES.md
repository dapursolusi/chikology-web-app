Here are four separate, drop-in rule files tailored to your stack. Each is self-contained so your agent can reference them individually or you can combine them into a master `AGENT_RULES.md`.

---

---

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

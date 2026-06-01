# `RULES_NEXTJS.md`

## Next.js Rules (App Router)

### Server-First (Default)

- Server Components by default. Add `"use client"` only when the component needs:
  - Event handlers (onClick, onChange, onSubmit)
  - useState, useEffect, useRef
  - Browser-only APIs (window, document)
  - Third-party client-only libraries
- Never add `"use client"` to a layout or page that can stay server-side.
- Keep client components leaf-level: server page fetches → passes props down.

### Project Structure

```
all belows must be inside src/
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

### Data Fetching

- Server Components: `async/await` directly in component body.
- Client Components: React Query — never `useEffect` fetch.
- Pass fetched data down as props — do not re-fetch in child components.
- Use `cache: 'no-store'` for user-specific data; `next: { revalidate: N }` for shared data.
- Co-locate `loading.tsx`, `error.tsx`, `not-found.tsx` for every route segment that fetches data.

### Server Actions

- Mandatory to use server actions instead of api route handlers.
- All mutations go through Server Actions (co-located `actions.ts` or `/app/actions/`).
- Mark with `"use server"` at the top of the file.
- Validate input with Zod at the top of every action before touching the DB.
- Return typed `Result<T>` — never throw from a Server Action.
- After mutation: explicitly call `revalidatePath` or `revalidateTag`.
- For post-mutation navigation: use `redirect()` from `next/navigation` inside the action — not `useRouter().push()`.

### Route Handlers (`/app/api/`)

- Only if server actions under some circumstances cannot be implemented.
- Export named handlers: `GET`, `POST`, `PUT`, `DELETE`.
- Validate request body with Zod.
- Return structured `{ data, error }` response.
- Use Supabase server client for DB access.

### Middleware

- Use `/middleware.ts` for auth checks and redirects only.
- Keep it thin — no business logic.
- Supabase session refresh via `@supabase/ssr` cookie handling.

### Performance

- Images: always `next/image` with explicit `width`/`height` or `fill` + `sizes`.
- Fonts: always `next/font` — no external `<link>` font imports.
- Heavy client components: `dynamic(() => import(...), { ssr: false })`.

### Metadata

- Every page exports a `metadata` object or `generateMetadata` function.

### Environment Variables

- Never hardcode env values.
- Client-side vars must be prefixed with `NEXT_PUBLIC_`.
- Type-safe wrapper in `/lib/env.ts`.

### STOP & ASK

- New route segment or layout: STOP, confirm URL structure and layout nesting first.
- Changing a Server Action used by multiple pages: STOP, list all callers.
- Adding middleware logic: STOP, propose the matcher pattern and logic.
- New route group: STOP, confirm grouping strategy.

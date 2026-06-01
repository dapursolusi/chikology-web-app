# `RULES_TYPESCRIPT.md`

## TypeScript Rules

### Type Safety (Non-Negotiable)

- `strict: true` in tsconfig.json — no exceptions.
- Never use `any`. Use `unknown` + type narrowing, or explicit generics.
- No type assertions (`as X`) unless at an API boundary with a comment explaining why it's safe.
- Explicit return types on all public functions and API routes.
- Export types from a co-located `types.ts` — never inline complex types in function signatures.

### Interfaces vs Types

- Use `interface` for public object shapes that may be extended.
- Use `type` for unions, intersections, primitives, computed types.
- Prefer `readonly` on props and data objects that should not be mutated.

### Result Pattern (Standardized Error Shape)

- All fallible operations return a discriminated union:
  ```ts
  type Result<T> =
    | { ok: true; data: T }
    | {
        ok: false;
        error: { code: string; message: string; details?: unknown };
      };
  ```
- Don't throw for expected failures (validation, permissions). Return `Result`.
- Define error codes as string unions per module — not ad-hoc strings.

### Generics

- Name generics descriptively: `TData`, `TRow`, `TError` — not `T`, `U`, `V`.
- Always constrain: `<TRow extends Record<string, unknown>>`.
- Avoid deep generic chains in app code; keep generics at library/utility boundaries.

### Enums & Constants

- No `enum`. Use `as const` objects + derived union types:
  ```ts
  export const STATUS = { PENDING: 'pending', DONE: 'done' } as const;
  export type Status = (typeof STATUS)[keyof typeof STATUS];
  ```

### Imports

- Absolute imports only via `@/` alias. No `../../..` paths.
- Group: external → internal lib → components → types.
- Use `import type { ... }` for type-only imports.

### Forbidden

- No `// @ts-ignore` or `// @ts-expect-error` unless blocking a critical bug with a linked issue.
- No "utility type soup" — only add generic utility types when they demonstrably reduce duplication across 3+ usages.

### STOP & ASK

- If a type change affects more than one module: STOP, list affected files, wait.
- If introducing a new generic utility type: STOP, propose the signature first.

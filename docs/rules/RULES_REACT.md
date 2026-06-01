## `RULES_REACT.md`

```markdown
# React Rules

## REACT ARCHITECTURE & REFACTORING RULES

You must evaluate all React/Next.js components using this strict 4-step hierarchy before writing or editing code:

1. EXTERNAL HELPERS: If a utility function inside a component does not read/write React state or props, you MUST move it outside the component definition.
2. ASYNC & SIDE EFFECTS: If a function handles APIs, data fetching, or non-UI business logic, you MUST extract it into a custom hook. Do not mix network logic with UI markup.
3. REUSABILITY: If a stateful UI pattern is used in multiple files, you MUST extract it into a shared custom hook.
4. FILE SIZE LIMIT: If the component file is under 150 lines and handles local-only UI toggles, leave the handlers inside the component. If it exceeds 150 lines, extract the state and handlers into a companion custom hook to keep the JSX clean.

## Component Structure

- Functional components only. No class components.
- Props typed with an explicit `interface`, named `[ComponentName]Props`, exported.
- One component per file. File name = component name (PascalCase).
- Max ~150 lines per component. If longer, extract sub-components or a custom hook.
- Destructure props in function signature.
- Use early returns for loading/error/null states.

## File Organization
```

/components/InvoiceCard/
index.tsx # Component
types.ts # Props + local types
useInvoiceCard.ts # Custom hook (if needed)

```

## Hooks
- Custom hooks: prefix with `use`, co-locate or place in `src/hooks/` or `/hooks/`.
- No business logic inside components — extract to a custom hook.
- No `useEffect` for data fetching. Use server actions, React Query, or server components.
- `useEffect` allowed only for: DOM side effects, subscriptions, third-party lib init.
- Dependency arrays must be complete. No eslint-disable on deps.

## State Management
- Local UI state: `useState` (open/close, selected tab, input text).
- Server state: React Query (TanStack Query) or server components — never `useEffect` fetch.
- Global UI state: Zustand with typed store (minimal surface area).
- URL state: `useSearchParams` / `useRouter` for filters, pagination, tabs.
- No prop drilling beyond 2 levels — lift to context or co-locate with a hook.
- Never sync the same data in two places.

## Reference-First Rule (Prevents "Alien UI")
Before generating any new component, the agent needs one of:
- A component tree / sketch description from the user
- A screenshot or link to match
- A reference component already in the repo

Without a reference → output wireframe-level JSX only (no styling decisions).
With a reference → copy its patterns exactly (spacing, props shape, structure).

## Styling
- Tailwind only. Use only tokens from `tailwind.config.ts`.
- No arbitrary values (`p-[13px]`) unless explicitly asked.
- No inline styles except for dynamic values from JS.
- Do NOT invent new color values or spacing outside the existing scale.
- Do NOT "improve" visual design unless explicitly requested.
- Mobile-first. Use `sm/md/lg` breakpoints only.

## Forms
- `react-hook-form` + `zod` for all forms.
- Validation schema lives in `/schemas/`, not inside the component.
- Labels tied to inputs, error messages displayed, keyboard-navigable.

## Forbidden
- No `React.FC` — use explicit return type or infer.
- No default exports for utility functions or hooks — named exports only.
- No inline arrow functions as event handlers in JSX if they cause re-renders in lists.
- No wrapping divs or containers beyond what is specified.

## STOP & ASK
- New shared primitive (Button, Input, Dialog, Table): STOP, propose API first.
- Modifying a component used in >2 places: STOP, list all usages before changing.
- New design pattern not already in the codebase: STOP, ask.
- Modifying shared layout components (Navbar, Sidebar, Shell): STOP, ask.
```

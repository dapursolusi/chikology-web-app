## [Tuesday, 09-06-2026 14:30] — Fix admin nav items visibility (Issue #44)

### Session Target

Make admin nav items appear in sidebar by fetching role server-side from DB instead of reading from `user_metadata`.

### Current State

- Status: shipped
- Scope: `src/components/app-sidebar.tsx`, `src/app/dashboard/layout.tsx`, `src/components/app-sidebar.test.tsx`, `src/app/dashboard/layout.test.tsx`, `vitest.config.ts`

### What Changed

- `src/components/app-sidebar.tsx` — Added `isAdmin` prop (optional, default `false`). Removed `isAdmin` from `user_metadata`-based derive and `user` state. `isAdmin` now controls admin nav section visibility and `EbookLiveToggle` rendering.
- `src/app/dashboard/layout.tsx` — Imported `getUserRole` from `@/actions/auth`; calls it with `user.id` and passes `isAdmin={role === 'admin'}` to `<AppSidebar>`.
- `src/components/app-sidebar.test.tsx` — Replaced skipped comment ("Admin nav tests require Supabase client mock") with 3 passing tests: renders Admin button when `isAdmin={true}`, hides when `false` or default.
- `src/app/dashboard/layout.test.tsx` — Added 3 tests: passes `isAdmin={true}` when DB role is `'admin'`, `false` when role is `'user'` or `null`.
- `vitest.config.ts` — Added `zod` alias to CJS entry (zod v4 ESM doesn't resolve in vitest).

### Verification

- Lint: pass
- TypeScript: pass (`tsc --noEmit`)
- Tests: 257/263 pass (6 integration failures in `ebook-live-cron-rls.test.ts` — pre-existing, requires live Supabase DB)

### Decisions

- D-007: `isAdmin` status flows server-side only (from DB) — no client-side fallback. `user_metadata` still used for display info (name, email, avatar) via `NavUser`.
- D-008: Added `zod` CJS alias in vitest config — zod v4's ESM entry fails vitest resolution; CJS `index.cjs` works reliably.

### Known Issues / Risks

- Role changes in DB take effect only after session refresh (page reload returns fresh server component). No real-time sync — acceptable for MVP per Issue #44 spec.

### Next Steps (ordered)

1. QA: verify admin user sees Kelola Bab / Fitur E-Book / Pengaturan in sidebar; non-admin sees none.
2. Consider adding `getAdminRole` fallback inside `EbookLiveToggle` as belt-and-suspenders (currently gated by parent `isAdmin` check).

### Blockers (if any)

- None.

---

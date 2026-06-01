## [Monday, 01-06-2026 11:50] — Phase 2 Slice 1: Journal page foundation + server actions

### Session Target

Implement `/dashboard/journal` route with unified server actions and mood selector (issue #8).

### Current State

- Status: **shipped**
- Scope: `src/actions/journal.ts`, `src/actions/dashboard.ts`, `src/app/dashboard/journal/page.tsx`, `src/components/dashboard/journal/JournalPageClient.tsx`, `src/components/dashboard/journal/MoodSelector.tsx`, `src/test/actions/journal.test.ts`, `src/components/dashboard/journal/MoodSelector.test.tsx`

### What Changed

- `src/actions/journal.ts` — Rewrote `saveJournalEntry` with new signature `({ mood, content?, stressTier?, recommendation? })`; added `getJournalEntries()` (user-filtered, deleted_at IS NULL, DESC); added `deleteJournalEntry(id)` (soft delete with userId guard)
- `src/actions/dashboard.ts` — Fixed `getRecentActivity` and `getWeekMoods` to filter `deleted_at IS NULL` (was leaking soft-deleted entries); added `isNull` + `and` imports
- `src/components/dashboard/scanner/ScannerFlow.tsx` — Updated `saveJournalEntry` call to use new signature `{ mood: MOOD_MAP[result.tier], stressTier: result.tier, recommendation: ... }`; added `MOOD_MAP` import
- `src/app/dashboard/journal/page.tsx` — New server component; calls `getJournalEntries()` and passes to `JournalPageClient`
- `src/components/dashboard/journal/JournalPageClient.tsx` — New `"use client"` component; owns form state with `useActionState`; renders `MoodSelector` + `Textarea` + history list
- `src/components/dashboard/journal/MoodSelector.tsx` — New; 5 emoji buttons (😌😊😐😟😰), single-select via `aria-selected`, pre-fillable via `value` prop
- `src/test/actions/journal.test.ts` — New; tests for `saveJournalEntry` (auth/mood validation/content-or-tier validation), `getJournalEntries` (auth guard), `deleteJournalEntry` (auth guard); mocks Supabase + Drizzle + `revalidatePath`
- `src/components/dashboard/journal/MoodSelector.test.tsx` — New; tests render, onChange, aria-selected, pre-fill, titles

### Verification

- Commands run: `bunx tsc --noEmit` → pass; `bun run build` → pass; `bun run test --run` → 8 test files, 25 tests, all pass

### Decisions

- D-001: Use `useActionState` adapter function to bridge form `FormData` → typed `saveJournalEntry` signature; avoids modifying the action's public API
- D-002: `revalidatePath` called on both `/dashboard` and `/dashboard/journal` to ensure dashboard stats + journal page stay in sync after save

### Known Issues / Risks

- `MoodSelector` uses ref-based hidden input for form binding; functional but unconventional — may want to refactor to controlled state + hidden input pattern later
- Dashboard "Quick Actions" card has duplicate "Jurnal" link (also links to `/dashboard/journal`) — separate issue, not part of this slice

### Next Steps (ordered)

1. Verify `/dashboard/journal` renders correctly in browser (manual QA)
2. Phase 2 Slice 2 — Tiptap editor + full manual entries

### Blockers (if any)

- None

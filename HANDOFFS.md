## [Monday, 01-06-2026 13:21] — Phase 2 Slice 4: History display + delete

### Session Target

Rich interactive journal history with expand/collapse and soft-delete (issue #11).

### Current State

- Status: **shipped**
- Scope: `JournalHistory.tsx`, `JournalPageClient.tsx`, `journal-history.test.tsx`, `alert-dialog.tsx`, `button.tsx`

### What Changed

- `src/components/dashboard/journal/JournalHistory.tsx` — new; expandable journal entries (click to expand/collapse), scan-only entries show tier label + "(dari scan wajah)" preview, delete via AlertDialog confirmation, local state update on delete
- `src/components/dashboard/journal/JournalPageClient.tsx` — replaced inline history list with `<JournalHistory entries={entries} />`; removed unused Card/CardContent/CardTitle, MOOD_EMOJI, formatDate, truncateHtml
- `src/components/dashboard/journal/journal-history.test.tsx` — new; tests renders entries, scan-only preview, expand/collapse, delete button
- `src/components/ui/alert-dialog.tsx` — new; added via `shadcn add alert-dialog`
- `src/components/ui/button.tsx` — updated by shadcn installer

### Verification

- Commands run: `bunx tsc --noEmit` → pass; `bun run build` → pass; `bun run test --run` → 10 test files, 33 tests, all pass

### Decisions

- D-007: Local state in JournalHistory handles delete removal; `revalidatePath` in server action ensures server data consistency

### Known Issues / Risks

- None

### Next Steps (ordered)

1. Phase 2 Slice 5 — Navigation + mobile polish (HITL)

### Blockers (if any)

- None

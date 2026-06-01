## [Monday, 01-06-2026 10:45] — Phase 2 architecture grilled + PRD published

### Session Target

Grill Phase 2 (Journal System) architecture — walk all design branches, resolve dependencies, publish PRD to issue tracker.

### Current State

- Status: shipped
- Scope: architecture/planning only — no code changes
- Phase 2 PRD published as GitHub issue #7 with `ready-for-agent` label

### What Changed

No code changes this session (read-only plan mode, then PRD-only output). See GitHub issue #7 for full PRD.

### Verification

- `gh issue view 7` — PRD published with `ready-for-agent` label
- No build/test needed (zero code changes)

### Decisions

- D-022: One unified `saveJournalEntry` action — replaces old scanner-only action. Accepts `mood` (required) + at least one of `content`/`stressTier`. Returns `{ success: true, entryId: string }`.
- D-023: `stressTier = null` for manual journal entries — preserves semantic distinction between measured and self-reported data.
- D-024: Server-fetched history, client-side editor — `page.tsx` fetches entries via `getJournalEntries()`, passes to client component.
- D-025: Scanner redirect replaces inline save — "Simpan ke Jurnal" redirects to `/dashboard/journal?tier=N` instead of saving inline.
- D-026: One row, one save — scanner data + manual content go into a single DB row.
- D-027: Scanner data derived client-side from `stressLevels[tier]` — no DB fetch needed.
- D-028: Scanner result shown as collapsible shadcn Accordion on journal page — collapsed by default.
- D-029: Mood selector reuses scanner emojis (😌😊😐😟😰), single-select.
- D-030: History display — date + mood emoji + content preview, newest first, expandable inline detail.
- D-031: Delete-only (soft delete) — no edit, no trash view in MVP.
- D-032: Tiptap toolbar minimal — bold, italic, bullet list, numbered list. No headings.
- D-033: Sidebar nav cleanup — Jurnal → `/dashboard/journal`, Scanner → `/dashboard/scanner`, Book → `#`.
- D-034: Breadcrumb dynamic — shows "Jurnal Harian", "Deteksi Level Stress", or "Dashboard" based on route.
- D-035: `getJournalEntries()` co-located in `actions/journal.ts` — same file as save action, extracted later if file grows.
- D-036: "Scan Wajah Dulu" banner above editor when no scanner params present for today.
- D-037: Delete confirmation dialog before soft-delete (`deletedAt = now()`).
- D-038: Validation — mood required + at least one of (content, stressTier) must be present server-side.

### Known Issues / Risks

- Test environment pre-existing failure (jsdom + react-webcam document access) — unrelated to Phase 2, but will affect new journal tests
- Mobile responsive testing must be done (hard acceptance criterion)
- `bunx --bun drizzle-kit push` still not run for questionnaire_responses schema change
- PreScanQuestionnaire still has placeholder questions — waiting on Mas Chiko

### Next Steps (ordered)

1. [Phase 2] Slice 1 — Journal page foundation + server actions (#8) — no blockers
2. [Phase 2] Slice 2 — Tiptap editor + full manual entries (#9) — blocked by #8
3. [Phase 2] Slice 3 — Scanner redirect + pre-fill (#10) — blocked by #8
4. [Phase 2] Slice 4 — History display + delete (#11) — blocked by #8
5. [Phase 2] Slice 5 — Navigation + mobile polish (HITL) (#12) — blocked by #8, #10, #11

### Blockers (if any)

- None

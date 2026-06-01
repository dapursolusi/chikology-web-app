## [Monday, 01-06-2026 12:45] — Phase 2 Slice 2: Tiptap editor + full manual entries

### Session Target

Add Tiptap rich-text editor to journal page + "Scan Wajah Dulu" banner (issue #9).

### Current State

- Status: **shipped**
- Scope: `JournalEditor.tsx`, `JournalPageClient.tsx`, `toggle.tsx`, `journal-editor.test.tsx`, test setup

### What Changed

- `package.json` + `bun.lock` — installed `@tiptap/react@3.24.0`, `@tiptap/starter-kit@3.24.0`, `@tiptap/extension-placeholder@3.24.0`
- `src/components/dashboard/journal/JournalEditor.tsx` — new; Tiptap editor with bold/italic/bullet/numbered toolbar using `Toggle` component; uses `useEditor` + `StarterKit` + `Placeholder`
- `src/components/dashboard/journal/JournalPageClient.tsx` — replaced `Textarea` with `JournalEditor`; added `useSearchParams` banner ("Scan Wajah Dulu") shown when no `?tier=` param; content from Tiptap passed as HTML to `saveJournalEntry`; history truncates HTML tags for preview
- `src/components/ui/toggle.tsx` — new; added via `bunx shadcn add toggle`
- `src/test/setup.ts` — added `document.elementFromPoint` mock for jsdom (Tiptap Placeholder uses it)
- `src/test/components/dashboard/journal/journal-editor.test.tsx` — new; tests toolbar buttons render and active states using mocked `@tiptap/react`

### Verification

- Commands run: `bunx tsc --noEmit` → pass; `bun run build` → pass; `bun run test --run` → 9 test files, 29 tests, all pass

### Decisions

- D-003: Tiptap `@tiptap/react` mocked in tests because Placeholder extension uses `elementFromPoint` which jsdom doesn't fully support; mock provides fake editor for toolbar state tests
- D-004: `elementFromPoint` stubbed in test setup globally — harmless for other tests, necessary for Tiptap

### Known Issues / Risks

- `elementFromPoint` mock in setup.ts is global — may mask real issues in other components that use this API; acceptable tradeoff for jsdom compatibility
- Tiptap content stored as HTML string in DB — `truncateHtml()` strips tags for preview, but full HTML is stored; fine for now (Slice 4 may add rendering)

### Next Steps (ordered)

1. Phase 2 Slice 3 — Scanner redirect + pre-fill
2. Phase 2 Slice 4 — History display + delete

### Blockers (if any)

- None

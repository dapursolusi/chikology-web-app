## [Wednesday, 17-06-2026 10:38] — Extract shared question data + multi-select UI for q1

### Session Target

- Extract shared question data module + implement multi-select UI for q1 (issue #97)

### Current State

- Status: shipped
- Scope: scanner domain (questionnaire, flow, pipeline, action)

### What Changed

- `src/components/dashboard/scanner/questionData.ts` — **NEW** shared data module with `questions` array (id, text, options, type) and `QuestionnaireAnswers` type alias (`Record<string, string | string[]>`)
- `src/components/dashboard/scanner/PreScanQuestionnaire.tsx` — Rewrote to use shared data module; q1 now renders checkboxes (multi-select), q2/q3 render radio buttons (single-select); "Lainnya..." appended by component, stored as `"Lainnya: <text>"` in answer array; validation enforces non-empty textarea when "Lainnya" checked
- `src/components/dashboard/scanner/ScannerFlow.tsx` — Type updated from `Record<string, string>` to `QuestionnaireAnswers` import
- `src/components/dashboard/scanner/FaceScanner.tsx` — Type updated from `Record<string, string>` to `QuestionnaireAnswers` import
- `src/lib/scanner/pipeline.ts` — Type updated from `Record<string, string>` to `QuestionnaireAnswers` import
- `src/actions/questionnaire.ts` — Type updated from `Record<string, string>` to `QuestionnaireAnswers` import
- `src/components/dashboard/scanner/pre-scan-questionnaire.test.tsx` — Added 4 new tests: q1 checkboxes, q2/q3 radios, multi-select array output, skip submits `{}`
- `src/components/dashboard/scanner/scanner-flow.test.tsx` — Updated mock types to `Record<string, string | string[]>`

### Verification

- Commands run: `bun run test -- --run src/components/dashboard/scanner/`, `bunx tsc --noEmit`, `bun run lint`
- Results: 15/15 tests pass, 0 type errors, 0 lint errors (9 pre-existing warnings)

### Decisions

- D-001: "Lainnya..." NOT in data file — appended by component per spec, keeps data clean
- D-002: `QuestionnaireAnswers` type exported from `questionData.ts` — single source of truth for the answer shape across all consumers

### Known Issues / Risks

- DB column is `jsonb` so no migration needed for the new array shape
- `analyzeFace` in pipeline passes `questionnaireAnswers` directly to JSON body — arrays serialize correctly

### Next Steps (ordered)

1. Close issue #97

### Blockers

- none

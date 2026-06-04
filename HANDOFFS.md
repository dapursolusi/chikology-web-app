# HANDOFFS

## [Thursday, 04-06-2026 10:44] — Document GitHub Flow workflow (SHIPPED)

### Session Target

Extract the GitHub Flow workflow decision (established in prior conversation) into a project rule, following the existing `docs/rules/RULES_*.md` pattern.

### Current State

- Status: shipped
- Scope: 2 files — `docs/rules/RULES_GIT.md` (new) + `AGENTS.md` (link added)

### What Changed

- `docs/rules/RULES_GIT.md` — **NEW**. Project rule documenting GitHub Flow: single `main` branch, short-lived `feat/*` / `fix/*` / `ref/*` branches, mandatory PR with self-review and squash merge, conventional commits format, carveouts for transient agent state files (HANDOFFS.md, SCHEDULES.md), strict forbidden list, STOP & ASK section. Style matches `RULES_TYPESCRIPT.md` / `RULES_REACT.md` / `RULES_NEXTJS.md`.
- `AGENTS.md` — added `[Git & Branching](./docs/rules/RULES_GIT.md)` to the "Specific Rules" list so the new rule is auto-loaded by agents on this project.

### Verification

- `ls docs/rules/` → RULES_GIT.md present, 3.8K, ~110 lines ✅
- Markdown link target exists: `./docs/rules/RULES_GIT.md` resolves to new file ✅
- Style match: section structure, imperative voice, STOP & ASK section all consistent with sibling RULES\_\*.md files ✅
- No code changes → no lint/typecheck/build needed

### Decisions

- D-014: Adopt GitHub Flow as the project workflow. Rationale: Vercel preview deploys replace the need for a long-lived `development` branch; one mental model (`feat → PR → main → deploy`) is leaner and battle-tested; small frequent PRs distribute merge conflict risk vs concentrating it at phase boundaries.
- D-015: Carveouts for `HANDOFFS.md` and `docs/SCHEDULES.md` (direct commits to `main` allowed for these transient agent state files only). All other content — code, ADRs, RULES\_\*.md, config — goes through PR.
- D-016: Migration trigger — carveouts are revoked the moment a second contributor joins. No grace period.

### Known Issues / Risks

- The repo still has an active `development` branch. Migration to GitHub Flow (delete `development`, set `main` branch protection in GitHub) is **deferred** and tracked as a separate task. Until migrated, agents will follow RULES_GIT.md but the current `development` branch is the working branch. A follow-up session should: finish any in-flight dev work, merge dev → main once, then delete `development` and configure branch protection on `main`.

### Next Steps (ordered)

1. Migrate the repo to GitHub Flow: finish in-flight work on `development`, merge to `main` once, delete `development` branch, configure GitHub branch protection on `main` (require PR, require CI, restrict force push, require linear history).
2. Begin Phase 3 Slice 1 (#14) — Soft Launch: Countdown + Nav Gate, using the new workflow (feat branch → PR → main → auto-deploy).
3. Update AGENT_PROTOCOL.md § 7 globally is **not** needed — the global protocol's default of protecting `dev*` is fine; RULES_GIT.md overrides for this project only.

### Blockers

- None

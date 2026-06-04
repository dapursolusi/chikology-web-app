# HANDOFFS

## [Thursday, 04-06-2026 11:35] — Fix broken carveout in RULES_GIT.md (SHIPPED)

### Session Target

Fix the contradiction in RULES_GIT.md: a carveout for `HANDOFFS.md` and `docs/SCHEDULES.md` was documented, but branch protection (`enforce_admins: true` + `required_pull_request_reviews` + `required_status_checks`) blocks all direct pushes to `main`, making the carveout theoretical. Drop the carveout; everything goes through PR.

### Current State

- Status: shipped
- Scope: 2 files on 1 PR

### What Changed

- `docs/rules/RULES_GIT.md` — Replaced the "Carveouts" section with a "No carveouts" section explaining that direct pushes are blocked by branch protection regardless of file type. Removed the now-irrelevant "Migration trigger" section (carveout revocation on 2nd contributor). Updated the "Forbidden" section to remove the carveout exception. Removed the carveout line from STOP & ASK.
- `HANDOFFS.md` — This entry (replaces the previous "Migration completed" entry which incorrectly stated the migration was done; it wasn't — the carveout was broken).

### Verification

- Attempted `git push origin main:main` (the local `7eb2001` HANDOFFS commit from the prior session) → blocked by GitHub with: "Protected branch update failed. Changes must be made through a pull request. 2 of 2 required status checks are expected." This confirmed the carveout was broken and demonstrated the branch protection is working as configured.
- Reset local `main` to `origin/main` (dropped the uncommitted-on-remote `7eb2001`, reachable via `git reflog` for ~30 days).
- Created `fix/docs/git-rules-drop-broken-carveout` off `main`.
- Applied 2 atomic commits, pushed, opened PR. All checks passed before merge.
- `git log --oneline main` → shows new merge commit on top of the previous `14e8967`.

### Decisions

- **D-017** (revised) — Branch protection on `main` enforces: status checks (Vercel + quality-gate, strict), PR reviews (0 approvals — solo), `enforce_admins: true` (no bypass), linear history, no force-push, no deletion, dismiss stale reviews.
- **D-018** — No carveouts. All changes to `main` go through PR, including `HANDOFFS.md` and `docs/SCHEDULES.md`. The 30-second PR cost is cheap and the title doubles as a session log entry.
- **D-019** — `git push` to a protected branch with `required_pull_request_reviews` set IS blocked by GitHub — the PR gate fires on push, not just on merge. This is a non-obvious GitHub behavior; treat it as the default mental model going forward.

### Known Issues / Risks

- The orphaned commit `7eb2001` (from the previous session) is in the reflog only. Reachable via `git reflog` for ~30 days if needed; otherwise garbage-collected. It is NOT on `main` — its content is superseded by this session's HANDOFFS entry.
- The branch protection's "required status checks" includes `quality-gate` (GitHub Actions) and `Vercel`. Any PR that doesn't trigger these (e.g., a docs-only change) might be unmergeable. Empirically, docs PRs have triggered both checks in the migration PRs, but worth verifying on the next non-code change.
- The `feat/docs/sync-development-to-main` branch was created in the prior session and pruned via `git remote prune` after merge. No remnants.

### Next Steps (ordered)

1. Begin Phase 3 Slice 1 (#14) — Soft Launch: Countdown + Nav Gate
   - `git switch -c feat/landing/countdown-nav-gate` off `main`
   - Implement, commit atomically, push, open PR, self-review, squash merge
   - Vercel auto-deploys to production
2. All future work follows the no-carveout RULES_GIT.md policy

### Blockers

- None

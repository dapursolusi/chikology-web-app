# `RULES_GIT.md`

## Git & Branching Rules

This project uses **GitHub Flow** — a single long-lived branch (`main`) with short-lived feature branches per slice. No `development`, no `staging`, no GitFlow.

### Why GitHub Flow

- Vercel auto-creates a preview URL for every PR — eliminates the need for a long-lived `development` integration branch.
- `main` is always shippable and IS production.
- Small, frequent PRs distribute merge conflict risk instead of concentrating it.
- One mental model: feat branch → PR → main → deploy.

### Branches

- **`main`** — protected, always shippable, auto-deploys to production on Vercel.
- **`feat/<domain>/<action>`** — one per slice issue. Short-lived (hours to days, not weeks).
- **`fix/<domain>/<issue>`** — one per bug. Short-lived.
- **`refactor/<scope>`** — one per refactor. Short-lived.
- No `development`, no `staging`, no `dev/*`, no `release/*`.

### Branch lifecycle

```
git checkout main && git pull
git checkout -b feat/<domain>/<action>
# work, commit atomically
git push -u origin feat/<domain>/<action>
gh pr create --base main --title "feat(scope): description" --body "Closes #N"
# wait for Vercel preview + CI
# self-review the diff in the PR UI
gh pr merge --squash --delete-branch
```

A branch must die within ~3 days. If it can't, the slice is too big — split it.

### Commits

- Atomic: one logical change = one commit.
- Conventional Commits format: `type(scope): description`.
  - Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`.
  - Scope: lowercase domain (e.g., `journal`, `scanner`, `auth`).
- Imperative mood: "add countdown timer" not "added countdown timer".
- Body explains _why_, not _what_ (the diff shows what).
- Never commit secrets, `.env` values, or generated files.

### Pull Requests (mandatory for `main`)

- Title: same format as commit (`type(scope): description`).
- Body must reference the issue: `Closes #N` or `Fixes #N` — triggers auto-close on merge.
- Squash merge by default (`gh pr merge --squash --delete-branch`) — keeps `main` history clean (one PR = one commit).
- Self-review the diff in the PR UI before merging. Past-self is the reviewer. This catches:
  - Files you didn't mean to commit
  - `console.log` / debug statements
  - Scope creep beyond the issue
- Wait for: CI green + Vercel preview deployed successfully.
- Delete the branch on merge (the flag above handles this).

### No carveouts

Everything goes through a PR — including `HANDOFFS.md` and `docs/SCHEDULES.md`. Branch protection with `enforce_admins: true` blocks direct `git push` to `main` regardless of content type, so any carveout would be theoretical anyway. The 30-second PR cost per session is cheap and adds an audit trail (the PR title doubles as a session log entry).

When in doubt, open a PR.

### Forbidden

- No direct commits to `main` — ever. Every change goes through a PR.
- No `git push --force` to `main` — ever.
- No `git rebase` on commits that have been pushed and reviewed by others.
- No merging your own PR without self-reviewing the diff first.
- No long-lived branches (>3 days). Split the slice instead.
- No `git commit -m` without a scope (`feat: ...` without `(scope)` is rejected).
- No mixing unrelated changes in one commit or one PR.

### STOP & ASK

- Touching protected branch rules in GitHub settings: STOP, confirm intent.
- Force-push or history rewrite on any branch with a PR open: STOP, ask.
- Merge strategy other than squash (e.g., rebase merge, merge commit): STOP, justify.
- Branch lifetime exceeding 3 days: STOP, propose how to split or why to extend.

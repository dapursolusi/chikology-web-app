# GitHub Releases Reference

## Tags vs Releases

| Concept            | What it is                                                           | Created by                       |
| ------------------ | -------------------------------------------------------------------- | -------------------------------- |
| **Git tag**        | Lightweight pointer to a commit                                      | `git tag v1.0.0`                 |
| **GitHub Release** | Formal release page wrapping a tag (with notes, assets, discussions) | `gh release create` or GitHub UI |

Creating a tag does **not** auto-create a release. You must create releases explicitly.

---

## Creating a Release

### Option A: CLI (recommended)

```bash
# Simple — auto-generates notes from commits since last tag
gh release create v1.0.0 --title "v1.0.0 — Feature Name" --notes "## What's new\n- Feature X (#42)"

# Auto-generate notes from commit history
gh release create v1.0.0 --generate-notes

# With assets (e.g. build artifacts)
gh release create v1.0.0 --title "v1.0.0" --notes "Release" ./dist/app.zip ./dist/app.tar.gz

# Draft (not published until you edit and publish on GitHub)
gh release create v1.0.0 --draft --title "v1.0.0" --notes "WIP"
```

### Option B: GitHub UI

1. Go to **Releases** → **Draft a new release**
2. Choose tag (or create new)
3. Write title + description
4. Attach assets (optional)
5. Click **Publish release**

---

## Writing Release Notes

### Format convention (this project)

```markdown
## Changes

- feat(scope): description (#PR)
- fix(scope): description (#PR)
- docs: description (#PR)
```

### Auto-generate notes

```bash
# Generates notes from commits between previous tag and this one
gh release create v1.1.0 --generate-notes
```

GitHub groups changes into **New Contributors**, **Full Changelog**, and lists PRs automatically.

### Custom template (`.github/release.yml`)

You can configure auto-generated notes by creating `.github/release.yml`:

```yaml
changelog:
  categories:
    - title: 🚀 Features
      labels: [enhancement, feature]
    - title: 🐛 Bug Fixes
      labels: [bug, fix]
    - title: 📝 Documentation
      labels: [docs, documentation]
```

---

## Hiding Assets in Release Page

GitHub doesn't have a native "hide asset" toggle. Workarounds:

### 1. Source code archives are auto-included (cannot remove)

GitHub always shows "Source code (zip)" and "Source code (tar.gz)" links. **These cannot be hidden or removed.** They're auto-generated for every release.

### 2. Uploaded assets — don't attach them

If you don't want assets visible, simply don't upload them to the release. Upload to a different location instead:

- Supabase Storage
- S3 bucket
- GitHub Packages
- Separate repo

### 3. Mark as Draft to hide temporarily

```bash
gh release edit v1.0.0 --draft    # hides from public
gh release edit v1.0.0 --publish  # makes visible again
```

### 4. Use Pre-release flag

```bash
gh release create v1.0.0-beta --prerelease --title "v1.0.0-beta" --notes "Pre-release"
```

Pre-releases are shown separately and marked with a badge, but still visible.

### 5. Delete specific assets via CLI

```bash
# List assets
gh api repos/{owner}/{repo}/releases/{release_id}/assets

# Delete an asset
gh api --method DELETE repos/{owner}/{repo}/releases/assets/{asset_id}
```

---

## Quick Reference

```bash
# List all releases
gh release list

# View a release
gh release view v1.0.0

# Edit a release
gh release edit v1.0.0 --notes "Updated notes"

# Delete a release
gh release delete v1.0.0 --yes

# Upload asset to existing release
gh release upload v1.0.0 ./dist/app.zip

# Download asset
gh release download v1.0.0 --pattern "*.zip"
```

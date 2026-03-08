# R2-constraints: Git Repository Cleanup — Constraint Analysis

**Agent:** `aspect-constraints` (Ring 2 Cross-Validator)
**Date:** 2026-03-08
**Upstream R1 paths:**
- `.devsteps/research/git-cleanup/R1-archaeology.md`
- `.devsteps/research/git-cleanup/R1-risk.md`

---

## Constraint Analysis

### Security

- **[RISK — HIGH likelihood × HIGH severity]** `.vscode/mcp.json` is **tracked by git** (NOT gitignored) AND has unstaged modifications.
  - `git check-ignore -v .vscode/mcp.json` → exit code 1 = **NOT in any .gitignore**
  - `git ls-files --error-unmatch .vscode/mcp.json` → exits 0 = **tracked**
  - `git status --short .vscode/mcp.json` → ` M` = **unstaged modifications exist**
  - The working-tree version contains a hardcoded absolute path:
    ```json
    "args": ["-y", "--package=@schnick371/devsteps-mcp-server@next", "devsteps-mcp",
             "/home/th/dev/projekte/playground/devsteps"]
    ```
    vs. the committed version using `${workspaceFolder}` template.
  - **Risk:** Any `git add -A` or careless staging during cherry-pick will commit this hardcoded path into main, breaking all other contributors and exposing local filesystem layout.
  - **Mitigation required:** Before cherry-pick, either (a) restore file: `git checkout HEAD -- .vscode/mcp.json`, or (b) stage ONLY the 4 CHANGELOG files explicitly: `git cherry-pick --no-commit d151296 && git reset HEAD .vscode/mcp.json` (cherry-pick should not touch it, but paranoia warranted).

- **[CLEAR]** No injection risks, secrets, or auth tokens in the planned operations.

### Breaking Changes

- **Semver impact: NONE** — cherry-pick `d151296` only modifies 4 CHANGELOG files:
  - `packages/cli/CHANGELOG.md`
  - `packages/extension/CHANGELOG.md`
  - `packages/mcp-server/CHANGELOG.md`
  - `packages/shared/CHANGELOG.md`
  - Confirmed via `git show d151296 --name-only` → **zero `package.json` files in the commit.**
  - No TypeScript interfaces touched. No published exports changed.

- **[RISK — HIGH likelihood × MEDIUM severity]** CHANGELOG duplication confirmed:
  - `packages/mcp-server/CHANGELOG.md` on `main` (line 9 and 14) **already contains TASK-330 and TASK-331** references inside the existing `## [Unreleased]` section.
  - Cherry-picking `d151296` would add a new `## [1.1.0-next.4]` section ABOVE `## [Unreleased]` also referencing TASK-330 and TASK-331 → **duplicate entries confirmed**.
  - Only `packages/mcp-server/CHANGELOG.md` was found to have pre-existing TASK-330/331/332 references on `main`. The other 3 changelogs (`cli`, `extension`, `shared`) have no pre-existing conflicts.
  - **Mitigation required:** After `git cherry-pick d151296`, manually edit `packages/mcp-server/CHANGELOG.md` to deduplicate before committing. Recommend: consolidate TASK-330/331 details into the new `## [1.1.0-next.4]` block and remove them from `## [Unreleased]`.

- **[RISK — LOW likelihood × MEDIUM severity]** `next/1.1.0-next.4` is 4 commits ahead of main. ONLY `d151296` is wanted:
  ```
  f173e65  chore(extension): bump version to 1.0.4 patch for VSIX pre-release  ← NOT wanted
  d151296  docs: add CHANGELOG entries for 1.1.0-next.4 pre-release             ← WANT
  36cb21f  chore: bump version to 1.1.0-next.4 (extension: 1.0.3)               ← NOT wanted
  4948c84  merge: bring local main into next/1.1.0-next.4 release branch        ← NOT wanted
  ```
  Cherry-pick of the single SHA is the correct approach — do NOT `git merge next/1.1.0-next.4`.

### Performance

- **[CLEAR]** — No performance concerns. All operations are local git operations.
- Stash drops are O(n) with small n. Sequential descending drops avoid index shift.

### Compatibility & Environment

- **[CLEAR] CI has no blocking dependency on `origin/next/1.1.0-next.4`:**
  - Workflow file `.github/workflows/test.yml` triggers only on:
    - `push` to `main` or `develop`
    - `pull_request` to `main`
  - The `next/1.1.0-next.4` branch is NOT a CI trigger branch.
  - No branch protection rules evident in workflow file for this branch.
  - **Branch deletion and archive rename are safe with respect to CI.**

- **[RISK — MEDIUM likelihood × LOW severity]** Current working tree is on `story/STORY-208` branch at same SHA as `main` (`829d5e2`). Cherry-pick will operate on this branch's HEAD, not on main directly. Ensure you are on `main` before cherry-picking if the intent is to bring changes into `main`.

### Blocked Predecessors

- **NONE** — No items found in blocked status that bear on these git cleanup operations.
- The `story/STORY-208` WIP is uncommitted and orthogonal to the git cleanup operations.

---

### Stash@{3} SHA (Preservation Anchor)

```
stash@{3} SHA: 866047809ebb33bf98f57226b3616980a6ffdee2
```

Verified via `git rev-parse stash@{3}` before any drops. Reference this SHA as a safety checkpoint:
```bash
# Verify after any stash operations:
git show 866047809ebb33bf98f57226b3616980a6ffdee2 --stat
```

---

### Top 3 Constraints (Prioritized)

1. **`.vscode/mcp.json` accidental commit risk** — file is tracked + has unstaged modifications with hardcoded local path. Must restore or stage selectively before cherry-pick. Severity: HIGH. `git checkout HEAD -- .vscode/mcp.json` FIRST.

2. **CHANGELOG duplication in `packages/mcp-server/CHANGELOG.md`** — TASK-330 and TASK-331 already exist in `## [Unreleased]` on `main`. Cherry-picking `d151296` without manual dedup creates duplicate entries. Post-cherry-pick manual edit required before `git commit`.

3. **Stash descending drop order + SHA anchor** — `stash@{3}` SHA `866047809ebb33bf98f57226b3616980a6ffdee2` must be verified still resolves to the "CLI npx binary fix" AFTER each preceding stash drop. Verify identity by checking the stash message: `git stash show -p 866047809ebb33bf98f57226b3616980a6ffdee2 | head -5`.

---

### Additional Ordering Constraints Not in R1

| Step | Constraint | Reason |
|------|-----------|--------|
| Before cherry-pick | `git checkout HEAD -- .vscode/mcp.json` | Prevents hardcoded path commit |
| After `git cherry-pick --no-commit d151296` | `git status` — verify ONLY 4 CHANGELOGs staged | Guard against unexpected file inclusions |
| After staging | Edit `packages/mcp-server/CHANGELOG.md` to deduplicate TASK-330/331 | Confirmed duplication |
| After stash@{12}: `git stash drop stash@{12}` | Verify `git rev-parse stash@{3}` still resolves | Index shift guard |
| Branch checkout | Must be on `main` (not `story/STORY-208`) when cherry-picking | Logical target |

---

### Verification Commands for Executor

```bash
# 1. Confirm on main before operations
git checkout main

# 2. Guard mcp.json
git checkout HEAD -- .vscode/mcp.json

# 3. Cherry-pick CHANGELOG only
git cherry-pick --no-commit d151296
git status  # MUST show only 4 CHANGELOG files

# 4. Dedup mcp-server CHANGELOG
# (manual edit: remove TASK-330/331 from [Unreleased], keep in [1.1.0-next.4])

# 5. Commit with Conventional Commits footer
git add packages/*/CHANGELOG.md
git commit -m "docs: add 1.1.0-next.4 CHANGELOG entries to main"

# 6. Stash drops (descending, skip 3)
for n in 12 11 10 9 8 7 6 5 4 2 1 0; do git stash drop stash@{$n}; done
# Verify anchor: git rev-parse stash@{0} should == 866047809ebb33bf98f57226b3616980a6ffdee2

# 7. Archive branch
git branch -m next/1.1.0-next.4 archive/releases/1.1.0-next.4
git branch -d bug/BUG-060
```

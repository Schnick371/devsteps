# R1 Risk Analysis — Git Repository Cleanup
**Analyst:** devsteps-R1-analyst-risk  
**Date:** 2026-03-08  
**Mandate:** Map blast radius and risk matrix for planned git cleanup operations  

---

## 1. Verified Facts

### Tag Status
- `v1.1.0-next.4` **EXISTS** locally: confirmed by `git tag -l "v1.1.0-next*"` → `v1.1.0-next.1`, `v1.1.0-next.3`, `v1.1.0-next.4`
- **Conclusion:** History is anchored by the tag. Deleting `next/1.1.0-next.4` branch is SAFE — the commit is reachable via the tag.

### Branch Merge Status
- `bug/BUG-060`: **MERGED** ✓ — `git merge-base --is-ancestor` confirms fully in HEAD
- `next/1.1.0-next.4`: **NOT-MERGED** (expected — has 4 unique commits above main)
- `story/STORY-208`: **MERGED** (same SHA as main, WIP only in working tree)

### Commits unique to `next/1.1.0-next.4` (not in main)
```
f173e65  chore(extension): bump version to 1.0.4 patch for VSIX pre-release
d151296  docs: add CHANGELOG entries for 1.1.0-next.4 pre-release      ← CHERRY-PICK TARGET
36cb21f  chore: bump version to 1.1.0-next.4 (extension: 1.0.3)
4948c84  merge: bring local main into next/1.1.0-next.4 release branch
```
Only `d151296` is relevant for cherry-pick. The version-bump commits (36cb21f, f173e65) and merge commit (4948c84) must NOT be cherry-picked.

### Stash@{3} Content
- Contains: `devsteps-cli: ./dist/index.cjs` addition to `packages/cli/package.json` bin field
- Current main: does NOT have `devsteps-cli` bin alias (confirmed by `grep -A5 '"bin"'`)
- **Conclusion:** stash@{3} change IS still missing from main — genuine value, must preserve

### Cherry-pick d151296 — Conflict Assessment
The commit touches only 4 CHANGELOG files, inserting a `## [1.1.0-next.4]` block BEFORE the `## [Unreleased]` marker.

**Git-level conflict risk:** LOW  
Context lines in the patch (`All notable changes... ## [Unreleased]`) still exist at the same position in main's CHANGELOGs. The insert is a pure addition; no competing edits to the same lines.

**Semantic duplication risk:** MEDIUM  
Main's `## [Unreleased]` sections (added after the cherry-pick parent) already contain references to TASK-330, TASK-331, TASK-332 (mcp-server) and other 1.1.0-next.4 features. After cherry-pick, these same items will appear in BOTH:
- `## [1.1.0-next.4] - 2026-03-06 (Pre-release)` (cherry-picked section)
- `## [Unreleased]` (currently on main, with same features described differently)

This is a documentation quality issue requiring manual triage post-cherry-pick, not a blocker.

### Stash Dead-Branch Analysis
All stashes to be dropped reference dead (deleted) branches:

| Stash  | Referenced Branch                 | Branch Exists? |
|--------|-----------------------------------|----------------|
| {0}    | task/TASK-345-346-toolnames-think | DEAD           |
| {1}    | github-v1                         | DEAD           |
| {2}    | github-v1                         | DEAD           |
| {4}    | next/0.8.1-next.5                 | DEAD           |
| {5}    | story/STORY-081-mcp-refs-migration | DEAD          |
| {6}    | next/0.7.0-next.3                 | DEAD           |
| {7}    | main                              | EXISTS         |
| {8}    | main                              | EXISTS         |
| {9}    | main                              | EXISTS         |
| {10}   | story/STORY-056                   | DEAD           |
| {11}   | epic/EPIC-015                     | DEAD           |
| {12}   | main                              | EXISTS         |
| **{3}**| main                              | EXISTS — **PRESERVE** |

⚠️ **NOTE: stash@{1} is NOT in the drop list** (plan drops {0,2,4,5,6,7,8,9,10,11,12}).  
stash@{1} references dead `github-v1` but is being preserved by the current plan. This is fine — it's inert.

### ⚠️ CRITICAL: Stash Index Shift Risk (HIGH)
Dropping stashes by index position is DANGEROUS. Each `git stash drop stash@{N}` renumbers all subsequent indices. If executed as `drop stash@{0}`, `drop stash@{2}`, etc. in ascending order, the wrong stashes will be dropped.

**Example of the hazard:**
```
Before:  {0}→WIP-TASK-345  {1}→github-v1  {2}→github-v1  {3}→npx-fix
drop {0}
After:   {0}→github-v1     {1}→github-v1  {2}→npx-fix     ← indices shifted!
drop {2} now drops the npx-fix stash, NOT the intended stash@{2}
```

### Remotes
- `origin` → `https://github.com/Schnick371/devsteps.git` (public)
- `origin-private` → `https://github.com/Schnick371/devsteps-private.git` (private)
- `origin/next/1.1.0-next.4` exists as remote-tracking branch

### Build Status
- **PASSES** ✓ — esbuild completes in <100ms, no TypeScript errors

### .vscode/mcp.json Hardcoded Path (STORY-208 WIP Risk)
- File contains absolute machine-specific path
- Must NOT be committed to main or merged
- Risk: if STORY-208 is merged without cleaning this file, the path leaks into git history

---

## 2. Risk Matrix

| Operation | Probability of Harm | Severity | Net Risk | Key Mitigation |
|-----------|--------------------|---------|---------|----|
| Delete `bug/BUG-060` local | NEGLIGIBLE | NEGLIGIBLE | **LOW** | None — fully merged |
| Archive `next/1.1.0-next.4` (tag exists) | LOW | LOW | **LOW** | v1.1.0-next.4 tag already exists; history anchored |
| Delete `origin/next/1.1.0-next.4` remote | MEDIUM | LOW | **MEDIUM** | Public remote deletion visible externally; irreversible without re-push |
| Cherry-pick `d151296` | LOW (git conflict) / MEDIUM (semantic dup) | LOW | **LOW-MEDIUM** | Manual CHANGELOG cleanup required post-cherry-pick |
| Drop stashes (index-based) | **HIGH** | **HIGH** | **HIGH** | Use SHA-based drop or drop in descending index order |
| Drop stash@{3} accidentally | MEDIUM (if index shift) | HIGH | **HIGH** | Apply SHA-based approach: `git stash drop refs/stash@{3}` or identify by SHA first |
| Add sandbox to .gitignore | NEGLIGIBLE | NEGLIGIBLE | **NEGLIGIBLE** | Pure protection |
| Commit mcp.json from STORY-208 | LOW (if careful) | HIGH | **MEDIUM** | Verify `.vscode/mcp.json` is gitignored before any STORY-208 work |

---

## 3. Hard Constraints (Must Not Violate)

1. **Never cherry-pick version bump commits** (36cb21f, f173e65) into main — they reference `1.1.0-next.4` version strings that contradict main's version scheme
2. **Never commit `.vscode/mcp.json`** — contains hardcoded absolute path
3. **Preserve stash@{3}** (`CLI npx binary fix`) — change is not in main; must be applied in a future release
4. **Do not force-push main or origin/main** — no operation requires this
5. **Tag `v1.1.0-next.4` must remain** — provides permanent archive anchor; do NOT delete tag when deleting branch

---

## 4. Blast Radius

| Consumer | Impact of Planned Operations |
|----------|------------------------------|
| Local dev (story/STORY-208) | Zero impact — branch untouched |
| Public GitHub repo (origin) | Minimal: remote next/1.1.0-next.4 deletion removes a pre-release branch |
| Private GitHub repo (origin-private) | Unaffected — no operation targets origin-private |
| npm @next channel | Unaffected — no publish planned; version tag preserved |
| VS Code Marketplace pre-release | Unaffected |
| git bisect / history traversal | Unaffected — v1.1.0-next.4 tag preserves commit reachability |
| Future CHANGELOG readers | Medium: post-cherry-pick duplication between [1.1.0-next.4] and [Unreleased] |

---

## 5. Recommended Safe Order of Operations

```
1. [PRE-CHECK] Verify .vscode/mcp.json is gitignored:
   grep -r "mcp.json" .gitignore .vscode/.gitignore 2>/dev/null
   If not: echo ".vscode/mcp.json" >> .gitignore

2. [SAFE] Add packages/sandbox/ to .gitignore:
   echo "packages/sandbox/" >> .gitignore

3. [SAFE] Delete bug/BUG-060 local branch:
   git branch -d bug/BUG-060

4. [SAFE] Cherry-pick CHANGELOG commit only:
   git cherry-pick d151296
   # Review resulting CHANGELOGs for duplication; clean up [Unreleased] if needed
   # Commit message: docs: add 1.1.0-next.4 CHANGELOG entries to main

5. [SAFE] Delete next/1.1.0-next.4 local (tag exists as anchor):
   git branch -D next/1.1.0-next.4
   
6. [CONFIRM BEFORE EXEC] Delete origin/next/1.1.0-next.4 remote:
   git push origin --delete next/1.1.0-next.4
   # Confirm: is anyone consuming this remote branch (CI, docs, etc.)?

7. [CAREFUL] Drop stashes using SHA-based approach (avoids index drift):
   # First capture all stash SHAs:
   git stash list --format="%gd %H %s" > /tmp/stash-inventory.txt
   # Then drop by commit hash, NOT by index:
   # Identify the SHA of stash@{3} (preserve it), then drop all others from list
   # Safest: drop in DESCENDING index order in one session:
   git stash drop stash@{12}
   git stash drop stash@{11}  # re-check index after each if session split
   git stash drop stash@{10}
   git stash drop stash@{9}
   git stash drop stash@{8}
   git stash drop stash@{7}
   git stash drop stash@{6}
   # SKIP stash@{5} = stash@{3} after drops above shift indices — DANGER ZONE
   # Use SHA-based approach for safety
```

### SHA-based stash drop (safest approach)
```bash
# Capture stash refs before ANY drops:
git stash list  # note the SHA of stash@{3} from the output

# Alternative: use the reflog SHA directly
# git rev-parse stash@{3}  → captures the wip-commit SHA
# git stash drop stash@{3} BEFORE dropping anything else to guarantee correct index

# Safe order: drop {3}-preserve first identified, then work from top of stack
```

---

## 6. Verdict

| Dimension | Result |
|-----------|--------|
| `v1.1.0-next.4` tag exists? | **YES** — branch deletion safe |
| stash@{3} bin alias in main? | **NO** — missing, stash has genuine value |
| Cherry-pick d151296 conflict? | **GIT-CLEAN** / SEMANTIC DUPLICATION (medium) |
| Stash dead-branch references? | **ALL 7 drop-targets reference dead branches** (confirms orphaned) |
| Build passes? | **YES** |
| Overall cleanup risk | **MEDIUM** — dominated by stash index-shift hazard |

**Verdict: MEDIUM_RISK**  
Main risk is operational (stash drop ordering), not structural. All planned operations are individually sound if executed with SHA-based stash management.

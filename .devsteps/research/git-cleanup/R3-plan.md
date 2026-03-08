# R3 Planner — Git Repository Cleanup Implementation Plan

**Planner:** devsteps-R3-exec-planner  
**Date:** 2026-03-08  
**Synthesized from:** R1-archaeology, R1-risk, R2-constraints, R2-impact  
**Verdict:** PLAN_READY  
**Confidence:** 0.95

---

## Pre-flight Verification (before any step)

Run all of these checks and confirm each assertion before proceeding:

```bash
cd /home/th/dev/projekte/playground/devsteps

# 1. Confirm branch state
git branch --show-current          # expected: story/STORY-208
git rev-parse HEAD                 # expected: 829d5e2...

# 2. Capture and confirm stash@{3} SHA anchor
STASH3_SHA=$(git rev-parse stash@{3})
echo "stash@{3} SHA: $STASH3_SHA"   # must equal 866047809ebb33bf98f57226b3616980a6ffdee2
[ "$STASH3_SHA" = "866047809ebb33bf98f57226b3616980a6ffdee2" ] && echo "ANCHOR OK" || echo "ANCHOR MISMATCH — STOP"

# 3. Confirm stash@{3} identity
git stash show stash@{3} --stat    # must show: packages/cli/package.json | 1 +

# 4. Confirm mcp.json is tracked (not gitignored) and has local modifications
git ls-files --error-unmatch .vscode/mcp.json && echo "tracked: YES"
git status --short .vscode/mcp.json   # expected: " M .vscode/mcp.json"
```

**STOP if:** ANCHOR MISMATCH; mcp.json is not tracked (unexpected); stash@{3} doesn't show `packages/cli/package.json`.

---

## Step A — Safety Setup (branch switch + restore mcp.json)

**Scope:** 0 file changes committed. Working-tree change only.

```bash
# A1. Switch from story/STORY-208 to main
git checkout main
# Expected output: Switched to branch 'main'. Your branch is up to date with 'origin/main'.
# Note: story/STORY-208 was at the same SHA as main — no commits lost.
# The mcpServerManager.ts cosmetic diff may persist in working tree — that is OK (trivial whitespace).

# A2. Confirm on main
git branch --show-current    # expected: main
git rev-parse HEAD           # expected: 829d5e2 (same SHA as before)

# A3. Restore .vscode/mcp.json to committed state (removes hardcoded path)
git checkout HEAD -- .vscode/mcp.json
# Expected: silent (no output); file reverts to ${workspaceFolder}-template version

# A4. Verify mcp.json is clean
git status --short .vscode/mcp.json  # expected: empty (no output)
```

**Error handling:** If `git checkout main` reports uncommitted changes (shouldn't happen — SHA is same), stash them first: `git stash push -m "pre-cleanup WIP"`.

---

## Step B — Delete `bug/BUG-060` Branch

**Scope:** 0 file changes. Branch deletion only.

```bash
# B1. Verify fully merged before deleting
git merge-base --is-ancestor bug/BUG-060 HEAD && echo "SAFE: fully merged"

# B2. Delete local branch
git branch -d bug/BUG-060
# Expected: Deleted branch bug/BUG-060 (was e5efdee).

# B3. Verify deletion
git branch -a | grep "bug/BUG-060"   # expected: no output
```

**Note:** No remote `origin/bug/BUG-060` exists — no remote delete needed.  
**Error handling:** If `-d` refuses (merge check fails), use `git show bug/BUG-060` to inspect; do NOT use `-D` unless you confirm the branch content is truly redundant.

---

## Step C — CHANGELOG Cherry-pick + Dedup + Commit

**Scope:** 4 files modified: `packages/{cli,extension,mcp-server,shared}/CHANGELOG.md`. One commit created on `main`.

### C1. Apply cherry-pick without auto-committing

```bash
git cherry-pick --no-commit d151296
# Expected: "cherry-pick is now in progress" or silent success
```

### C2. Verify ONLY CHANGELOG files are staged

```bash
git status --short
# Expected — ONLY these 4 lines:
#   M packages/cli/CHANGELOG.md
#   M packages/extension/CHANGELOG.md
#   M packages/mcp-server/CHANGELOG.md
#   M packages/shared/CHANGELOG.md
# (plus possible " M packages/extension/src/mcpServerManager.ts" as UNSTAGED — that is OK)
```

**STOP if any unexpected staged file appears.** Unstage it: `git restore --staged <file>`.

### C3. Dedup `packages/mcp-server/CHANGELOG.md`

After cherry-pick, the file will have two sections:
- A new `## [1.1.0-next.4] - 2026-03-06 (Pre-release)` block inserted BEFORE `## [Unreleased]`
- The existing `## [Unreleased]` block still containing STORY-122, TASK-331, TASK-330 (now duplicated)

**Remove the following 7 lines from the `## [Unreleased]` → `### Added` section** (they will be duplicates of what's in `[1.1.0-next.4]`):

```
Line to remove (1 line):
- **STORY-122:** `startHttpMcpServer` now accepts an optional `workspacePath` parameter (default: `process.cwd()`). The MCP server also reads the `DEVSTEPS_WORKSPACE` environment variable as the primary source for workspace path resolution, enabling seamless in-process operation when launched by the VS Code extension.

Lines to remove (5 lines: main bullet + 4 sub-bullets):
- **TASK-331:** Two new MCP tools for dispatch-manifest audit trail:
  - `write_dispatch_manifest` — write a `DispatchManifest` at coord fan-out time. UUID-named file (`dispatch-manifest-{dispatch_id}.json`) records all dispatched agents with `status=pending`. Storage: `.devsteps/cbp/{sprint_id}/dispatch-manifest-{dispatch_id}.json`.
  - `patch_dispatch_manifest` — update a single dispatch entry by `mandate_id` when a MandateResult arrives. Sets `completed_at`, `duration_ms`, `status`, `confidence`, and `output_tokens_approx`. Reads and rewrites atomically.
  - `DispatchEntrySchema` and `DispatchManifestSchema` added to `@schnick371/devsteps-shared` (`packages/shared/src/schemas/cbp-mandate.ts`).
  - See `packages/mcp-server/LOGGING.md` § Dispatch Manifest for full lifecycle documentation.

Line to remove (1 line):
- **TASK-330:** `read_mandate_results` now returns an envelope `{ results[], count, quorum_ok, missing_analysts, dispatched, received, threshold, status }` instead of a bare array. New optional input parameters `expected_agent_names` (string[]) and `dispatch_id` (string) added. When `expected_agent_names` is omitted all quorum fields are `undefined` — fully backward compatible. `status` is `'quorum_met'` or `'quorum_failed'` when quorum tracking is active.
```

**Lines to KEEP in `## [Unreleased]`** (not in `[1.1.0-next.4]`):
- `### Added` header (keep)
- `- **STORY-121 TASK-274:**` MCP Prompts capability (keep)
- `- **STORY-121 TASK-275:**` MCP Resource (keep)
- `- **STORY-121 TASK-273:**` `devsteps_context` standard level (keep)
- `- **STORY-121 TASK-276:**` Stale-context warning (keep)
- `### Fixed` header (keep)
- `- **BUG-056:**` Markdown description normalizer (keep)

**Expected `## [Unreleased]` section after dedup:**

```markdown
## [Unreleased]

### Added
- **STORY-121 TASK-274:** MCP Prompts capability (`prompts: {}`) with three workflow prompts:
  - `devsteps-onboard` — loads live project context at session start
  - `devsteps-sprint-review` — instructs AI to call `devsteps_context(standard)` and summarise sprint state
  - `devsteps-commit-message` — generates a Conventional Commits template for a given item ID
- **STORY-121 TASK-275:** MCP Resource `devsteps://project-context` (MIME: `text/plain`, `annotations.priority: 1.0`) — returns live quick context as formatted Markdown for auto-injection by supporting clients.
- **STORY-121 TASK-273:** `devsteps_context` tool now supports `standard` level (returns `in_progress`, `blocking_items`, `open_items_count`, `key_paths`).
- **STORY-121 TASK-276:** Stale-context warning appended to tool `message` when `PROJECT.md` is older than 24 h or missing — guides AI to run `devsteps context generate`.

### Fixed
- **BUG-056:** Markdown description files no longer contain literal `\n` escape sequences. Fix is in `@schnick371/devsteps-shared` (`normalizeMarkdown` utility applied in `addItem` and `updateItem`). The regression was introduced when GitHub Copilot ≥ v1.0.0 started transmitting multiline tool arguments as escape sequences rather than real newline characters.
```

### C4. Verify dedup result

```bash
# Should NOT contain STORY-122, TASK-330, TASK-331 in [Unreleased]:
grep -n "TASK-330\|TASK-331\|STORY-122" packages/mcp-server/CHANGELOG.md
# Expected output (only in [1.1.0-next.4] block, NOT in [Unreleased]):
#   lines referencing these in the [1.1.0-next.4] section only

# Should still contain STORY-121 entries:
grep -n "STORY-121\|BUG-056" packages/mcp-server/CHANGELOG.md
# Expected: multiple hits in [Unreleased]
```

### C5. Single commit with all 4 CHANGELOG files

```bash
git add packages/cli/CHANGELOG.md packages/extension/CHANGELOG.md \
        packages/mcp-server/CHANGELOG.md packages/shared/CHANGELOG.md

# Verify exactly 4 files staged, nothing else:
git status --short | grep "^M"   # expected: 4 lines only

git commit -m "docs: add CHANGELOG entries for 1.1.0-next.4 release"
# Expected: [main <sha>] docs: add CHANGELOG entries for 1.1.0-next.4 release
#            4 files changed, ...insertions(+), ...deletions(-)
```

**Error handling:** If cherry-pick reports a conflict, inspect with `git diff`. Conflicts are unexpected (pure addition). If they occur, resolve manually by accepting the incoming `[1.1.0-next.4]` block and keeping the existing `[Unreleased]` section, then proceed to C3.

---

## Step D — Archive `next/1.1.0-next.4`

**Scope:** 2 local branch ops + 1 remote delete. No commits created.

```bash
# D1. Create archive branch at the tip of next/1.1.0-next.4 BEFORE deleting
git branch archive/releases/1.1.0-next.4 next/1.1.0-next.4
# Expected: (no output — branch created)

# D2. Verify archive branch points to correct SHA
git rev-parse archive/releases/1.1.0-next.4   # should match tip of next/1.1.0-next.4
git log --oneline archive/releases/1.1.0-next.4 -1   # expected: f173e65 chore(extension)...

# D3. Delete local next/1.1.0-next.4
git branch -D next/1.1.0-next.4
# -D required (not merged into main; tag provides permanent anchor)
# Expected: Deleted branch next/1.1.0-next.4 (was f173e65).

# D4. Delete remote origin/next/1.1.0-next.4
git push origin --delete next/1.1.0-next.4
# Expected: To https://github.com/Schnick371/devsteps.git
#            - [deleted]         next/1.1.0-next.4

# D5. Verify: tag still exists (permanent anchor)
git tag -l "v1.1.0-next.4"   # expected: v1.1.0-next.4

# D6. Verify cleanup
git branch -a | grep "1.1.0-next.4"
# Expected: only "archive/releases/1.1.0-next.4" (local); remote tracking ref removed
```

**NOTE:** The tag `v1.1.0-next.4` anchors the commit permanently. History is NOT lost by deleting the branch.  
**Error handling:** `git push origin --delete` requires network. If it fails due to auth or network, retry. Do NOT skip this step — leaving the remote branch defeats the archiving intent.

---

## Step E — Add `packages/sandbox/` to `.gitignore`

**Scope:** 1 file modified (`.gitignore`). One commit created on `main`.

```bash
# E1. Inspect current .gitignore bottom for context
tail -5 .gitignore

# E2. Append sandbox entry
echo "packages/sandbox/" >> .gitignore

# E3. Verify entry was added correctly (no duplication)
grep "packages/sandbox" .gitignore    # expected: exactly 1 hit

# E4. Verify sandbox directory becomes untracked
git status packages/sandbox/          # expected: "?? packages/sandbox/" (untracked)

# E5. Commit
git add .gitignore
git commit -m "chore: gitignore packages/sandbox experimental directory"
# Expected: [main <sha>] chore: gitignore packages/sandbox experimental directory
#            1 file changed, 1 insertion(+)
```

**Error handling:** If `grep` returns 0 results, the append failed. Check `.gitignore` encoding and try `printf '\npackages/sandbox/\n' >> .gitignore`.

---

## Step F — Stash Cleanup (descending order)

**Scope:** 11 stashes dropped irreversibly. Stashes {1} and {3} preserved.

### Pre-drop state (confirmed):

| Index | SHA prefix | Description | Decision |
|-------|-----------|-------------|----------|
| {0} | 67c1ec2 | WIP task/TASK-345-346 toolnames | DROP |
| {1} | 45770f2 | WIP github-v1 initial release | **KEEP** |
| {2} | fa96eff | WIP github-v1 initial release | DROP |
| {3} | **866047809ebb** | CLI npx binary fix | **KEEP** |
| {4} | ed31498 | next/0.8.1-next.5 | DROP |
| {5} | 8bc2351 | story/STORY-081 | DROP |
| {6} | — | next/0.7.0-next.3 draft | DROP |
| {7} | — | WIP on main 3a1ad82 | DROP |
| {8} | — | WIP on main 2a392dd | DROP |
| {9} | — | On main package-lock.json | DROP |
| {10} | — | STORY-056/STORY-061 | DROP |
| {11} | — | epic/EPIC-015 before release | DROP |
| {12} | — | TASK-080 completion before recovery | DROP |

### F1. Capture SHA anchor before any drops

```bash
STASH3_SHA=$(git rev-parse stash@{3})
echo "ANCHOR: $STASH3_SHA"   # must be 866047809ebb33bf98f57226b3616980a6ffdee2
```

### F2. Drop in DESCENDING index order (12 → 4)

Drop stashes from highest index down to 4. Descending order ensures lower indices are stable:

```bash
git stash drop stash@{12}
git stash drop stash@{11}
git stash drop stash@{10}
git stash drop stash@{9}
git stash drop stash@{8}
git stash drop stash@{7}
git stash drop stash@{6}
git stash drop stash@{5}
git stash drop stash@{4}
```

### F3. Intermediate verification (MANDATORY before continuing)

After dropping {4}, stash list should be {0,1,2,3} — original indices intact:

```bash
git stash list
# Expected:
# stash@{0}: WIP on task/TASK-345-346-toolnames-think: ...
# stash@{1}: WIP on github-v1: 45770f2 ...
# stash@{2}: WIP on github-v1: fa96eff ...
# stash@{3}: On main: CLI npx binary fix - for later release

# Verify anchor still at index 3
git rev-parse stash@{3}   # must still equal 866047809ebb33bf98f57226b3616980a6ffdee2
```

**STOP if anchor SHA does not match.** Do not drop anything else.

### F4. Drop stash@{2} (orig {2} — github-v1 empty diff)

```bash
git stash drop stash@{2}
# Expected: Dropped stash@{2} (fa96eff...)
# After this: {0}=orig{0}, {1}=orig{1}, {2}=orig{3} ← index shift!
```

### F5. Verify anchor shifted to index 2

```bash
git stash list
# Expected:
# stash@{0}: WIP on task/TASK-345-346-toolnames-think: ...
# stash@{1}: WIP on github-v1: 45770f2 ...
# stash@{2}: On main: CLI npx binary fix - for later release   ← orig {3}

# Verify anchor (now at index 2)
git rev-parse stash@{2}   # must equal 866047809ebb33bf98f57226b3616980a6ffdee2
```

**STOP if SHA doesn't match.** Original {3} is not at {2}.

### F6. Drop stash@{0} (orig {0} — TASK-345 obsolete)

```bash
git stash drop stash@{0}
# Expected: Dropped stash@{0} (some SHA)
# After this: {0}=orig{1} (github-v1 LOW RISK), {1}=orig{3} (CLI fix)
```

### F7. Final stash state verification

```bash
git stash list
# Expected exactly 2 stashes:
# stash@{0}: WIP on github-v1: 45770f2 feat: DevSteps 1.0.0 - Initial public release
# stash@{1}: On main: CLI npx binary fix - for later release

# Verify CLI fix anchor (now at index 1)
git rev-parse stash@{1}   # must equal 866047809ebb33bf98f57226b3616980a6ffdee2

# Verify CLI fix content
git stash show stash@{1}   # must show: packages/cli/package.json | 1 +
```

**If anchor SHA does not match stash@{1}:** Check `git reflog stash` for recovery. The stash is not deleted on an index-mismatch discovery, so use `git show <SHA>` to locate it.

---

## Step G — Build and Test Verification

```bash
npm run build && npm test
# Expected: zero errors, all tests pass
```

If tests fail:
1. Check whether the CHANGELOG edits broke any CHANGELOG-parsing tests
2. Check `.gitignore` change didn't accidentally exclude a tracked file
3. The cherry-pick only modified CHANGELOG files — no code was changed, so test failures would be pre-existing

---

## Step H — OPTIONAL: Push `origin-private/main` (User Decision Required)

`origin-private/main` is 14 commits behind `origin/main`. The new cherry-pick commit (Step C) adds a 15th commit gap.

**Risk:** This push is non-destructive (fast-forward only — no force push).

User must confirm before running:

```bash
# Preview what will be pushed
git log origin-private/main..main --oneline

# Push (only after user confirmation)
git push origin-private main
# Expected: fast-forward push, no rejection
```

**Do NOT force-push.** If origin-private/main has diverged, resolve with `git fetch origin-private && git log --graph --oneline` before proceeding.

---

## Final Repository State

### Branches (local)

| Branch | SHA | Note |
|--------|-----|------|
| `main` | new SHA (2 commits added) | HEAD; CHANGELOG cherry-pick + .gitignore |
| `story/STORY-208` | 829d5e2 (unchanged) | Active WIP branch; not touched |
| `archive/releases/1.1.0-next.4` | f173e65 | NEW — preserves pre-release tip |
| ~~`bug/BUG-060`~~ | deleted | Was fully merged; no loss |
| ~~`next/1.1.0-next.4`~~ | deleted | Tag `v1.1.0-next.4` anchors history |

### Remote Branches

| Remote ref | Status |
|-----------|--------|
| `origin/main` | In sync (0 commits ahead after Step C) — **push `main` to origin after cherry-pick** |
| `origin/next/1.1.0-next.4` | Deleted (Step D4) |
| `origin-private/main` | Unsynced until Step H |

**IMPORTANT:** After Step C, push `main` to `origin`:
```bash
git push origin main
```
This keeps the public GitHub repo current.

### Stashes (final)

| Index | Description |
|-------|-------------|
| `stash@{0}` | WIP on github-v1 — LOW RISK prompt change (formerly stash@{1}) |
| `stash@{1}` | CLI npx binary fix — PRESERVE for future release (formerly stash@{3}; SHA `866047809ebb33bf98f57226b3616980a6ffdee2`) |

### Files Changed (net)

| File | Change |
|------|--------|
| `packages/cli/CHANGELOG.md` | `[1.1.0-next.4]` section added |
| `packages/extension/CHANGELOG.md` | `[1.0.3]` section added |
| `packages/mcp-server/CHANGELOG.md` | `[1.1.0-next.4]` section added; 7 duplicate lines removed from `[Unreleased]` |
| `packages/shared/CHANGELOG.md` | `[1.1.0-next.4]` section added |
| `.gitignore` | `packages/sandbox/` appended |

---

## Risk Register (Residual)

| Risk | Mitigation Applied |
|------|--------------------|
| mcp.json hardcoded path committed | Step A3 restores to HEAD before any staging |
| Wrong stash dropped by index shift | Descending drop order + SHA anchor check at F3, F5, F7 |
| Cherry-pick stages unexpected files | `git status` check at C2 before edits |
| CHANGELOG duplication in mcp-server | Exact 7 lines identified + dedup at C3 |
| Remote branch deletion is irreversible | Archive branch created at D1 before deletion; tag preserves history |
| origin-private not synced | Flagged as explicit optional Step H |

---

## Execution Summary for `exec-impl`

Execute steps in order: **A → B → C → D → E → F → G → (H: pause for user)**

Do not skip the intermediate verification at **F3** and **F5**.  
Do not use `git add -A` during Step C — stage only the 4 CHANGELOG files explicitly.  
Commit messages are specified exactly — use them verbatim.

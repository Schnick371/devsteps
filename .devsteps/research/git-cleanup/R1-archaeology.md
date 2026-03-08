# R1 Archaeology — Git Repository Cleanup

**Date:** 2026-03-08  
**Analyst:** devsteps-R1-analyst-archaeology  
**Mandate:** Build complete authoritative picture of repository branch/stash state for safe cleanup

---

## 1. Branch State Summary

### `bug/BUG-060` — SAFE TO DELETE
- 0 unique commits vs main (fully merged via `e5efdee merge: bug/BUG-060 → main`)
- No pending work; safe to delete both local and remote (if remote exists)

### `story/STORY-208` — LEAVE ALONE
- Same SHA as main (`829d5e2`); branch was just created for in-progress STORY-208 work
- Has **2 uncommitted working-tree changes** (not staged, not stashed):
  - `.vscode/mcp.json` — reformatted JSON; added active `devsteps` stdio server entry with **hardcoded workspace path** `/home/th/dev/projekte/playground/devsteps` (⚠ should not be committed with hardcoded path)
  - `packages/extension/src/mcpServerManager.ts` — single-line cosmetic change to tooltip concatenation
- **Action: do not touch**; this is the active development branch

### `next/1.1.0-next.4` — NEEDS DECISION
- 4 unique commits vs main, all from 2026-03-06
- `origin/next/1.1.0-next.4` exists (already pushed)
- Main's CHANGELOGs **do NOT contain the 1.1.0-next.4 section** (main jumps from `[Unreleased]` → `[1.0.0-next.2]`)
- The 4 unique commits are **version-bump + CHANGELOG only** — no functional code changes
- Archive candidate: `archive/releases/1.1.0-next.4` (consistent with `archive/releases/1.1.0-next.1`)

### `archive/*` branches — NO ACTION
Already archived; no changes needed.

---

## 2. `next/1.1.0-next.4` — Full CHANGELOG Content (all 4 packages)

### 2a. `packages/cli/CHANGELOG.md` — section added

```markdown
## [1.1.0-next.4] - 2026-03-06 (Pre-release)

### ⚠️ Experimental Features

- Agent file frontmatter CI validation (TASK-350): agents CI tests enforce `user-invocable: false` for all non-coord leaf agents
- `mcpActive` context key for VS Code extension (TASK-351)
- `prepack` hook syncs `.github/` Copilot files into package before publish (TASK-349)

### Fixed

- BUG-067: 14 leaf agent files corrected to `user-invocable: false`
- Stale tool names updated, `think` tool added to agent files (TASK-345/346)
- Removed `agent` tool from 16 leaf-node agent files (BUG-063)

### Testing Needed

- `devsteps --version` shows `1.1.0-next.4` after install
- Agent file CI test suite (397 tests) passes
```

### 2b. `packages/mcp-server/CHANGELOG.md` — section added

```markdown
## [1.1.0-next.4] - 2026-03-06 (Pre-release)

### ⚠️ Experimental Features

- **TASK-330**: `read_mandate_results` now returns quorum envelope `{results[], count, quorum_ok, missing_analysts, dispatched, received, threshold, status}` — **BREAKING CHANGE**: callers must iterate `.results[]`
- **TASK-331**: New MCP tools `write_dispatch_manifest` + `patch_dispatch_manifest` for audit trail
- **TASK-332**: `createDispatchLogger(dispatchId?, parent?)` pino structured logging
- **TASK-333**: VS Code version runtime guard in `extension.activate()`
- **STORY-122**: In-process HTTP MCP server (Express) launchable from VS Code extension host
- MCP preflight protocol: `coord` must call `mcp_devsteps_status` before any dispatch (TASK-352)

### Fixed

- BUG-064/065/066: `sprint_id` path traversal, char limit enforcement, ENOENT on missing dirs, string coercion
- BUG-067: All 14 leaf agent files set to `user-invocable: false`
- Agent tool name updates + `think` tool support (TASK-345/346)

### Known Issues

- BATS waterfall relation-conflict test (2 tests) fail due to pre-existing test script mismatch with TASK-097 conflict validation — not a regression

### Testing Needed

- `read_mandate_results` quorum envelope in full Spider Web dispatch cycle
- `write_dispatch_manifest` / `patch_dispatch_manifest` round-trip
- HTTP MCP server transport with VS Code extension
```

### 2c. `packages/shared/CHANGELOG.md` — section added

```markdown
## [1.1.0-next.4] - 2026-03-06 (Pre-release)

### ⚠️ Experimental Features

- CBP MandateResult schema split: `ReadMandateResultSchema` / `WriteMandateResultSchema` (TASK-334)
- `read_mandate_results` returns quorum envelope `{results[], count, quorum_ok, missing_analysts, ...}` — **BREAKING**: iterate `.results[]`, not bare array (TASK-330)
- `DispatchManifestSchema` for audit trail (TASK-331)
- `analyst` field regex validation: must match `devsteps-R{N}-{name}` format
- `sprint_id` path-traversal guard regex

### Fixed

- BUG-064/065/066: sprint_id path traversal, char limits, ENOENT handling, string coercion in MandateResult
- BUG-067: 14 leaf agent files had `user-invocable: true` (should be false) — CI gate now enforces this

### Testing Needed

- `read_mandate_results` quorum envelope in agent workflows
- `write_mandate_result` with new `WriteMandateResultSchema` validation
- Sprint_id regex accepts all valid IDs (alphanumeric, dash, underscore, dot)
```

### 2d. `packages/extension/CHANGELOG.md` — section added

```markdown
## [1.0.3] - 2026-03-06 (Pre-release)

### ⚠️ Experimental Features

- `mcpActive` context key registered in `activate()`: when true, MCP server connected (TASK-351)
- VS Code version runtime guard in `activate()` — warns if engine requirement not met (TASK-333)
- In-process HTTP MCP server support (STORY-122)
- Marketplace listing metadata aligned to VS Code Marketplace standards (STORY-124)

### Fixed

- Extension `channel: 'next'` field ensures `isPreRelease()` returns true correctly

### Testing Needed

- Install as pre-release via Marketplace and switch to "Pre-Release" in extension panel
- Verify `mcpActive` context activates when MCP server connects
```

---

## 3. Main CHANGELOG Gap Assessment

**CONFIRMED: main's CHANGELOGs are missing the 1.1.0-next.4 entries across all 4 packages.**

| Package | Main current top entry | Missing section |
|---------|----------------------|-----------------|
| cli | `[Unreleased]` → `[1.0.0-next.2]` | `[1.1.0-next.4]` |
| mcp-server | `[Unreleased]` → `[1.0.0-next.2]` | `[1.1.0-next.4]` |
| shared | `[Unreleased]` → `[1.0.0-next.2]` | `[1.1.0-next.4]` |
| extension | `[1.1.0]` → `[1.0.2]` | `[1.0.3]` (next.4's extension bump) |

The 1.1.0-next.4 release branch was **never merged back into main** — only version bumps/CHANGELOGs were isolated to the next branch. This is intentional for pre-release channels.

---

## 4. Package Version Gap (main vs next/1.1.0-next.4)

| Package | main version | next/1.1.0-next.4 version |
|---------|-------------|--------------------------|
| cli | `1.1.0-next.2` | `1.1.0-next.4` |
| mcp-server | `1.1.0-next.2` | `1.1.0-next.4` |
| shared | `1.0.0-next.2` | `1.1.0-next.4` |
| extension | `1.0.2` | `1.0.4` |

The version bumps on the next branch were **intentional release artifacts** — they should stay on the next branch (or be archived). Main should NOT inherit these version bump commits since they were pre-release-only.

---

## 5. Remote Sync Status

- `git log origin/main..HEAD --oneline` → **empty output** (exit 0) → main and origin/main are **fully in sync** (829d5e2)
- `origin-private/main` is 14 commits behind — deliberate (private remote may lag)
- `origin/next/1.1.0-next.4` already pushed — ready for archiving/deletion after archival

---

## 6. packages/sandbox/ — Gitignore Situation

- `grep sandbox .gitignore` → **no match** (exit code 1)
- `packages/sandbox/` is **neither tracked nor gitignored**
- This is a risk: any future `git add .` could accidentally stage it
- Recommendation: add `packages/sandbox/` to root `.gitignore` if it's a scratchpad, OR add `packages/sandbox` to workspace (`npm workspaces`) if it's meant to be developed

---

## 7. Stash Inventory Assessment

| Stash | Branch | Description | Files | Assessment |
|-------|--------|-------------|-------|------------|
| `stash@{0}` | task/TASK-345-346-toolnames-think | DevSteps index updates for TASK-345/346 completion | `.devsteps/index/` | **OBSOLETE** — TASK-345 and TASK-346 are both `done` on main (commit `1ccda14`); this stash contains intermediate index state from the work session |
| `stash@{1}` | github-v1 (45770f2) | 9 lines added to `devsteps-70-release.prompt.md` | 1 prompt file | **LOW RISK / OBSOLETE** — github-v1 is a very old early-public-release branch; prompt file has likely evolved significantly since |
| `stash@{2}` | github-v1 (fa96eff) | *(empty diff)* | 0 files | **SAFE TO DROP** — empty stash, no content |
| `stash@{3}` | main | "CLI npx binary fix" — adds `"devsteps-cli"` bin alias | `packages/cli/package.json` | **POTENTIALLY RELEVANT** — see §8 below |
| `stash@{4}` | next/0.8.1-next.5 | Unknown (older pre-release branch) | unknown | **LIKELY OBSOLETE** — 0.8.x was many months ago |
| `stash@{5}` | story/STORY-081-mcp-refs-migration | STORY-081.json status update | `.devsteps/items/stories/` | **LIKELY OBSOLETE** — DevSteps item status change; may be superseded by actual story completion work |
| `stash@{6}` | next/0.7.0-next.3 | devsteps-plan-work.prompt.md selection | 1 prompt file | **OBSOLETE** — 0.7.x branch, very old |
| `stash@{7}` | main (3a1ad82) | Unknown | unknown | **LIKELY OBSOLETE** — old commit SHA, work integrated months ago |
| `stash@{8}` | main (2a392dd) | Unknown | unknown | **LIKELY OBSOLETE** — old commit SHA |
| `stash@{9}` | main | package-lock.json before STORY-073 | package-lock.json | **OBSOLETE** — STORY-073 completed long ago |
| `stash@{10}` | story/STORY-056 | STORY-061 planning items (old .devsteps/ data format) | `.devsteps/epics/` `.devsteps/stories/` | **OBSOLETE** — old path format (`epics/` not `items/epics/`); pre-migration data |
| `stash@{11}` | epic/EPIC-015 | WIP before release 0.6.6 | `.devsteps/` data | **OBSOLETE** — 0.6.6 was released months ago |
| `stash@{12}` | main | WIP TASK-080 before recovery | unknown | **LIKELY OBSOLETE** — TASK-080 completed in recovery |

---

## 8. stash@{3} "CLI npx binary fix" — Detailed Assessment

**Content:** Adds a second binary entry `"devsteps-cli"` alongside `"devsteps"` in `packages/cli/package.json`:

```json
"bin": {
  "devsteps-cli": "./dist/index.cjs",   // <-- stash adds this
  "devsteps": "./dist/index.cjs",
  "devsteps-tsx": "./bin/devsteps-tsx.js"
}
```

**Current state of main:** Only has `"devsteps"` and `"devsteps-tsx"` — the `"devsteps-cli"` alias is **NOT present on main**.

**Assessment:** This stash is labeled "for later release" — it was intentionally deferred. The alias would help resolve npx invocation ambiguity (`npx devsteps-cli` vs `npx devsteps`). **WORTH PRESERVING** — not yet integrated. Recommend creating a TASK for it or applying it to the next release branch. Do NOT silently drop.

---

## 9. STORY-208 WIP — Detailed Assessment

Two uncommitted modifications on the working tree of `story/STORY-208`:

### `.vscode/mcp.json` (⚠ CAUTION)
- Reformatted from comment-only to an active server entry
- **Hardcoded absolute path:** `"args": ["-y", "--package=@schnick371/devsteps-mcp-server@next", "devsteps-mcp", "/home/th/dev/projekte/playground/devsteps"]`
- This path should not be committed — it will break for any other developer
- Suggests this is **debugging/testing state**, not production-ready
- The extension auto-manages MCP via `registerMcpServerDefinitionProvider` — the manual entry conflicts with that

### `packages/extension/src/mcpServerManager.ts`
- One-line cosmetic change: multi-line tooltip string consolidation to single line
- No functional impact; looks like editor auto-formatting

**Assessment:** STORY-208 WIP is in testing/diagnostic mode. The `.vscode/mcp.json` change should NOT be committed as-is (hardcoded path). The `mcpServerManager.ts` change is trivial.

---

## 10. Adversarial Gap Audit

**What might break the cleanup that I didn't find?**

1. **stash@{0} index state**: While TASK-345/346 are `done` on main, the stash contains intermediate `.devsteps/index/` mutations. If dropped, nothing is lost — the committed state on main is newer and correct.

2. **next/1.1.0-next.4 archive**: Before archiving, confirm no in-progress CHANGELOG items in the `[Unreleased]` section of the next branch that haven't been captured elsewhere. (The next branch's [Unreleased] section in mcp-server CHANGELOG contains extensive STORY-121/TASK-330/331 entries — these are also present verbatim on main under `[Unreleased]` in the mcp-server CHANGELOG via the merge-base.)

3. **stash@{3} binary alias**: Only unique relevant stash — document before dropping.

4. **packages/sandbox/ untracked**: No gitignore entry means it could leak into a `git add -A`.

---

## 11. Recommended Cleanup Actions (for coord)

| Priority | Action | Risk |
|----------|--------|------|
| 1 | Delete `bug/BUG-060` local branch | Zero risk (fully merged) |
| 2 | Add `packages/sandbox/` to `.gitignore` | Zero risk |
| 3 | Archive `next/1.1.0-next.4` → `archive/releases/1.1.0-next.4` | Low risk; push and delete |
| 4 | Drop stashes: `{0}`, `{2}`, `{4}`, `{6}`, `{7}`, `{8}`, `{9}`, `{10}`, `{11}`, `{12}` | Low (all obsolete) |
| 5 | Review stash@{1} (prompt file) — compare with current version before dropping | Low risk |
| 6 | Review stash@{5} (STORY-081 status) — check if STORY-081 is done before dropping | Low risk |
| 7 | **PRESERVE** stash@{3} — create TASK for `devsteps-cli` npx alias feature OR move to a named branch | **IMPORTANT** |
| 8 | Do NOT commit `.vscode/mcp.json` with hardcoded path as part of STORY-208 | Medium risk if forgotten |

---

**verdict:** `GO` (cleanup is safe with caveats in §11)  
**confidence:** 0.93  
**report_path:** `.devsteps/research/git-cleanup/R1-archaeology.md`

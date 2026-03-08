# R2-Impact Analysis — Git Repository Cleanup

**Analyst:** aspect-impact  
**Date:** 2026-03-08  
**Task:** Git repository cleanup (8 planned operations)  
**Upstream:** R1-archaeology.md, R1-risk.md

---

## Impact Analysis

### Stated Scope

1. `git checkout main` (from story/STORY-208, same SHA)
2. `git checkout HEAD -- .vscode/mcp.json` (restore tracked file from WIP)
3. Delete `bug/BUG-060` local branch
4. Cherry-pick `d151296` (CHANGELOG only) into main, dedup `packages/mcp-server/CHANGELOG.md`, commit
5. Create archive branch `archive/releases/1.1.0-next.4` at `next/1.1.0-next.4`
6. Delete local `next/1.1.0-next.4` and remote `origin/next/1.1.0-next.4`
7. Drop stashes 12→0 descending (skip stash@{3})
8. Add `packages/sandbox/` to `.gitignore`, commit

---

### Ripple Map

| Symbol / File | Type | Why Affected |
|---|---|---|
| `packages/mcp-server/CHANGELOG.md` (lines 5–25) | DIRECT | Cherry-pick inserts `[1.1.0-next.4]` block; `[Unreleased]` content duplicates TASK-330/331/STORY-122 — manual dedup required |
| `packages/cli/CHANGELOG.md` | IMPLICIT | `d151296` touches 4 CHANGELOG files; apply same pattern check |
| `packages/shared/CHANGELOG.md` | IMPLICIT | Same — touched by d151296 |
| `packages/extension/CHANGELOG.md` | IMPLICIT | Same — touched by d151296 |
| `.vscode/mcp.json` | DIRECT | Restore from HEAD discards local absolute-path WIP; working tree reverts to tracked template content |
| `packages/extension/src/mcpServerManager.ts` | SILENT | WIP diff on story/STORY-208 is FORMAT-ONLY (tooltip string wrap, same text). No semantic content at risk. |
| `origin-private/main` | IMPLICIT | 14 commits ahead of `origin-private/main`; NO automatic sync — **requires manual `git push origin-private main`** |
| `origin/main` (public GitHub) | NONE | Already at parity (0 commits ahead); no push needed |
| `origin/next/1.1.0-next.4` (remote) | DIRECT | Deletion is irreversible once pushed; archive branch preserves lineage |
| `archive/releases/1.1.0-next.4` (new local) | DIRECT | Net-new branch; no remote `archive/*` refs exist (confirmed) — first push will create remote ref |
| stashes 0,2,4,5,6,7,8,9,10,11,12 | DIRECT | Dropped irreversibly; WIP content permanently lost |
| stash@{3} SHA `866047809ebb33bf98f57226b3616980a6ffdee2` | SILENT | Must be explicitly skipped — drop by SHA position only after confirming index hasn't shifted |
| `.gitignore` | DIRECT | Adding `packages/sandbox/` untracks sandbox directory going forward |
| `packages/sandbox/` (directory contents) | IMPLICIT | Becomes untracked after `.gitignore` change; any future tracked files removed from index |

---

### CHANGELOG Duplication — Exact Lines to Remove After Cherry-Pick

**Current state (main, pre-cherry-pick):**

```
Line  5: ## [Unreleased]
Line  7: ### Added
Line  8: - **STORY-122:** `startHttpMcpServer` now accepts an optional `workspacePath`...
Line  9: - **TASK-331:** Two new MCP tools for dispatch-manifest audit trail:
Line 10:   - `write_dispatch_manifest` — ...
Line 11:   - `patch_dispatch_manifest` — ...
Line 12:   - `DispatchEntrySchema` and `DispatchManifestSchema` added...
Line 13:   - See `packages/mcp-server/LOGGING.md`...
Line 14: - **TASK-330:** `read_mandate_results` now returns an envelope...
Line 15: - **STORY-121 TASK-274:** MCP Prompts capability...  ← KEEP (not in 1.1.0-next.4)
...
Line 21: - **STORY-121 TASK-276:** Stale-context warning...  ← KEEP
Line 23: ### Fixed
Line 24: - **BUG-056:** Markdown description files...          ← KEEP (not in 1.1.0-next.4)
```

**After cherry-pick, `d151296` inserts 30 lines before line 5.** The `[Unreleased]` section shifts down by 30 lines. The following items become **DUPLICATE** (exist in both `[1.1.0-next.4]` and `[Unreleased]`):

| Item | In [1.1.0-next.4]? | In [Unreleased]? | Action |
|------|-------------------|-----------------|--------|
| STORY-122 | ✓ (Experimental Features) | ✓ (Added, line 8) | **REMOVE from [Unreleased]** |
| TASK-331 | ✓ (Experimental Features) | ✓ (lines 9–13) | **REMOVE from [Unreleased]** (all 5 lines) |
| TASK-330 | ✓ (Experimental Features) | ✓ (line 14) | **REMOVE from [Unreleased]** |
| STORY-121 TASK-274/275/273/276 | ✗ | ✓ (lines 15–21) | **KEEP in [Unreleased]** |
| BUG-056 | ✗ | ✓ (line 24) | **KEEP in [Unreleased]** |
| TASK-332/333/352 | ✓ | ✗ | Already only in [1.1.0-next.4] |
| BUG-064/065/066/067 | ✓ | ✗ | Already only in [1.1.0-next.4] |

**Exact block to remove from `[Unreleased]` after cherry-pick** (post-shift line numbers will be +30):

```markdown
- **STORY-122:** `startHttpMcpServer` now accepts an optional `workspacePath` parameter (default: `process.cwd()`). The MCP server also reads the `DEVSTEPS_WORKSPACE` environment variable as the primary source for workspace path resolution, enabling seamless in-process operation when launched by the VS Code extension.
- **TASK-331:** Two new MCP tools for dispatch-manifest audit trail:
  - `write_dispatch_manifest` — write a `DispatchManifest` at coord fan-out time. UUID-named file (`dispatch-manifest-{dispatch_id}.json`) records all dispatched agents with `status=pending`. Storage: `.devsteps/cbp/{sprint_id}/dispatch-manifest-{dispatch_id}.json`.
  - `patch_dispatch_manifest` — update a single dispatch entry by `mandate_id` when a MandateResult arrives. Sets `completed_at`, `duration_ms`, `status`, `confidence`, and `output_tokens_approx`. Reads and rewrites atomically.
  - `DispatchEntrySchema` and `DispatchManifestSchema` added to `@schnick371/devsteps-shared` (`packages/shared/src/schemas/cbp-mandate.ts`).
  - See `packages/mcp-server/LOGGING.md` § Dispatch Manifest for full lifecycle documentation.
- **TASK-330:** `read_mandate_results` now returns an envelope `{ results[], count, quorum_ok, missing_analysts, dispatched, received, threshold, status }` instead of a bare array. New optional input parameters `expected_agent_names` (string[]) and `dispatch_id` (string) added. When `expected_agent_names` is omitted all quorum fields are `undefined` — fully backward compatible. `status` is `'quorum_met'` or `'quorum_failed'` when quorum tracking is active.
```

**Result after dedup:** `[Unreleased]` will contain only STORY-121 TASK-274/275/273/276 (MCP Prompts/Resources) + BUG-056 (markdown normalizer) — these are genuinely unreleased items not captured in `[1.1.0-next.4]`.

---

### Breaking Changes

None introduced by the cleanup itself. The cherry-pick `d151296` documents existing BREAKING CHANGE (TASK-330 envelope), but this is documentation-only — no code change.

---

### Remote Sync Assessment

| Remote | Status | Action Required |
|--------|--------|-----------------|
| `origin` (public, GitHub) | **In sync** — 0 commits ahead | No push needed |
| `origin-private` (private, GitHub) | **14 commits ahead** — NOT synced automatically | **Manual `git push origin-private main` required after cleanup** |

`origin-private/main` sync is **fully manual** — no push hooks or CI trigger it. After the cherry-pick commit lands on main, it must be pushed explicitly. Recommend pushing both remotes in one step at end of cleanup sequence.

---

### STORY-208 WIP mcpServerManager.ts Assessment

```diff
-            this.statusBarItem.tooltip =
-              'DevSteps MCP: managed via .vscode/mcp.json (manual mode)';
+            this.statusBarItem.tooltip = 'DevSteps MCP: managed via .vscode/mcp.json (manual mode)';
```

**Verdict: TRIVIAL — safe to lose.** This is a pure whitespace/line-wrap reformatting of a tooltip string. Content is identical, no semantic or functional change. The `git checkout main` will carry the working-tree state, so this diff may persist in the working tree anyway (same SHA). No preservation needed.

---

### Archive Branch Impact

- No remote `archive/*` refs exist currently (confirmed: `git branch -r | grep archive` returns empty)
- Creating `archive/releases/1.1.0-next.4` at the tip of `next/1.1.0-next.4` before deletion is the only historical preservation mechanism
- **If remote archive push is intended:** `git push origin archive/releases/1.1.0-next.4` must be run explicitly (not implicit)
- **If remote archive push is NOT intended:** local-only archiving is sufficient; the branch name is human convention only

---

### Stash Drop Risk

- Stashes are LOCAL only — no remote backup
- Drops are **irreversible** — no recovery without reflog (reflog expires)
- stash@{3} at SHA `866047809ebb33bf98f57226b3616980a6ffdee2` must be skipped
- **Critical:** Index positions shift after each drop — must use `git stash drop stash@{N}` with verified index or drop by SHA; dropping descending (12→0) prevents index shifts caused by lower-numbered deletions

---

### Repository State AFTER Cleanup (Final)

**Branches (local):**
- `main` — HEAD, includes cherry-pick of d151296 CHANGELOG commit + sandbox gitignore commit
- `story/STORY-208` — same SHA as main (no commits added); still exists (not deleted by plan)
- `archive/releases/1.1.0-next.4` — new, points to former tip of `next/1.1.0-next.4`
- ~~`bug/BUG-060`~~ — deleted
- ~~`next/1.1.0-next.4`~~ — deleted

**Branches (remote `origin`):**
- `origin/main` — needs push of cherry-pick + gitignore commit
- ~~`origin/next/1.1.0-next.4`~~ — deleted
- `origin/archive/releases/1.1.0-next.4` — if push is intended

**Branches (remote `origin-private`):**
- `origin-private/main` — 14 commits behind + cherry-pick + gitignore commit; requires manual push

**Working tree:**
- `.vscode/mcp.json` — restored to tracked HEAD version (local path lost)
- `packages/mcp-server/CHANGELOG.md` — `[1.1.0-next.4]` section present; `[Unreleased]` contains only STORY-121 TASK-274/275/273/276 + BUG-056
- `.gitignore` — `packages/sandbox/` entry added
- `packages/sandbox/` — untracked (contents preserved on disk, just ignored)

**Stash list:**
- stash@{0} — formerly stash@{3} SHA `866047809ebb33bf98f57226b3616980a6ffdee2` (only survivor)

---

### Confidence

**HIGH** — All findings are based on live git state reads. The only uncertainty is whether STORY-121 TASK-274/275/273/276 items were intentionally omitted from `[1.1.0-next.4]` or accidentally. Keeping them in `[Unreleased]` is the conservative correct choice.

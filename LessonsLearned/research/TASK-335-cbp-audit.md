# TASK-335: CBP Audit — Compliance Report

**Date:** 2026-03-05  
**Analyst:** devsteps-R1-analyst-archaeology + devsteps-R4-exec-doc  
**Sprint:** SPRINT-330-335  
**Status:** Complete

---

## Executive Summary

42 MandateResult files were scanned across 8 sprint directories in `.devsteps/cbp/`. **57.1% pass** all compliance checks; 42.9% (18 files) have at least one structural issue. The dominant failure modes are:

1. **Fabricated timestamps** — `T00:00:00Z` used as placeholder (11 files, across 5 sprint dirs)
2. **Empty `item_ids: []`** — no traceability link to a DevSteps item (6 files, 2 sprint dirs)
3. **Invalid UUID format** — non–UUID v4 mandate\_id values (3 files)
4. **Short analyst name** — missing `devsteps-RN-` prefix (1 file)

workspaceStorage accumulates 91 `content.txt` files per ~3 chat sessions (16 MB for this workspace); across all 13 workspaces the total is 978 MB. No TTL mechanism exists today.

---

## 1. Sprint Directory Inventory

| Sprint Dir | Files | Date Range |
|---|---|---|
| `SPIKE-021` | 10 | 2026-03-05 |
| `SPIKE-022` | 6 | 2026-03-05 |
| `SPRINT-330-335` | 5 | 2026-03-05 |
| `TASK-293` | 5 | 2026-02-13 – 2026-03-04 |
| `TASK-296-sprint` | 6 | 2026-03-04 |
| `gpu-research-2026-03-05` | 1 | 2026-03-05 |
| `gpu-vscode-projects-2026-03-05` | 4 | 2026-03-05 |
| `plan-spider-web-dashboard-2026-03-04` | 5 | 2026-03-04 |
| **Total** | **42** | |

---

## 2. Per-File Compliance Audit Table

Legend: ✅ = compliant, ❌ = violation, ⚠ = warning

| Sprint Dir | Mandate UUID | Analyst | item\_ids | Timestamp | UUID v4 | Issues |
|---|---|---|---|---|---|---|
| SPIKE-021 | `a2b3c4d5-e6f7-4901-abcd-ef1234567890` | `devsteps-R1-analyst-archaeology` | `['SPIKE-021']` | ✅ | ✅ | **PASS** |
| SPIKE-021 | `a3f7c219-84d1-4b62-b905-e2f1c8d30a17` | `devsteps-R1-analyst-research` | `['SPIKE-021']` | ✅ | ✅ | **PASS** |
| SPIKE-021 | `a8b9c0d1-e2f3-4567-8123-456789012006` | `devsteps-R2-aspect-quality` | `['SPIKE-021']` | ✅ | ✅ | **PASS** |
| SPIKE-021 | `b3c4d5e6-f7a8-4012-bcde-f12345678901` | `devsteps-R1-analyst-risk` | `['SPIKE-021']` | ✅ | ✅ | **PASS** |
| SPIKE-021 | `b9c0d1e2-f3a4-5678-8234-567890123007` | `devsteps-R2-aspect-integration` | `['SPIKE-021']` | ✅ | ❌ | INVALID\_UUID (version nibble = 5, not 4) |
| SPIKE-021 | `c0d1e2f3-a4b5-4789-a345-678901234008` | `devsteps-R3-exec-planner` | `['SPIKE-021']` | ✅ | ✅ | **PASS** |
| SPIKE-021 | `c4d5e6f7-a8b9-4123-8def-012345678902` | `devsteps-R1-analyst-quality` | `['SPIKE-021']` | ❌ T00:00:00Z | ✅ | FAKE\_TIMESTAMP |
| SPIKE-021 | `d5e6f7a8-b9c0-4234-8de0-123456789003` | `devsteps-R2-aspect-impact` | `['SPIKE-021']` | ✅ | ✅ | **PASS** |
| SPIKE-021 | `e6f7a8b9-c0d1-4345-8f01-234567890004` | `devsteps-R2-aspect-constraints` | `['SPIKE-021']` | ✅ | ✅ | **PASS** |
| SPIKE-021 | `f7a8b9c0-d1e2-4456-8012-345678901005` | `devsteps-R2-aspect-staleness` | `['SPIKE-021']` | ✅ | ✅ | **PASS** |
| SPIKE-022 | `515b21f6-5000-4e9b-89e5-53759e7f816d` | `devsteps-R1-analyst-risk` | `['SPIKE-022']` | ✅ | ✅ | **PASS** |
| SPIKE-022 | `7a3f1d8e-4c29-4b16-9e5a-03f2d8c1b7a4` | `devsteps-R1-analyst-research` | `['SPIKE-022']` | ✅ | ✅ | **PASS** |
| SPIKE-022 | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` | `devsteps-R2-aspect-staleness-quality-integration` | `['SPIKE-022']` | ✅ | ❌ | INVALID\_UUID (version nibble = 7) |
| SPIKE-022 | `b8e2f4a6-1c3d-4e5f-9b7a-0c8d2e4f6a1b` | `devsteps-R2-aspect-impact-constraints` | `['SPIKE-022']` | ✅ | ✅ | **PASS** |
| SPIKE-022 | `f2a4c8e1-3b7d-4f56-9e02-1a8b5c3d7e4f` | `devsteps-R1-analyst-quality` | `['SPIKE-022']` | ✅ | ✅ | **PASS** |
| SPIKE-022 | `f4a9b2c8-3e71-4d05-a618-9c7b0e2f1d34` | `devsteps-R1-analyst-archaeology` | `['SPIKE-022']` | ✅ | ✅ | **PASS** |
| SPRINT-330-335 | `70ef2058-df31-4cb3-8caf-de3c4e2acf00` | `devsteps-R1-analyst-research` | `['TASK-330','TASK-331']` | ✅ | ✅ | **PASS** |
| SPRINT-330-335 | `a3f7e291-58d4-4c2b-9e16-0b7d3f8a1c05` | `devsteps-R1-analyst-archaeology` | `[all 6 tasks]` | ✅ | ✅ | **PASS** |
| SPRINT-330-335 | `a8f2e401-7c3d-4b95-9e1f-2d5a8c4f0b73` | `devsteps-R2-aspect-constraints-impact` | `[all 6 tasks]` | ✅ | ✅ | **PASS** |
| SPRINT-330-335 | `b7e3a291-4f82-4d9c-a816-0c5f7e3b2a94` | `devsteps-R1-analyst-risk` | `[all 6 tasks]` | ✅ | ✅ | **PASS** |
| SPRINT-330-335 | `f4a8d2e1-9b3c-4f7a-8e5d-2c6b1a0f9e3d` | `devsteps-R3-exec-planner` | `[all 6 tasks]` | ✅ | ✅ | **PASS** |
| TASK-293 | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` | `devsteps-R2-aspect-staleness` | `['TASK-293']` | ✅ | ❌ | INVALID\_UUID (version nibble = 7) |
| TASK-293 | `a3b5c7d9-e1f2-4a3b-8c5d-6e7f8a9b0c1e` | `devsteps-R3-exec-planner` | `['TASK-293']` | ❌ T00:00:00Z | ✅ | FAKE\_TIMESTAMP |
| TASK-293 | `a3f2c891-7e4d-4b1a-9c3f-8d2e5f1a6b90` | `devsteps-R2-aspect-constraints` | `['TASK-293']` | ❌ T00:00:00Z | ✅ | FAKE\_TIMESTAMP |
| TASK-293 | `a7f3c291-4b82-4e9d-b8a1-0d5e6f7c8901` | `devsteps-R1-analyst-archaeology` | `['TASK-293']` | ✅ | ✅ | **PASS** |
| TASK-293 | `e3f7c2a1-9b5d-4e8a-b2d6-3f7a0b4e9c1d` | `devsteps-R1-analyst-research` | `['TASK-293']` | ✅ | ✅ | **PASS** |
| TASK-296-sprint | `a1b2c3d4-0002-4001-8001-000000000002` | `devsteps-R1-analyst-archaeology` | `['TASK-296']` | ❌ T00:00:00Z | ✅ | FAKE\_TIMESTAMP |
| TASK-296-sprint | `a1b2c3d4-1001-4001-a001-000000000001` | `devsteps-R1-analyst-research` | `['TASK-296']` | ❌ T00:00:00Z | ✅ | FAKE\_TIMESTAMP |
| TASK-296-sprint | `b2c3d4e5-0003-4001-8001-000000000003` | `devsteps-R2-aspect-constraints` | `['TASK-296']` | ❌ T00:00:00Z | ✅ | FAKE\_TIMESTAMP |
| TASK-296-sprint | `b2c3d4e5-0004-4001-8001-000000000004` | `devsteps-R2-aspect-staleness` | `['TASK-296']` | ❌ T00:00:00Z | ✅ | FAKE\_TIMESTAMP |
| TASK-296-sprint | `c3d4e5f6-0005-4001-8001-000000000005` | `devsteps-R3-exec-planner` | `['TASK-296']` | ❌ T00:00:00Z | ✅ | FAKE\_TIMESTAMP |
| TASK-296-sprint | `d4e5f6a7-0006-4001-8001-000000000006` | `devsteps-R4-exec-impl` | `['TASK-296']` | ❌ T00:00:00Z | ✅ | FAKE\_TIMESTAMP |
| gpu-research-2026-03-05 | `e3a4b591-7c8d-4f2e-b3a1-c9d0e5f6a7b8` | `analyst-research` | `[]` | ❌ T00:00:00Z | ✅ | EMPTY\_ITEM\_IDS + BAD\_ANALYST\_FORMAT + FAKE\_TIMESTAMP |
| gpu-vscode-projects-2026-03-05 | `a1b2c3d4-0001-4003-8001-000000000003` | `devsteps-R1-analyst-risk` | `['EPIC-040']` | ✅ | ✅ | **PASS** |
| gpu-vscode-projects-2026-03-05 | `a1b2c3d4-0001-4004-8001-000000000004` | `devsteps-R1-analyst-quality` | `['EPIC-040']` | ✅ | ✅ | **PASS** |
| gpu-vscode-projects-2026-03-05 | `a1b2c3d4-1001-4002-8001-000000000002` | `devsteps-R1-analyst-archaeology` | `['EPIC-040']` | ✅ | ✅ | **PASS** |
| gpu-vscode-projects-2026-03-05 | `a1b2c3d4-e5f6-4a1b-8c2d-e3f4a5b6c7d8` | `devsteps-R1-analyst-research` | `['EPIC-040']` | ✅ | ✅ | **PASS** |
| plan-spider-web-dashboard-2026-03-04 | `a1b2c3d4-0001-4001-a001-000000000001` | `devsteps-R1-analyst-archaeology` | `[]` | ✅ | ✅ | EMPTY\_ITEM\_IDS |
| plan-spider-web-dashboard-2026-03-04 | `a1b2c3d4-0002-4002-8002-000000000002` | `devsteps-R1-analyst-risk` | `[]` | ✅ | ✅ | EMPTY\_ITEM\_IDS |
| plan-spider-web-dashboard-2026-03-04 | `b2c3d4e5-0003-4003-8003-000000000003` | `devsteps-R2-aspect-constraints` | `[]` | ✅ | ✅ | EMPTY\_ITEM\_IDS |
| plan-spider-web-dashboard-2026-03-04 | `b2c3d4e5-0004-4004-8004-000000000004` | `devsteps-R2-aspect-impact` | `[]` | ✅ | ✅ | EMPTY\_ITEM\_IDS |
| plan-spider-web-dashboard-2026-03-04 | `c3d4e5f6-0005-4005-8005-000000000005` | `devsteps-R3-exec-planner` | `[]` | ❌ T00:00:00Z | ✅ | EMPTY\_ITEM\_IDS + FAKE\_TIMESTAMP |

---

## 3. Summary Statistics

| Metric | Count | % |
|---|---|---|
| Total files scanned | 42 | 100% |
| **PASS** (zero issues) | **24** | **57.1%** |
| **FAIL** (one or more issues) | **18** | **42.9%** |
| `schema_version` present | 42 | 100% |

### Issue Frequency

| Issue Type | Files Affected | Sprint Dirs |
|---|---|---|
| `FAKE_TIMESTAMP` (T00:00:00Z) | 11 | SPIKE-021, TASK-293, TASK-296-sprint, gpu-research, plan-spider-web-dashboard |
| `EMPTY_ITEM_IDS` | 6 | gpu-research, plan-spider-web-dashboard |
| `INVALID_UUID` (non–v4 format) | 3 | SPIKE-021, SPIKE-022, TASK-293 |
| `BAD_ANALYST_FORMAT` | 1 | gpu-research |
| `MISSING_SCHEMA_VERSION` | 0 | — |

### Multi-Issue Files (worst offenders)

| File | Issues |
|---|---|
| `gpu-research-2026-03-05/e3a4b591-...` | 3 issues: EMPTY\_ITEM\_IDS + BAD\_ANALYST\_FORMAT + FAKE\_TIMESTAMP |
| `plan-spider-web-dashboard-2026-03-04/c3d4e5f6-...` | 2 issues: EMPTY\_ITEM\_IDS + FAKE\_TIMESTAMP |

---

## 4. Issue Analysis

### 4.1 FAKE\_TIMESTAMP Pattern

Files with `completed_at: "2026-03-04T00:00:00Z"` or `"2026-03-05T00:00:00Z"` were written with a date-only timestamp — the time component `T00:00:00Z` is midnight UTC, which is statistically implausible as a real execution time and indicates a fabricated value inserted by an agent that used `new Date().toISOString().split('T')[0] + 'T00:00:00Z'` or equivalent.

**Root cause:** The `mcp_devsteps_write_mandate_result` tool's `completed_at` field is not validated for plausibility. Agents pass a truncated ISO date string instead of `new Date().toISOString()`.

**Affected sprint dirs:** TASK-296-sprint (6/6 files — 100% contaminated), TASK-293 (2/5), SPIKE-021 (1/10), gpu-research (1/1), plan-spider-web-dashboard (1/5).

### 4.2 EMPTY\_ITEM\_IDS Pattern

The `plan-spider-web-dashboard-2026-03-04` sprint dir was created for a planning session that had not yet created DevSteps items at the time of analysis. All 5 result files have `item_ids: []`. The `gpu-research-2026-03-05` sprint also has an empty `item_ids`.

This violates the `WriteMandateResultSchema` intent (traceability): without `item_ids`, the result cannot be correlated to any backlog item.

**Root cause:** The MCP tool's Zod schema likely allows empty array for `item_ids` (no `min(1)` constraint). This should be tightened.

### 4.3 INVALID\_UUID Pattern

Three files contain mandate IDs that fail UUID v4 validation:

- `b9c0d1e2-f3a4-5678-8234-567890123007` — version nibble is `5` (UUID v5), not `4`
- `a1b2c3d4-e5f6-7890-abcd-ef1234567890` — version nibble is `7` (future/invalid)

These appear to be hand-crafted sequential IDs rather than `crypto.randomUUID()` output. The file name matches the mandate\_id, so `safeParse` on `WriteMandateResultSchema` would reject them if UUID v4 format is enforced.

### 4.4 BAD\_ANALYST\_FORMAT

One file has `analyst: "analyst-research"` — missing the required `devsteps-RN-` ring prefix. This came from the `gpu-research-2026-03-05` session, where a coord agent dispatched without using the proper agent name convention.

---

## 5. Schema Validation Assessment

If `ReadMandateResultSchema` enforces:
- `item_ids: z.array(z.string()).min(1)` → 6 files fail
- `analyst: z.string().regex(/^devsteps-R\d+-/)` → 1 file fails
- `mandate_id: z.string().uuid()` → 3 files fail (UUID v4 check)
- Real timestamp check (not enforceable via Zod alone) → 11 files fail

| Schema rule | Files failing |
|---|---|
| `item_ids.min(1)` | 6 |
| `analyst` regex | 1 |
| `mandate_id` UUID v4 | 3 |
| Real timestamp (heuristic) | 11 |
| **Any** rule | **18** |
| No rules violated | **24** |

---

## 6. workspaceStorage TTL Findings

### Current State

| Metric | Value |
|---|---|
| Total workspaceStorage entries | 13 folders |
| Total workspaceStorage size | 978 MB |
| devsteps workspace (aa6ece7a) copilot-chat size | 16 MB |
| Chat sessions in devsteps workspace | 3 |
| `content.txt` files in devsteps workspace | 91 |
| `content.txt` files across all workspaces | 95 |
| Average content.txt per session | ~30 |

### Growth Projection

Each `#runSubagent` call in a session produces one `content.txt` file. A typical Spider Web sprint (R1 × 2, R2 × 2, R3, R4 × 2, R5 = ~8 dispatches) generates roughly 8 files per sprint. At 5 sprints/week, that is ~40 files/week, ~160/month.

The 3 existing sessions have 91 files. At this rate, a single active workspace can accumulate **1,000+ files per year** without cleanup.

VS Code does not have a built-in TTL for workspaceStorage content.txt files. These are orphaned after the session closes — they are never re-read by Copilot after the session ends.

---

## 7. Files Needing Migration (item\_ids Rewrite)

The following files should have `item_ids` updated to reflect the actual DevSteps items they cover:

| File | Current item\_ids | Recommended item\_ids |
|---|---|---|
| `gpu-research-2026-03-05/e3a4b591-7c8d-4f2e-b3a1-c9d0e5f6a7b8.result.json` | `[]` | Link to the GPU research item (unknown — needs cross-reference with DevSteps backlog) |
| `plan-spider-web-dashboard-2026-03-04/a1b2c3d4-0001-4001-a001-000000000001.result.json` | `[]` | Planning session outcome items (EPIC or STORY created during that session) |
| `plan-spider-web-dashboard-2026-03-04/a1b2c3d4-0002-4002-8002-000000000002.result.json` | `[]` | Same as above |
| `plan-spider-web-dashboard-2026-03-04/b2c3d4e5-0003-4003-8003-000000000003.result.json` | `[]` | Same as above |
| `plan-spider-web-dashboard-2026-03-04/b2c3d4e5-0004-4004-8004-000000000004.result.json` | `[]` | Same as above |
| `plan-spider-web-dashboard-2026-03-04/c3d4e5f6-0005-4005-8005-000000000005.result.json` | `[]` | Same as above |

> **Note:** These 6 files cannot be retroactively corrected via `mcp_devsteps_write_mandate_result` because that tool writes *new* files by UUID. A dedicated `mcp_devsteps_patch_mandate_result` tool or a direct JSON patch script would be needed for migration.

---

## 8. Recommended TTL Strategy

### 8.1 CBP Sprint Directory TTL

**Proposal:** A sprint directory in `.devsteps/cbp/<sprint_id>/` should be eligible for archival when:

```
sprint status = done  AND  (today - sprint.completed_at) >= TTL_DAYS
```

**Recommended TTL values:**

| Sprint type | TTL (after done) | Rationale |
|---|---|---|
| Active sprint (TASK-/STORY-/EPIC-) | 30 days | Audit window; bug reports may reference |
| SPIKE / research sprint | 90 days | Research may be re-referenced |
| Named planning sessions (plan-*) | 14 days | Short utility; planning is consumed fast |
| GPU / external research sessions | 7 days | One-shot; low reuse value |

**Archive target:** `.devsteps/archive/cbp/<sprint_id>/` (mirrors existing `.devsteps/archive/` pattern)

### 8.2 TTL Hook Location

The TTL logic should live in the **shared package** as a pure utility and be exposed via both CLI and MCP:

```
packages/shared/src/cbp/
  ttl.ts          — computeArchiveCandidates(cbpDir, items, now) → string[]
  archive.ts      — archiveSprintDir(cbpDir, sprintId, archiveDir) → void

packages/cli/src/commands/
  cbp-cleanup.ts  — devsteps cbp cleanup [--dry-run] [--ttl-days N]

packages/mcp-server/src/tools/
  cbp_cleanup.ts  — mcp_devsteps_cbp_cleanup tool
```

The CLI command is the primary entry point; the MCP tool allows automation from coord agents.

### 8.3 workspaceStorage TTL

VS Code workspaceStorage `content.txt` files are **outside the DevSteps system boundary** — they are managed by the GitHub Copilot extension. DevSteps cannot safely delete them.

**Recommended action:** File a feature request / issue in `microsoft/vscode-copilot-chat` for TTL-based cleanup of `chat-session-resources/`. As a workaround, document that users can manually clear old chat sessions from the Copilot Chat history UI, which will eventually purge the backing files.

**Workaround script** (manual, user-run — not automated):  
```bash
# Remove content.txt files older than N days from all workspaceStorage
find ~/.vscode-server/data/User/workspaceStorage/ \
  -name "content.txt" -mtime +30 -delete
```

This is safe because `content.txt` files are write-once session artifacts. They are not read after session close.

---

## 9. Suggested Follow-Up TASK Items

| Suggested Item | Type | Priority | Description |
|---|---|---|---|
| Enforce `item_ids.min(1)` in WriteMandateResultSchema | TASK | urgent-important | Tighten Zod schema in `packages/shared` to reject empty `item_ids` at write time |
| Validate `completed_at` is not midnight UTC | TASK | not-urgent-important | Add heuristic check: reject `T00:00:00` timestamps; force `new Date().toISOString()` in agent prompts |
| Add UUID v4 enforcement to `mandate_id` in schema | TASK | not-urgent-important | Add `z.string().uuid()` to `WriteMandateResultSchema.mandate_id` |
| Implement `devsteps cbp cleanup` CLI command | STORY | not-urgent-important | TTL-based archival of sprint dirs per §8.2; dry-run mode mandatory |
| Add `mcp_devsteps_cbp_cleanup` MCP tool | TASK | not-urgent-important | Expose `cbp cleanup` via MCP for coord automation |
| Patch `plan-spider-web-dashboard-2026-03-04` item\_ids | TASK | urgent-not-important | Script to rewrite `item_ids: []` with correct item references after backlog cross-check |
| Document workspaceStorage content.txt TTL workaround | TASK | not-urgent-not-important | Add to `LessonsLearned/` or CONTRIBUTING.md |
| Add `analyst` name format validation to write\_mandate\_result | TASK | not-urgent-important | Zod regex or enum check on `analyst` field at MCP tool level |

---

## 10. Conclusion

The CBP directory carries a **historical debt of 18 non-compliant files (42.9%)**. The most impactful single fix is enforcing `item_ids.min(1)` in the schema — this would have prevented 6 files from being written without traceability. The second highest-value fix is enforcing `new Date().toISOString()` in agent prompts, which would eliminate the T00:00:00Z fake-timestamp pattern that affects 11 files across 5 sprint directories.

The TASK-296-sprint directory is a total loss for timestamp compliance (6/6 files fake) — it represents an early session before timestamp discipline was established. These files should be archived after the 30-day TTL window.

workspaceStorage is growing organically and will require either a VS Code extension–side cleanup feature or periodic manual sweeps. At 95 files / 3 sessions today, the growth is manageable but will compound significantly over months of active Spider Web usage.

---
agent: devsteps-R0-coord
model: Claude Sonnet 4.6
tools:
  ['vscode', 'execute', 'read', 'agent', 'browser', 'bright-data/*', 'edit', 'search', 'web', 'devsteps/*', 'todo']
description: "Classify DevSteps backlog items using the 3-level taxonomy + facets. Run on-demand — NOT triggered automatically at item creation."
---

# 🏷️ DevSteps Item Classification

> **When to use:** When the backlog has grown and AI retrieval by topic is degrading, or after a batch of new items has been added without classification.
> **Not for:** Automatic classification during `devsteps add` — classification is always a deliberate, human-triggered action.

## Inputs (provide one or more)

- **Item IDs to classify** — e.g. `STORY-190, TASK-320, BUG-055` (omit = classify all unclassified)
- **Batch size** — max items per run (default: 20)
- **Dry run** — `yes/no` — preview proposed classifications without applying (default: yes)
- **Reclassify** — `yes/no` — overwrite existing classifications (default: no)

## What this does

Assigns a structured `metadata.classification` object to each target item:

```
domain      → Level-1 taxonomy node (core | api | ui | ai | devops | docs | research)
subdomain   → Level-2 specialisation (e.g. mcp, extension, agents, build, spike...)
topic       → Level-3 most-specific (e.g. tree-view, zod-validation, npm-publish...)
concerns    → Orthogonal quality facets (performance | security | dx | reliability | ...)
scope       → Impact breadth (platform | package | module | function)
cluster     → Optional topic cluster name (e.g. release-1.0, mcp-adoption)
```

Classification is stored in `metadata.classification` — no existing fields are changed.

## Classification Taxonomy Reference

Full taxonomy is in `.github/instructions/devsteps-classification.instructions.md`.  
The `worker-classifier` reads this file before every run — taxonomy is always up-to-date.

## Coord Execution Protocol

### Triage: STANDARD

Classification runs are always STANDARD tier — they touch multiple items and index structures.

### Step 1 — Pre-flight

1. Read `.github/instructions/devsteps-classification.instructions.md`
2. Call `mcp_devsteps_status` to get current item counts
3. If `item_ids` not provided: call `mcp_devsteps_list` to identify unclassified items (those without `metadata.classification`)

### Step 2 — Ring 1 (optional, fires only for large batches > 50 items)

Dispatch `devsteps-R1-analyst-archaeology` to scan the backlog for thematic clusters before the classifier runs. Pass findings as context to the classifier.

### Step 3 — Ring 4: Dispatch worker-classifier

Dispatch `devsteps-R4-worker-classifier` with:

```json
{
  "item_ids":   ["<list or empty>"],
  "batch_size": 20,
  "dry_run":    true,
  "reclassify": false
}
```

### Step 4 — Review dry-run output

Present the proposed classification table to the user. Ask for confirmation before applying.

### Step 5 — Apply (if confirmed)

Re-dispatch `devsteps-R4-worker-classifier` with `dry_run: false`.

### Step 6 — Done

Report: items classified / skipped / remaining. Suggest scheduling next batch if items remain.

## Additional Structuring Beyond Taxonomy

If the user wants to apply ADDITIONAL structure beyond per-item classification:

| Method | When to use | How |
|--------|-------------|-----|
| **Topic Cluster** | Cross-domain themes (e.g. all release-1.0 work) | Set `cluster` facet on all related items |
| **Concern Cross-cut** | Find all performance or security items | Query by `tags` after adding `concern:performance` |
| **Milestone Grouping** | Sprint / release planning view | Use `cluster: release-x.y` + `mcp_devsteps_list tags=release-x.y` |
| **Knowledge Map** | Graph traversal from a concept node | Use `mcp_devsteps_trace` from an EPIC after classification |
| **Audience Lens** | Who uses the output? | Add `audience:developer` etc. to `metadata.classification` |

## Success Criteria

- All target items have `metadata.classification.domain` assigned
- No existing item fields (`status`, `title`, `type`, `eisenhower`) changed
- Summary table returned with full visibility of skipped / ambiguous items
- Unclassified remainder count shown for next batch planning

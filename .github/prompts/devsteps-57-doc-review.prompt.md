---
agent: "devsteps-R0-coord"
model: "Claude Sonnet 4.6"
description: "Scan doc coverage against BOM/subsystem map — detect gaps and create placeholder doc items via worker-doc-gap"
tools:
  ['vscode', 'read', 'agent', 'search', 'devsteps/*', 'todo']
---

# 🔍 Doc Review — Coverage Scan + Gap Detection

> Dispatches `worker-doc-gap` to map existing `doc` items against the project subsystem × Diataxis matrix. Surfaces holes and creates placeholders.

## Mode Selection

| When | Behaviour |
| ---- | --------- |
| No scope given | Scan all `packages/*` × all 4 Diataxis types |
| `scope: <bom_root_id>` | Restrict to items under that BOM root node |
| `scope: <subsystem>` | Restrict to a named subsystem (`cli`, `mcp-server`, …) |
| `dry_run: true` | Report gaps — do NOT create placeholders yet |

## Handbook Coverage Baseline

When reviewing coverage for the **DevSteps project handbook**, use **STORY-297** as the authoritative structural baseline:

- **L1 areas (ARCH-010 – ARCH-070)** define the 7 functional areas — Introduction, Fundamentals, AI/Copilot, VS Code Extension, MCP Tools, CLI, Documentation System
- **Orphan detection:** Any DOC-item not linked to an ARCH-NNN slot → flag in review report with suggestion to run `mcp_devsteps_link`
- **Gap detection:** Any ARCH-NNN slot without a DOC-item mapping → include in gap list with type annotation (Tutorial / How-to / Reference / Explanation / Architecture / Research)
- **Diataxis type mismatch:** e.g., a How-to item filed under a Reference chapter → flag for reclassification via `devsteps_docs_classify`
- All 33 existing DOC-items must map to an ARCH-NNN slot; new Deep-Reference items (L3/L4) are expected for tool parameters, schemas, and agent dispatch rules

Scope the baseline check with `scope: bom` to restrict the coverage scan to the ARCH-NNN tree instead of the default packages × Diataxis matrix.

## Execution Protocol

### Step 1 — Identify Work Item

If no item ID provided: `mcp_devsteps_list(type: "story", tags: ["doc-system"])` → confirm with user.  
Set item `in-progress`.

### Step 2 — Dispatch worker-doc-gap

Dispatch `devsteps-R4-worker-doc-gap` via `#runSubagent` with:

```json
{
  "item_id": "<story-id>",
  "scope": "<scope or all>",
  "diataxis_types": ["tutorial", "how-to", "reference", "explanation"],
  "dry_run": false
}
```

### Step 3 — Display Coverage Matrix

Print the table returned by worker-doc-gap:

```
| Subsystem   | Tutorial   | How-To     | Reference   | Explanation |
|-------------|------------|------------|-------------|-------------|
| cli         | ✅         | ✅         | 🔲→DOC-087  | ✅          |
| mcp-server  | 🔲→DOC-088 | ✅         | ✅          | ⚠️ DOC-023  |
```

Legend: ✅ covered · 🔲 placeholder created · ⚠️ partial (stale draft)

### Step 4 — Guide Next Action

- Placeholders created → suggest `devsteps-58-doc-import` to fill them
- All covered → suggest `devsteps-59-doc-assemble` to generate the document
- After dry\_run → confirm with user before re-running with `dry_run: false`

## Status Close-out

After matrix delivered and user satisfied: set item `done` + `append_description` with `coverage_delta` and summary from worker-doc-gap result.

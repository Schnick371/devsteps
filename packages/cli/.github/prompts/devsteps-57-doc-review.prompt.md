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

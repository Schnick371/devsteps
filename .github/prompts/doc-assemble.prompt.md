---
agent: "devsteps-R0-coord"
model: "Claude Sonnet 4.6"
description: "Assemble a BOM tree of doc items into a single Markdown file with heading-level normalization (offset = bom_level − 1, hard cap H6)"
tools:
  ['vscode', 'read', 'edit', 'search', 'devsteps/*', 'todo']
---

# 📄 Doc Assemble — BOM Tree → Full Document

> Traverses a BOM root's doc-item tree and concatenates all fragments into one Markdown file applying per-node heading normalization.
>
> **⚠️ Prerequisites:** TASK-436 (`adjustHeadingLevels`) and TASK-437 (`exportHandler`) must be `done` before this prompt can produce output.

## Heading Normalization Rule

Authors always write `# Title` (H1) in the `description` field. The assembler shifts levels per BOM position:

| BOM depth (level) | offset | H1 in source → output |
| ----------------- | ------ | ---------------------- |
| 1 — root | +0 | H1 → **H1** |
| 2 — chapter | +1 | H1 → **H2** |
| 3 — section | +2 | H1 → **H3** |
| 4 — subsection | +3 | H1 → **H4** |

`offset = bom_level − 1`. Hard cap: H6 (never output H7+).

## Execution Protocol

### Step 1 — Select BOM Root

If user provides `--root <DOC-ID>` → use that.  
Otherwise: `mcp_devsteps_list(type: "doc", tags: ["bom-root"])` → show list → ask user.

### Step 2 — Prerequisite Check

Verify TASK-436 and TASK-437 status via `mcp_devsteps_get`:

- Both `done` → proceed
- Either not `done` → stop, report missing tasks, offer `devsteps-40-start-work` with the blocking task

### Step 3 — Coverage Check

Count BOM nodes with `status: draft` and empty `description`.  
If >10% of nodes are empty placeholders → warn user; suggest `doc-review` first.  
User may override and assemble anyway (placeholders render as `<!-- placeholder -->` comments).

### Step 4 — Assemble

Call `devsteps_docs_assemble` (TASK-437 exportHandler):

```json
{
  "root_id":               "<DOC-root-ID>",
  "output_path":           "docs/<diataxis_type>/<title-kebab>.md",
  "heading_normalization": true
}
```

The handler:
1. Traverses BOM tree in order
2. For each node at depth D: `offset = D − 1`
3. Applies `adjustHeadingLevels(fragment.description, offset)` — TASK-436
4. Strips YAML frontmatter before concatenating
5. Writes assembled file to `output_path`

### Step 5 — Verify + Commit

Read assembled file — check: no H7+ headings, no raw `---` frontmatter visible.

```bash
git add docs/<output_path>
git commit -m "docs(<scope>): assemble <title> from BOM

Implements: <item_id>"
```

## Status Close-out

Set work item `done` + `append_description` with output path, node count, and any placeholder warnings.  
Suggest `doc-review` if coverage gaps were skipped.

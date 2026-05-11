---
description: "Diataxis BOM worker — builds the ARCH-NNN BOM tree from DOC items, links doc_ids, verifies prerequisite tasks, triggers devsteps_docs_assemble, and commits final Markdown output. Leaf Node. NEVER calls runSubagent."
model: "Claude Sonnet 4.6"
tools:
  ['think', 'vscode', 'read', 'search', 'devsteps/*', 'todo']
user-invocable: false
---

<!-- devsteps-managed: true | version: 1.0.0 | hash: sha256:pending -->

# 🗺️ Diataxis BOM — worker (Spider Web Dispatch)

## Contract

- **Tier**: `worker` — Leaf Node, dispatched by `exec-doc-diataxis` conductor AFTER all `worker-diataxis-author` instances complete
- **Mandate type**: `diataxis-bom`
- **Returns**: `{ bom_root_ids: string[], assembled_files: string[], commit_hash: string, missing_prerequisites: string[] }`
- **NEVER dispatches** further agents — `dispatch_role: leaf`
- **Responsibility**: Build ARCH-NNN BOM tree, link DOC items, verify assembly prerequisites, trigger assembly, commit output

## Dispatch Mandate Format

```
{
  "item_id": "<parent Story or Epic ID>",
  "doc_items": ["DOC-NNN", ...],
  "document_structure": {
    "<document-title>": {
      "quadrant": "tutorial | how-to | reference | explanation",
      "chapters": ["DOC-NNN", ...]
    }
  },
  "output_path_prefix": "docs/",
  "failed_approaches": []
}
```

## Execution Protocol

### Step 1 — Prerequisite Check

Verify via `mcp_devsteps_get`:
- TASK-436 (`adjustHeadingLevels`) status must be `done`
- TASK-437 (`exportHandler`) status must be `done`

If either is not `done`: report in `missing_prerequisites`, return immediately — do NOT proceed to Step 3.

### Step 2 — Validate DOC Items

For each DOC item in `doc_items`:
1. Call `devsteps_doc_read_content` — verify `content` is non-empty and starts with `# ` (H1)
2. Flag any items with empty or placeholder content
3. If >10% of items are empty: warn coord, proceed with placeholders rendered as `<!-- placeholder -->`

### Step 3 — Build BOM Tree

For each document in `document_structure`:

1. Create L0 root node: `mcp_devsteps_docs_bom_commit` or `docs_map_write` with:
   - `id`: new ARCH-NNN (sequential — check existing IDs via `mcp_devsteps_docs_bom_status`)
   - `title`: document title
   - `diataxis_type`: quadrant value
   - `parent_id`: null (root)

2. Create L1 chapter nodes for each DOC item in `chapters`:
   - `id`: new ARCH-NNN
   - `doc_id`: linked DOC-NNN
   - `parent_id`: L0 root ARCH-NNN
   - `level`: 1

3. If a DOC item has sub-sections (H2+ in content): create L2/L3 nodes accordingly

### Step 4 — BOM Heading Normalization Contract

Every node level determines the heading offset applied during assembly:

| BOM level | offset | H1 in source → assembled output |
|-----------|--------|----------------------------------|
| 0 (root) | +0 | H1 → H1 |
| 1 (chapter) | +1 | H1 → H2 |
| 2 (section) | +2 | H1 → H3 |
| 3 (subsection) | +3 | H1 → H4 |

`offset = bom_level − 1`. Hard cap H6 — never output H7+.
Verify: no DOC item has heading deeper than `H(6 - bom_level)` to avoid overflow.

### Step 5 — Assemble Documents

For each L0 BOM root:

1. Call `devsteps_docs_assemble`:
   ```
   root_id: <L0 ARCH-NNN>
   output_path: docs/<diataxis_type>/<title-kebab>.md
   heading_normalization: true
   ```

2. Verify output file exists and contains non-empty content
3. Check: each Diataxis quadrant has the correct file naming convention:
   - Tutorial: `tutorial-<goal>.md`
   - How-to: `how-to-<verb>-<noun>.md`
   - Reference: `reference-<subject>.md`
   - Explanation: `explanation-<topic>.md`

### Step 6 — Commit Output

Commit all assembled Markdown files:
- Message format: `docs(<quadrant>): assemble <title> from BOM`
- Footer: `Implements: <item_id>`

## Quality Checklist (self-review before returning)

- [ ] TASK-436 + TASK-437 both `done` (or `missing_prerequisites` reported)
- [ ] All BOM nodes have valid ARCH-NNN IDs (no duplicates)
- [ ] All `doc_id` fields in L1+ nodes point to existing DOC items
- [ ] Assembled files exist in `docs/<quadrant>/` with correct naming
- [ ] No heading overflow (H7+) in any assembled output
- [ ] All assembled files committed with Conventional Commits format

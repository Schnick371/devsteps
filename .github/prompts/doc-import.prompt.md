---
agent: "devsteps-R0-coord"
model: "Claude Sonnet 4.6"
description: "Import workspace markdown files or inline content into DevSteps doc items — 3 modes: directory scan (5-tool chain), single file, or inline content_markdown"
tools:
  ['vscode', 'read', 'edit', 'search', 'devsteps/*', 'todo']
---

# 📥 Doc Import — Workspace → Doc Items

> Imports existing documentation into DevSteps `doc` items.

## Mode Selection

| Mode | Trigger | Tool chain |
| ---- | ------- | ---------- |
| **A — Directory scan** | `--dir <path>` or user provides folder | `devsteps_docs_classify` → `classify_confirm` → `devsteps_docs_import` → `bom_status` → `bom_commit` |
| **B — Single file** | `--file <path>` or user provides one file | Read file → `devsteps add type=doc` with content as description |
| **C — Inline content** | User pastes markdown in chat | `devsteps add type=doc` with content as description directly |

## Mode A — Directory Scan (5-Tool Chain)

```
Step 1: devsteps_docs_classify        — classify files by Diataxis type
Step 2: devsteps_docs_classify_confirm — PAUSE → show table → await "Proceed?"
Step 3: devsteps_docs_import          — create doc items from confirmed files
Step 4: devsteps_docs_bom_status      — check BOM coverage  
Step 5: devsteps_docs_bom_commit      — commit BOM structure
```

**Step 2 always pauses.** Show classification table with detected Diataxis type per file and ask user to confirm before creating items.

## Mode B + C — Single File / Inline (via generic `add`)

1. If Mode B: read file content, extract title from first `# Heading`
2. Auto-detect Diataxis type (use `heuristicClassify` if no frontmatter `diataxis`)
3. Confirm detection with user if confidence < 0.7
4. For bulk splitting: use `parseDocumentFragments(content, splitLevel)` to split at heading boundaries, then call `add` per fragment
5. For single doc: call `devsteps add`:

```json
{
  "type": "doc",
  "title": "<H1 from content>",
  "description": "<full markdown content>",
  "tags": ["<diataxis-type>"]
}
```

Tags containing a Diataxis type (tutorial, how-to, reference, explanation, architecture, research) trigger automatic skeleton generation when no description is provided. With description, content is stored as-is.

## Frontmatter Handling

If content contains YAML frontmatter (`--- ... ---`):

| Front-matter field | Effect |
| ------------------ | ------ |
| `related_items: [STORY-042]` | Auto-link created doc items → those IDs |
| `status: approved` | Set created items to `done` instead of `draft` |
| `split_at_level: 2` | Override split level (1 \| 2 \| 3) |

## Status Close-out

After import: summarise created item IDs → set work item `done`.  
Suggest `doc-review` to verify coverage or `doc-assemble` to generate output document.

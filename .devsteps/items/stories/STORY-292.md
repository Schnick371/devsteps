## Context — Work-First Semantic Anchor, Step 1
Authors (or tooling) write `related_items: [STORY-123]` in their Markdown fragment frontmatter.
Today: `devsteps_docs_import` and `devsteps_docs_bom_commit` never call `parseFrontmatter()`,
so this information is silently discarded — the DOC item has no links to its originating task.

## What changes
At import time, call `extractFrontmatter()` (NOT `DocFrontmatterSchema.safeParse()` directly —
the `.strict()` schema will abort on unknown user keys unless field-stripped first).

For each entry in `related_items[]`:
1. Validate the item ID resolves to a real DevSteps item (`getItem(id)` — if not found: warn and continue, do NOT abort)
2. Create link: `link(doc_item_id, 'implements', related_item_id)`

Same change applied to `devsteps_docs_bom_commit` when it creates/updates DOC items.

## Failure mode (impact-analyst constraint)
**Warn-and-continue**: unresolved `related_items` entries log a warning in the MCP response
(`warnings: ["related_items entry 'STORY-999' not found — link skipped"]`), but import does not fail.
Hard failures remain reserved for malformed item IDs (format validation only).

## TreeView companion (must ship together)
The TreeView will accumulate many DOC `implemented-by` children under STORY nodes at scale.
Add a `hideDocChildren` filter toggle (`devsteps.treeView.hideDocChildren: boolean`, default `false`)
alongside this story. See companion TASK created with this story.

## Acceptance Criteria
- [ ] `devsteps_docs_import` calls `extractFrontmatter()` and processes `related_items`
- [ ] `devsteps_docs_bom_commit` applies same logic at commit time
- [ ] Warn-and-continue: unresolved IDs produce `warnings[]` in response, never abort
- [ ] Unit test: import .md with `related_items: [STORY-X]` → DOC item has `implements` link to STORY-X
- [ ] Unit test: import .md with `related_items: [STORY-NONEXISTENT]` → import succeeds, warning in response

## Related signals
- `DocFrontmatterSchema` is `.strict()` — use `extractFrontmatter()` wrapper, not direct `.safeParse()`
- `linkItem()` in `link.ts` is idempotent — duplicate auto-link calls are safe
Update `packages/copilot-instructions.md` (root) and `.github/copilot-instructions.md` — the `doc` item type description currently reads:

> "H1=Diataxis type, H2=chapter, H3=section, H4=subsection"

This implies H4 is a separate doc-item. That is **wrong** under the new model.

**New description for `doc` type:**

```
doc | Wissensknoten / Content Fragment: one H1-level block of a documentation document. 
H1 = document root (Diataxis type / topic title). H2/H3/H4/H5 are content WITHIN the 
fragment — never separate items. Bidirectionally linked to backlog items via `documents` 
/ `documented-by` relations. Use `devsteps_docs_new content_markdown=...` to ingest a 
full document and split it automatically.
```

Also update the authoring convention comment if present: "Write documents starting at H1. Heading levels are adjusted automatically at assembly time based on BOM position."

## Affected Files
- `.github/copilot-instructions.md` (search for `doc` item type table row)
- `packages/mcp-server/.github/copilot-instructions.md` if it exists as a copy

## Acceptance Criteria
- [ ] `doc` type row no longer mentions H4 as separate item
- [ ] "always H1" authoring convention visible in the table or as a note below the Item Types table
- [ ] Both file copies updated (root + mcp-server if present)
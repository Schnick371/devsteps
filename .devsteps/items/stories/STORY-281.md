devsteps_docs_bom_commit currently stores diataxis_type as a tag only. The .md
description file has no YAML frontmatter, so devsteps_doc_read_content returns
frontmatter: null for all imported docs.

## Acceptance Criteria
- In devsteps_docs_bom_commit.ts: before calling addItem(), prepend YAML block:
  ---
  diataxis: <diataxis_type value>
  ---
  to the fragment description
- If YAML frontmatter already present: update/merge the diataxis field
- extractFrontmatter() from shared package handles reading existing frontmatter
- devsteps_doc_read_content returns correct diataxis value for BOM-imported docs

## Files
- packages/mcp-server/src/handlers/devsteps_docs_bom_commit.ts (approx line 107)
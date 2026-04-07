Add `devsteps_docs_new` to MCP tools handler:
- Input: `{ title, diataxis_type?, parent_bom_id? }`
- If diataxis_type missing: return guided 6-question type-selection next_steps (no item created yet)
- If type provided: create DOC Item + stub .md file with correct Diataxis template frontmatter
- Slug sanitization: lowercase, hyphens, strip special chars
- SECURITY: validate resolved file path stays within workspace
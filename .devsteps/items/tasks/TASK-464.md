Replace or update the MCP server export handler to delegate composition to the shared md-compose pipeline from packages/shared.

## Acceptance Criteria
- Composed output must strip per-document frontmatter.
- Default heading shift follows strict rule: h' = min(6, h + 2*(L-1)); L2 means H1→H3 and H3→H5.
- Mandatory frontmatter enforcement only after compatibility migration and quality gates pass.
- MCP export tool returns composed output consistently with CLI export.
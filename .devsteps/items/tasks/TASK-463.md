Implement the core md-compose pipeline in packages/shared that all consumers (CLI, MCP server) will use.

## Acceptance Criteria
- Composed output must strip per-document frontmatter.
- Default heading shift follows strict rule: h' = min(6, h + 2*(L-1)); L2 means H1→H3 and H3→H5.
- Mandatory frontmatter enforcement only after compatibility migration and quality gates pass.
- Pipeline is exported as a reusable module with a documented public API.
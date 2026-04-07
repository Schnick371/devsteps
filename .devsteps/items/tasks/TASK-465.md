Replace the CLI export stub implementation with a call to the shared md-compose pipeline, achieving feature parity with MCP export.

## Acceptance Criteria
- Composed output must strip per-document frontmatter.
- Default heading shift follows strict rule: h' = min(6, h + 2*(L-1)); L2 means H1→H3 and H3→H5.
- Mandatory frontmatter enforcement only after compatibility migration and quality gates pass.
- `devsteps export` CLI command produces identical output to MCP export for the same input.
Implements the recommendations from SPIKE-060: define and enforce a YAML frontmatter contract for doc items, implement a shared md-compose pipeline, and normalize heading levels on composed export.

## Acceptance Criteria
- Composed output must strip per-document frontmatter.
- Default heading shift follows strict rule: h' = min(6, h + 2*(L-1)); L2 means H1→H3 and H3→H5.
- Mandatory frontmatter enforcement only after compatibility migration and quality gates pass.

## Scope
- packages/shared: shared md-compose pipeline
- packages/mcp-server: MCP export handler integration
- packages/cli: CLI export parity via shared composition path
- Test fixture matrix for frontmatter stripping and strict heading-shift
- Docs migration compatibility mode before mandatory enforcement
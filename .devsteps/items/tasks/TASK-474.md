Wire MCP export flow to the shared composition pipeline to ensure parity and centralized normalization behavior.

Acceptance notes:
- Composed output must strip per-document frontmatter.
- Default heading shift follows strict rule: h' = min(6, h + 2*(L-1)); L2 means H1->H3 and H3->H5.
- Mandatory frontmatter enforcement only after compatibility migration and quality gates.
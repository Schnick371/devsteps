Create a comprehensive fixture matrix covering all relevant input combinations for frontmatter stripping and the strict heading-shift algorithm.

## Acceptance Criteria
- Composed output must strip per-document frontmatter.
- Default heading shift follows strict rule: h' = min(6, h + 2*(L-1)); L2 means H1→H3 and H3→H5.
- Mandatory frontmatter enforcement only after compatibility migration and quality gates pass.
- Fixture matrix covers: L1/L2/L3 depth levels, documents with/without frontmatter, heading levels H1–H6 at each depth, edge case H6 clamping.
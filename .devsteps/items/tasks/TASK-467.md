Implement a compatibility mode that allows existing docs without frontmatter to continue working during migration, before mandatory enforcement is activated.

## Acceptance Criteria
- Composed output must strip per-document frontmatter.
- Default heading shift follows strict rule: h' = min(6, h + 2*(L-1)); L2 means H1→H3 and H3→H5.
- Mandatory frontmatter enforcement only after compatibility migration and quality gates pass.
- Compatibility mode is the default until explicitly opted out.
- Provides clear migration warnings/hints for docs missing required frontmatter fields.
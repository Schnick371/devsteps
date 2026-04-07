Identify and fix all existing delta-gate (lint/test) failures so that a clean baseline exists before SPIKE-060 implementation work begins.

## Acceptance Criteria
- Composed output must strip per-document frontmatter.
- Default heading shift follows strict rule: h' = min(6, h + 2*(L-1)); L2 means H1→H3 and H3→H5.
- Mandatory frontmatter enforcement only after compatibility migration and quality gates pass.
- All lint checks pass with exit code 0.
- All unit and CLI integration tests pass.
- CI pipeline shows green baseline before any SPIKE-060 feature branch is opened.
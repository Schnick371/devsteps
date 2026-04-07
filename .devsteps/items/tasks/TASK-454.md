## Problem

During sprint planning, `mcp_devsteps_update(ids[])` (batch update) failed because `.devsteps/index/by-status/draft.json` contains an invalid item ID `DOC-002`. This stale/corrupt entry causes the batch update path to abort when iterating the index, blocking bulk status transitions.

## Required Actions

1. **Remove** the invalid `DOC-002` entry from `.devsteps/index/by-status/draft.json`.
2. **Audit** all other by-status index files for similarly orphaned or invalid IDs and clean them up.
3. **Harden** the batch update path in `mcp_devsteps_update` (shared/mcp-server) to skip or warn on unresolvable IDs instead of aborting the entire batch.

## Acceptance Criteria

- `mcp_devsteps_update(ids[])` completes successfully even if the index contains stale references.
- A warning is logged (not an error) for each unresolvable ID encountered during batch processing.
- Unit tests cover the corrupt-index-entry scenario for the batch update code path.
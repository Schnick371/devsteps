# Fix content-persistence bug in `docs_import + bom_commit`

## Problem

The `docs_import + bom_commit` pipeline currently leaves DOC item `description` fields as one-line stubs (e.g. `"Imported from {path}."`). Full markdown content remains only in the staging files on disk. DevSteps is not the authoritative source of truth for content — the staging directory is.

This caused a false PASS in the external sprint post-mortem (root cause E): the gate-reviewer's word-count check (≥100 words per DOC) read the `description` field, found the stub, and incorrectly passed. The full content — which would have revealed authoring gaps — was inaccessible to any MCP tool.

This is also directly related to STORY-268 (`devsteps_docs_new` removal), which removed the tool that previously handled content ingestion. The removal left a gap in the content-persistence path.

## Current State

After `bom_commit`, DOC items in `.devsteps/items/docs/` have `description` values like `"Imported from staging/file.md."`. The actual markdown content lives in the staging file (e.g. `tmp/` or a session-scoped staging directory). When staging files are cleaned up, content is permanently lost. `mcp_devsteps_docs_metrics` and gate-reviewer word-count checks operate on `description` and produce incorrect results.

## Proposed Approach

1. In the `bom_commit` handler: after creating or updating a DOC item node in `docs-map.json`, if the caller supplies `content_path` or `content_markdown` per file entry, write the full markdown content into the DOC item's `.md` file and update the `description` field (or `description_preview`) to reflect the actual content.
2. If `content_markdown` is not supplied, attempt to read from `content_path` if provided.
3. Define a clear content-persistence contract: after `bom_commit`, the DOC item `.md` file in `.devsteps/items/docs/DOC-NNN.md` MUST contain the full content (not a stub). The `description` field in the JSON metadata MUST contain at least the first 500 characters of content (not a path reference).
4. Add a migration note / warning to the `bom_commit` response when stubs are detected in existing DOC items that were committed without content.
5. Write a unit test that calls `bom_commit` with `content_markdown` for a file entry and asserts the DOC item `.md` file contains the full markdown (not a stub).

## Acceptance Criteria

- After `bom_commit` with `content_markdown` or `content_path` per file, the DOC item `.md` file contains the full content.
- `description` field in the DOC JSON metadata is NOT a stub (does not match pattern `"Imported from *."`).
- `mcp_devsteps_docs_metrics` word count is computed from real content, not stubs.
- Gate-reviewer word-count check produces correct results (true PASS / true FAIL).
- Backward compatibility: calls without `content_markdown` or `content_path` continue to work (create stub as before, but emit a warning in the response).
- Unit test passes.

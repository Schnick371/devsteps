## Context

7 handlers from the docs import dialog chain (implemented as part of STORY-238, status: done) have **zero test coverage**. A new ingestion mode (STORY-268) will modify `devsteps_docs_new` — without a test safety net this creates regression risk.

## Handlers to Cover

| Handler | Risk |
|---|---|
| `devsteps_docs_import` | Markdown parse, section detection, BOM entry generation |
| `devsteps_docs_classify` | AI classification request, draft state |  
| `devsteps_docs_classify_confirm` | Confirm/reject classification, type assignment |
| `devsteps_docs_bom_status` | BOM read, pending entry count |
| `devsteps_docs_bom_commit` | Atomic BOM commit, item linking |
| `devsteps_docs_new` | **HIGH PRIORITY** — will be modified by STORY-268 |
| `devsteps_doc_read_content` | Path guard, content retrieval |

## Acceptance Criteria

- ≥4 tests per handler (happy path, validation, error cases)
- Tests in `packages/mcp-server/tests/handlers/docs/`
- Path guard tested for traversal prevention (security)
- STORY-268 changes go in AFTER this story establishes the baseline

## Ishikawa Source

Tests bone 🔴 HIGH. Also: regression gate for STORY-268 ingestion mode redesign.
# Add `mcp_devsteps_docs_bom_add_node` MCP Tool — incremental tree-building during authoring

## Problem

After the handbook outline is declared via `bom_outline` (STORY-285), exec-doc workers may discover during authoring that additional sub-chapters are needed that were not in the original outline. Currently there is no tool for adding a single node to an existing BOM tree. The only option is re-calling `bom_commit` with the full updated list — which is fragile and error-prone when multiple workers are authoring in parallel.

This is MCP gap (7) identified in the post-mortem: no `docs_bom_add_node(parent_id, title, level, doc_id?)` for incremental tree-building during authoring.

## Current State

No `docs_bom_add_node` tool exists. Confirmed: zero references in `packages/`. Workers must re-submit full BOM payloads to add a node, which creates race conditions in parallel execution and risks overwriting other workers' additions.

## Proposed Approach

Implement a new MCP tool `mcp_devsteps_docs_bom_add_node` that:

1. Accepts: `parent_id: string`, `title: string`, `level: number`, `doc_id?: string` (optional — can be a placeholder if content is not yet authored).
2. Atomically adds a single node to `docs-map.json` as a child of `parent_id`.
3. Validates: `parent_id` must exist in the current BOM; `level` must be `parent.level + 1`; `title` must be unique among siblings.
4. Returns the new node's generated ID so the caller can reference it in subsequent `bom_commit` or `bom_outline` calls.
5. If `doc_id` is provided, validates that the DOC item exists.

This tool is the complement to `bom_outline`: `bom_outline` pre-declares the full skeleton, while `bom_add_node` handles incremental additions discovered during execution. The two tools together cover the full lifecycle of handbook structure evolution.

## Acceptance Criteria

- Tool adds a single node to the BOM tree without touching other nodes.
- Atomic write ensures concurrent exec-doc workers do not lose each other's additions.
- Validation rejects: unknown `parent_id`, incorrect `level` (not parent.level + 1), duplicate sibling title.
- Returns the new node ID.
- Unit test: add three sibling nodes to the same parent sequentially and assert all three appear in `docs-map.json` with correct `parent_id`.
- Regression: existing BOM nodes are unchanged after add_node call.

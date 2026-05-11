# Add `mcp_devsteps_docs_bom_outline` MCP Tool

## Problem

Currently there is no tool for declaring the target outline of a handbook before authoring begins. Planners must either call `bom_commit` with a flat list (losing structure) or improvise a mental model of the hierarchy. When the planner changes mid-sprint or a different exec-doc worker takes over, the intended outline is lost.

This was root cause (C) and MCP gap (3) in the post-mortem: no L0/L1/L2 BOM tree was pre-built as a skeleton, so all commit calls defaulted to a flat list.

## Current State

No `docs_bom_outline` or `docs_handbook_plan` tool exists. Confirmed: zero references to either name in `packages/`. The only way to add nodes to the BOM is via `bom_commit` (which now accepts hierarchy per STORY-284) but requires actual DOC items. There is no way to pre-declare placeholder slots that will be filled later.

## Proposed Approach

Implement a new MCP tool `mcp_devsteps_docs_bom_outline` that:

1. Accepts an outline definition: a root node (ARCH level, L0) plus an array of quadrant roots (L1 nodes, one per Diataxis type) plus chapter slot definitions (L2 nodes, with title and intended Diataxis type but no DOC item yet — `doc_id: null`).
2. Creates the BOM skeleton in `docs-map.json` with all declared nodes, marking unfilled slots with `status: "placeholder"` and `doc_id: null`.
3. Returns the created outline as a tree structure so coord/planner can confirm the skeleton before authoring begins.
4. Validates: node titles are unique within their parent; level values are consistent (parent.level = child.level − 1); depth does not exceed 4 levels.
5. Is idempotent: calling `bom_outline` on a BOM root that already has children appends new placeholder slots without overwriting existing filled nodes.

Intended usage in a handbook sprint:
1. coord-sprint calls `bom_outline` at the start of the sprint with the full desired handbook structure.
2. exec-doc workers fill slots by calling `bom_commit` scoped to specific placeholder IDs.
3. Gate-reviewer calls `bom_validate_completeness` to confirm all placeholder slots are filled before PASS.

## Acceptance Criteria

- Tool accepts root + quadrant roots + chapter slots and writes them to `docs-map.json`.
- Placeholder nodes are distinct from filled nodes (status field).
- Calling `bom_outline` twice on the same root is idempotent (no duplicate slots).
- Validation rejects outlines where parent level ≠ child level − 1.
- Unit test: create a 3-quadrant, 2-chapter-per-quadrant outline and verify all 9 nodes appear in `docs-map.json` with correct `parent_id` and `level` values.

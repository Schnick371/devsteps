# Add `mcp_devsteps_docs_bom_validate_completeness` MCP Tool

## Problem

After a handbook sprint's authoring phase, there is currently no automated way to verify that the BOM tree is complete before the gate-reviewer issues a PASS. The gate-reviewer manually inspects the BOM — which is error-prone and inconsistent. The post-mortem identified this as MCP gap (4): no `docs_bom_validate_completeness` to check whether root has ≥N children, all sub-chapters are present, heading depth is consistent, and no orphan DOC items exist.

In the external sprint, all 12 DOC items passed the per-item word-count check but the gate-reviewer never verified structural completeness. The result was 12 orphan fragments with no handbook root.

## Current State

No `docs_bom_validate_completeness` tool exists. Confirmed: zero references in `packages/`. The gate-reviewer has no programmatic way to enforce structural completeness criteria.

## Proposed Approach

Implement `mcp_devsteps_docs_bom_validate_completeness` that:

1. Accepts: `root_id: string`, configurable thresholds: `min_children_per_quadrant: number`, `max_heading_depth: number` (default 6), `require_all_slots_filled: boolean`.
2. Traverses the BOM tree from `root_id` depth-first.
3. Checks: (a) root has ≥1 quadrant child; (b) each quadrant has ≥`min_children_per_quadrant` chapter children; (c) no placeholder nodes with `doc_id: null` remain (when `require_all_slots_filled = true`); (d) heading depth does not exceed `max_heading_depth`; (e) no orphan DOC items exist (DOC items not attached to any BOM node under this root).
4. Returns a structured report: `{ valid: boolean, violations: Violation[] }` where each violation includes the node ID, the check that failed, and a human-readable message.
5. Is called by the gate-reviewer as part of the handbook PASS criteria.

## Acceptance Criteria

- Tool traverses from root and checks all five completeness criteria.
- Returns `{ valid: true, violations: [] }` for a correctly assembled 4-quadrant handbook.
- Returns `{ valid: false, violations: [...] }` with specific violations for incomplete handbooks.
- Orphan DOC item detection: DOC items in the project with `diataxis` tags but not linked to any BOM node under the given root are reported.
- Unit test: a partially filled BOM (two placeholder slots remaining) returns correct violation entries.
- gate-reviewer integration: gate-reviewer file documents that this tool is called when `output_mode = handbook`.

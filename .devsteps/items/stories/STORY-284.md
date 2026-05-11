# Extend `mcp_devsteps_docs_bom_commit` to accept hierarchy (parent_id + level per file)

## Problem

`mcp_devsteps_docs_bom_commit` currently hardcodes `parent_id: null` for every node it creates in `docs-map.json`. The hardcoding occurs at two locations confirmed in the codebase:

- `packages/mcp-server/src/handlers/devsteps_docs_bom_commit.ts` line 163
- `packages/mcp-server/src/handlers/devsteps_docs_bom_commit.ts` line 198

As a result, every BOM tree produced by a `bom_commit` call is structurally flat regardless of what the caller intends. It is impossible to express an L0 handbook root, L1 quadrant roots (Tutorial, How-to, Reference, Explanation), or L2 chapter nodes. Any sprint that calls `bom_commit` with a list of files will always produce a flat list — the BOM is useless as a hierarchical structure.

This was confirmed as root cause (C) in the post-mortem: "no L0/L1/L2 BOM tree was built before authoring began" — because the tool physically cannot build one.

## Current State

File: `packages/mcp-server/src/handlers/devsteps_docs_bom_commit.ts`
- Line 163: `parent_id` is set to `null` unconditionally when creating BOM nodes
- Line 198: `parent_id` is set to `null` unconditionally in the update path
- The input schema for `bom_commit` does not accept `parent_id` or `level` per file entry

The `docs-map.json` schema in `packages/shared/src/core/docs-map.ts` may already have `parent_id` as an optional field — if so, only the handler needs updating. If not, the schema must be extended too.

## Proposed Approach

1. Extend the per-file entry in the `bom_commit` input schema to accept optional `parent_id: string | null` and `level: number` (0 = root, 1 = quadrant, 2 = chapter, etc.).
2. Remove the hardcoded `parent_id: null` assignments at lines 163 and 198. Use the caller-supplied `parent_id` instead, defaulting to `null` for backward compatibility.
3. Validate that referenced `parent_id` values either exist in the current BOM or appear earlier in the same commit payload (forward-reference within one commit payload is an error).
4. Update `docs-map.json` write logic to preserve the tree structure.
5. Add a unit test: commit a 3-level payload (L0 root, two L1 children, one L2 grandchild) and assert `docs-map.json` reflects the correct parent–child relationships.

## Acceptance Criteria

- Per-file `parent_id` and `level` are accepted in the `bom_commit` payload.
- Hardcoded `parent_id: null` is removed from lines 163 and 198.
- A commit with a hierarchical payload produces a correct tree in `docs-map.json`.
- A commit without `parent_id` (backward-compatible call) still produces a flat node with `parent_id: null`.
- Unit test passes for the 3-level payload scenario.
- Existing `bom_commit` tests continue to pass (no regression).

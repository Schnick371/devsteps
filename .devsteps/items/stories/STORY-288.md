# Add `mcp_devsteps_docs_metrics` MCP Tool — handbook scope and coverage metrics

## Problem

The gate-reviewer currently has no quantitative data about the assembled handbook. It cannot enforce thresholds like "total assembled word count ≥5000" or "explanation chapter ≥400 words" because there is no tool that computes these numbers. This is MCP gap (5) from the post-mortem: no `docs_metrics` returning assembled word count, chapter count, max heading depth, empty slot count, and per-quadrant word distribution.

Without metrics, the gate-reviewer can only pass qualitative judgement — which led to the false PASS in the external sprint where stubs counted as content.

## Current State

No `docs_metrics` tool exists. Confirmed: zero references in `packages/`. The `mcp_devsteps_health` and `mcp_devsteps_metrics` tools return server health/Prometheus metrics — neither covers documentation content metrics.

## Proposed Approach

Implement `mcp_devsteps_docs_metrics` that:

1. Accepts: `root_id: string` (BOM root to analyze), optional `include_per_node: boolean`.
2. Traverses the BOM tree from `root_id`, reading each linked DOC item's `description` field (or `.md` file if available).
3. Computes and returns:
   - `total_words: number` — word count across all DOC items linked to the BOM tree
   - `chapter_count: number` — number of non-root, non-placeholder BOM nodes
   - `max_depth: number` — maximum heading depth in the assembled document (accounting for level normalization)
   - `empty_slot_count: number` — nodes with `doc_id: null` or stub descriptions
   - `per_quadrant: Record<string, { words: number, chapters: number }>` — breakdown by L1 quadrant
   - `assembled_word_count: number` — word count of the actual assembled output file (if it exists at the expected path)
4. When `include_per_node: true`, also returns a per-node breakdown.
5. Is idempotent and read-only — does not modify any files or DevSteps items.

The gate-reviewer uses `docs_metrics` to enforce: total assembled word count ≥ handbook threshold (configurable, e.g. 5000), per-quadrant word count ≥ quadrant threshold (e.g. 400 per quadrant), empty slot count = 0.

## Acceptance Criteria

- Tool returns `total_words`, `chapter_count`, `max_depth`, `empty_slot_count`, `per_quadrant` for a valid BOM tree.
- `assembled_word_count` is populated when the assembled file exists at the expected output path.
- Empty slot count correctly counts placeholder nodes and stubs.
- Unit test: a 4-quadrant, 3-chapters-per-quadrant BOM where each DOC description has exactly 100 words returns `total_words = 1200`, `chapter_count = 12`, `per_quadrant` with 300 words per quadrant.
- Read-only: no side effects on DevSteps items or files.

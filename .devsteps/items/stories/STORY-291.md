# Update gate-reviewer criteria — handbook-level checks for `output_mode = handbook`

## Problem

The gate-reviewer currently checks per-item criteria only (e.g. ≥100 words per DOC item). It never checks: Is there an assembled handbook file at the expected output path? Are sub-chapters present and correctly nested? Is the total scope handbook-sized? This was root cause (E) from the post-mortem, leading to a false PASS on 12 stub-filled DOC items.

## Current State

- `.github/agents/devsteps-R5-gate-reviewer.agent.md`: PASS criteria do not include handbook-level checks.
- No call to `docs_metrics` or `docs_bom_validate_completeness` in the gate-reviewer flow.
- Word-count check is per-DOC-item `description` field — trivially fooled by stubs.

## Proposed Approach

Extend the gate-reviewer with a `handbook` check block that fires when `output_mode = handbook` is present in the sprint context:

1. **Assembled output exists**: call `docs_assemble` result path or check file system for the output file — FAIL if absent.
2. **Structural completeness**: call `mcp_devsteps_docs_bom_validate_completeness(root_id, min_children_per_quadrant=2, require_all_slots_filled=true)` — FAIL if `valid: false`, list violations.
3. **Total scope**: call `mcp_devsteps_docs_metrics(root_id)` — FAIL if `assembled_word_count < handbook_word_threshold` (default 5000, configurable per sprint context).
4. **Per-quadrant coverage**: FAIL if any quadrant has `words < quadrant_word_threshold` (default 400).
5. **Heading depth**: FAIL if `max_depth > 6`.
6. **Content authenticity**: FAIL if `empty_slot_count > 0` (stubs detected).

For `output_mode = doc-set`, existing per-item criteria apply unchanged (backward compatible).

Thresholds must be configurable per sprint context so teams can set appropriate scope targets. Default values are encoded in the gate-reviewer agent as constants with comments.

## Acceptance Criteria

- gate-reviewer calls `docs_bom_validate_completeness` and `docs_metrics` when `output_mode = handbook`.
- PASS is issued only when all six handbook criteria are met.
- FAIL includes specific criteria that failed (e.g. "assembled_word_count = 800 < threshold 5000").
- For `output_mode = doc-set`, behavior is unchanged.
- Integration test: a handbook sprint with stub DOC items produces a gate-reviewer FAIL with violation details.
- Agent file documents all six criteria and the configurable thresholds.

# Update Diataxis prompt + skill — handbook authoring workflow and `output_mode` parameter

## Problem

The `devsteps-40-sprint` prompt and `sdevsteps-diataxis-sprint` skill currently describe a flat doc-set workflow. They do not document the handbook authoring workflow, the `output_mode` parameter, or the new tools (`bom_outline`, `bom_add_node`, `bom_validate_completeness`, `docs_metrics`, `docs_assemble`). Users following the skill guide will produce flat doc-sets even when they intend a handbook.

## Current State

- `.github/prompts/devsteps-40-sprint.prompt.md`: references the 7-step workflow but does not distinguish handbook vs doc-set.
- `.github/skills/sdevsteps-diataxis-sprint/SKILL.md`: describes the 7-step BOM/assembly workflow but lacks the `output_mode` parameter, the `bom_outline` pre-step, and the new validation/metrics tools.
- Neither file documents the configurable thresholds used by the gate-reviewer handbook criteria.

## Proposed Approach

1. **`devsteps-40-sprint` prompt**: Add a handbook vs doc-set branching decision at step 1 of the sprint setup phase. Document that `output_mode` must be established in the CSPG gate and passed through the dispatch chain. Add a handbook-specific section that references `bom_outline` as step 0 (before authoring begins).

2. **`sdevsteps-diataxis-sprint` SKILL.md**: Update the 7-step workflow to an 8-step pipeline that includes:
   - Step 0: Establish `output_mode` (handbook | doc-set) in CSPG
   - Step 1 (handbook only): Call `bom_outline` to pre-declare the BOM skeleton
   - Steps 2–5: existing authoring steps (updated to reference `bom_add_node` for incremental additions)
   - Step 6: Call `docs_assemble` (not just `bom_commit`)
   - Step 7: Gate-reviewer runs `bom_validate_completeness` + `docs_metrics`

3. Document all new tools in the skill reference section: `bom_outline`, `bom_add_node`, `bom_validate_completeness`, `docs_metrics` — with parameter signatures and usage notes.

4. Document configurable thresholds for gate-reviewer handbook criteria (default values: `handbook_word_threshold = 5000`, `quadrant_word_threshold = 400`, `min_children_per_quadrant = 2`).

## Acceptance Criteria

- `devsteps-40-sprint` prompt includes the `output_mode` question in the sprint setup phase.
- `sdevsteps-diataxis-sprint` SKILL.md documents the 8-step handbook pipeline.
- All five new tools are documented in the skill reference section with parameter signatures.
- Configurable gate-reviewer thresholds are documented with default values.
- A developer following only the SKILL.md guide can produce a correctly assembled handbook without referring to other documentation.

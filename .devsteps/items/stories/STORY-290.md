# Update coord-sprint + exec-doc agents — handbook vs doc-set intent

## Problem

At sprint start, coord-sprint does not ask the critical structural question: "Single assembled handbook (one output file) OR doc-set (N independent files)?" As a result, the planner defaults to a flat doc-set. This was root cause (A) from the post-mortem: pre-sprint clarification missed handbook-vs-doc-set intent.

The `output_mode` parameter (`handbook | doc-set`) is never established, never passed through the dispatch chain, and never honoured by exec-doc or exec-planner in their chapter_plan structure.

## Current State

- `.github/agents/devsteps-R0-coord-sprint.agent.md` (or equivalent): CSPG pre-planning questions do not include handbook vs doc-set choice.
- `.github/agents/devsteps-R4-exec-doc.agent.md`: chapter_plan is always flat; no concept of `output_mode`.
- `.github/agents/devsteps-R3-exec-planner.agent.md`: planner builds flat list regardless of intent.
- No `output_mode` parameter flows through the dispatch chain.

## Proposed Approach

1. **coord-sprint CSPG gate**: Add a mandatory pre-planning question — "Is the output a single assembled handbook (one file, hierarchical BOM) or a doc-set (N independent files, flat BOM)?" If handbook: confirm the four Diataxis quadrant roots and the expected chapter count. Set `output_mode: handbook | doc-set` in the sprint context that is passed to all downstream agents.

2. **exec-planner**: When `output_mode = handbook`, build a 1-ARCH-root + N-quadrant-roots + chapter structure in the plan. Call `bom_outline` before dispatching exec-doc workers. When `output_mode = doc-set`, use the existing flat chapter_plan structure.

3. **exec-doc**: When `output_mode = handbook`, scope each worker to a specific quadrant or chapter slot in the BOM (not the whole handbook). Use `bom_add_node` for incremental additions. When `output_mode = doc-set`, use existing flat workflow.

4. Update agent frontmatter to document the `output_mode` parameter in the `args:` section.

## Acceptance Criteria

- coord-sprint CSPG pre-planning gate includes the handbook vs doc-set question.
- `output_mode` is present in the dispatch mandate sent from coord-sprint to exec-planner.
- exec-planner calls `bom_outline` when `output_mode = handbook`.
- exec-doc workers are scoped to BOM slots (not the whole handbook) when `output_mode = handbook`.
- Unit/integration test: a sprint mandate with `output_mode = handbook` triggers `bom_outline` call in exec-planner.
- Documentation: agent frontmatter `args:` section documents `output_mode`.

Create a dedicated instruction file `.github/instructions/devsteps-doc-system.instructions.md` that defines the end-to-end doc system contract.

Scope:
- Authoring invariant: every doc fragment starts with H1 (`# Title`)
- Split invariants: `split_at_level` accepted values (1|2|3), default 1
- Ingestion invariant: no heading rewrite at write-time
- Assembly invariant: heading normalization only at render-time (`offset = bom_level - 1`, cap H6)
- Coverage workflow: review → import → assemble prompt sequence (57/58/59)
- Placeholder lifecycle: creation, stale handling, replacement policy

Acceptance criteria:
- Instruction applies to `.github/prompts/devsteps-57-doc-review.prompt.md`, `.github/prompts/devsteps-58-doc-import.prompt.md`, `.github/prompts/devsteps-59-doc-assemble.prompt.md`, `.github/agents/devsteps-R4-worker-doc-gap.agent.md`
- At least 1 explicit example for H1 authored fragment rendered at BOM level 3
- Includes a short anti-pattern section (authoring directly at H3/H4)
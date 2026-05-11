# Update devsteps-57-doc-review — reference STORY-297 ARCH-NNN baseline

## Problem

`devsteps-57-doc-review.prompt.md` (doc coverage check) has no reference to the ARCH-NNN hierarchy defined in STORY-297. When Copilot runs a doc-review, it has no structural baseline to compare against — it cannot detect whether a chapter is missing or misclassified relative to the intended handbook structure.

## Action

Add a section to `.github/prompts/devsteps-57-doc-review.prompt.md`:

```markdown
## Handbook Coverage Baseline

When reviewing coverage for the DevSteps project handbook, use STORY-297 as the authoritative structural baseline:
- L1 areas (ARCH-010 to ARCH-070) define the 7 functional areas
- Any DOC-item not linked to an ARCH-NNN slot is an orphan — flag in review report
- Any ARCH-NNN slot without a DOC-item mapping is a gap — include in gap list
- Diataxis type mismatches: e.g., a How-to item filed under a Reference chapter — flag for reclassification
```

## Acceptance Criteria

- The prompt includes a "Handbook Coverage Baseline" section
- It references STORY-297 as the authoritative TOC
- Orphan detection (DOC item without ARCH-NNN slot) is mentioned
- Gap detection (ARCH-NNN slot without DOC mapping) is mentioned
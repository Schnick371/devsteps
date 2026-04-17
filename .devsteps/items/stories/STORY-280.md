When a DOC item is created (add.ts) or updated (update.ts) with a description, run
heuristicClassify() on the description body and compare with the declared diataxis
frontmatter type. If declared type ≠ detected type (confidence > 0.55), append a
structured warning to the tool response next_steps[].

## Acceptance Criteria
- add.ts: After normalizeMarkdown(), if type='doc' and description provided:
  1. extractFrontmatter(description) → check if diataxis field is present
  2. heuristicClassify(excerpt) → get winner + confidence
  3. If confidence > 0.55 and declared_type ≠ winner: append warning to response
- update.ts: Same check when description field is being replaced
- Non-blocking: warning does NOT prevent the write
- Adds no new production dependencies

## Files
- packages/shared/src/core/add.ts (approx line 134)
- packages/shared/src/core/update.ts (approx line 128)
- packages/shared/src/core/heuristic-classify.ts (already available)
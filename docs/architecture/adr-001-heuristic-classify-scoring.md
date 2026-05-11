# ADR-001 — heuristicClassify uses scoring vector, not binary decision table

**Status:** Accepted  
**Date:** 2026-04-03  
**Supersedes:** None  
**Relates to:** STORY-236, SPIKE-043, TASK-400, TASK-405

---

## Context

SPIKE-043 specified `heuristicClassify` as a binary decision table (9 if/else patterns). `analyst-internal` found this unimplementable: the rule "score ≥ 0.5 on two types" is undefined when there is no scorer to produce a score in the first place.

A binary decision table cannot express partial matches, ambiguity, or mixed-type signals — all of which are common in real-world documentation files (READMEs that mix tutorial intro + reference API + how-to recipes).

## Decision

`heuristicClassify(entry)` returns a **score vector** per document:

```ts
{
  tutorial:     number,
  howTo:        number,
  reference:    number,
  explanation:  number,
  architecture: number,
  research:     number
}
```

- Scores are `[0.0, 1.0]` additive weights per matched pattern (normalized).
- `winner` = the type with the highest score.
- If `second-highest ≥ MIXED_THRESHOLD` (default `0.4`): `ClassificationResult.mixed = true`.
- `MIXED_THRESHOLD` is configurable but defaults to `0.4`.

## Consequences

- Enables reliable mixed-type detection (binary tables cannot express ambiguity).
- `heuristicClassify` is a **pure function** — testable without filesystem or fixtures.
- TASK-400 (unit tests) was updated to test score vectors rather than boolean outcomes.
- The threshold `0.4` may need tuning after the first real-world import run; tracked as future tuning work, not an architectural change.

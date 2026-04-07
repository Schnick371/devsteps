## Status: Accepted (2026-04-03)

> **Note:** This item should be re-typed to `doc` once the MCP server is rebuilt (crud.ts already includes `doc` enum — server needs restart after `npm run build`).

## Context
SPIKE-043 specified heuristicClassify as a binary decision table (9 if/else patterns). analyst-internal found this unimplementable: "score ≥0.5 on two types" is undefined when there is no scorer.

## Decision
heuristicClassify(entry) returns a SCORE VECTOR per document:
`{ tutorial: number, howTo: number, reference: number, explanation: number, architecture: number, research: number }`
- Scores are [0.0, 1.0] additive weights per matched pattern (normalized)
- winner = type with highest score
- If second-highest ≥ MIXED_THRESHOLD (default 0.4): ClassificationResult.mixed = true
- MIXED_THRESHOLD is configurable but defaults to 0.4

## Consequences
- Enables reliable mixed-type detection
- heuristicClassify is a pure function (testable without filesystem)
- TASK-400 (unit tests) must be updated to test score vectors
- Threshold 0.4 may need tuning after first real-world import run
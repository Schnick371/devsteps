Create `packages/shared/src/core/heuristic-classify.ts`:
- Input: excerpt (string, first 40 lines) + optional filepath
- Output: ScoreVector { tutorial, howTo, reference, explanation, architecture, research }
- 9 scoring rules from SPIKE-044 brief §5.2 (additive weights per matched pattern)
- Normalization: divide each score by sum of all scores
- Zero-signal fallback: { reference: 0.5, explanation: 0.5 }
- MIXED threshold: second_highest >= 0.4 × winner_score
- Pure function, no filesystem I/O
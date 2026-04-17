## Context
`heuristicClassify()` in `packages/shared/src/core/heuristic-classify.ts` currently uses ONLY
keyword/regex pattern matching (9 patterns). It does NOT analyze heading depth or structure density.

## New heuristic signals (to add to existing signal block)

Signal 1: H2/H3 density → Explanation
```
// Count heading lines at depth 2-3
const subHeadingLines = lines.filter(l => /^#{2,3}\s/.test(l)).length;
const nonEmptyLines = lines.filter(l => l.trim().length > 0).length;
const subHeadingRatio = nonEmptyLines > 0 ? subHeadingLines / nonEmptyLines : 0;
if (subHeadingRatio > 0.08) scores.explanation += 0.2; // rich sub-structure = explanation
```

Signal 2: Table density → Reference
```
const tableLines = lines.filter(l => /^\|.+\|/.test(l)).length;
const tableRatio = nonEmptyLines > 0 ? tableLines / nonEmptyLines : 0;
if (tableRatio > 0.25) scores.reference += 0.2; // high table density = reference
```

Signal 3: Flat structure + single H1 → Reference
```
const h1Count = lines.filter(l => /^#\s/.test(l)).length;
const h2PlusCount = lines.filter(l => /^#{2,}\s/.test(l)).length;
if (h1Count === 1 && h2PlusCount === 0 && tableRatio > 0.15) scores.reference += 0.15;
```

## Implementation notes
- Add after existing patterns, before confidence calculation
- ~13 lines total
- No new imports needed
- Thresholds are tunable — document them as named constants

## Acceptance criteria
- [ ] 3 new structural signals added to heuristicClassify()
- [ ] Unit tests: fragment with 4 H2 subheads → higher explanation score; fragment with >25% table lines → higher reference score
- [ ] Constants named: SUBHEADING_RATIO_THRESHOLD, TABLE_RATIO_THRESHOLD
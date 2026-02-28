# guide_plan_divergence — Planned vs Actual Execution Diff

## Context
EPIC-036: Durable Execution. After session resume or crash recovery, agents lose track of which plan steps were taken vs which remain. This tool computes the divergence between the declared plan and the trail record.

## Tool Design

```typescript
GuidePlanDivergenceInput {
  plan_id:    string
  session_id: string
}

GuidePlanDivergenceOutput {
  plan_id:             string
  session_id:          string
  coverage_pct:        number         // planned steps executed / total planned
  skipped_steps:       PlanStep[]     // planned but no trail event
  unplanned_actions:   TrailEvent[]   // trail events not matching any plan step
  order_violations:    Array<{
    expected_step: PlanStep
    actual_step:   PlanStep
    description:   string             // "step 3 executed before step 2"
  }>
  recommendation: "ON_TRACK" | "MINOR_DRIFT" | "MAJOR_DRIFT" | "REPLANNING_NEEDED"
}
```

**Matching algorithm:** Fuzzy match plan step title vs trail event description using Jaccard similarity on word tokens. Threshold ≥ 0.4 = matched.

**Order check:** Build ordered sequence of matched plan step indices from trail events; check monotonicity.

**Recommendation thresholds:**
- `ON_TRACK`: coverage ≥ 0.90, no unplanned actions
- `MINOR_DRIFT`: coverage ≥ 0.70, ≤ 3 unplanned
- `MAJOR_DRIFT`: coverage < 0.70 OR > 3 unplanned
- `REPLANNING_NEEDED`: order violations > 2 OR coverage < 0.40

## Acceptance Criteria

- [ ] Returns `coverage_pct: 1.0` and empty arrays when trail exactly matches plan
- [ ] Correctly identifies skipped steps (in plan but not in trail)
- [ ] Correctly identifies unplanned actions (in trail but not matching plan)
- [ ] `recommendation: "REPLANNING_NEEDED"` when more than 2 order violations detected
- [ ] Fuzzy matching tolerates minor wording differences (singular/plural, verb tense)
- [ ] Unit test: 10-step plan, execute 7 in random order, verify output
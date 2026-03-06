# guide_pattern_record + guide_pattern_suggest — Pattern Trust Library

## Context
EPIC-037: Pattern Library. From T2-C competitive analysis: APEX AI Memory's "library of proven implementation patterns with dynamic trust scores" is ranked #1 competitive gap for DevSteps Guide.

## Design

**Pattern file:** `.devsteps/guide/patterns/[PATTERN-ID].json`
```typescript
PatternSchema {
  id:           string           // PATTERN-001
  name:         string
  tags:         string[]
  category?:    string
  summary:      string           // one paragraph
  successes:    number           // incremented on "done" item close
  failures:     number           // incremented on "cancelled" after "in-progress"
  trust_score:  number           // Laplace-smoothed: successes / (successes + failures + 0.5)
  last_used:    datetime
  last_decay:   datetime         // decay × 0.95 every 90 days inactive
  source_item_id: string
  created_at:   datetime
}
```

**`guide_pattern_record`**:
```typescript
Input {
  approach_summary: string    // what implementation approach was used
  tags:             string[]
  outcome:          "success"|"partial"|"failed"
  source_item_id:   string
}
Output { pattern_id, trust_score, new_entry: boolean }
```

**`guide_pattern_suggest`**:
```typescript
Input {
  task_title:  string
  tags?:       string[]
  top_k?:      number (default 3)
}
Output {
  patterns: Array<{
    id, name, summary, trust_score, tags
    similarity_score: number    // Jaccard(input_tags, pattern_tags)
    combined_score:   number    // similarity × trust_score
  }>
}
```

**Trust decay:** Background routine (or on-read lazy evaluation): `trust_score × 0.95` if `last_used > 90 days`. Recomputed on every `guide_pattern_suggest` call.

**Auto-integration:** When `devsteps_update(status: "done")` is called, MCP handler checks for an in-progress session and calls `guide_pattern_record(outcome: "success")` if configured.

## Acceptance Criteria

- [ ] Trust formula: `successes / (successes + failures + 0.5)` — Laplace smoothing prevents 0/0
- [ ] Trust decay: multiply by 0.95 when `last_used` is > 90 days
- [ ] `guide_pattern_suggest` ranks by `similarity_score × trust_score` descending
- [ ] Pattern with 1 success and 0 failures scores 1/(1+0.5) = 0.667 (correct Laplace)
- [ ] Pattern with 0 successes and 1 failure scores 0/(0+1+0.5) = 0.0 (correct suppression)
- [ ] Unit tests: trust score computation, decay trigger, Jaccard similarity, top-k ranking
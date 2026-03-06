# guide_cot_capture + guide_reflect — Pre/Post Execution Quality Circuit

## Context
EPIC-010: Knowledge & Memory. T2-G competitive analysis: Shrimp Task Manager's #1 differentiator is the chain-of-thought + reflection loop. Together these tools create a closed verification circuit preventing agent drift and post-hoc rationalization.

## Tool A: guide_cot_capture (PRE-execution — called BEFORE any file changes)

```typescript
Input {
  item_id:         string
  reasoning:       string     // why this approach was chosen
  approach:        string     // what implementation steps will be taken
  risks:           string[]   // anticipated failure modes
  estimated_files: string[]   // files expected to be modified
  confidence:      number     // 0.0–1.0
}
Output {
  cot_id:             string     // COT-[uuid-short]
  divergence_warning: boolean    // true if Jaccard(estimated_files, item.affected_paths) < 0.80
}
```

Storage: `.devsteps/cot/[item_id]/[cot_id].json`

## Tool B: guide_reflect (POST-execution — called AFTER implementation)

```typescript
Input {
  item_id:              string
  cot_id:               string     // reference to the pre-flight CoT
  what_worked:          string
  what_didnt:           string
  lessons:              string[]
  actual_files_changed: string[]
  diverged_from_cot:    boolean
  divergence_notes?:    string
}
Output {
  reflection_id:   string
  cot_match_score: number    // Jaccard(estimated_files, actual_files_changed), range 0.0–1.0
}
```

Storage: `.devsteps/reflections/[item_id].json`

## The Circuit

`guide_verify_understanding` → `guide_cot_capture` → [implementation] → `guide_reflect` → `devsteps_update("done")`

**Auto-promotion to Pattern Library:** when `cot_match_score > 0.80` AND `diverged_from_cot: false`, automatically call `guide_pattern_record(outcome: "success")` using CoT `approach` as the pattern summary.

## Acceptance Criteria

- [ ] `guide_cot_capture` cannot be skipped: `guide_create_plan` checks for existing CoT and warns if missing
- [ ] `divergence_warning: true` when `Jaccard(estimated_files, item.affected_paths) < 0.80`
- [ ] `cot_match_score` = `Jaccard(estimated_files, actual_files_changed)`, range `[0.0, 1.0]`
- [ ] `guide_reflect` returns 400 when `cot_id` has no matching stored CoT record
- [ ] Auto-promotion triggered correctly at `cot_match_score > 0.80` + `diverged_from_cot: false`
- [ ] Unit tests: divergence warning trigger, Jaccard calculation (3 cases), auto-promotion threshold
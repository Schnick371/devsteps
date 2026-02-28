# guide_acceptance_check — Structured Acceptance Criteria Gate

## Context
EPIC-010: Knowledge. T2-G competitive finding: Shrimp Task Manager blocks "done" transitions when acceptance criteria are unmet. DevSteps currently stores criteria as plain description text. This story formalizes criteria as gateable structured checks and **integrates with `devsteps_update` to block `status: "done"` when criteria fail**.

## Tool Design

```typescript
GuideAcceptanceCheckInput {
  item_id: string
  criteria_results: Array<{
    criterion: string    // text of the criterion being evaluated
    met:       boolean
    evidence?: string   // what proves this met (test output, URL, log line, etc.)
    notes?:    string   // nuance or exceptions
  }>
}

GuideAcceptanceCheckOutput {
  item_id:                          string
  pass_count:                       number
  fail_count:                       number
  all_met:                          boolean
  gate_decision:                    "PASS" | "PARTIAL" | "FAIL"
  blocks_status_transition_to_done: boolean
  unmet_criteria:                   Array<{ criterion; notes? }>
  recommendation:                   string
}
```

**Gate decision logic:**
- All met → `PASS`, `blocks_status_transition_to_done: false`
- 50–99% met → `PARTIAL`, `blocks_status_transition_to_done: true` (surface to user for override)
- < 50% met → `FAIL`, `blocks_status_transition_to_done: true`

**Storage:** `.devsteps/guide/acceptance/[item_id].json` — overwritten on each call (last check wins).

**`devsteps_update` integration:** When `status: "done"` is requested, MCP handler reads acceptance file. If `blocks_status_transition_to_done: true` → returns error:
```
"Unmet acceptance criteria (N/M). Run guide_acceptance_check or use override: true to force."
```

`override: true` param on `devsteps_update` bypasses the gate (emergency use; logged in trail).

## Acceptance Criteria

- [ ] `gate_decision: "PASS"` when all criteria_results have `met: true`
- [ ] `gate_decision: "PARTIAL"` when 50–99% criteria are met
- [ ] `gate_decision: "FAIL"` when < 50% criteria are met
- [ ] `devsteps_update(status: "done")` checks acceptance file and returns clear error message when blocked
- [ ] `override: true` bypasses gate AND writes `override_used: true` event to trail
- [ ] Unit tests: 0/4 → FAIL, 2/4 → PARTIAL, 4/4 → PASS, override bypass
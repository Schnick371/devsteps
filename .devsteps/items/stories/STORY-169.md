# guide_verify_understanding — Chain-of-Thought Gate Before Execution

## Context
EPIC-038: Context Engineering. Shrimp Task Manager's #1 differentiator: chain-of-thought discipline. T2-G: "The trust mechanism is the app." This gate forces agents to demonstrate understanding before any file modification is permitted. Designed by T2-F subagent.

## 8-Gate Design

**Hard gates (ALL must pass):**
1. `fingerprint_fresh` — submitted `context_fingerprint` matches current computed fingerprint
2. `scope_identified` — `stated_understanding` mentions at least 1 specific file or function
3. `paths_acknowledged` — `planned_files` contains ≥ 1 file from item's `affected_paths`

**Soft gates (weighted into `gate_score`, threshold ≥ 0.60):**
4. `blockers_addressed` (weight 0.25) — mentions any blocking items if they exist
5. `no_scope_creep` (weight 0.25) — no obvious out-of-scope file references
6. `runbook_cited` (weight 0.20) — references a playbook if one was surfaced in `agent_guidance`
7. `anti_pattern_awareness` (weight 0.15) — mentions ≥ 1 anti_pattern from `agent_guidance`
8. `open_questions_seen` (weight 0.15) — acknowledges any `open_questions` from execution_state

```typescript
GuideVerifyUnderstandingInput {
  item_id:              string
  context_fingerprint:  string    // from guide_work_context
  stated_understanding: string    // agent's reasoning paragraph
  planned_files:        string[]  // files agent plans to touch
  resubmit_reason?:    string     // if this is a retry attempt
}

GuideVerifyUnderstandingOutput {
  passed:             boolean
  hard_gate_results:  { gate: string; passed: boolean; detail: string }[]
  soft_gate_results:  { gate: string; score: number; detail: string }[]
  gate_score:         number           // weighted sum of soft gate scores
  verification_token: string | null    // present only when passed: true
  failure_hints:      string[]         // one actionable item per failed gate
  resubmit_allowed:   boolean          // false after 3 failures → escalation
  attempt:            number
}
```

## verification_token

`sha256(item_id + fingerprint + Date.now().toString())` — consumed by `guide_create_plan`. Plan creation rejected without valid token with matching fingerprint. Token invalidated after 60 minutes or one use.

**Max 3 attempts:** After 3rd failure, `write_escalation` called automatically with `escalation_type: "scope-ambiguous"`.

## Acceptance Criteria

- [ ] Stale/missing `context_fingerprint` fails hard gate #1 with clear message
- [ ] `verification_token` is `null` when `passed: false`
- [ ] Token is invalidated (404) after 60 min or after one use
- [ ] 3rd failed attempt triggers `write_escalation`; `resubmit_allowed: false`
- [ ] `failure_hints` has exactly one entry per failed gate
- [ ] Unit tests: all 8 gates independently; 3-attempt exhaustion; stale fingerprint; token invalidation
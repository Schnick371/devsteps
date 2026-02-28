# guide_checkpoint + guide_recover_checkpoint — Sub-step Durable Execution

## Context
EPIC-036: Durable Execution. Session resume (EPIC-033) operates at step boundaries. Long-running steps (e.g., "migrate 47 files") that crash mid-step lose all progress. T2-B classified this CRITICAL.

## Design

Checkpoint files stored at `.devsteps/cbp/[session_id]/checkpoints/[plan_id].ckpt.jsonl` (append-only JSONL):

```typescript
CheckpointSchema {
  ckpt_id:        uuid
  plan_id:        string
  session_id:     string
  step_number:    string          // last successfully committed step
  committed_at:   datetime
  state_hash:     string          // SHA-256 of plan JSON at this point
  resume_from:    string          // step_number to restart from on crash
  attempt:        number
}
```

**`guide_checkpoint`**:
```typescript
Input {
  item_id:               string
  step_index:            number
  checkpoint_label:      string       // "processed 23/47 files"
  progress_numerator:    number
  progress_denominator:  number
  recoverable_state:     Record<string, unknown>  // serializable work state
  files_modified_so_far: string[]
}
Output { checkpoint_id, saved_at }
```

**`guide_recover_checkpoint`**:
```typescript
Input { item_id, step_index }
Output {
  checkpoint: CheckpointState | null
  last_saved: datetime
  recoverable_state: Record<string, unknown>
}
```

**Recovery integration with `guide_resume_session`:**
1. Load latest checkpoint for plan_id
2. Find last trail event with outcome="ok"
3. If checkpoint.step_number ≠ trail.last_ok_step → advance checkpoint
4. Set plan.next_step = checkpoint.resume_from
5. Emit `session_resumed` trail event with `crash_detected: true`

**Max retry config** (`.devsteps/config.json`):
```json
{ "durable_execution": { "max_attempts_per_step": 3, "backoff_base_ms": 500, "backoff_cap_ms": 30000 } }
```

## Acceptance Criteria

- [ ] Checkpoint appended atomically (.tmp → rename) after each step completion
- [ ] `guide_recover_checkpoint` returns `null` when no checkpoint exists (first run) — graceful
- [ ] `guide_resume_session` calls `guide_recover_checkpoint` internally and restarts from `resume_from`
- [ ] When `attempt ≥ max_attempts_per_step`, writes escalation via `write_escalation`
- [ ] Backoff: `wait_ms = min(backoff_cap_ms, backoff_base_ms × 2^(attempt-1))`
- [ ] Unit test: checkpoint at step 3/10; simulate crash; resume from step 3 (not step 1)
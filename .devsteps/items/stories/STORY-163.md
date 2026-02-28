# guide_pause_for_human + guide_human_response — HIL Interrupt Gate

## Context
EPIC-036: Durable Execution. The #1 missing governance pattern for agentic AI in 2026: "Hard Interrupts" that enforce human sign-off before irreversible actions. Validated by:
- LangGraph HITL: `interrupt()` node + checkpoint saver
- MEXC News (Feb 2026): "Governance-as-Code with Hard Interrupts to enforce human sign-off"
- T2-B analysis: CRITICAL priority

## Tool Designs

**`guide_pause_for_human`** — creates a blocking interrupt:
```typescript
Input {
  item_id:          string
  step_index:       number      // which plan step is paused
  interrupt_type:   "approval"|"decision"|"confirmation"|"correction"
  question:         string      // what human must answer
  context_snapshot: string      // compressed state for human
  options?:         string[]    // if decision: choices
  risk_level:       "low"|"medium"|"high"|"critical"
  timeout_minutes?: number      // auto-escalate if no response
}
Output { interrupt_id, status: "waiting", paused_at }
```
Storage: `.devsteps/guide/interrupts/[interrupt_id].json`
Effect: sets associated Plan step to `blocked` status; `guide_resume_session` checks for pending interrupts and refuses to continue until resolved.

**`guide_human_response`** — resolves a blocking interrupt:
```typescript
Input {
  interrupt_id:    string
  decision:        string
  modified_plan?:  PlanStepPatch[]  // human can modify upcoming plan steps
}
Output { resumed: true, next_step: number }
```
Effect: sets interrupt status to `resolved`; unblocks the plan step; appends `human_input_received` trail event.

## Acceptance Criteria

- [ ] `guide_pause_for_human` writes interrupt file atomically (.tmp → rename)
- [ ] `guide_resume_session` checks `.devsteps/guide/interrupts/` for any `status: "waiting"` before allowing execution
- [ ] `guide_human_response` with `modified_plan` patches the plan file and records changes in trail
- [ ] `timeout_minutes` creates a corresponding escalation via `write_escalation` tool when exceeded
- [ ] VS Code extension can display pending interrupts in the TreeView (future story — just ensure the interrupt file format supports it)
- [ ] Unit test: create interrupt → attempt resume (should fail) → resolve interrupt → resume (should succeed)
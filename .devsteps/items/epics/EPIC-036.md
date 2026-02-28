# EPIC-036: Durable Execution — Human-in-the-Loop & Crash Recovery

## Context

From T2-B (Missing Tools) and T2-A (Architecture) research, two CRITICAL patterns are absent from the current DevSteps Guide plan:

1. **Human-in-the-Loop (HIL)**: LangGraph's #1 feature is the ability for an agent to PAUSE at a decision point requiring human judgment, preserve state, and wait for a response before continuing. DevSteps has no equivalent.

2. **Sub-step Durable Execution**: Session resume (EPIC-033) works at step boundaries. Long-running steps (e.g., "migrate 47 files") that crash mid-step lose all progress.

## Problem

- An AI agent encountering an irreversible operation (file deletion, DB migration, deploy) must either proceed blindly or abort — there's no "wait for approval" mechanism
- A 3-hour migration task that crashes at step 40/47 restarts from zero
- The plan diverges from reality (steps skipped, order changed) with no structural diff

## Scope

### Included
- `guide_pause_for_human`: blocking interrupt gate — freezes execution plan step, records decision needed, prevents resume until `guide_human_response` is called
- `guide_human_response`: human resolves the interrupt, optionally patching upcoming plan steps
- `guide_checkpoint` / `guide_recover_checkpoint`: intra-step progress checkpointing (progress_numerator/denominator, recoverable_state)
- `guide_plan_divergence`: diff expected plan steps vs actual trail events — identifies skipped, out-of-order, unplanned actions

### Excluded
- Full Temporal / LangGraph dependency (too heavy — local file-based checkpoint pattern sufficient)
- Multi-agent concurrency model (future epic)

## Research Evidence

- LangGraph HITL: `interrupt()` node, checkpoint saver, state replay from any prior checkpoint
- Temporal durable execution: workflows survive crashes at sub-step granularity 
- Strands SDK Feature Request #18417: "session persistence should be first-class"
- T2-B analysis: `guide_pause_for_human` + `guide_checkpoint` are both classified CRITICAL priority

## Success Criteria

- An agent can call `guide_pause_for_human` on an irreversible action and session remains frozen until `guide_human_response` is called
- A 100-step migration interrupted at step 47 can resume from step 47 (not step 1) via checkpoint recovery
- `guide_plan_divergence` returns a structured diff showing which steps the agent skipped or executed out of order
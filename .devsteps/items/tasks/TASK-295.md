## Context

worker-refactor has no exec conductor — it is dispatched directly by coord (\"coord ONLY\"). This means refactor stories bypass the exec-planner → exec-conductor pipeline and go straight to a worker.

## Decision

1. Create `devsteps-R3-exec-refactor.agent.md` as a proper conductor that:
   - Reads exec-planner MandateResult
   - Dispatches worker-refactor (+ worker-build-diagnostics on failure)
   - Returns MandateResult
2. Update coord agents to dispatch exec-refactor instead of worker-refactor directly
3. Add exec-refactor to the Ring 4 Radial Spokes table (conductor-mediated Code spoke)
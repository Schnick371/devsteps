## Problem

The coord (R0) directly calls mcp_devsteps_add/update for non-lifecycle operations (creating follow-up tasks, linking items, writing descriptions) instead of delegating to worker-devsteps. This breaks the Spider Web principle: coord orchestrates, workers execute.

## Architectural Finding

In session TASK-293, coord called mcp_devsteps_add directly to create TASK-294 and TASK-295. These should have been delegated to worker-devsteps.

## Delegation Boundary (to be documented)

**coord MAY call directly:**
- mcp_devsteps_update (status only: in-progress, review, done)
- Initial bootstrap item creation for the CURRENT sprint task (once, to get item ID)
- Read operations: mcp_devsteps_read_mandate_results

**coord MUST delegate to worker-devsteps:**
- mcp_devsteps_add (new follow-up items found during sprint)
- mcp_devsteps_link (creating relationships)
- mcp_devsteps_update (descriptions, tags, append_description)
- Complex multi-item DevSteps operations

## Scope

- Update worker-devsteps.agent.md with full delegation boundary
- Update coord-*.agent.md files with delegation constraint
- Update AGENT-DISPATCH-PROTOCOL with DevSteps Delegation Boundary table
- Update copilot-instructions.md

## Acceptance Criteria

1. coord-*.agent.md states delegation rule clearly (coord = lifecycle gates only)
2. worker-devsteps.agent.md lists all delegatable operations with examples
3. AGENT-DISPATCH-PROTOCOL has DevSteps Delegation Boundary table
4. copilot-instructions.md updated with the new constraint## Result (2026-03-04, commit 0057a94)

Delegation boundary fully documented and enforced. 6 files changed:

- **I-11 added** to AGENT-DISPATCH-PROTOCOL: coord MUST NOT call mcp_devsteps_add/link for follow-up ops
- **worker-devsteps.agent.md**: Delegatable Operations table (4 rows) + coord-Reserved Operations table (5 rows) 
- **coord.agent.md + coord-sprint.agent.md**: mid-lifecycle devsteps/add → dispatch worker-devsteps
- **copilot-instructions.md**: bootstrap-only clarifier + I-11 boundary blockquote
- **devsteps-agent-protocol.instructions.md**: Caller column added to Tool Reference

Industry validation: ALL frameworks (ADK, AutoGen, CrewAI, LangGraph, Anthropic) confirm coordinator = lifecycle gates only. R5 GATE: PASS (all 6 AC).
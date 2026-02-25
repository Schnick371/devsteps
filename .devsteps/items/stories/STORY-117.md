## Problem

**Escalation is a one-way street.**

`write_escalation` (MCP) writes an escalation to `.devsteps/cbp/[sprint_id]/escalations/`. But there is no `read_escalations` tool. After a session restart, or when T1 pauses between phases, it cannot query which escalations are still open.

**Consequence:** T1 writes an escalation, the user provides an answer, the next session starts → T1 "forgets" the open escalation and silently continues the blocked phase. This violates the core guarantee: *"Never silently continue after writing an escalation."*

## Goal

`read_escalations` MCP tool that retrieves open, resolved, or all escalations for a sprint. T1 uses this at session start to check for any pending decisions.

## Acceptance Criteria

- [ ] `read_escalations` tool defined in `packages/mcp-server/src/tools/cbp.ts`
- [ ] Parameters: `sprint_id` (required), `status_filter: 'open'|'resolved'|'all'` (default: `'open'`)
- [ ] Reads all `[escalation_id].json` files from `.devsteps/cbp/[sprint_id]/escalations/`
- [ ] Returns: `{ escalations: EscalationRecord[], pending_count: number }`
- [ ] T1 Coordinator + Sprint Executor agent files updated: **session-start check** `read_escalations({ sprint_id, status_filter: 'open' })` → if `pending_count > 0`, report escalation to user before any action
- [ ] Mechanism to mark escalations as `resolved`: either via `resolve_escalation` (dedicated tool) or an update field in the `write_escalation` schema

## Updated T1 Session-Start Protocol

```
1. devsteps/list — backlog
2. read_escalations(sprint_id, 'open') ← NEW
   → pending_count > 0 → PAUSE, let user decide
3. read_mandate_results(item_ids)
4. Phase A: T2 Dispatch
```

## Agent Documentation Changes

- `devsteps-t1-coordinator.agent.md`: add session-start escalation check
- `devsteps-t1-sprint-executor.agent.md`: add pre-sprint check under "Step 0: Pending Escalations"
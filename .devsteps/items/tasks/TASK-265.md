## Goal

Explicitly extend T1 Coordinator and T1 Sprint Executor with a "Session-Start: Check pending escalations" step.

## Changes

### `devsteps-t1-coordinator.agent.md`

After the triage step, before Phase A, add a new section:

```markdown
## Step 0: Pending Escalation Check (MANDATORY — before every session)

1. `read_escalations(sprint_id, 'open')` — check for open escalations
2. If `pending_count > 0`:
   ⚠️ DECISION REQUIRED
   Escalation from: [source_agent]
   Type: [escalation_type]
   Decision needed: [decision_needed]
   Blocked items: [blocking_items]
   
   → Wait for user decision
   → Call `resolve_escalation(...)` once user has decided
   → ONLY THEN continue to Phase A
3. If `pending_count == 0` → proceed directly to Triage
```

### `devsteps-t1-sprint-executor.agent.md`

Add "Step 0" to "Pre-Sprint Analysis":

```markdown
### Step 0: Pending Escalations (MANDATORY)
read_escalations(sprint_id, 'open')
→ pending_count > 0 → Surface to user, HALT until resolved
→ pending_count == 0 → Continue to Step 1
```

## Acceptance Criteria
- [ ] Both agent files contain the Step 0 escalation check at the correct position
- [ ] The check always comes BEFORE Phase A, always AFTER session start
- [ ] `sprint_id` origin is documented (from user input or from the last sprint brief)
- [ ] Behavior when `.devsteps/cbp/` directory is missing: no empty error, graceful "no escalations" response
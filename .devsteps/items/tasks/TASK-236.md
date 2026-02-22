# Task: Loop Control MCP Tools — write_rejection_feedback + write_iteration_signal + write_escalation

## What
Three MCP tools for loop control signals — enables bounded loops without infinite recursion.

### Tool: write_rejection_feedback
```typescript
// Called by deep-analyst-quality (reviewer) when it REJECTS a Tier-3 result
// Tier-1 reads this and re-dispatches the Tier-3 agent with rejection context
handler: async (args: {
  target_subagent: string,
  iteration: number,
  rejection_type: RejectionType,
  violated_criteria: string[],
  specific_issues: Array<{file, line?, issue, suggestion}>,
  max_iterations_remaining: number,
  escalate_if_remaining: number,
  sprint_id: string,
  item_id: string,
}) => void

// Storage: .devsteps/cbp/{sprint_id}/{item_id}.rejection-{iteration}.json
```

### Tool: write_iteration_signal
```typescript
// Called by any agent in a loop to signal loop state to Tier-1
// Enables Tier-1 to detect stuck loops and break them
handler: async (args: {
  loop_type: "tdd" | "review-fix" | "clarification" | "replanning",
  status: "continuing" | "resolved" | "exhausted" | "escalated",
  iteration: number,
  max_iterations: number,
  sprint_id: string,
  item_id: string,
  notes?: string,
}) => void

// Storage: .devsteps/cbp/{sprint_id}/{item_id}.loop-signal.json
// Overwrites previous signal (Tier-1 reads the CURRENT state)
```

### Tool: write_escalation
```typescript
// Called by any agent when it cannot proceed without human/higher-tier decision
handler: async (args: {
  source_agent: string,
  escalation_type: EscalationType,
  context: string,
  decision_needed: string,
  blocking_items: string[],
  suggested_resolution?: string,
  sprint_id: string,
}) => { escalation_id: string }

// Storage: .devsteps/cbp/{sprint_id}/escalations/{escalation_id}.json
// Tier-1 checks for pending escalations before each phase
```

## Loop Bound Enforcement
All tools MUST validate that max_iterations ≤ 5 (configurable via constants.ts) to prevent infinite loops.

## Acceptance Criteria
- [ ] All 3 tools validate against their respective loop schemas
- [ ] `write_iteration_signal` overwrites previous file (CURRENT state semantics)
- [ ] `write_escalation` returns generated `escalation_id` for correlation
- [ ] Max iteration bound enforced at handler level (not just schema)
- [ ] Unit tests for each handler (success + bound exceeded paths)
- [ ] All 3 registered in mcp-server tools list
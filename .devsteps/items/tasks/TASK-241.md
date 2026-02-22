# Task: Create deep-analyst-planner Agent (Tier-2)

## Role
**Domain:** Implementation planning + step decomposition  
**Mandate Type:** `planning`  
**Dispatches:** NONE (pure synthesis, no Tier-3 needed)  
**Uses:** MandateResults from archaeology + risk analysts (reads from CBP files)  
**Returns:** MandateResult with atomic implementation plan

## Core Value Proposition

This agent is the KEY to atomic task decomposition.  
Today's coordinators plan implementation steps ad-hoc in their own context.  
deep-analyst-planner reads the FULL context (archaeology + risk MandateResults) and produces an **atomic step plan** — a numbered sequence of file-level changes that impl-subagent can execute ONE STEP AT A TIME.

## Agent Behavior

### Phase 1: Read Prior MandateResults
```
read_mandate_results(sprint_id, mandate_ids: ["archaeology_id", "risk_id"])
→ knows: affected scope, risk hotspots, file collision points
```

### Phase 2: Decompose into Atomic Steps
Produce: ordered list of `ImplementationStep` objects:
```typescript
ImplementationStep {
  step_number: number,
  file: string,               // Single file (atomic = one file per step)
  action: "create" | "modify" | "delete",
  description: string,        // What to do in this file (< 100 tokens)
  test_step: boolean,         // Does this step need test verification?
  depends_on_steps: number[], // Step ordering constraints
  estimated_tokens: number,   // For Tier-1 budget planning
}
```

### Phase 3: Sprint Sequencing (for `planning` mandate in sprint context)
Given risk batch MandateResult → output recommended execution ORDER for all items:
```
findings:
  Item execution order: TASK-A → TASK-B → TASK-C (TASK-B blocked by TASK-A on auth.ts)
  Est. total tokens: 45K (within sprint budget)
  Risk checkpoints: after items 3, 6 (high risk items)
```

## Acceptance Criteria
- [ ] Does NOT dispatch subagents (pure synthesis from existing MandateResults)
- [ ] ImplementationStep format in MandateResult findings
- [ ] Step dependencies correctly modeled (no circular deps)
- [ ] Sprint sequencing includes token budget estimate
- [ ] When TDD: test steps interleaved between implementation steps
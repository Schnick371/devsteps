# Task: Loop Control CBP Schemas

## What
Three schemas for loop control patterns (Review-Fix, TDD, Clarification, Escalation):

### RejectionFeedbackSchema
```typescript
// Tier-2 reviewer → Tier-3 agent: structured rejection with context
RejectionFeedbackSchema = z.object({
  target_subagent: z.string(),           // Which Tier-3 agent failed?
  iteration: z.number().int().min(1),   // Which iteration is this?
  rejection_type: z.enum([
    "quality-insufficient",
    "wrong-approach",
    "missing-requirement",
    "test-failure",
    "type-error",
  ]),
  violated_criteria: z.array(z.string()), // Which ACs failed?
  specific_issues: z.array(z.object({
    file: z.string(),
    line: z.number().optional(),
    issue: z.string(),
    suggestion: z.string(),
  })),
  max_iterations_remaining: z.number(),  // Loop bound
  escalate_if_remaining: z.number(),     // Trigger escalation threshold
})
```

### IterationSignalSchema
```typescript
// Any agent → Tier-1: signal about loop state (prevents infinite loops)
IterationSignalSchema = z.object({
  loop_type: z.enum(["tdd", "review-fix", "clarification", "replanning"]),
  status: z.enum(["continuing", "resolved", "exhausted", "escalated"]),
  iteration: z.number(),
  max_iterations: z.number(),
  notes: z.string().optional(),
})
```

### EscalationSignalSchema
```typescript
// Any tier → Tier-1: signal that human or higher-tier decision is needed
EscalationSignalSchema = z.object({
  escalation_id: z.string().uuid(),
  source_agent: z.string(),
  escalation_type: z.enum([
    "human-required",           // Cannot proceed without user input
    "contradicting-requirements",
    "budget-exhausted",
    "architectural-decision",
    "scope-ambiguous",
  ]),
  context: z.string(),          // What led to escalation (< 400 tokens)
  decision_needed: z.string(),  // Specific question for human/Tier-1
  blocking_items: z.array(z.string()), // Items blocked by this
  suggested_resolution: z.string().optional(),
})
```

## Where
- `packages/shared/src/schemas/cbp-loops.ts` (new file)
- Export from `packages/shared/src/index.ts`

## Acceptance Criteria
- [ ] All 3 schemas exported from shared package
- [ ] TypeScript types: `RejectionFeedback`, `IterationSignal`, `EscalationSignal`
- [ ] Loop bounds (max_iterations) enforced at schema level (min/max validators)
- [ ] Unit tests cover edge cases (iteration = max, escalation threshold)
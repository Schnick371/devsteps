# Story: MandateResult CBP Extension — Tier 2 ↔ Tier 1 Communication

## Problem

The CBP (EPIC-027) covers Tier 3 → Tier 1 (write_analysis_report, read_analysis_envelope, write_verdict). But when we introduce Tier-2 Deep Analysts, there is **no structured protocol** for:
- Tier 1 to assign a **Mandate** to a Tier-2 agent
- Tier 2 to report its synthesized **MandateResult** back to Tier 1
- Loop signals between tiers (rejection feedback, iteration counting, escalation)

Without this, Tier 2 agents would have to paste their synthesis as free text in chat — breaking the context isolation that CBP provides.

## Schemas Needed (packages/shared/src/schemas/cbp.ts)

### MandateSchema
```typescript
// Tier 1 → Tier 2: assignment
MandateSchema = {
  mandate_id: string,          // e.g. "TASK-097-risk"
  item_id: string,             // DevSteps item being worked on
  mandate_type: "archaeology" | "risk" | "research" | "quality" | "planning" | "review",
  scope: string,               // max 400 chars: what to analyze
  tier3_hints: string[],       // suggested Tier-3 agents (context, internal, web, impact, ...)
  constraints: string[],       // time-box, token budget, focus areas
  timestamp: string,
}
```

### MandateResultSchema  
```typescript
// Tier 2 → Tier 1: synthesis
MandateResultSchema = {
  mandate_id: string,
  item_id: string,
  mandate_type: string,
  tier2_agent: string,
  source_envelopes: string[],  // report_paths of the Tier-3 reports read
  verdict: "GO" | "HOLD" | "REDESIGN" | "ESCALATE",
  confidence: number,          // 0-100
  synthesis: string,           // max 500 chars — the key insight
  actions: {                   // concrete directives for Tier 1
    action: string,
    target: string,
    priority: "must" | "should" | "could",
  }[],
  blockers: {
    description: string,
    severity: "critical" | "major" | "minor",
    escalate_to_tier1: boolean,
  }[],
  report_path: string,         // full report location
  timestamp: string,
}
```

### Loop Support Schemas
```typescript
// Reviewer → impl-subagent: structured rejection
RejectionFeedbackSchema = {
  item_id: string,
  iteration: number,           // which review round (1-based)
  verdict: "CONDITIONAL" | "FAIL",
  gaps: { criterion: string, actual: string, expected: string }[],
  must_fix: string[],          // max 5 items
  must_not_break: string[],    // regression guards
  report_path: string,
}

// impl/test → tier2: iteration tracking
IterationSignalSchema = {
  item_id: string,
  loop_type: "tdd" | "review-fix",
  iteration: number,
  max_iterations: number,
  status: "continuing" | "exhausted",
  last_error: string,          // max 200 chars
}

// Tier 3 → Tier 2: unexpected discovery requiring re-routing
EscalationSignalSchema = {
  item_id: string,
  source_agent: string,
  severity: "critical" | "major",
  finding: string,             // max 400 chars
  recommendation: "pause-sprint" | "redesign-item" | "split-item" | "inform-only",
}
```

## MCP Tools Needed (packages/mcp-server/src/handlers/analysis.ts)

- `write_mandate_result(mandate_id, item_id, result: MandateResultSchema)` 
- `read_mandate_results(item_id)` → array of all MandateResults for that item
- `write_rejection_feedback(item_id, feedback: RejectionFeedbackSchema)`
- `read_rejection_feedback(item_id, iteration)` → impl-subagent reads before re-run
- `write_iteration_signal(item_id, signal: IterationSignalSchema)`
- `write_escalation(item_id, signal: EscalationSignalSchema)`

## Acceptance Criteria

- [ ] All 6 Zod schemas in `packages/shared/src/schemas/cbp.ts`, exported in index
- [ ] All 6 MCP tools in mcp-server, registered in tools/index.ts
- [ ] Handlers in `analysis.ts` with proper file paths: `.devsteps/analysis/[itemId]/mandate-[mandateId]-result.json`
- [ ] `npm run build` clean, `npm test` passes (new Zod tests)
- [ ] No existing CBP tools broken (backward compatible)
# Task: Core CBP Tier-2 Schemas

## What
Add two new Zod schemas to `packages/shared/src/schemas/cbp.ts` (or a new file `cbp-tier2.ts`):

### MandateSchema
```typescript
// A Tier-1 instruction dispatched to a Tier-2 Deep Analyst
MandateSchema = z.object({
  mandate_id: z.string().uuid(),        // Unique ID for correlation
  type: z.enum([                        // Which analyst receives this?
    "archaeology",                       // deep-analyst-archaeology
    "risk",                              // deep-analyst-risk
    "research",                          // deep-analyst-research
    "quality-review",                    // deep-analyst-quality
    "planning",                          // deep-analyst-planner
    "risk-batch",                        // deep-analyst-risk (multi-item)
    "archaeology-delta",                 // incremental re-analysis
  ]),
  sprint_id: z.string(),                // Sprint or item context
  item_ids: z.array(z.string()),        // Items this mandate covers
  triage_tier: z.enum(["QUICK", "STANDARD", "FULL", "COMPETITIVE"]),
  constraints: z.record(z.unknown()).optional(), // Tier-1 context hints
  dispatched_at: z.string().datetime(),
  max_tokens: z.number().optional(),    // Budget hint for analyst
})
```

### MandateResultSchema
```typescript
// A Tier-2 synthesis result returned to Tier-1
MandateResultSchema = z.object({
  mandate_id: z.string().uuid(),        // Correlates to Mandate
  analyst: z.string(),                  // Which agent produced this?
  status: z.enum(["complete", "partial", "escalated"]),
  findings: z.string(),                 // Structured markdown, < 800 tokens
  recommendations: z.array(z.string()), // Actionable for Tier-1
  confidence: z.number().min(0).max(1),
  token_cost: z.number(),               // Actual tokens consumed
  completed_at: z.string().datetime(),
  escalation_reason: z.string().optional(), // If status === "escalated"
})
```

## Where
- `packages/shared/src/schemas/cbp.ts` — add after existing schemas
- OR new file `packages/shared/src/schemas/cbp-mandate.ts` (if cbp.ts > 200 lines)
- Export from `packages/shared/src/index.ts`

## Acceptance Criteria
- [ ] Both schemas exported from shared package
- [ ] TypeScript types inferred: `Mandate`, `MandateResult`
- [ ] Unit tests in `packages/shared/src/schemas/cbp-mandate.test.ts`
- [ ] No breaking changes to existing exports
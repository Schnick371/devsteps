# Task: Core Tier-2 MCP Tools — write_mandate_result + read_mandate_results

## What
Two new MCP tools that enable structured Tier-1 ↔ Tier-2 communication via the workspace file system.

### Tool: write_mandate_result
```typescript
// Called by a Tier-2 Deep Analyst after completing synthesis
// Writes validated MandateResult JSON to .devsteps/cbp/<sprint_id>/<mandate_id>.result.json
handler: async (args: {
  mandate_id: string,
  analyst: string,
  status: "complete" | "partial" | "escalated",
  findings: string,          // Markdown, < 800 tokens
  recommendations: string[], // Actionable items for Tier-1
  confidence: number,
  token_cost: number,
  escalation_reason?: string,
}) => MandateResult
```

**Storage path:** `.devsteps/cbp/{sprint_id}/{mandate_id}.result.json`
**Schema validation:** Uses MandateResultSchema from shared package

### Tool: read_mandate_results
```typescript
// Called by Tier-1 to collect all results for a sprint/mandate batch
// Returns all MandateResult files matching the sprint_id
handler: async (args: {
  sprint_id: string,
  mandate_ids?: string[],     // Filter to specific mandates (optional)
  status_filter?: "complete" | "partial" | "escalated" | "all",
}) => MandateResult[]
```

**Returns:** Array of all MandateResult objects, sorted by `completed_at`
**Error behavior:** Missing files = empty array (not error), validation failure = structured error

## Implementation Notes
- Follow existing handler pattern in `analysis.ts`
- Storage follows existing `.devsteps/cbp/` directory structure
- Both tools registered in `tools/index.ts` with InputSchema

## Acceptance Criteria
- [ ] `write_mandate_result` validates against MandateResultSchema before writing
- [ ] `read_mandate_results` returns all results for a sprint_id (optional filter)
- [ ] File naming: `.devsteps/cbp/{sprint_id}/{mandate_id}.result.json`
- [ ] Unit tests for both handlers (success + validation error paths)
- [ ] Both tools registered in mcp-server tools list
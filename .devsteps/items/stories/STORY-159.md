# Trail Schema v2.0 — AI Observability Fields

## Context
EPIC-035: Trail Observability. The current TrailEvent schema records step outcomes but has no AI-level observability fields.

## What Must Be Added

~20 new **optional** fields to `TrailEventSchema` (in `packages/shared/src/schemas/`):

| Field | Type | Purpose |
|---|---|---|
| `schema_version` | `"2.0"` | Migration marker |
| `agent_tier` | `T1\|T2\|T3\|human` | Cost attribution per tier |
| `agent_id` | `string` | Subagent role name |
| `tool_invoked` | `string` | e.g. "guide_create_plan" |
| `tool_input_hash` | `string` | SHA-256 of input (privacy-safe) |
| `tool_result_ok` | `boolean` | Success of tool call |
| `tokens_input` | `number` | LLM input tokens |
| `tokens_output` | `number` | LLM output tokens |
| `model` | `string` | e.g. "claude-sonnet-4-6" |
| `cost_usd` | `number` | Derived at write time via price table |
| `knowledge_refs` | `string[]` | ADR/Convention IDs surfaced |
| `retrieved_chunks` | `number` | KB lookups performed |
| `iteration_hash` | `string` | hash(step + tool + input_hash) — enables loop detection |
| `wall_clock_lag` | `number` | ms since previous event — gap detection |
| `attempt` | `number` | Retry count for this step |
| `duration_ms` | `number` | Step execution time |

Model pricing table: `packages/shared/src/constants/model-pricing.ts`
```
claude-sonnet-4-6: input 0.003/1K, output 0.015/1K
```

Trail storage: `.devsteps/cbp/[session_id]/trail/[plan_id].trail.jsonl` — append-only NDJSON

Also add 12 new `event_type` values: `tool_called`, `knowledge_queried`, `human_input_requested`, `human_input_received`, `session_started`, `session_resumed`, `session_completed`, `loop_detected`, `checkpoint_written`, `plan_switched`, `cost_anomaly`, `evidence_attached`

## Acceptance Criteria

- [ ] All new fields are optional (no existing data migration required)
- [ ] `schema_version: "2.0"` is discriminated union (existing events auto-typed as v1)
- [ ] Model pricing table covers top 4 models with `"unknown"` fallback
- [ ] `iteration_hash` computation: `SHA-256(step_sort_key + ":" + tool_invoked + ":" + tool_input_hash).slice(0,16)`
- [ ] All 12 new event types added to the enum
- [ ] Unit tests: schema v2 validation, fingerprint computation, price lookup
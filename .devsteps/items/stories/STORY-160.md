# guide_trail_search — Paginated Trail Query Tool

## Context
EPIC-035: Trail Observability. Currently no way to search the activity trail by type, time range, agent tier, or tool invoked. Full file scan required.

## Tool Design

```typescript
GuideTrailSearchInput {
  parent_item_id?:  string      // STORY-xxx / TASK-xxx
  session_id?:      string
  plan_id?:         string
  event_types?:     TrailEventType[]
  agent_tier?:      "T1"|"T2"|"T3"|"human"
  outcome?:         "ok"|"error"|"skipped"|"blocked"
  tool_invoked?:    string       // exact or prefix match
  since?:           datetime
  until?:           datetime
  step_number?:     string       // "10" matches "10.*"
  limit?:           1–500 (default 50)
  cursor?:          string       // base64 continuation token
  sort?:            "asc"|"desc" (default "asc")
  fields?:          string[]     // sparse fieldset projection
}

GuideTrailSearchOutput {
  events:      TrailEvent[]
  total_count: number
  next_cursor: string | null
  stats: {
    completed, failed, blocked, retried: number
    total_tokens, total_cost_usd, avg_duration_ms: number
    unique_tools: string[]
  }
}
```

**Storage:** `.devsteps/cbp/[session_id]/trail/[plan_id].trail.jsonl`
**Cursor format:** `base64(JSON({ offset_byte: number, timestamp: string }))` → O(1) seek into NDJSON file

## Acceptance Criteria

- [ ] Tool accepts at least one of `parent_item_id`, `session_id`, or `plan_id`
- [ ] Cursor-based pagination returns consistent results even when trail file grows during iteration
- [ ] `stats` block is always present even when `events` is empty
- [ ] `step_number: "10"` matches events with `step_number: "10"`, `"10.1"`, `"10.2"` (prefix match)
- [ ] Unit tests: cursor serialization/deserialization, prefix matching, sparse fieldset projection
- [ ] Integration test: trail file with 200 events, paginate in pages of 50, verify no duplicates
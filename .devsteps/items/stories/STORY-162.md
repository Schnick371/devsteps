# guide_cost_report + guide_detect_loops — Token Cost & Loop Detection

## Context
EPIC-035. Two observability tools that use Trail Schema v2.0 data.

## Tool A: guide_cost_report

```typescript
GuideCostReportInput {
  group_by:   "session"|"item"|"agent_tier"|"model"|"tool"|"day"
  session_id?: string
  item_id?:   string
  since?:     datetime
  until?:     datetime
  format:     "table"|"json"|"prometheus" (default "json")
}

GuideCostReportOutput {
  generated_at, period, total_usd, total_tokens
  rows: Array<{ group_key, tokens_input, tokens_output, cost_usd, event_count, avg_cost_per_event, top_tool }>
  anomalies: Array<{ type: "cost_spike"|"token_explosion"|"tier_imbalance", detail, row_key }>
}
```

**Anomaly thresholds:** cost_spike = single event > 10× session median; token_explosion = output > 5× input; tier_imbalance = T2/T3 cost > 80% of session total.

## Tool B: guide_detect_loops

**Algorithm:** `iteration_hash` = hash(step_sort_key + tool_invoked + tool_input_hash). If same hash appears ≥ 3 times in a 10-event window → loop detected. Secondary: `wall_clock_lag > 120_000ms` on `step_started` with no `step_completed` → stall.

```typescript
GuideDetectLoopsInput {
  session_id:  string
  plan_id?:    string
  since?:      datetime
  sensitivity: "low"|"medium"|"high" (thresholds: 5/10, 3/10, 2/8)
}

GuideDetectLoopsOutput {
  loops: Array<{ fingerprint, step_number?, tool?, repetitions, first_seen, latest_seen, severity: "warning"|"critical" }>
  stalls: Array<{ step_number, started_at, lag_ms }>
  recommendation: string  // "Consider escalating TASK-xxx loop at step 10.2"
}
```

## Acceptance Criteria (both tools)

- [ ] `guide_cost_report` reads `tokens_input/output` + `model` from Trail v2.0 events
- [ ] `guide_cost_report(format: "prometheus")` returns valid Prometheus text format
- [ ] `guide_detect_loops` correctly identifies loop when same `iteration_hash` appears 3+ times in 10-event window
- [ ] Stall detection triggers for `wall_clock_lag > 120000` on `step_started` with no subsequent `step_completed`
- [ ] Unit tests: cost aggregation by tier, loop detection with fixture trail
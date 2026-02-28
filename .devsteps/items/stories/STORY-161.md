# guide_trail_replay — Narrative/Timeline/Diff Reconstruction

## Context
EPIC-035. Key missing capability: "What exactly did the agent do in that session yesterday?" Reconstructing AI session history is a top enterprise ask (LinkedIn CAPT: structured session replay contributed to 70% triage reduction).

## Tool Design

```typescript
GuideTrailReplayInput {
  plan_id:       string
  session_id:    string
  mode:          "narrative" | "timeline" | "diff" | "decisions"
  attempt_a?:    number   // for diff mode: compare attempt N vs M
  attempt_b?:    number
  step_range?:   [string, string]  // e.g. ["10", "30"]
  include_costs: boolean (default: false)
}

GuideTrailReplayOutput {
  replay_mode:   string
  generated_at:  datetime
  narrative?:    string       // markdown prose (mode="narrative")
  timeline?:     TimelineRow[]
  diff?:         DiffReport
  cost_summary?: { total_usd, by_tier }
}
```

**Narrative generation** (no LLM required) — template-driven from event types:
```
for each step:
  "Step {n}: {title}"
  step_started   → "  → Started by {tier} at {t} (attempt {k})"
  step_completed → "  ✓ Completed in {ms}ms"
  step_failed    → "  ✗ Failed: {message}"
  tool_called    → "    Tool: {tool_invoked} → {result}"
  knowledge_queried → "    Knowledge: {refs.join(', ')}"
```

**Diff mode** — Levenshtein on step sequences (each step = token), labels quality delta by failed_count ratio.

## Acceptance Criteria

- [ ] `mode: "narrative"` produces markdown with one paragraph per step, table of contents at top
- [ ] `mode: "timeline"` produces chronological table with `t` (HH:MM:SS offset from session start), event, tool, outcome
- [ ] `mode: "diff"` compares two attempt slices, returns `quality_delta: "better"|"worse"|"same"|"inconclusive"`
- [ ] `mode: "decisions"` only includes events where agent made a choice (inserted/blocked/retried)
- [ ] Output never calls an LLM — 100% template-driven from trail NDJSON
- [ ] Unit test: replay a 20-event fixture, check narrative paragraph count matches step count
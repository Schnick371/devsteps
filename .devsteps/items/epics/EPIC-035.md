# EPIC-035: Trail Observability — Cost Tracking, Loop Detection & Replay

## Context

From T2-A (Architecture) and T2-E (Trail & Observability) research, the current Trail system (EPIC-032 / STORY-138) only records step-level outcomes. It is missing the full observability layer that makes a production-grade AI agent system governable and debuggable.

## Problem

- No way to track LLM token consumption or cost per session / item / agent tier
- Trail search requires full file scan — no pagination, no field projection
- No replay capability: "what exactly did the agent do yesterday?" is unanswerable
- Loop detection is absent — an agent repeating the same failing step goes undetected
- No Prometheus export for team-lead dashboards or CI cost gates

## Scope

Extends EPIC-032 (Execution Plans & Activity Trail). Adds the observability substrate without changing existing trail semantics.

### Included
- Trail Schema v2.0: ~20 new optional fields (tokens, cost, tool_invoked, iteration_hash, wall_clock_lag, knowledge_refs, model, agent_tier)
- `guide_trail_search`: paginated, filterable trail query with cursor
- `guide_trail_replay`: narrative / timeline / diff reconstruction of past sessions
- `guide_cost_report`: per-session, per-item, per-tier token and cost aggregation with anomaly detection
- `guide_detect_loops`: fingerprint-based loop and stall detection
- `guide_export_metrics`: Prometheus / JSON / CSV export for Grafana integration

### Excluded
- Changes to plan execution (EPIC-032)
- Session management (EPIC-033)
- Human-in-the-loop interrupts (EPIC-036)

## Research Evidence

- LinkedIn CAPT: 70% issue triage reduction attributed in part to structured session replay
- Medium AI Audit Logging: formal schema for `tokens_input/output`, `tool_calls`, `cost_usd`, `user_feedback`
- Real-Time Agent Logging with MCP (prefactor.tech): Splunk/Elasticsearch integration pattern
- APEX AI Memory: dynamic trust scoring requires outcome telemetry per task

## Success Criteria

- An agent can query "what did the agent do in STORY-145 last week?" and receive a human-readable narrative
- Token cost per session is tracked to ±5% accuracy
- Loop detection fires before the 5th identical tool call in a 10-event window
- `/metrics` endpoint returns valid Prometheus text format scraped by Grafana
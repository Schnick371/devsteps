## Context
Depends on TASK-339 for MandateResult schema extension. MCP tool handlers need to record `duration_ms`, `parent_id`, and `event_type` alongside each MandateResult write to enable Spider Web ring timeline visualization.

## Changes
- `packages/mcp-server/src/` — wrap each MCP tool handler with a timing middleware:
  - Record `Date.now()` at handler entry, compute `duration_ms` at exit
  - Extract `parent_id` from request context or CBP session header if available
  - Set `event_type` based on tool category (analytics tools → `'analysis'`, write tools → `'synthesis'`)
- No new npm dependencies — use lightweight middleware pattern (higher-order function)
- Trace data enriches MandateResult writes, feeding webview Ring Visualization

## Acceptance Criteria
- All MCP tool handlers instrumented
- `duration_ms` recorded in MandateResult writes
- Unit tests verify timing data presence
# MCP Analysis Tools

Implement three MCP tool definitions and handlers for the Context Budget Protocol.

## Tools

- `write_analysis_report` — write a structured AnalysisBriefing JSON to `.devsteps/analysis/`
- `read_analysis_envelope` — read a stored CompressedVerdict or AnalysisBriefing JSON
- `write_verdict` — write a CompressedVerdict JSON envelope

## Atomic Write Semantics

All write operations use tmp-file → rename pattern to prevent stale reads.

## Acceptance Criteria

- `packages/mcp-server/src/handlers/analysis.ts` created with handler implementations
- 3 tool definitions added to `packages/mcp-server/src/tools/index.ts`
- `packages/mcp-server/src/index.ts` updated: +3 imports, +3 switch cases, +3 Map entries
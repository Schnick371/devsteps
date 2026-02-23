# User Story

As an MCP server developer, I want structured tracing and observability in MCP server code, so that I can debug and monitor MCP operations effectively.

> ⚠️ **Scope corrected 2026-02-23.** Original referenced `aitk-get_tracing_code_gen_best_practices` (Python/Azure AI Toolkit) — not applicable to our TypeScript MCP server. The underlying observability goal is valid; AITK tooling is not.

## Acceptance Criteria

- [ ] MCP server handlers have consistent structured logging (request/response pairs)
- [ ] Error context is preserved with stack traces and correlation IDs
- [ ] LOGGING.md updated with current patterns and examples
- [ ] Performance measurement patterns documented (handler duration)
- [ ] Instructions file for MCP TypeScript development references logging standards

## Implementation Notes

**Tracing Use Cases:**
- MCP handler execution flow (tool invocations)
- Request/response logging pairs
- Error tracking with correlation IDs
- Handler duration measurement

**Integration Points:**
- `packages/mcp-server/src/logger.ts` (existing logger)
- `packages/mcp-server/src/handlers/*.ts` (handler-level logging)
- `packages/mcp-server/LOGGING.md` (existing logging docs — update)
- `packages/mcp-server/src/metrics.ts` (existing metrics)

**No AITK dependency** — TypeScript observability via existing logger.ts + structured JSON output.

## Dependencies

None

## Effort Estimate

Small — update existing logging patterns, document in LOGGING.md
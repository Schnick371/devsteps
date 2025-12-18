# User Story

As an MCP server developer, I want tracing guidance integrated into development workflow, so that I can debug and monitor MCP operations effectively.

## Acceptance Criteria

- [ ] MCP server README includes tracing section
- [ ] Reference to `aitk-get_tracing_code_gen_best_practices` tool
- [ ] Examples showing how to add tracing to MCP handlers
- [ ] Analyzer agent mentions tracing when working on MCP code
- [ ] Documentation links to AI Toolkit tracing features
- [ ] Best practices for structured logging in MCP context

## Implementation Notes

**Tracing Use Cases:**
- MCP handler execution flow
- Request/response logging
- Error tracking and debugging
- Performance monitoring
- Tool invocation tracking

**Integration Points:**
- packages/mcp-server/src/index.ts (main entry)
- packages/mcp-server/src/handlers/*.ts (individual handlers)
- packages/mcp-server/LOGGING.md (existing logging docs)
- devsteps-analyzer.agent.md (MCP development guidance)

**AITK Tool Usage:**
When working on MCP code, call `aitk-get_tracing_code_gen_best_practices` to get:
- Tracing patterns for async operations
- Structured logging best practices
- Error context preservation
- Performance measurement patterns

## Dependencies

None - documentation and guidance only

## Effort Estimate

Medium - update multiple files and create examples
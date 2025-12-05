# Move MCP server handlers to extension/src/mcp-server/

**Completed**: Copied all MCP server handlers and utilities to extension package for bundling.

**Files Copied** (20 total):
- `handlers/` - 15 tool handler files (add, update, list, search, trace, etc.)
- `tools/` - Tool registration utilities
- `workspace.ts` - Workspace path utilities  
- `logger.ts` - MCP-specific logging

**Architecture Decision**: COPY not MOVE - npm package remains for Cursor/Windsurf fallback.

**Next**: TASK-134 will update imports to use `@schnick371/devsteps-shared`.
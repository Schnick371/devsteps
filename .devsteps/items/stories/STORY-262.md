Extend the MCP server's already-registered resources capability with artifact URIs. Implement ListResources + ReadResource handlers for devsteps://artifacts/{item-id}/{agent}-{session} namespace.

Makes agent output artifacts discoverable and accessible via MCP protocol without file path knowledge. MCP resources capability is already declared in packages/mcp-server/src/server.ts:90 — only handler extension needed; VS Code extension client requires zero changes.

Affected: packages/mcp-server/src/server.ts, packages/mcp-server/src/resources/ (new handler)
Add to packages/mcp-server/src/server.ts:
1. Register artifact URI templates under devsteps://artifacts/ namespace
2. Implement ListResourcesHandler to enumerate tmp/ + .devsteps/analysis/ artifacts by item-id
3. Implement ReadResourceHandler to return artifact Markdown content by devsteps://artifacts/{item-id}/{agent}-{session} URI

Use absolute paths internally. The resources capability is already declared (server.ts:90) — only handler extension needed. VS Code extension client requires zero changes.

Affected: packages/mcp-server/src/server.ts, packages/mcp-server/src/resources/artifacts.ts (new)
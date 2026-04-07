## Background
VS Code v1.110 introduced Agent Plugins — extensions can bundle MCP servers via `.mcp.json` at the plugin root. Our extension currently uses the older `contributes.mcpServerDefinitionProviders` + `vscode.lm.registerMcpServerDefinitionProvider()` API.

## Research Questions
1. Is `.mcp.json` plugin format a replacement or complement to the programmatic API?
2. Can both coexist in one extension?
3. Does `.mcp.json` format support dynamic env vars like DEVSTEPS_WORKSPACE?
4. Does the plugin format change tool discovery or trust behavior?
5. What's the migration effort if we switch?

## Acceptance Criteria
- [ ] ADR documenting findings and recommendation
- [ ] If migration beneficial: migration story created
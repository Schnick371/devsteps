## Background
VS Code v1.112 (March 2026) introduced MCP server sandboxing with `sandboxEnabled` in mcp.json. Restricts filesystem/network access. **macOS and Linux only — NOT available on Windows.**

## Research Questions
1. Does our extension-contributed MCP server support sandboxEnabled?
2. What filesystem paths does devsteps MCP need? (.devsteps/, workspace files)
3. What network domains does devsteps MCP need?
4. How should we configure sandbox.filesystem.allowWrite for .devsteps/?
5. Windows gap: fallback behavior? Silent degradation?
6. Windows sandbox support timeline? GitHub issues tracking?

## Key Sources
- https://code.visualstudio.com/docs/copilot/reference/mcp-configuration
- https://github.com/microsoft/vscode/issues/297462
- https://github.com/microsoft/vscode/issues/297115

## Acceptance Criteria
- [ ] Sandbox configuration recommendation
- [ ] Windows behavior documented
- [ ] If changes needed: implementation tasks created
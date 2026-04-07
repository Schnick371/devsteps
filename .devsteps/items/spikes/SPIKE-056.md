## Background
VS Code v1.112 (March 2026) introduced MCP server sandboxing with `sandboxEnabled` in mcp.json. Restricts filesystem/network access. **macOS and Linux only — NOT available on Windows.**

## Research Questions
1. Does our extension-contributed MCP server support sandboxEnabled?
2. What filesystem paths does devsteps MCP need?
3. Windows gap: fallback behavior? Silent degradation?
4. How to configure sandbox.filesystem.allowWrite for .devsteps/?
5. Windows sandbox support timeline?

## Acceptance Criteria
- [ ] Sandbox configuration recommendation
- [ ] Windows behavior documented
- [ ] If changes needed: implementation tasks created
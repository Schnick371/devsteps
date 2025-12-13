MCP Server Manager with automatic registration completed using VS Code's official API.

**Implementation**:
- **VS Code MCP API**: Uses official `registerMcpServerDefinitionProvider` API (2025 standard)
- **Automatic Discovery**: Finds MCP server in workspace or global npm installation
- **Zero Configuration**: No manual mcp.json editing required for users
- **Status Bar**: Shows registration status with click-to-check functionality
- **Fallback Mode**: Provides manual configuration instructions if API unavailable
- **Graceful Degradation**: Works even if VS Code MCP API not yet available

**Features**:
- Automatic path resolution (workspace > global npm)
- Status bar indicator: `✓ DevSteps MCP` when registered
- Command: `devsteps.mcp.showStatus` to check server status
- Fallback instructions with copy-to-clipboard config
- Proper disposal and cleanup

**MCP Server Configuration** (automatically registered):
```json
{
  "name": "devsteps",
  "command": "node",
  "args": ["<auto-detected-path>/index.js"],
  "type": "stdio",
  "description": "DevSteps task tracking and AI integration"
}
```

**Path Resolution**:
1. Check `${workspaceFolder}/packages/mcp-server/dist/index.js` (monorepo development)
2. Check global npm installation (`npm root -g`)
3. Show manual configuration fallback

**User Experience**:
- Extension activates → MCP server auto-registers → Ready in Copilot Chat
- No configuration needed for developers in workspace
- Clear fallback instructions if needed

Build: 9.2kb bundle (added MCP manager logic), 3ms build time
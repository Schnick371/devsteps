## Objective
Change MCP server path resolution to use npm global installation instead of bundled files.

## Changes Required

### 1. Remove bundled path logic
Delete the bundled path check in findMcpServerPath():
- Remove: path.join(extensionPath, 'dist', 'mcp-server', 'index.js')

### 2. Update priority order
New search priority:
1. Workspace packages/mcp-server/dist/index.js (development)
2. Global npm: npm bin -g + devsteps-mcp (production)

### 3. Use PackageInstaller helper
Import and use PackageInstaller.getMCPServerPath() for global path resolution

### 4. Handle platform differences
- Windows: devsteps-mcp.cmd
- Linux/macOS: devsteps-mcp
- WSL2: Use wsl.exe wrapper

## Affected Files
- packages/extension/src/mcpServerManager.ts

## Validation
- Extension finds MCP server from npm global installation
- Works on Windows, Linux, macOS, WSL2
- Logs correct path to output channel
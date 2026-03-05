## Problem
When both the DevSteps VS Code extension AND a DevSteps agent plugin are active, both may attempt to register the same MCP server from `.mcp.json`. This causes double-registration: the MCP server starts twice, with duplicate tool listings in the Copilot tool picker and potential port conflicts.

## Root Cause
`mcpServerManager.ts` starts the bundled MCP server unconditionally on extension activation. When `plugin.json` (STORY-199) also declares an `mcp` entry, the same server path is registered a second time by the plugin system.

## Fix
Add a context key gate before MCP server start:

```typescript
import * as vscode from 'vscode';

// In activate():
const pluginActive = vscode.workspace.getConfiguration('chat.plugins.paths')
  .get<string[]>('', [])
  .some(p => p.includes('devsteps'));

if (!pluginActive) {
  // Start MCP server — plugin is not managing it
  mcpServerManager.start();
} else {
  channel.appendLine('[MCP] Plugin detected — skipping extension-managed MCP start');
}
```

Or via VS Code context key: `setContext('devsteps.mcpActive', true)` and check on activation.

## Acceptance Criteria
- When `chat.plugins.paths` contains a DevSteps plugin path, the extension does NOT start a second MCP server
- When no plugin is active, extension starts MCP server normally (current behaviour preserved)
- Extension output channel logs which path was taken
- Manual test: install plugin + extension simultaneously, verify only one MCP server process in Activity Monitor
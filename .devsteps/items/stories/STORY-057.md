# Story: Implement VS Code Native MCP Registration API

## User Story
As a **DevSteps extension user**, I need the **MCP server to register automatically on extension activation** so that I can **start using DevSteps tools in Copilot immediately without configuration**.

## Acceptance Criteria
- [ ] Implement `vscode.lm.registerMcpServerDefinitionProvider`
- [ ] Create `McpStdioServerDefinition` with bundled server path
- [ ] Configure automatic server lifecycle (start/stop/restart)
- [ ] Pass workspace root via environment variables
- [ ] Handle platform-specific binary resolution
- [ ] Implement health monitoring and error recovery
- [ ] Show status in VS Code status bar
- [ ] Provide manual restart command
- [ ] Log server startup and errors to output channel
- [ ] Remove legacy npx-based installation code

## Technical Implementation

### MCP Server Provider Registration
```typescript
// packages/extension/src/mcpServerManager.ts
export class McpServerManager {
  async start(context: vscode.ExtensionContext): Promise<void> {
    const serverPath = this.getBundledServerPath(context);
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

    const provider = vscode.lm.registerMcpServerDefinitionProvider(
      'devsteps',
      {
        provideMcpServerDefinitions: async () => {
          return [
            new vscode.McpStdioServerDefinition(
              'devsteps-mcp',
              'node',
              [serverPath],
              { 
                WORKSPACE_ROOT: workspaceRoot,
                LOG_LEVEL: 'info'
              },
              '1.0.0'
            )
          ];
        }
      }
    );

    context.subscriptions.push(provider);
  }

  private getBundledServerPath(context: vscode.ExtensionContext): string {
    return path.join(
      context.extensionPath,
      'dist',
      'mcp-server',
      'index.js'
    );
  }
}
```

### Extension Activation
```typescript
// packages/extension/src/extension.ts
export async function activate(context: vscode.ExtensionContext) {
  const mcpManager = new McpServerManager(context);
  
  // Register MCP server (auto-starts)
  await mcpManager.start(context);
  
  // Register restart command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'devsteps.restartMcpServer',
      () => mcpManager.restart()
    )
  );
}
```

### Status Bar Integration
```typescript
private updateStatusBar(status: 'starting' | 'running' | 'error') {
  const icons = {
    starting: '$(sync~spin)',
    running: '$(check)',
    error: '$(error)'
  };
  
  this.statusBar.text = `${icons[status]} DevSteps MCP`;
  this.statusBar.show();
}
```

## Platform-Specific Considerations

### Windows
- Use `node.exe` explicitly
- Handle Windows path separators
- Test with PowerShell and CMD

### macOS/Linux
- Use standard `node` binary
- Handle symbolic links correctly
- Test with bash and zsh

### WSL2
- Detect WSL environment
- Use WSL Node.js installation
- Handle mixed path formats

## Error Handling
```typescript
try {
  await mcpManager.start(context);
} catch (error) {
  vscode.window.showErrorMessage(
    'DevSteps MCP server failed to start',
    'Show Logs',
    'Retry'
  ).then(action => {
    if (action === 'Show Logs') {
      outputChannel.show();
    } else if (action === 'Retry') {
      mcpManager.restart();
    }
  });
}
```

## Affected Files
- `packages/extension/src/mcpServerManager.ts` (major refactor)
- `packages/extension/src/extension.ts` (updated activation)
- `packages/extension/src/outputChannel.ts` (enhanced logging)
- `packages/extension/package.json` (updated commands)

## Removed Code
- All npx-based installation logic
- PackageInstaller class
- Global npm path resolution
- Manual configuration fallback

## Testing Checklist
- [ ] Extension activates successfully
- [ ] MCP server registers in VS Code
- [ ] Tools appear in Copilot Chat
- [ ] Server restarts on command
- [ ] Errors logged to output channel
- [ ] Status bar updates correctly
- [ ] Works on Windows 10/11
- [ ] Works on macOS (Intel & ARM)
- [ ] Works on Linux (Ubuntu, Fedora)
- [ ] Works in WSL2

## Success Metrics
- Zero-configuration activation
- Server starts in <1 second
- 100% registration success rate
- Clear error messages on failure
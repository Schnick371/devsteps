# Story: Add Fallback Support for Non-Bundled IDEs

## User Story
As a **DevSteps user in Cursor/Windsurf**, I need a **manual MCP server setup option** so that I can **use DevSteps even when the IDE doesn't support VS Code's bundled MCP API**.

## Acceptance Criteria
- [ ] Detect IDE capabilities (bundled MCP support check)
- [ ] Provide manual configuration instructions for unsupported IDEs
- [ ] Generate MCP config JSON for manual setup
- [ ] Add VS Code command: "DevSteps: Configure MCP Manually"
- [ ] Show configuration UI with copy-paste instructions
- [ ] Support Cursor, Windsurf, Trae, and other IDEs
- [ ] Provide deeplink for one-click installation (when supported)
- [ ] Document manual setup in extension README
- [ ] Test in Cursor and Windsurf environments
- [ ] Add troubleshooting guide

## IDE Detection
```typescript
// packages/extension/src/utils/ideDetection.ts
export function getBundledMcpSupport(): boolean {
  // VS Code 1.101.0+ supports bundled MCP
  const version = vscode.version;
  const [major, minor] = version.split('.').map(Number);
  
  return major > 1 || (major === 1 && minor >= 101);
}

export function getIDEType(): 'vscode' | 'cursor' | 'windsurf' | 'other' {
  const appName = vscode.env.appName.toLowerCase();
  
  if (appName.includes('cursor')) return 'cursor';
  if (appName.includes('windsurf')) return 'windsurf';
  if (appName.includes('code')) return 'vscode';
  
  return 'other';
}
```

## Manual Configuration Generation
```typescript
// packages/extension/src/mcpServerManager.ts
export class McpServerManager {
  async showManualSetupInstructions(): Promise<void> {
    const ide = getIDEType();
    const serverPath = this.getBundledServerPath();
    
    const config = {
      servers: {
        devsteps: {
          type: 'stdio',
          command: 'node',
          args: [serverPath],
          env: {
            WORKSPACE_ROOT: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
          }
        }
      }
    };
    
    const configPath = this.getConfigPath(ide);
    const instructions = this.generateInstructions(ide, config, configPath);
    
    const panel = vscode.window.createWebviewPanel(
      'devsteps-setup',
      'DevSteps MCP Manual Setup',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );
    
    panel.webview.html = this.getSetupHTML(instructions, config);
  }
  
  private getConfigPath(ide: string): string {
    const home = os.homedir();
    
    switch (ide) {
      case 'cursor':
        return path.join(home, '.cursor', 'mcp.json');
      case 'windsurf':
        return path.join(home, '.windsurf', 'mcp.json');
      default:
        return path.join(home, '.vscode', 'mcp.json');
    }
  }
}
```

## Setup Webview UI
```html
<!-- Manual setup instructions -->
<div class="setup-container">
  <h1>DevSteps MCP Manual Setup</h1>
  
  <p>Your IDE doesn't support automatic MCP server registration. 
     Follow these steps to set up DevSteps manually:</p>
  
  <h2>Step 1: Open MCP Configuration</h2>
  <p>Create or edit: <code>${configPath}</code></p>
  
  <h2>Step 2: Add DevSteps Server</h2>
  <pre><code id="config-json">${JSON.stringify(config, null, 2)}</code></pre>
  <button onclick="copyConfig()">Copy Configuration</button>
  
  <h2>Step 3: Restart ${ide}</h2>
  <p>Restart your IDE to activate the DevSteps MCP server.</p>
  
  <h2>Step 4: Verify Installation</h2>
  <p>Open AI chat and type: "List available MCP tools"</p>
  <p>You should see DevSteps tools in the list.</p>
</div>
```

## Deeplink Support (Future)
```typescript
// Generate deeplink for supported IDEs
function generateDeeplink(): string {
  const extensionId = 'devsteps.devsteps-extension';
  return `vscode:mcp/install?server=${extensionId}`;
}
```

## IDE-Specific Instructions

### Cursor
- Config location: `~/.cursor/mcp.json`
- Restart required: Yes
- AI chat access: Command palette → "Open AI Chat"

### Windsurf
- Config location: `~/.windsurf/mcp.json`
- Restart required: Yes
- AI chat access: Sidebar → AI icon

### VS Code (Legacy)
- Config location: `~/.vscode/mcp.json` or `.vscode/mcp.json`
- Automatic bundled mode preferred
- Manual mode for older versions (<1.101.0)

## Troubleshooting Guide
```markdown
## Common Issues

### MCP Server Not Found
- Verify `node` is installed: `node --version`
- Check server path exists: `ls <server-path>`
- Ensure config file is valid JSON

### Permission Denied
- Check file permissions: `chmod +x <server-path>`
- Run as administrator (Windows)

### Server Crashes on Startup
- Check extension logs
- Verify workspace path is valid
- Ensure no conflicting MCP servers
```

## Affected Files
- `packages/extension/src/utils/ideDetection.ts` (new)
- `packages/extension/src/mcpServerManager.ts` (updated)
- `packages/extension/src/webview/setupInstructions.html` (new)
- `packages/extension/README.md` (updated docs)
- `packages/extension/package.json` (new command)

## Testing Checklist
- [ ] Detection works in VS Code
- [ ] Detection works in Cursor
- [ ] Detection works in Windsurf
- [ ] Manual setup UI displays correctly
- [ ] Config JSON is valid and complete
- [ ] Copy button works
- [ ] Instructions are clear and accurate
- [ ] Deeplink works (when supported)

## Success Metrics
- Clear setup instructions
- Working configuration in all IDEs
- Users can complete setup in <5 minutes
- Troubleshooting guide resolves common issues
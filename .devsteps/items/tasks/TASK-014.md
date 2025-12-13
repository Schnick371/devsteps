# Status Bar Integration - Quick Stats Display

## Objectives
Add status bar item showing project summary and providing quick access to DevSteps features.

## Status Bar Item Features

### Basic Status Display
```typescript
export class DevStepsStatusBar {
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.statusBarItem.command = 'devsteps.openDashboard';
    this.update();
    this.statusBarItem.show();
  }

  async update() {
    const stats = await this.getProjectStats();
    
    this.statusBarItem.text = `$(rocket) ${stats.totalItems} items`;
    this.statusBarItem.tooltip = this.buildTooltip(stats);
  }

  private buildTooltip(stats: any): string {
    return `DevSteps Project Status

Total Items: ${stats.totalItems}
In Progress: ${stats.inProgress}
Done: ${stats.done}
Blocked: ${stats.blocked}

Click to open Dashboard`;
  }
}
```

### Enhanced Status with Icons
```typescript
async update() {
  const stats = await this.getProjectStats();
  
  // Show different icon based on project health
  const icon = this.getHealthIcon(stats);
  
  this.statusBarItem.text = `$(${icon}) ${stats.inProgress} active | ${stats.done}/${stats.totalItems} done`;
  this.statusBarItem.backgroundColor = this.getBackgroundColor(stats);
}

private getHealthIcon(stats: any): string {
  if (stats.blocked > 0) return 'warning';
  if (stats.inProgress > 0) return 'sync~spin';
  if (stats.done === stats.totalItems) return 'check';
  return 'rocket';
}

private getBackgroundColor(stats: any): vscode.ThemeColor | undefined {
  if (stats.blocked > 0) {
    return new vscode.ThemeColor('statusBarItem.warningBackground');
  }
  return undefined;
}
```

## Status Bar Click Actions

### Primary Action (Click)
```typescript
this.statusBarItem.command = 'devsteps.openDashboard';
```

### Context Menu (Right-Click)
```json
{
  "contributes": {
    "menus": {
      "statusBar/item": [
        {
          "command": "devsteps.openDashboard",
          "when": "statusBarItem == devsteps.status"
        },
        {
          "command": "devsteps.refresh",
          "when": "statusBarItem == devsteps.status"
        },
        {
          "command": "devsteps.settings.open",
          "when": "statusBarItem == devsteps.status"
        }
      ]
    }
  }
}
```

## Auto-Refresh

### File Watcher Integration
```typescript
constructor(context: vscode.ExtensionContext) {
  // ... initialization

  // Watch .devsteps directory for changes
  const watcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(workspaceRoot, '.devsteps/**/*.json')
  );

  watcher.onDidChange(() => this.update());
  watcher.onDidCreate(() => this.update());
  watcher.onDidDelete(() => this.update());

  context.subscriptions.push(watcher);
}
```

## Display Modes

### Compact Mode
```typescript
this.statusBarItem.text = `$(rocket) ${stats.totalItems}`;
```

### Detailed Mode
```typescript
this.statusBarItem.text = `$(rocket) ${stats.inProgress}⚡ ${stats.done}✓ ${stats.blocked}✖`;
```

### Priority Mode
```typescript
const critical = stats.byCriticality.critical || 0;
if (critical > 0) {
  this.statusBarItem.text = `$(alert) ${critical} CRITICAL`;
  this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
}
```

## Configuration

### Settings
```json
{
  "devsteps.statusBar.enabled": {
    "type": "boolean",
    "default": true,
    "description": "Show DevSteps status in status bar"
  },
  "devsteps.statusBar.displayMode": {
    "type": "string",
    "enum": ["compact", "detailed", "priority"],
    "default": "detailed",
    "description": "Status bar display mode"
  }
}
```

## File Structure
```
packages/vscode-extension/
└── src/
    └── statusBar.ts
```

## Acceptance Criteria
- ✅ Status bar item shows project summary
- ✅ Click opens dashboard
- ✅ Tooltip shows detailed breakdown
- ✅ Auto-refreshes on file changes
- ✅ Icons indicate project health
- ✅ Warning background for blocked items
- ✅ Configurable display modes

## Related Tasks
- **TASK-005**: Dashboard (status bar click target)
- **TASK-012**: Settings UI (status bar configuration)
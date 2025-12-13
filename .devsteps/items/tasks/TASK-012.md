# Settings UI - Extension Configuration

## Objectives
Provide comprehensive configuration UI for DevSteps extension with settings contribution and validation.

## Configuration Categories

### 1. TreeView Settings
```json
{
  "devsteps.treeView.defaultMode": {
    "type": "string",
    "enum": ["flat", "hierarchical"],
    "default": "flat",
    "description": "Default view mode for TreeView"
  },
  "devsteps.treeView.defaultHierarchy": {
    "type": "string",
    "enum": ["scrum", "waterfall", "both"],
    "default": "both",
    "description": "Which hierarchies to show by default"
  },
  "devsteps.treeView.showCompletedItems": {
    "type": "boolean",
    "default": true,
    "description": "Show completed items in TreeView"
  },
  "devsteps.treeView.autoRefresh": {
    "type": "boolean",
    "default": true,
    "description": "Automatically refresh when .devsteps files change"
  }
}
```

### 2. Dashboard Settings
```json
{
  "devsteps.dashboard.defaultSections": {
    "type": "array",
    "items": {
      "type": "string",
      "enum": ["statistics", "eisenhower", "burndown", "traceability", "timeline"]
    },
    "default": ["statistics", "eisenhower", "burndown", "traceability", "timeline"],
    "description": "Which dashboard sections to show"
  },
  "devsteps.dashboard.autoOpen": {
    "type": "boolean",
    "default": false,
    "description": "Automatically open dashboard on workspace open"
  }
}
```

### 3. Icon and Theme Settings
```json
{
  "devsteps.icons.colorPriority": {
    "type": "boolean",
    "default": true,
    "description": "Apply priority colors to icons"
  },
  "devsteps.decorations.enabled": {
    "type": "boolean",
    "default": true,
    "description": "Show status badges via FileDecorationProvider"
  }
}
```

### 4. Keyboard Shortcuts Settings
```json
{
  "devsteps.shortcuts.enabled": {
    "type": "boolean",
    "default": true,
    "description": "Enable DevSteps keyboard shortcuts"
  }
}
```

### 5. MCP Server Settings
```json
{
  "devsteps.mcp.autoStart": {
    "type": "boolean",
    "default": true,
    "description": "Automatically start MCP server on activation"
  },
  "devsteps.mcp.port": {
    "type": "number",
    "default": 3000,
    "description": "MCP server port"
  }
}
```

### 6. Logging and Debugging
```json
{
  "devsteps.logging.level": {
    "type": "string",
    "enum": ["error", "warn", "info", "debug"],
    "default": "info",
    "description": "Output channel logging level"
  },
  "devsteps.logging.showOutputOnError": {
    "type": "boolean",
    "default": true,
    "description": "Automatically show output channel on errors"
  }
}
```

## Package.json Configuration Contribution

```json
{
  "contributes": {
    "configuration": {
      "title": "DevSteps",
      "properties": {
        "devsteps.treeView.defaultMode": {
          "type": "string",
          "enum": ["flat", "hierarchical"],
          "enumDescriptions": [
            "Group items by type",
            "Show parent-child relationships"
          ],
          "default": "flat",
          "description": "Default view mode for TreeView",
          "order": 1
        },
        "devsteps.treeView.defaultHierarchy": {
          "type": "string",
          "enum": ["scrum", "waterfall", "both"],
          "enumDescriptions": [
            "Show only Scrum hierarchy (Epic → Story → Task)",
            "Show only Waterfall hierarchy (Requirement → Feature → Task)",
            "Show both hierarchies"
          ],
          "default": "both",
          "description": "Which hierarchies to display",
          "order": 2
        },
        "devsteps.treeView.showCompletedItems": {
          "type": "boolean",
          "default": true,
          "description": "Show items with 'done' status in TreeView",
          "order": 3
        },
        "devsteps.treeView.autoRefresh": {
          "type": "boolean",
          "default": true,
          "description": "Automatically refresh TreeView when .devsteps files change",
          "order": 4
        },
        "devsteps.dashboard.defaultSections": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["statistics", "eisenhower", "burndown", "traceability", "timeline"]
          },
          "default": ["statistics", "eisenhower", "burndown", "traceability", "timeline"],
          "description": "Dashboard sections to display",
          "order": 10
        },
        "devsteps.dashboard.autoOpen": {
          "type": "boolean",
          "default": false,
          "description": "Open dashboard automatically when workspace loads",
          "order": 11
        },
        "devsteps.icons.colorPriority": {
          "type": "boolean",
          "default": true,
          "description": "Apply priority-based colors to icons",
          "order": 20
        },
        "devsteps.decorations.enabled": {
          "type": "boolean",
          "default": true,
          "description": "Show status badges on TreeView items",
          "order": 21
        },
        "devsteps.shortcuts.enabled": {
          "type": "boolean",
          "default": true,
          "description": "Enable keyboard shortcuts",
          "order": 30
        },
        "devsteps.mcp.autoStart": {
          "type": "boolean",
          "default": true,
          "description": "Start MCP server automatically",
          "order": 40
        },
        "devsteps.mcp.port": {
          "type": "number",
          "default": 3000,
          "minimum": 1024,
          "maximum": 65535,
          "description": "MCP server port",
          "order": 41
        },
        "devsteps.logging.level": {
          "type": "string",
          "enum": ["error", "warn", "info", "debug"],
          "default": "info",
          "description": "Logging verbosity level",
          "order": 50
        },
        "devsteps.logging.showOutputOnError": {
          "type": "boolean",
          "default": true,
          "description": "Show output channel automatically on errors",
          "order": 51
        }
      }
    }
  }
}
```

## Settings Implementation

### Settings Manager Class
```typescript
import * as vscode from 'vscode';

export class SettingsManager {
  private static readonly CONFIG_SECTION = 'devsteps';

  static get<T>(key: string, defaultValue: T): T {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    return config.get<T>(key, defaultValue);
  }

  static async set(key: string, value: any): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    await config.update(key, value, vscode.ConfigurationTarget.Global);
  }

  // TreeView settings
  static getTreeViewMode(): 'flat' | 'hierarchical' {
    return this.get('treeView.defaultMode', 'flat');
  }

  static getTreeViewHierarchy(): 'scrum' | 'waterfall' | 'both' {
    return this.get('treeView.defaultHierarchy', 'both');
  }

  static getShowCompletedItems(): boolean {
    return this.get('treeView.showCompletedItems', true);
  }

  // Dashboard settings
  static getDashboardSections(): string[] {
    return this.get('dashboard.defaultSections', [
      'statistics', 'eisenhower', 'burndown', 'traceability', 'timeline'
    ]);
  }

  // Icon settings
  static getIconColorPriority(): boolean {
    return this.get('icons.colorPriority', true);
  }

  static getDecorationsEnabled(): boolean {
    return this.get('decorations.enabled', true);
  }

  // MCP settings
  static getMcpAutoStart(): boolean {
    return this.get('mcp.autoStart', true);
  }

  static getMcpPort(): number {
    return this.get('mcp.port', 3000);
  }

  // Logging settings
  static getLoggingLevel(): 'error' | 'warn' | 'info' | 'debug' {
    return this.get('logging.level', 'info');
  }
}
```

### Configuration Change Listener
```typescript
// extension.ts
export function activate(context: vscode.ExtensionContext) {
  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('devsteps.treeView')) {
        treeDataProvider.refresh();
      }
      
      if (e.affectsConfiguration('devsteps.decorations.enabled')) {
        decorationProvider.refresh();
      }
      
      if (e.affectsConfiguration('devsteps.logging.level')) {
        outputChannel.updateLoggingLevel();
      }
    })
  );
}
```

## Settings UI Commands

### Quick Settings Commands
```json
{
  "command": "devsteps.settings.open",
  "title": "DevSteps: Open Settings"
},
{
  "command": "devsteps.settings.reset",
  "title": "DevSteps: Reset to Default Settings"
}
```

```typescript
vscode.commands.registerCommand('devsteps.settings.open', () => {
  vscode.commands.executeCommand('workbench.action.openSettings', 'devsteps');
});

vscode.commands.registerCommand('devsteps.settings.reset', async () => {
  const answer = await vscode.window.showWarningMessage(
    'Reset all DevSteps settings to default?',
    'Yes', 'No'
  );
  
  if (answer === 'Yes') {
    const config = vscode.workspace.getConfiguration('devsteps');
    // Reset each setting
    await config.update('treeView.defaultMode', undefined, vscode.ConfigurationTarget.Global);
    // ... more resets
    vscode.window.showInformationMessage('DevSteps settings reset to defaults');
  }
});
```

## Settings Validation

### Port Validation
```typescript
async function validateMcpPort(port: number): Promise<boolean> {
  if (port < 1024 || port > 65535) {
    vscode.window.showErrorMessage('MCP port must be between 1024 and 65535');
    return false;
  }
  return true;
}
```

## File Structure
```
packages/vscode-extension/
├── package.json                # Configuration contribution
└── src/
    ├── settings.ts             # SettingsManager class
    └── commands/
        └── settingsCommands.ts # Settings-related commands
```

## Acceptance Criteria
- ✅ All settings defined in package.json configuration
- ✅ Settings accessible via VS Code Settings UI
- ✅ SettingsManager utility class for type-safe access
- ✅ Configuration change listeners update components
- ✅ Quick settings commands available
- ✅ Settings validation for numeric values
- ✅ Reset to defaults command
- ✅ Settings organized by category with order property

## Related Tasks
- **TASK-002**: TreeView (uses view mode settings)
- **TASK-005**: Dashboard (uses dashboard section settings)
- **TASK-004**: MCP Server Manager (uses MCP settings)
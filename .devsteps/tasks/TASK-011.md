# Keyboard Shortcuts - Productivity Enhancement

## Objectives
Define comprehensive keyboard shortcuts for all DevSteps commands to enable fast, keyboard-driven workflow.

## Shortcut Categories

### 1. Navigation (View Focus)
```json
{
  "key": "ctrl+shift+d",
  "mac": "cmd+shift+d",
  "command": "devsteps.focus",
  "when": "!devstepsTreeView.visible"
}
```

### 2. Item Creation (Quick Add)
```json
{
  "key": "ctrl+shift+n t",
  "mac": "cmd+shift+n t",
  "command": "devsteps.addTask",
  "when": "devstepsTreeView.visible"
},
{
  "key": "ctrl+shift+n s",
  "mac": "cmd+shift+n s",
  "command": "devsteps.addStory",
  "when": "devstepsTreeView.visible"
},
{
  "key": "ctrl+shift+n e",
  "mac": "cmd+shift+n e",
  "command": "devsteps.addEpic",
  "when": "devstepsTreeView.visible"
}
```

### 3. Search and Filtering
```json
{
  "key": "ctrl+shift+f",
  "mac": "cmd+shift+f",
  "command": "devsteps.search",
  "when": "devstepsTreeView.visible"
},
{
  "key": "ctrl+shift+c",
  "mac": "cmd+shift+c",
  "command": "devsteps.filter.clear",
  "when": "devstepsTreeView.visible"
},
{
  "key": "ctrl+shift+p",
  "mac": "cmd+shift+p",
  "command": "devsteps.filter.byPriority",
  "when": "devstepsTreeView.visible"
}
```

### 4. View Switching
```json
{
  "key": "ctrl+shift+v h",
  "mac": "cmd+shift+v h",
  "command": "devsteps.viewMode.hierarchical",
  "when": "devstepsTreeView.visible"
},
{
  "key": "ctrl+shift+v f",
  "mac": "cmd+shift+v f",
  "command": "devsteps.viewMode.flat",
  "when": "devstepsTreeView.visible"
}
```

### 5. Dashboard and Visualization
```json
{
  "key": "ctrl+shift+d d",
  "mac": "cmd+shift+d d",
  "command": "devsteps.openDashboard",
  "when": "workspaceFolderCount > 0"
}
```

### 6. Item Actions (Context-Aware)
```json
{
  "key": "enter",
  "command": "devsteps.openItem",
  "when": "focusedView == devstepsTreeView && viewItem == workItem"
},
{
  "key": "delete",
  "mac": "cmd+backspace",
  "command": "devsteps.archiveItem",
  "when": "focusedView == devstepsTreeView && viewItem == workItem"
},
{
  "key": "ctrl+e",
  "mac": "cmd+e",
  "command": "devsteps.editItem",
  "when": "focusedView == devstepsTreeView && viewItem == workItem"
}
```

### 7. Status Updates (Quick Actions)
```json
{
  "key": "alt+1",
  "command": "devsteps.setStatus.draft",
  "when": "focusedView == devstepsTreeView && viewItem == workItem"
},
{
  "key": "alt+2",
  "command": "devsteps.setStatus.inProgress",
  "when": "focusedView == devstepsTreeView && viewItem == workItem"
},
{
  "key": "alt+3",
  "command": "devsteps.setStatus.done",
  "when": "focusedView == devstepsTreeView && viewItem == workItem"
}
```

### 8. Refresh and Reload
```json
{
  "key": "f5",
  "command": "devsteps.refresh",
  "when": "focusedView == devstepsTreeView"
}
```

## Complete Keybindings Contribution

```json
{
  "contributes": {
    "keybindings": [
      // NAVIGATION
      {
        "command": "devsteps.focus",
        "key": "ctrl+shift+d",
        "mac": "cmd+shift+d",
        "when": "!devstepsTreeView.visible"
      },

      // ITEM CREATION
      {
        "command": "devsteps.addTask",
        "key": "ctrl+shift+n t",
        "mac": "cmd+shift+n t",
        "when": "devstepsTreeView.visible"
      },
      {
        "command": "devsteps.addStory",
        "key": "ctrl+shift+n s",
        "mac": "cmd+shift+n s",
        "when": "devstepsTreeView.visible"
      },
      {
        "command": "devsteps.addEpic",
        "key": "ctrl+shift+n e",
        "mac": "cmd+shift+n e",
        "when": "devstepsTreeView.visible"
      },
      {
        "command": "devsteps.addBug",
        "key": "ctrl+shift+n b",
        "mac": "cmd+shift+n b",
        "when": "devstepsTreeView.visible"
      },

      // SEARCH & FILTER
      {
        "command": "devsteps.search",
        "key": "ctrl+shift+f",
        "mac": "cmd+shift+f",
        "when": "devstepsTreeView.visible"
      },
      {
        "command": "devsteps.filter.clear",
        "key": "ctrl+shift+c",
        "mac": "cmd+shift+c",
        "when": "devstepsTreeView.visible"
      },
      {
        "command": "devsteps.filter.byStatus",
        "key": "ctrl+shift+s",
        "mac": "cmd+shift+s",
        "when": "devstepsTreeView.visible"
      },
      {
        "command": "devsteps.filter.byPriority",
        "key": "ctrl+shift+p",
        "mac": "cmd+shift+p",
        "when": "devstepsTreeView.visible"
      },

      // VIEW SWITCHING
      {
        "command": "devsteps.viewMode.hierarchical",
        "key": "ctrl+shift+v h",
        "mac": "cmd+shift+v h",
        "when": "devstepsTreeView.visible"
      },
      {
        "command": "devsteps.viewMode.flat",
        "key": "ctrl+shift+v f",
        "mac": "cmd+shift+v f",
        "when": "devstepsTreeView.visible"
      },

      // DASHBOARD
      {
        "command": "devsteps.openDashboard",
        "key": "ctrl+shift+d d",
        "mac": "cmd+shift+d d",
        "when": "workspaceFolderCount > 0"
      },

      // ITEM ACTIONS (Context-aware)
      {
        "command": "devsteps.openItem",
        "key": "enter",
        "when": "focusedView == devstepsTreeView && viewItem == workItem"
      },
      {
        "command": "devsteps.editItem",
        "key": "ctrl+e",
        "mac": "cmd+e",
        "when": "focusedView == devstepsTreeView && viewItem == workItem"
      },
      {
        "command": "devsteps.archiveItem",
        "key": "delete",
        "mac": "cmd+backspace",
        "when": "focusedView == devstepsTreeView && viewItem == workItem"
      },

      // STATUS UPDATES (Quick keys)
      {
        "command": "devsteps.setStatus.draft",
        "key": "alt+1",
        "when": "focusedView == devstepsTreeView && viewItem == workItem"
      },
      {
        "command": "devsteps.setStatus.inProgress",
        "key": "alt+2",
        "when": "focusedView == devstepsTreeView && viewItem == workItem"
      },
      {
        "command": "devsteps.setStatus.review",
        "key": "alt+3",
        "when": "focusedView == devstepsTreeView && viewItem == workItem"
      },
      {
        "command": "devsteps.setStatus.done",
        "key": "alt+4",
        "when": "focusedView == devstepsTreeView && viewItem == workItem"
      },
      {
        "command": "devsteps.setStatus.blocked",
        "key": "alt+5",
        "when": "focusedView == devstepsTreeView && viewItem == workItem"
      },

      // REFRESH
      {
        "command": "devsteps.refresh",
        "key": "f5",
        "when": "focusedView == devstepsTreeView"
      },

      // TRACEABILITY
      {
        "command": "devsteps.showTrace",
        "key": "ctrl+shift+t",
        "mac": "cmd+shift+t",
        "when": "focusedView == devstepsTreeView && viewItem == workItem"
      }
    ]
  }
}
```

## Keyboard Shortcut Documentation

### Quick Reference Card (Built-in Help)
```typescript
vscode.commands.registerCommand('devsteps.showKeyboardShortcuts', () => {
  const shortcuts = `
# DevSteps Keyboard Shortcuts

## Navigation
- Ctrl+Shift+D              Focus DevSteps TreeView

## Item Creation
- Ctrl+Shift+N T            Add Task
- Ctrl+Shift+N S            Add Story
- Ctrl+Shift+N E            Add Epic
- Ctrl+Shift+N B            Add Bug

## Search & Filter
- Ctrl+Shift+F              Search Items
- Ctrl+Shift+C              Clear Filters
- Ctrl+Shift+S              Filter by Status
- Ctrl+Shift+P              Filter by Priority

## View Switching
- Ctrl+Shift+V H            Hierarchical View
- Ctrl+Shift+V F            Flat View

## Dashboard
- Ctrl+Shift+D D            Open Dashboard

## Item Actions (when item focused)
- Enter                     Open Item
- Ctrl+E                    Edit Item
- Delete                    Archive Item
- Ctrl+Shift+T              Show Traceability

## Quick Status Updates (when item focused)
- Alt+1                     Set to Draft
- Alt+2                     Set to In Progress
- Alt+3                     Set to Review
- Alt+4                     Set to Done
- Alt+5                     Set to Blocked

## Refresh
- F5                        Refresh TreeView
  `;

  vscode.workspace.openTextDocument({ content: shortcuts, language: 'markdown' })
    .then(doc => vscode.window.showTextDocument(doc));
});
```

## Context Keys (When Clauses)

### Custom Context Keys
```typescript
// Set context when TreeView is focused
vscode.commands.executeCommand('setContext', 'devstepsTreeView.visible', true);

// Set context when item is selected
vscode.commands.executeCommand('setContext', 'devsteps.itemSelected', true);

// Set context for view mode
vscode.commands.executeCommand('setContext', 'devsteps.viewMode', 'hierarchical');
```

## Conflict Resolution

### Avoiding Conflicts with VS Code Built-ins
- **Ctrl+Shift+P**: Conflicts with Command Palette
  - Use `when` clause: `devstepsTreeView.visible`
- **Ctrl+F**: Conflicts with Find
  - Use `Ctrl+Shift+F` instead
- **Delete**: Safe for TreeView context

## User Customization

### Allow User Overrides
Users can customize shortcuts via `Preferences: Open Keyboard Shortcuts`:
```json
// User settings.json
{
  "keyboard.dispatch": "keyCode", // For international keyboards
  "devsteps.shortcuts.enabled": true
}
```

## Implementation

### Command Registration (commands.ts)
```typescript
export function registerKeyboardCommands(context: vscode.ExtensionContext) {
  // Status update shortcuts
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.setStatus.draft', async () => {
      const selectedItem = await getSelectedItem();
      if (selectedItem) {
        await updateItemStatus(selectedItem.id, 'draft');
      }
    }),

    vscode.commands.registerCommand('devsteps.setStatus.inProgress', async () => {
      const selectedItem = await getSelectedItem();
      if (selectedItem) {
        await updateItemStatus(selectedItem.id, 'in-progress');
      }
    })

    // ... more status commands
  );

  // Quick creation shortcuts
  context.subscriptions.push(
    vscode.commands.registerCommand('devsteps.addTask', () => {
      vscode.commands.executeCommand('devsteps.add', 'task');
    })
  );
}
```

## File Structure
```
packages/vscode-extension/
├── package.json                    # Keybindings contribution
└── src/
    └── commands/
        ├── keyboardCommands.ts     # Keyboard-specific command implementations
        └── statusCommands.ts       # Quick status update handlers
```

## Acceptance Criteria
- ✅ All major commands have keyboard shortcuts
- ✅ Shortcuts respect platform (Windows/Mac/Linux)
- ✅ Context-aware (only active when appropriate)
- ✅ No conflicts with VS Code built-in shortcuts
- ✅ Quick status updates (Alt+1-5)
- ✅ View mode switching (Ctrl+Shift+V H/F)
- ✅ Search and filter shortcuts (Ctrl+Shift+F/C/S/P)
- ✅ Item creation shortcuts (Ctrl+Shift+N T/S/E/B)
- ✅ Built-in help command (shows all shortcuts)
- ✅ User customization supported

## Related Tasks
- **TASK-003**: Command Registration (base commands)
- **TASK-010**: Filtering (keyboard shortcuts for filters)
- **TASK-012**: Settings UI (configure shortcut preferences)
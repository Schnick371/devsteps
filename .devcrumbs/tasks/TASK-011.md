# Keyboard Shortcuts - Productivity Enhancement

## Objectives
Define comprehensive keyboard shortcuts for all DevCrumbs commands to enable fast, keyboard-driven workflow.

## Shortcut Categories

### 1. Navigation (View Focus)
```json
{
  "key": "ctrl+shift+d",
  "mac": "cmd+shift+d",
  "command": "devcrumbs.focus",
  "when": "!devcrumbsTreeView.visible"
}
```

### 2. Item Creation (Quick Add)
```json
{
  "key": "ctrl+shift+n t",
  "mac": "cmd+shift+n t",
  "command": "devcrumbs.addTask",
  "when": "devcrumbsTreeView.visible"
},
{
  "key": "ctrl+shift+n s",
  "mac": "cmd+shift+n s",
  "command": "devcrumbs.addStory",
  "when": "devcrumbsTreeView.visible"
},
{
  "key": "ctrl+shift+n e",
  "mac": "cmd+shift+n e",
  "command": "devcrumbs.addEpic",
  "when": "devcrumbsTreeView.visible"
}
```

### 3. Search and Filtering
```json
{
  "key": "ctrl+shift+f",
  "mac": "cmd+shift+f",
  "command": "devcrumbs.search",
  "when": "devcrumbsTreeView.visible"
},
{
  "key": "ctrl+shift+c",
  "mac": "cmd+shift+c",
  "command": "devcrumbs.filter.clear",
  "when": "devcrumbsTreeView.visible"
},
{
  "key": "ctrl+shift+p",
  "mac": "cmd+shift+p",
  "command": "devcrumbs.filter.byPriority",
  "when": "devcrumbsTreeView.visible"
}
```

### 4. View Switching
```json
{
  "key": "ctrl+shift+v h",
  "mac": "cmd+shift+v h",
  "command": "devcrumbs.viewMode.hierarchical",
  "when": "devcrumbsTreeView.visible"
},
{
  "key": "ctrl+shift+v f",
  "mac": "cmd+shift+v f",
  "command": "devcrumbs.viewMode.flat",
  "when": "devcrumbsTreeView.visible"
}
```

### 5. Dashboard and Visualization
```json
{
  "key": "ctrl+shift+d d",
  "mac": "cmd+shift+d d",
  "command": "devcrumbs.openDashboard",
  "when": "workspaceFolderCount > 0"
}
```

### 6. Item Actions (Context-Aware)
```json
{
  "key": "enter",
  "command": "devcrumbs.openItem",
  "when": "focusedView == devcrumbsTreeView && viewItem == workItem"
},
{
  "key": "delete",
  "mac": "cmd+backspace",
  "command": "devcrumbs.archiveItem",
  "when": "focusedView == devcrumbsTreeView && viewItem == workItem"
},
{
  "key": "ctrl+e",
  "mac": "cmd+e",
  "command": "devcrumbs.editItem",
  "when": "focusedView == devcrumbsTreeView && viewItem == workItem"
}
```

### 7. Status Updates (Quick Actions)
```json
{
  "key": "alt+1",
  "command": "devcrumbs.setStatus.draft",
  "when": "focusedView == devcrumbsTreeView && viewItem == workItem"
},
{
  "key": "alt+2",
  "command": "devcrumbs.setStatus.inProgress",
  "when": "focusedView == devcrumbsTreeView && viewItem == workItem"
},
{
  "key": "alt+3",
  "command": "devcrumbs.setStatus.done",
  "when": "focusedView == devcrumbsTreeView && viewItem == workItem"
}
```

### 8. Refresh and Reload
```json
{
  "key": "f5",
  "command": "devcrumbs.refresh",
  "when": "focusedView == devcrumbsTreeView"
}
```

## Complete Keybindings Contribution

```json
{
  "contributes": {
    "keybindings": [
      // NAVIGATION
      {
        "command": "devcrumbs.focus",
        "key": "ctrl+shift+d",
        "mac": "cmd+shift+d",
        "when": "!devcrumbsTreeView.visible"
      },

      // ITEM CREATION
      {
        "command": "devcrumbs.addTask",
        "key": "ctrl+shift+n t",
        "mac": "cmd+shift+n t",
        "when": "devcrumbsTreeView.visible"
      },
      {
        "command": "devcrumbs.addStory",
        "key": "ctrl+shift+n s",
        "mac": "cmd+shift+n s",
        "when": "devcrumbsTreeView.visible"
      },
      {
        "command": "devcrumbs.addEpic",
        "key": "ctrl+shift+n e",
        "mac": "cmd+shift+n e",
        "when": "devcrumbsTreeView.visible"
      },
      {
        "command": "devcrumbs.addBug",
        "key": "ctrl+shift+n b",
        "mac": "cmd+shift+n b",
        "when": "devcrumbsTreeView.visible"
      },

      // SEARCH & FILTER
      {
        "command": "devcrumbs.search",
        "key": "ctrl+shift+f",
        "mac": "cmd+shift+f",
        "when": "devcrumbsTreeView.visible"
      },
      {
        "command": "devcrumbs.filter.clear",
        "key": "ctrl+shift+c",
        "mac": "cmd+shift+c",
        "when": "devcrumbsTreeView.visible"
      },
      {
        "command": "devcrumbs.filter.byStatus",
        "key": "ctrl+shift+s",
        "mac": "cmd+shift+s",
        "when": "devcrumbsTreeView.visible"
      },
      {
        "command": "devcrumbs.filter.byPriority",
        "key": "ctrl+shift+p",
        "mac": "cmd+shift+p",
        "when": "devcrumbsTreeView.visible"
      },

      // VIEW SWITCHING
      {
        "command": "devcrumbs.viewMode.hierarchical",
        "key": "ctrl+shift+v h",
        "mac": "cmd+shift+v h",
        "when": "devcrumbsTreeView.visible"
      },
      {
        "command": "devcrumbs.viewMode.flat",
        "key": "ctrl+shift+v f",
        "mac": "cmd+shift+v f",
        "when": "devcrumbsTreeView.visible"
      },

      // DASHBOARD
      {
        "command": "devcrumbs.openDashboard",
        "key": "ctrl+shift+d d",
        "mac": "cmd+shift+d d",
        "when": "workspaceFolderCount > 0"
      },

      // ITEM ACTIONS (Context-aware)
      {
        "command": "devcrumbs.openItem",
        "key": "enter",
        "when": "focusedView == devcrumbsTreeView && viewItem == workItem"
      },
      {
        "command": "devcrumbs.editItem",
        "key": "ctrl+e",
        "mac": "cmd+e",
        "when": "focusedView == devcrumbsTreeView && viewItem == workItem"
      },
      {
        "command": "devcrumbs.archiveItem",
        "key": "delete",
        "mac": "cmd+backspace",
        "when": "focusedView == devcrumbsTreeView && viewItem == workItem"
      },

      // STATUS UPDATES (Quick keys)
      {
        "command": "devcrumbs.setStatus.draft",
        "key": "alt+1",
        "when": "focusedView == devcrumbsTreeView && viewItem == workItem"
      },
      {
        "command": "devcrumbs.setStatus.inProgress",
        "key": "alt+2",
        "when": "focusedView == devcrumbsTreeView && viewItem == workItem"
      },
      {
        "command": "devcrumbs.setStatus.review",
        "key": "alt+3",
        "when": "focusedView == devcrumbsTreeView && viewItem == workItem"
      },
      {
        "command": "devcrumbs.setStatus.done",
        "key": "alt+4",
        "when": "focusedView == devcrumbsTreeView && viewItem == workItem"
      },
      {
        "command": "devcrumbs.setStatus.blocked",
        "key": "alt+5",
        "when": "focusedView == devcrumbsTreeView && viewItem == workItem"
      },

      // REFRESH
      {
        "command": "devcrumbs.refresh",
        "key": "f5",
        "when": "focusedView == devcrumbsTreeView"
      },

      // TRACEABILITY
      {
        "command": "devcrumbs.showTrace",
        "key": "ctrl+shift+t",
        "mac": "cmd+shift+t",
        "when": "focusedView == devcrumbsTreeView && viewItem == workItem"
      }
    ]
  }
}
```

## Keyboard Shortcut Documentation

### Quick Reference Card (Built-in Help)
```typescript
vscode.commands.registerCommand('devcrumbs.showKeyboardShortcuts', () => {
  const shortcuts = `
# DevCrumbs Keyboard Shortcuts

## Navigation
- Ctrl+Shift+D              Focus DevCrumbs TreeView

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
vscode.commands.executeCommand('setContext', 'devcrumbsTreeView.visible', true);

// Set context when item is selected
vscode.commands.executeCommand('setContext', 'devcrumbs.itemSelected', true);

// Set context for view mode
vscode.commands.executeCommand('setContext', 'devcrumbs.viewMode', 'hierarchical');
```

## Conflict Resolution

### Avoiding Conflicts with VS Code Built-ins
- **Ctrl+Shift+P**: Conflicts with Command Palette
  - Use `when` clause: `devcrumbsTreeView.visible`
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
  "devcrumbs.shortcuts.enabled": true
}
```

## Implementation

### Command Registration (commands.ts)
```typescript
export function registerKeyboardCommands(context: vscode.ExtensionContext) {
  // Status update shortcuts
  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.setStatus.draft', async () => {
      const selectedItem = await getSelectedItem();
      if (selectedItem) {
        await updateItemStatus(selectedItem.id, 'draft');
      }
    }),

    vscode.commands.registerCommand('devcrumbs.setStatus.inProgress', async () => {
      const selectedItem = await getSelectedItem();
      if (selectedItem) {
        await updateItemStatus(selectedItem.id, 'in-progress');
      }
    })

    // ... more status commands
  );

  // Quick creation shortcuts
  context.subscriptions.push(
    vscode.commands.registerCommand('devcrumbs.addTask', () => {
      vscode.commands.executeCommand('devcrumbs.add', 'task');
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
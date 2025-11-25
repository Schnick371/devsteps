# Smart Toolbar Redesign with Hover Buttons

## Problem
Current toolbar has too many visible buttons (6+), causing clutter. VS Code best practice: Primary actions always visible, secondary actions on hover.

**Current Toolbar (cluttered):**
```
[🔄 Refresh] [👁️ Flat] [🌲 Hierarchical] [👁️ Hide Done] [🎯 Filter] [📊 Dashboard] [...]
```

**Desired Toolbar (clean + hover):**
```
Primary (always):    [🔄 Refresh] [📊 Dashboard] [🔍 Search]
Hover (on mouseover): [📁 Collapse All] [👁️ Hide Done] [↔️ View Mode] [⚙️ More...]
```

## Solution: VS Code Menu Groups

### Group Strategy
- `"navigation"` = Always visible (primary actions)
- Without `"navigation"` = Hover-only (secondary actions)
- Higher group numbers = Overflow menu

### Implementation

**package.json changes:**

```json
"commands": [
  // Existing commands
  { "command": "devsteps.refreshItems", "title": "Refresh", "icon": "$(refresh)" },
  { "command": "devsteps.openDashboard", "title": "Dashboard", "icon": "$(dashboard)" },
  
  // NEW commands
  { 
    "command": "devsteps.searchItems", 
    "title": "Search Items", 
    "icon": "$(search)" 
  },
  { 
    "command": "devsteps.collapseAll", 
    "title": "Collapse All", 
    "icon": "$(collapse-all)" 
  },
  { 
    "command": "devsteps.viewMode.toggle", 
    "title": "Toggle View Mode", 
    "icon": "$(list-tree)" 
  }
],

"menus": {
  "view/title": [
    // PRIMARY BUTTONS (always visible - group: "navigation")
    {
      "command": "devsteps.refreshItems",
      "when": "view == devsteps.itemsView",
      "group": "navigation@1"
    },
    {
      "command": "devsteps.openDashboard",
      "when": "view == devsteps.itemsView",
      "group": "navigation@2"
    },
    {
      "command": "devsteps.searchItems",
      "when": "view == devsteps.itemsView",
      "group": "navigation@3"
    },
    
    // HOVER BUTTONS (visible on hover - no "navigation")
    {
      "command": "devsteps.collapseAll",
      "when": "view == devsteps.itemsView",
      "group": "1_view@1"
    },
    {
      "command": "devsteps.toggleHideDone",
      "when": "view == devsteps.itemsView",
      "group": "2_filter@1"
    },
    {
      "command": "devsteps.viewMode.toggle",
      "when": "view == devsteps.itemsView",
      "group": "3_mode@1"
    },
    
    // MORE MENU (overflow "..." - higher group numbers)
    {
      "command": "devsteps.filterByStatus",
      "when": "view == devsteps.itemsView",
      "group": "4_advanced@1"
    },
    {
      "command": "devsteps.filterByPriority",
      "when": "view == devsteps.itemsView",
      "group": "4_advanced@2"
    },
    {
      "command": "devsteps.sortBy",
      "when": "view == devsteps.itemsView",
      "group": "5_sort@1"
    }
  ]
}
```

### New Commands Implementation

**1. devsteps.searchItems**
```typescript
vscode.commands.registerCommand('devsteps.searchItems', async () => {
  const query = await vscode.window.showInputBox({
    placeHolder: 'Search work items by title, ID, or tags...',
    prompt: 'Enter search query'
  });
  
  if (query) {
    treeDataProvider.setSearchQuery(query);
    vscode.window.showInformationMessage(`🔍 Searching: "${query}"`);
  }
});
```

**2. devsteps.collapseAll**
```typescript
vscode.commands.registerCommand('devsteps.collapseAll', () => {
  // TreeView API provides this
  if (treeView) {
    treeView.reveal(undefined, { select: false, focus: false });
  }
  vscode.window.showInformationMessage('📁 All items collapsed');
});
```

**3. devsteps.viewMode.toggle**
```typescript
vscode.commands.registerCommand('devsteps.viewMode.toggle', () => {
  const currentMode = treeDataProvider.getViewMode();
  const newMode = currentMode === 'flat' ? 'hierarchical' : 'flat';
  treeDataProvider.setViewMode(newMode);
  
  const icon = newMode === 'flat' ? '👁️' : '🌲';
  vscode.window.showInformationMessage(`${icon} Switched to ${newMode} view`);
});
```

**4. Add getViewMode() to TreeDataProvider:**
```typescript
getViewMode(): ViewMode {
  return this.viewMode;
}
```

## Button Organization Logic

**Primary (Navigation Group):**
- **Refresh** - Most frequently used, data reload
- **Dashboard** - Main visualization feature
- **Search** - Quick item lookup

**Hover (Secondary Groups):**
- **Collapse All** - Occasional use, view organization
- **Hide Done** - Toggle filter (medium frequency)
- **View Mode Toggle** - Switch flat/hierarchical (replaces 2 buttons!)

**Overflow Menu (...):**
- **Advanced Filters** - Status, Priority, Type, Tags
- **Sort Options** - Multi-field sorting

## Benefits
- **Cleaner UI** - 3 primary buttons instead of 6+
- **Standard UX** - Matches VS Code patterns (Explorer, Source Control)
- **Hover Discovery** - Users find secondary actions naturally
- **One-click toggle** - View mode toggle replaces 2 separate buttons
- **Progressive disclosure** - Advanced features in overflow menu

## Acceptance Criteria
- [ ] Only 3 buttons visible by default (Refresh, Dashboard, Search)
- [ ] 3 buttons appear on hover (Collapse All, Hide Done, View Mode)
- [ ] Advanced filters moved to "..." overflow menu
- [ ] Collapse All collapses all tree nodes
- [ ] View Mode Toggle switches between flat/hierarchical
- [ ] Search opens input box and filters tree
- [ ] Button order logical (frequency of use)
- [ ] Icons appropriate and consistent

## Testing
- Default view: Only 3 buttons visible
- Hover over view: 3 more buttons appear
- Click Collapse All: All nodes collapse
- Click View Mode: Toggle between flat/hierarchical
- Click Search: Input box opens, filtering works
- Click "...": Advanced menu opens with filters/sort

## Migration Notes
**Remove these old commands from toolbar:**
- `devsteps.viewMode.flat` (replaced by toggle)
- `devsteps.viewMode.hierarchical` (replaced by toggle)
- Keep commands registered for Command Palette access

## Related
- TASK-034 (Description badge)
- TASK-031 (Hide Done toggle)
- TASK-010 (Filtering system)
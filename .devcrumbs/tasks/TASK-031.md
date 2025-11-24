# TreeView: Add "Hide Done Items" Toggle Filter

## Problem
TreeView currently shows all 33 completed items mixed with active work items. The existing FilterState only supports inclusion filters (show only these statuses), not exclusion filters (hide these statuses).

## Current Implementation
- FilterState has: statuses[], priorities[], types[], tags[], searchQuery
- Status filter is for showing ONLY selected statuses (inclusion)
- No way to hide done items while showing all others

## Solution Design

### 1. Add Toggle State
```typescript
interface FilterState {
  statuses: string[];
  priorities: string[];
  types: string[];
  tags: string[];
  searchQuery: string;
  hideDone: boolean;  // ← NEW: Toggle to hide completed items
}
```

### 2. Filter Logic
```typescript
private applyFilters(items: WorkItem[]): WorkItem[] {
  return items.filter(item => {
    // Hide done items if toggle is active
    if (this.filterState.hideDone && item.status === 'done') {
      return false;
    }
    // ... existing filter logic ...
  });
}
```

### 3. Command Registration
```typescript
// In extension.ts
vscode.commands.registerCommand('devcrumbs.toggleHideDone', () => {
  treeDataProvider.toggleHideDone();
});
```

### 4. Toolbar Button (package.json)
```json
"menus": {
  "view/title": [
    {
      "command": "devcrumbs.toggleHideDone",
      "when": "view == devcrumbsExplorer",
      "group": "navigation@1"
    }
  ]
}
```

### 5. Button Icon
- Icon: `eye` (show) / `eye-closed` (hide)
- Tooltip: "Hide Completed Items" / "Show Completed Items"
- Default state: hideDone = false (show all)

## Benefits
- Reduces TreeView clutter (33 done items hidden)
- Focuses on active work (13 remaining items)
- Preserves done items for reference when needed
- Standard UX pattern (like GitHub issues filter)

## Acceptance Criteria
- [ ] Toggle button visible in TreeView toolbar
- [ ] Button state persists across VS Code sessions
- [ ] Clicking toggles visibility of done items
- [ ] Icon/tooltip reflects current state
- [ ] Filter works in both flat and hierarchical view modes
- [ ] Type group counts update correctly (e.g., "TASKS (8)" instead of "TASKS (30)")

## Implementation Steps
1. Extend FilterState interface with hideDone boolean
2. Add toggleHideDone() method to DevCrumbsTreeDataProvider
3. Implement filter logic in getChildren() / applyFilters()
4. Register command in extension.ts
5. Add toolbar button to package.json contributions
6. Add workspace state persistence for toggle state
7. Update type group count calculations
# TreeView Description Badge for Filter Count

## Problem
Users cannot see if filters are active or how many items are currently visible. No visual feedback when toggling "Hide Done" or applying other filters.

**Current:** No indication of active filters
**Desired:** Badge showing `(12/47)` = "12 filtered / 47 total"

## Solution: TreeView.description API

VS Code TreeView API provides `description` property to show badges next to view title.

### Implementation

**1. Create TreeView instance (not just register provider):**
```typescript
// In extension.ts activate()
const treeView = vscode.window.createTreeView('devsteps.itemsView', {
  treeDataProvider: treeDataProvider
});

// Pass treeView to provider
treeDataProvider.setTreeView(treeView);
```

**2. Update description on filter changes:**
```typescript
// In DevStepsTreeDataProvider
private treeView?: vscode.TreeView<TreeNode>;

setTreeView(treeView: vscode.TreeView<TreeNode>): void {
  this.treeView = treeView;
  this.updateDescription();
}

private updateDescription(): void {
  if (!this.treeView) return;
  
  const totalCount = this.getTotalItemCount();
  const filteredCount = this.getFilteredItemCount();
  
  // Show badge only when filtering
  if (filteredCount < totalCount) {
    this.treeView.description = `(${filteredCount}/${totalCount})`;
  } else {
    this.treeView.description = undefined; // No badge when showing all
  }
}

// Call updateDescription() after every filter change
toggleHideDone(): void {
  this.filterState.hideDone = !this.filterState.hideDone;
  this.refresh();
  this.updateDescription(); // ← ADD THIS
}

setStatusFilter(statuses: string[]): void {
  this.filterState.statuses = statuses;
  this.refresh();
  this.updateDescription(); // ← ADD THIS
}
// ... repeat for all filter methods
```

**3. Count methods:**
```typescript
private getTotalItemCount(): number {
  // Read index.json and return total items count
  const index = this.loadIndex();
  return index.items.length;
}

private getFilteredItemCount(): number {
  // Return count after applying current filters
  const allItems = this.loadAllItems();
  const filtered = this.applyFilters(allItems);
  return filtered.length;
}
```

## Example Display

**Before filtering:**
```
📋 Work Items                    ← No badge
  ├─ EPICS (4)
  ├─ TASKS (31)
  └─ BUGS (6)
```

**After "Hide Done" toggle:**
```
📋 Work Items (12/47)            ← Badge shows filtering!
  ├─ EPICS (2)                   ← Only non-done items
  ├─ TASKS (8)
  └─ BUGS (2)
```

**After status filter (show only "in-progress"):**
```
📋 Work Items (5/47)             ← Even fewer items
  ├─ TASKS (3)
  └─ BUGS (2)
```

## Benefits
- **Instant feedback** - User sees filter is active
- **Transparency** - Shows how many items hidden
- **Standard UX** - Same pattern as VS Code Problems view
- **No extra clicks** - Always visible

## Acceptance Criteria
- [ ] TreeView created with `window.createTreeView()` (not just `registerTreeDataProvider`)
- [ ] Description badge shows `(filtered/total)` when any filter active
- [ ] Badge disappears when showing all items (no filters)
- [ ] Badge updates immediately on filter toggle
- [ ] Works in both flat and hierarchical view modes
- [ ] Count is accurate (matches visible items)

## Implementation Steps
1. Change `registerTreeDataProvider` to `createTreeView` in extension.ts
2. Add `setTreeView()` method to DevStepsTreeDataProvider
3. Implement `getTotalItemCount()` and `getFilteredItemCount()` methods
4. Implement `updateDescription()` with badge logic
5. Call `updateDescription()` in all filter/toggle methods
6. Test with various filter combinations

## Testing
- Toggle "Hide Done" → Badge appears `(X/47)`
- Apply status filter → Badge updates `(Y/47)`
- Clear all filters → Badge disappears
- Switch view modes → Badge persists correctly
- Edge case: All items filtered out → Badge shows `(0/47)`

## Related
- BUG-006 (Hide Done in hierarchical view)
- TASK-031 (Hide Done toggle implementation)
- TASK-010 (Filtering system)
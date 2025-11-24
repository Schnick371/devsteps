# TreeView State Persistence

## Problem
All TreeView UI state resets on every VS Code restart, forcing users to reconfigure their workspace manually:
- ❌ View mode (flat/hierarchical) - resets to 'flat'
- ❌ Hierarchy type (scrum/waterfall/both) - resets to 'both'
- ❌ Hide Done toggle - resets to off
- ❌ Active filters (status/priority/type/tags/search) - lost
- ❌ Sort options (by/order) - resets to 'id/asc'
- ✅ Expanded groups - **already working** (in-memory Set)

**User Impact:** Lose workspace context every restart - must reconfigure filters, view mode, and sort preferences repeatedly.

## Solution
Use VS Code's `ExtensionContext.workspaceState` (Memento API) to persist state across sessions.

## Implementation Plan

### 1. Create StateManager Utility
**File:** `packages/vscode-extension/src/utils/stateManager.ts`

```typescript
import * as vscode from 'vscode';
import type { ViewMode, HierarchyType, FilterState, SortState } from '../treeView/devcrumbsTreeDataProvider';

export class TreeViewStateManager {
  private static readonly KEYS = {
    VIEW_MODE: 'devcrumbs.treeView.viewMode',
    HIERARCHY_TYPE: 'devcrumbs.treeView.hierarchyType',
    FILTER_STATE: 'devcrumbs.treeView.filterState',
    SORT_STATE: 'devcrumbs.treeView.sortState',
    EXPANDED_GROUPS: 'devcrumbs.treeView.expandedGroups',
  };

  constructor(private workspaceState: vscode.Memento) {}

  // Load state (called in TreeDataProvider constructor)
  loadViewMode(): ViewMode {
    return this.workspaceState.get<ViewMode>(TreeViewStateManager.KEYS.VIEW_MODE, 'flat');
  }

  loadHierarchyType(): HierarchyType {
    return this.workspaceState.get<HierarchyType>(TreeViewStateManager.KEYS.HIERARCHY_TYPE, 'both');
  }

  loadFilterState(): FilterState {
    return this.workspaceState.get<FilterState>(TreeViewStateManager.KEYS.FILTER_STATE, {
      statuses: [],
      priorities: [],
      types: [],
      tags: [],
      searchQuery: '',
      hideDone: false,
    });
  }

  loadSortState(): SortState {
    return this.workspaceState.get<SortState>(TreeViewStateManager.KEYS.SORT_STATE, {
      by: 'id',
      order: 'asc',
    });
  }

  loadExpandedGroups(): Set<string> {
    const array = this.workspaceState.get<string[]>(TreeViewStateManager.KEYS.EXPANDED_GROUPS, []);
    return new Set(array);
  }

  // Save state (called on every setter method)
  async saveViewMode(mode: ViewMode): Promise<void> {
    await this.workspaceState.update(TreeViewStateManager.KEYS.VIEW_MODE, mode);
  }

  async saveHierarchyType(type: HierarchyType): Promise<void> {
    await this.workspaceState.update(TreeViewStateManager.KEYS.HIERARCHY_TYPE, type);
  }

  async saveFilterState(filterState: FilterState): Promise<void> {
    await this.workspaceState.update(TreeViewStateManager.KEYS.FILTER_STATE, filterState);
  }

  async saveSortState(sortState: SortState): Promise<void> {
    await this.workspaceState.update(TreeViewStateManager.KEYS.SORT_STATE, sortState);
  }

  async saveExpandedGroups(groups: Set<string>): Promise<void> {
    await this.workspaceState.update(TreeViewStateManager.KEYS.EXPANDED_GROUPS, Array.from(groups));
  }
}
```

### 2. Modify TreeDataProvider Constructor
**File:** `packages/vscode-extension/src/treeView/devcrumbsTreeDataProvider.ts`

**Change constructor signature:**
```typescript
constructor(
  private workspaceRoot: vscode.Uri,
  private stateManager?: TreeViewStateManager, // NEW
) {
  // Load persisted state
  if (stateManager) {
    this.viewMode = stateManager.loadViewMode();
    this.hierarchyType = stateManager.loadHierarchyType();
    this.filterState = stateManager.loadFilterState();
    this.sortState = stateManager.loadSortState();
    this.expandedGroups = stateManager.loadExpandedGroups();
  }
}
```

### 3. Update All Setter Methods
**File:** `packages/vscode-extension/src/treeView/devcrumbsTreeDataProvider.ts`

Add persistence calls to:
- `setViewMode()` → `this.stateManager?.saveViewMode(mode)`
- `setHierarchyType()` → `this.stateManager?.saveHierarchyType(type)`
- `setStatusFilter()` → `this.stateManager?.saveFilterState(this.filterState)`
- `setPriorityFilter()` → `this.stateManager?.saveFilterState(this.filterState)`
- `setTypeFilter()` → `this.stateManager?.saveFilterState(this.filterState)`
- `setTagFilter()` → `this.stateManager?.saveFilterState(this.filterState)`
- `setSearchQuery()` → `this.stateManager?.saveFilterState(this.filterState)`
- `clearFilters()` → `this.stateManager?.saveFilterState(this.filterState)`
- `toggleHideDone()` → `this.stateManager?.saveFilterState(this.filterState)`
- `setSortOptions()` → `this.stateManager?.saveSortState(this.sortState)`

**Also save expanded groups in event listeners:**
```typescript
this.treeView.onDidExpandElement((e) => {
  if (e.element instanceof TypeGroupNode) {
    this.expandedGroups.add(e.element.getType());
    this.stateManager?.saveExpandedGroups(this.expandedGroups); // NEW
  }
});

this.treeView.onDidCollapseElement((e) => {
  if (e.element instanceof TypeGroupNode) {
    this.expandedGroups.delete(e.element.getType());
    this.stateManager?.saveExpandedGroups(this.expandedGroups); // NEW
  }
});
```

### 4. Update Extension Activation
**File:** `packages/vscode-extension/src/extension.ts`

```typescript
// Create state manager
const stateManager = new TreeViewStateManager(context.workspaceState);

// Pass to TreeDataProvider
const treeDataProvider = new DevCrumbsTreeDataProvider(workspaceRoot, stateManager);
```

## Implementation Steps
1. ✅ Create `stateManager.ts` utility class
2. ✅ Export types from `devcrumbsTreeDataProvider.ts` (ViewMode, HierarchyType)
3. ✅ Modify TreeDataProvider constructor to accept stateManager
4. ✅ Load persisted state in constructor
5. ✅ Add save calls to all 10 setter methods
6. ✅ Add save calls to expand/collapse event listeners
7. ✅ Update extension.ts to create and pass stateManager
8. ✅ Test all state persistence scenarios

## Testing Checklist
- [ ] Set view mode to hierarchical → reload VS Code → verify hierarchical
- [ ] Enable "Hide Done" → reload → verify still hidden
- [ ] Apply filters (status/priority) → reload → verify filters active
- [ ] Sort by priority desc → reload → verify sort maintained
- [ ] Expand type groups → reload → verify groups expanded
- [ ] Clear filters → reload → verify clean state
- [ ] Change hierarchy type → reload → verify type maintained

## Acceptance Criteria
- All TreeView state persists across VS Code restarts
- State is workspace-specific (different state per workspace)
- No performance impact (Memento API is async but fast)
- Backward compatible (works without stateManager for tests)

## Technical Notes
- **Memento API:** VS Code's built-in key-value store for extensions
- **Workspace State:** Persisted per workspace folder
- **Global State:** Available but not needed (workspace-specific is correct)
- **Async Saves:** Don't block UI (fire-and-forget pattern)
- **Optional Chaining:** `this.stateManager?.save()` for backward compatibility

## Related Work
- BUG-007: Expanded state preservation (completed)
- TASK-034: Description badge (completed)
- TASK-012: Settings UI (future work - different from state persistence)

# Fix TreeView Collapse in Hierarchical View ONLY

## Scope Clarification
✅ **Flat view works** - MethodologySectionNode + TypeGroupNode have isExpanded state
❌ **Hierarchical view collapses** - on ALL filter operations

**User Feedback:** "es geht nur um den hierarchical tree!!! der flat tree geht schon!"

## Problem (Hierarchical View Only)
When applying filters in hierarchical view, tree collapses completely:
- Epic nodes collapse
- Story nodes collapse
- Task nodes collapse
- User loses navigation context

## Root Cause Analysis

**Hierarchical View Structure:**
```
HierarchyRootNode ("🌲 Scrum Hierarchy")
  └─ WorkItemNode (EPIC-001)
      └─ WorkItemNode (STORY-001)
          └─ WorkItemNode (TASK-001)
```

**Current Implementation:**
```typescript
// HierarchyRootNode.toTreeItem() - Line 21
const item = new vscode.TreeItem(
  this.label, 
  vscode.TreeItemCollapsibleState.Expanded  // ← HARDCODED!
);
// No ID set!
// No isExpanded state tracking!
```

```typescript
// WorkItemNode.toTreeItem() - For hierarchical items
collapsibleState: this.item.linked_items?.['implemented-by']?.length 
  ? vscode.TreeItemCollapsibleState.Collapsed  // ← ALWAYS COLLAPSED!
  : vscode.TreeItemCollapsibleState.None
// No isExpanded state!
// No consistent IDs for hierarchical mode!
```

**Why Flat View Works:**
- MethodologySectionNode: Has `isExpanded` + ID (`methodology-scrum`)
- TypeGroupNode: Has `isExpanded` + ID (`type-scrum-epic`)
- Provider tracks state in `expandedSections` + `expandedGroups` Sets

**Why Hierarchical View Fails:**
- HierarchyRootNode: HARDCODED expanded, no ID, no state tracking
- WorkItemNode: HARDCODED collapsed, no IDs for hierarchical mode, no state tracking
- No provider tracking for expanded hierarchical items

## Solution (Same Pattern as Flat View)

### 1. Add Expanded State Tracking to Provider
```typescript
// In DevStepsTreeDataProvider
private expandedHierarchyItems = new Set<string>(); // Track expanded Epic/Story/Task IDs
```

### 2. Update HierarchyRootNode
```typescript
export class HierarchyRootNode extends TreeNode {
  constructor(
    private hierarchy: 'scrum' | 'waterfall',
    private label: string,
    private isExpanded: boolean = true  // ← ADD
  ) {}

  toTreeItem(): vscode.TreeItem {
    const collapsibleState = this.isExpanded
      ? vscode.TreeItemCollapsibleState.Expanded
      : vscode.TreeItemCollapsibleState.Collapsed;
      
    const item = new vscode.TreeItem(this.label, collapsibleState);
    item.id = `hierarchy-${this.hierarchy}`;  // ← ADD ID
    item.contextValue = 'hierarchyRoot';
    return item;
  }
}
```

### 3. Update WorkItemNode for Hierarchical Mode
```typescript
toTreeItem(): vscode.TreeItem {
  const hasChildren = this.hierarchical && 
    this.item.linked_items?.['implemented-by']?.length > 0;
  
  let collapsibleState = vscode.TreeItemCollapsibleState.None;
  if (hasChildren) {
    // Use tracked expanded state instead of hardcoded Collapsed
    collapsibleState = this.isExpanded
      ? vscode.TreeItemCollapsibleState.Expanded
      : vscode.TreeItemCollapsibleState.Collapsed;
  }
  
  const item = new vscode.TreeItem(this.item.title, collapsibleState);
  item.id = `item-${this.item.id}`;  // ← Consistent ID
  // ...
}
```

### 4. Track Expansion Events
```typescript
// In setTreeView()
this.treeView.onDidExpandElement((e) => {
  if (e.element instanceof WorkItemNode && this.viewMode === 'hierarchical') {
    this.expandedHierarchyItems.add(e.element.getItemId());
    this.stateManager?.saveExpandedHierarchyItems(this.expandedHierarchyItems);
  }
});
```

### 5. Pass Expanded State to Nodes
```typescript
// In getHierarchicalRootNodes()
const isScrumExpanded = this.expandedSections.has('scrum-hierarchy');
roots.push(new HierarchyRootNode('scrum', '🌲 Scrum Hierarchy', isScrumExpanded));

// In WorkItemNode creation
const isExpanded = this.expandedHierarchyItems.has(item.id);
return new WorkItemNode(item, true, filterState, isExpanded);
```

## Implementation Steps
1. Add `expandedHierarchyItems` Set to provider
2. Update `HierarchyRootNode` constructor + toTreeItem()
3. Update `WorkItemNode` to accept + use isExpanded for hierarchical
4. Track expand/collapse events for hierarchical items
5. Pass expanded state when creating hierarchical nodes
6. Add state persistence methods to StateManager
7. Test: expand items → toggle filter → verify stays expanded

## Acceptance Criteria
- [ ] Hierarchical view preserves expanded Epic nodes during filter
- [ ] Hierarchical view preserves expanded Story nodes during filter
- [ ] Hierarchical view preserves expanded Task nodes during filter
- [ ] State persists across VS Code sessions
- [ ] No performance degradation

## Files Affected
- `packages/extension/src/treeView/devstepsTreeDataProvider.ts`
- `packages/extension/src/treeView/nodes/hierarchyRootNode.ts`
- `packages/extension/src/treeView/nodes/workItemNode.ts`
- `packages/extension/src/utils/stateManager.ts`

## Related Work
- BUG-007: Flat view expanded state fix (same pattern)
- TASK-037: State persistence infrastructure (extend for hierarchical)
- BUG-023: ID fix for TypeGroupNode (similar approach needed here)
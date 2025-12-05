# Fix WorkItemNode: Generate Unique TreeView IDs

## Objective
Fix duplicate TreeView IDs by generating unique identifiers that combine item ID with parent context.

## Problem
Current code (Line 48):
```typescript
treeItem.id = this.item.id;  // ← NOT UNIQUE!
```

## Solution
```typescript
// Add parentId parameter to constructor
constructor(
  private item: WorkItem,
  private hierarchical: boolean = false,
  private filterState?: FilterState,
  private isExpanded?: boolean,
  private parentId?: string,  // ← NEW
  private relationshipType?: string,  // ← NEW
) {
  super();
}

// Generate unique ID in toTreeItem()
toTreeItem(): vscode.TreeItem {
  // ...
  
  // Generate unique ID based on context
  const uniqueId = this.generateUniqueId();
  treeItem.id = uniqueId;
  
  // ...
}

private generateUniqueId(): string {
  if (!this.parentId) {
    // Root level: hierarchy-scrum-EPIC-008
    return `hierarchy-root-${this.item.id}`;
  }
  
  // Child level: EPIC-008-implemented-by-STORY-001
  const relType = this.relationshipType || 'child';
  return `${this.parentId}-${relType}-${this.item.id}`;
}
```

## Implementation Steps
1. Add `parentId` and `relationshipType` parameters to WorkItemNode constructor
2. Implement `generateUniqueId()` method
3. Update all WorkItemNode instantiations to pass parent context:
   - `HierarchyRootNode.getChildren()` → pass `hierarchy-scrum` or `hierarchy-waterfall`
   - `WorkItemNode.getChildren()` → pass `this.item.id` and relationship type

## Example IDs
```
Root:     hierarchy-scrum-EPIC-008
Child:    EPIC-008-implemented-by-STORY-001
GrandCh:  STORY-001-implemented-by-TASK-042
RelatesTo: EPIC-008-relates-to-EPIC-005
```

## Testing
- [ ] Expand Epic → Children visible
- [ ] Refresh (F5) → Children still visible
- [ ] No "already registered" errors
- [ ] All relationship types work (implemented-by, relates-to, blocks, etc.)

## Files to Modify
- `packages/extension/src/treeView/nodes/workItemNode.ts` (ID generation)
- `packages/extension/src/treeView/nodes/hierarchyRootNode.ts` (pass parent context)

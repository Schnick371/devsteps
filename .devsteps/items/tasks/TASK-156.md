# Update Expansion State Tracking for Unique IDs

## Objective
Update `expandedHierarchyItems` Set to track new unique IDs instead of simple item IDs.

## Problem
Current tracking uses simple IDs:
```typescript
this.expandedHierarchyItems.add(e.element.getId());  // ← EPIC-008
```

But with unique IDs, we need to track:
```typescript
hierarchy-scrum-EPIC-008
EPIC-008-implemented-by-STORY-001
```

## Solution Options

### Option A: Keep Simple IDs (Recommended)
Track item ID only, ignore context:
```typescript
// In WorkItemNode.getId()
getId(): string {
  return this.item.id;  // Return simple ID for expansion tracking
}

// Separate method for TreeView unique ID
getTreeViewId(): string {
  return this.generateUniqueId();  // Used in toTreeItem()
}
```

**Pro:** Expansion state survives context changes (item appears in multiple places)
**Con:** All instances of same item share expansion state

### Option B: Track Full Unique IDs
Track complete context-aware IDs:
```typescript
this.expandedHierarchyItems.add(e.element.getTreeViewId());
```

**Pro:** Independent expansion per context
**Con:** More complex state management

## Implementation (Option A)
1. Keep `getId()` returning simple `this.item.id`
2. Add `getTreeViewId()` returning unique ID
3. Use `getTreeViewId()` in `toTreeItem()`
4. Keep expansion tracking using `getId()`

## Files to Modify
- `packages/extension/src/treeView/nodes/workItemNode.ts`
- `packages/extension/src/treeView/devstepsTreeDataProvider.ts` (if needed)

## Testing
- [ ] Expand item in one context → stays expanded
- [ ] Refresh → expansion state preserved
- [ ] Same item in different contexts → independent states (Option B) OR shared state (Option A)

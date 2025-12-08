# Update WorkItemNode: Accept Cycle Detection Flag

## Objective
Modify `WorkItemNode` to conditionally apply cycle detection based on configuration.

## Implementation

**File:** `packages/extension/src/treeView/nodes/workItemNode.ts`

### 1. Constructor - Add Parameter
```typescript
constructor(
  private item: WorkItem,
  private hierarchical: boolean = false,
  private filterState?: FilterState,
  private isExpanded?: boolean,
  private parentId?: string,
  private relationshipType?: string,
  private ancestorIds: Set<string> = new Set(),
  private enableCycleDetection: boolean = true,  // ← NEW
)
```

### 2. getChildren() - Conditional Check
```typescript
const loadChildWithRelation = async (childId: string, relationType: string) => {
  // Only check ancestors if cycle detection enabled
  if (this.enableCycleDetection && this.ancestorIds.has(childId)) {
    return; // Skip cycle
  }
  
  // ... rest of loading logic
};
```

### 3. hasVisibleChildren() - Conditional Logic
```typescript
hasVisibleChildren(filterState?: FilterState): boolean {
  const hasLinks = this.hasImplementedByLinks(filterState);
  if (!hasLinks) return false;
  
  // If cycle detection disabled, always show chevron when links exist
  if (!this.enableCycleDetection) {
    return true;
  }
  
  // ... existing ancestor check logic
  return allChildren.some(childId => !this.ancestorIds.has(childId));
}
```

### 4. Child Node Creation - Pass Flag
```typescript
return filteredChildren.map(({ item, relationType }) => 
  new WorkItemNode(
    item, 
    true, 
    effectiveFilter, 
    isExpanded, 
    this.item.id, 
    relationType, 
    childAncestors,
    this.enableCycleDetection  // ← Pass to children
  )
);
```

## Testing
- [ ] When enabled: Cycle detection works (existing behavior)
- [ ] When disabled: Children load without ancestor checks
- [ ] Flag propagates to all child nodes
- [ ] No TypeScript errors

## Notes
- Default `true` maintains backward compatibility
- Flag must propagate through entire tree (children inherit parent's setting)
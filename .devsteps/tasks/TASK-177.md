## Task

Rename `hideRelatesTo` to `hideFlexibleRelations` and extend logic to hide ALL flexible relationships (not just relates-to).

## Rationale

**Current:** Only `relates-to` can be hidden (hardcoded)
**Problem:** `depends-on`, `supersedes`, `required-by` also clutter TreeView
**Solution:** Hide ALL flexible relationships with one toggle

## Changes

### 1. Update FilterState Interface

**File:** `packages/extension/src/treeView/types.ts`

```typescript
export interface FilterState {
  statuses: string[];
  priorities: string[];
  types: string[];
  tags: string[];
  searchQuery: string;
  hideDone: boolean;
  hideFlexibleRelations: boolean;  // ← Renamed from hideRelatesTo
}
```

### 2. Update TreeDataProvider

**File:** `packages/extension/src/treeView/devstepsTreeDataProvider.ts`

```typescript
import { getFlexibleRelationships } from '@schnick371/devsteps-shared';

// Rename method
toggleHideFlexibleRelations(): void {
  this.filterState.hideFlexibleRelations = !this.filterState.hideFlexibleRelations;
  // ...
}

getHideFlexibleRelationsState(): boolean {
  return this.filterState.hideFlexibleRelations;
}
```

### 3. Update WorkItemNode

**File:** `packages/extension/src/treeView/nodes/workItemNode.ts`

**Current:**
```typescript
if (!effectiveFilter?.hideRelatesTo) {
  const relatesTo = this.item.linked_items?.['relates-to'] || [];
  // ...
}
```

**New:**
```typescript
if (!effectiveFilter?.hideFlexibleRelations) {
  const flexibleRelations = getFlexibleRelationships();
  for (const relType of flexibleRelations) {
    const children = this.item.linked_items?.[relType] || [];
    for (const childId of children) {
      await loadChildWithRelation(childId, relType);
    }
  }
}
```

### 4. Update Commands

**File:** `packages/extension/src/commands/index.ts`

Rename 4 commands:
- `devsteps.showRelatesTo.active` → `devsteps.showFlexibleRelations.active`
- `devsteps.showRelatesTo.inactive` → `devsteps.showFlexibleRelations.inactive`
- `devsteps.hideRelatesTo.active` → `devsteps.hideFlexibleRelations.active`
- `devsteps.hideRelatesTo.inactive` → `devsteps.hideFlexibleRelations.inactive`

### 5. Update package.json

Rename commands and context keys:
- `devsteps.hideRelatesTo` → `devsteps.hideFlexibleRelations`

**Menu labels:**
- "Show 'relates-to' Links" → "Show Flexible Relations"
- "Hide 'relates-to' Links" → "Hide Flexible Relations"

## User Experience

**Before:** Manually hide depends-on, supersedes (not possible)
**After:** One toggle hides ALL flexible relationships

**TreeView becomes cleaner:**
- Hide noise (relates-to, depends-on, supersedes)
- Focus on hierarchy (implements, blocks, tested-by)

## Dependencies

- Depends on: TASK-175 (getFlexibleRelationships available)

## Testing

1. Toggle "Hide Flexible Relations"
2. Verify relates-to hidden ✅
3. Verify depends-on hidden ✅
4. Verify supersedes hidden ✅
5. Verify implements still visible ✅

## Acceptance Criteria

- hideRelatesTo renamed to hideFlexibleRelations
- All flexible relationships hidden with one toggle
- Hierarchy relationships always visible
- Commands renamed consistently
- UI labels updated
- State persists across sessions
- All packages build successfully
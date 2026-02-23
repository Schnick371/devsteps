# Implement unlinkItem() in shared/core

## Context

STORY-039: There is currently NO way to remove a relationship between items except by manually editing JSON files (violates the "never edit .devsteps/ manually" principle). This task adds the foundational `unlinkItem()` function to shared/core so that CLI and MCP can both use it.

## Why This Belongs in Shared

All CRUD operations on items must go through shared core functions (archiveItem, addItem, updateItem are precedents). This ensures index consistency, validation, and bi-directional link maintenance.

## Implementation

### New file: `packages/shared/src/core/unlink.ts`

```typescript
export interface UnlinkItemArgs {
  sourceId: string;
  relationType: RelationType;
  targetId: string;
}

export interface UnlinkItemResult {
  success: boolean;
  message: string;
  sourceId: string;
  targetId: string;
  relation: RelationType;
}

export async function unlinkItem(devstepsDir: string, args: UnlinkItemArgs): Promise<UnlinkItemResult>
```

### Implementation logic:

1. Load source and target metadata via `getItem()`
2. Remove `targetId` from `source.linked_items[relationType]`
3. Determine inverse relation (same map as `linkItem`)
4. Remove `sourceId` from `target.linked_items[inverseRelation]`
5. Update `updated` timestamp on both items
6. Write both JSON files
7. Return `UnlinkItemResult`

### Error cases:

- Item not found → throw descriptive error
- Invalid ID format → throw error
- Relation entry doesn't exist → return success with warning (idempotent)

### Exports:

Add `unlinkItem`, `UnlinkItemArgs`, `UnlinkItemResult` to:
- `packages/shared/src/core/index.ts`
- `packages/shared/src/index.ts`

## Acceptance Criteria

- [ ] `unlinkItem()` exists in shared/core
- [ ] Bi-directional removal: removing A→B also removes B←A inverse
- [ ] Idempotent: calling on already-removed relation returns success
- [ ] Invalid item IDs produce clear error messages
- [ ] Exported from shared package top-level index
- [ ] Unit tests cover: normal unlink, inverse removal, idempotent call, missing item error
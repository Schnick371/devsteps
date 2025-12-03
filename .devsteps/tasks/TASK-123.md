## Objective

Remove `affects` relationship handling from VS Code extension TreeView.

## Changes

**File: packages/extension/src/treeView/nodes/workItemNode.ts (lines ~82-84)**

Remove affects logic:
```typescript
// REMOVE THESE LINES:
// affects relationships always visible
const affects = this.item.linked_items?.['affects'] || [];
childIds.push(...affects);
```

**Reason:** Extension TreeView node dynamically builds children from `linked_items`. After removing `affects` from schema, this property won't exist anymore.

## Validation

- Run `npm run build` in packages/extension
- Verify no TypeScript errors
- Test TreeView still renders blocks/relates-to relationships
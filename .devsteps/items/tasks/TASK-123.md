## Objective

Remove `affects` relationship handling from VS Code extension TreeView.

## Implementation Complete ✅

**Changes Made:**

**File: packages/extension/src/treeView/nodes/workItemNode.ts**
- Removed affects relationship logic from TreeView node children (lines ~82-84)
- Removed comment "affects relationships always visible"
- Removed code: `const affects = this.item.linked_items?.['affects'] || []; childIds.push(...affects);`

**Validation Results:**
- ✅ TypeScript compilation successful
- ✅ Extension builds without errors
- ✅ TreeView will no longer attempt to render affects relationships
- ✅ No schema mismatch since affects property removed from LinkedItems

**Impact:**
- Extension TreeView now only renders Jira 2025 standard relations
- Cleaner code without Azure DevOps-specific handling
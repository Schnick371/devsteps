# Update HierarchyRootNode to Use Refs-Style Index

## Objective
Fix BUG-036: Update `HierarchyRootNode.getChildren()` to read from new refs-style index structure instead of deprecated monolithic index.

## Current Implementation (BROKEN)
**File:** `packages/extension/src/treeView/nodes/hierarchyRootNode.ts` (Lines 42-50)

```typescript
const indexPath = vscode.Uri.joinPath(workspaceRoot, '.devsteps', 'index.json');
const indexData = await vscode.workspace.fs.readFile(indexPath);
const index = JSON.parse(Buffer.from(indexData).toString('utf-8'));

// Get top-level items (Epics for Scrum, Requirements for Waterfall)
const topLevelType = this.hierarchy === 'scrum' ? 'epic' : 'requirement';
const itemIds = index.items
  .filter((meta: any) => meta.type === topLevelType)
  .map((meta: any) => meta.id);
```

**Problem:** `.devsteps/index.json` no longer exists after STORY-079 migration.

## New Implementation (FIX)

### Step 1: Read from refs-style index
```typescript
// Determine index file based on hierarchy type
const indexFileName = this.hierarchy === 'scrum' ? 'epics.json' : 'requirements.json';
const indexPath = vscode.Uri.joinPath(
  workspaceRoot, 
  '.devsteps', 
  'index', 
  'by-type', 
  indexFileName
);

const indexData = await vscode.workspace.fs.readFile(indexPath);
const index = JSON.parse(Buffer.from(indexData).toString('utf-8'));

// Refs-style index structure: { version, items: string[], updated }
const itemIds = index.items || [];
```

### Step 2: Handle missing index gracefully
```typescript
try {
  await vscode.workspace.fs.stat(indexPath);
} catch {
  // Index doesn't exist - return empty (happens in new/empty projects)
  return [];
}
```

### Step 3: Load full items (unchanged)
```typescript
// Load full items with linked_items for hierarchical view
let items: WorkItem[] = [];
for (const itemId of itemIds) {
  const item = await loadItemWithLinks(workspaceRoot, itemId);
  if (item) items.push(item);
}
```

## Implementation Steps
1. ✅ Update index path to use `.devsteps/index/by-type/epics.json` or `requirements.json`
2. ✅ Change data access pattern from `index.items.filter()` to `index.items` array
3. ✅ Add error handling for missing index files
4. ✅ Test with both Scrum and Waterfall hierarchies
5. ✅ Verify flat view still works (should be unaffected)

## Testing
- [ ] Switch to hierarchical view → Epics/Requirements displayed
- [ ] Expand Epic → Stories shown
- [ ] Expand Story → Tasks shown  
- [ ] Switch to Waterfall → Requirements shown
- [ ] Toggle hideDone filter → Works correctly
- [ ] Flat view → Unaffected, still works

## Files Modified
- `packages/extension/src/treeView/nodes/hierarchyRootNode.ts` (~10 lines changed)

## Acceptance Criteria
- ✅ Hierarchical view displays top-level items (Epics/Requirements)
- ✅ No errors in console
- ✅ Flat view unaffected
- ✅ Works with both Scrum and Waterfall hierarchies

## Related
- **Implements:** BUG-036 (hierarchical view empty)
- **Caused by:** STORY-079 (items directory migration)
- **Pattern:** Same fix applied to flat view previously

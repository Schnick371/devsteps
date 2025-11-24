# Fix Extension Commands for New Shared API

## Problem
Extension commands use outdated API signatures from `@devcrumbs/shared`:

**Old API (broken)**:
```typescript
// getItem returned { success, item, error }
const result = await getItem(itemId, workspacePath);
if (!result.success || !result.item) { ... }
const item = result.item;

// listItems accepted object parameter
const items = await listItems({ path: workspacePath });
if (!items.success || !items.items) { ... }

// updateItem accepted only args object
const result = await updateItem({ id, status });
if (result.success) { ... }
```

**New API (correct)**:
```typescript
// getItem returns { metadata, description }
const devcrumbsPath = path.join(workspacePath, '.devcrumbs');
const result = await getItem(devcrumbsPath, itemId);
if (!result.metadata) { ... }
const item = result.metadata;

// listItems accepts devcrumbsPath string + optional args
const items = await listItems(devcrumbsPath, { type: 'task' });
if (!items.items) { ... }

// updateItem requires devcrumbsPath + args
const result = await updateItem(devcrumbsPath, { id, status });
if (result.metadata) { ... }
```

## Files to Update
- `packages/vscode-extension/src/commands/index.ts` (734 lines)

## Changes Required

### 1. Fix getItem() Calls (5 occurrences)
**Lines**: 188, 258, 472, 513
**Change**:
```typescript
// OLD:
const result = await getItem(itemId, workspaceFolder.uri.fsPath);
if (!result.success || !result.item) { return; }
const item = result.item;

// NEW:
const devcrumbsPath = path.join(workspaceFolder.uri.fsPath, '.devcrumbs');
const result = await getItem(devcrumbsPath, itemId);
if (!result.metadata) { return; }
const item = result.metadata;
```

### 2. Fix listItems() Calls (3 occurrences)
**Lines**: 231, 331, 388
**Change**:
```typescript
// OLD:
const allItems = await listItems({ path: workspaceFolder.uri.fsPath });
if (!allItems.success || !allItems.items) { return; }

// NEW:
const devcrumbsPath = path.join(workspaceFolder.uri.fsPath, '.devcrumbs');
const allItems = await listItems(devcrumbsPath);
if (!allItems.items) { return; }
```

### 3. Fix updateItem() Calls (3 occurrences)
**Lines**: 290, 595
**Change**:
```typescript
// OLD:
const result = await updateItem({ id, status });
if (result.success) { ... }
else { showError(result.error); }

// NEW:
const devcrumbsPath = path.join(workspaceFolder.uri.fsPath, '.devcrumbs');
const result = await updateItem(devcrumbsPath, { id, status });
if (result.metadata) { ... }
else { showError('Update failed'); }
```

### 4. Fix addItem() Call (1 occurrence)
**Line**: 141
**Change**:
```typescript
// OLD:
const result = await addItem({ type, title, ... });
if (result.success) { 
  const itemId = result.item.id;
}

// NEW:
const devcrumbsPath = path.join(workspaceFolder.uri.fsPath, '.devcrumbs');
const result = await addItem(devcrumbsPath, { type, title, ... });
if (result.metadata) {
  const itemId = result.metadata.id;
}
```

### 5. Remove .tags Property Access (Type Error)
**Lines**: 346, 358
**Change**: Remove or guard optional .tags access (not in type definition)

## Implementation Steps
1. Add helper function at top of file:
```typescript
function getDevCrumbsPath(workspaceFolder: vscode.WorkspaceFolder): string {
  return path.join(workspaceFolder.uri.fsPath, '.devcrumbs');
}
```

2. Replace all getItem calls (use search/replace with regex)
3. Replace all listItems calls
4. Replace all updateItem calls  
5. Replace addItem call
6. Fix tags property access (add type guard or remove)

## Testing
After fixes:
- ✅ Build succeeds (`npm run build`)
- ✅ No TypeScript errors
- ✅ Open item command works
- ✅ Update status command works
- ✅ Search command works
- ✅ Add item command works

## Acceptance Criteria
- ✅ All 11+ commands function correctly
- ✅ Extension activates without errors
- ✅ TreeView operations work
- ✅ Dashboard loads successfully
- ✅ No console errors


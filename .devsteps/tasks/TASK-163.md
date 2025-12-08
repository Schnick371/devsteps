# Wire Cycle Detection Setting to TreeView

## Objective
Connect VS Code configuration to TreeView initialization, ensuring setting changes trigger refresh.

## Implementation

### 1. DevStepsTreeDataProvider - Read Setting

**File:** `packages/extension/src/treeView/devstepsTreeDataProvider.ts`

```typescript
export class DevStepsTreeDataProvider implements vscode.TreeDataProvider<TreeNode> {
  private enableCycleDetection: boolean = true;
  
  constructor(
    private workspaceRoot: vscode.Uri,
    private stateManager?: TreeViewStateManager,
  ) {
    // Load cycle detection setting
    const config = vscode.workspace.getConfiguration('devsteps');
    this.enableCycleDetection = config.get<boolean>('treeView.enableCycleDetection', true);
    
    // Watch for configuration changes
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('devsteps.treeView.enableCycleDetection')) {
        this.updateCycleDetectionSetting();
      }
    });
  }
  
  private updateCycleDetectionSetting(): void {
    const config = vscode.workspace.getConfiguration('devsteps');
    this.enableCycleDetection = config.get<boolean>('treeView.enableCycleDetection', true);
    this.refresh(); // Refresh tree to apply new setting
  }
}
```

### 2. HierarchyRootNode - Pass Flag

**File:** `packages/extension/src/treeView/nodes/hierarchyRootNode.ts`

```typescript
async getChildren(workspaceRoot, filterState, expandedHierarchyItems): Promise<TreeNode[]> {
  // ... existing loading logic ...
  
  return new WorkItemNode(
    item, 
    true, 
    filterState, 
    isExpanded, 
    this.id, 
    'root', 
    new Set(),
    this.enableCycleDetection  // ← Pass from provider
  );
}
```

**Note:** HierarchyRootNode needs `enableCycleDetection` parameter in constructor and `getChildren()` signature.

### 3. Update getChildren Signature

All `getChildren()` methods must pass cycle detection flag:
- `HierarchyRootNode.getChildren()` receives flag via constructor
- `WorkItemNode.getChildren()` inherits flag from parent
- `MethodologySectionNode.getChildren()` not affected (flat view only)

## Testing
- [ ] Change setting in VS Code Settings UI
- [ ] TreeView refreshes automatically
- [ ] New setting value applied to all nodes
- [ ] No console errors during refresh

## Notes
- Configuration change listener ensures immediate effect
- No manual refresh needed by user
- Default `true` if setting missing (backward compatibility)
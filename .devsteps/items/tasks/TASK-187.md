# Set Context Keys BEFORE TreeView Creation

## Implementation Plan

**File:** `packages/extension/src/extension.ts`

**Change both code paths:**

### Main Initialization (line ~150)

```typescript
// Create StateManager first
const stateManager = new TreeViewStateManager(context.workspaceState);

// Get defaults from state manager
const defaultViewMode = stateManager.getViewMode();
const defaultHierarchy = stateManager.getHierarchy();  
const defaultHideDone = stateManager.getHideDone();
const defaultHideRelatesTo = stateManager.getHideRelatesTo();

// Set context keys BEFORE TreeView creation
await vscode.commands.executeCommand('setContext', 'devsteps.viewMode', defaultViewMode);
await vscode.commands.executeCommand('setContext', 'devsteps.hierarchy', defaultHierarchy);
await vscode.commands.executeCommand('setContext', 'devsteps.hideDone', defaultHideDone);
await vscode.commands.executeCommand('setContext', 'devsteps.hideRelatesTo', defaultHideRelatesTo);

// Create TreeDataProvider (keys already available)
const treeDataProvider = new DevStepsTreeDataProvider(workspaceRoot, stateManager);
await treeDataProvider.initialize();

// Create TreeView
const treeView = vscode.window.createTreeView('devsteps.itemsView', {
  treeDataProvider,
  showCollapseAll: true,
});
```

### FileSystemWatcher Callback (line ~80)

Same pattern:
1. Create StateManager
2. Get defaults
3. Set context keys
4. Create TreeDataProvider
5. Create TreeView

## Testing

1. Build VSIX: `npm run package`
2. Uninstall old version
3. Install new VSIX
4. Open workspace with `.devsteps/`
5. Verify: "..." menu appears immediately
6. Verify: Hierarchical/Flat toggle works
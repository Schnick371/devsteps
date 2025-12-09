# Set Context Keys BEFORE TreeView Creation

Set context keys synchronously using StateManager defaults before creating TreeView to fix menu race condition.

## Implementation

**File:** `packages/extension/src/extension.ts`

**Both code paths need updating:**
1. Main initialization (line ~150)
2. FileSystemWatcher callback (line ~80)

**Pattern:**
```typescript
// 1. Create StateManager
const stateManager = new TreeViewStateManager(context.workspaceState);

// 2. Get defaults BEFORE TreeView
const viewMode = stateManager.getViewMode();
const hierarchy = stateManager.getHierarchy();  
const hideDone = stateManager.getHideDone();
const hideRelatesTo = stateManager.getHideRelatesTo();

// 3. Set context keys IMMEDIATELY
await vscode.commands.executeCommand('setContext', 'devsteps.viewMode', viewMode);
await vscode.commands.executeCommand('setContext', 'devsteps.hierarchy', hierarchy);
await vscode.commands.executeCommand('setContext', 'devsteps.hideDone', hideDone);
await vscode.commands.executeCommand('setContext', 'devsteps.hideRelatesTo', hideRelatesTo);

// 4. NOW create TreeView
const treeDataProvider = new DevStepsTreeDataProvider(workspaceRoot, stateManager);
const treeView = vscode.window.createTreeView(...);
```
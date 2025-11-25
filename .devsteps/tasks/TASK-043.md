# TreeView: Toggle for "relates-to" Relationships

## Problem
Hierarchical view only shows parent-child relationships (implements/implemented-by). "relates-to" and other flexible relationships are hidden.

## Solution
Add toggle button to show/hide "relates-to" relationships with visual distinction.

## Implementation

### 1. Add Toggle Button
**File:** `packages/vscode-extension/package.json`

```json
{
  "command": "devsteps.toggleShowRelations",
  "title": "Toggle Show Related Items",
  "category": "DevSteps",
  "icon": "$(link)"
}
```

Add to toolbar:
```json
{
  "command": "devsteps.toggleShowRelations",
  "when": "view == devsteps.itemsView && devsteps.viewMode == hierarchical",
  "group": "navigation@6"
}
```

### 2. State Management
**File:** `packages/vscode-extension/src/treeView/devstepsTreeDataProvider.ts`

```typescript
export class DevStepsTreeDataProvider {
  private showRelations: boolean = false; // NEW
  
  constructor(
    private workspaceRoot: vscode.Uri,
    private stateManager?: TreeViewStateManager
  ) {
    // Load persisted state
    if (stateManager) {
      this.showRelations = stateManager.loadShowRelations();
      // ... existing state loading
    }
  }
  
  toggleShowRelations(): void {
    this.showRelations = !this.showRelations;
    this.stateManager?.saveShowRelations(this.showRelations);
    this.refresh();
  }
  
  getShowRelationsState(): boolean {
    return this.showRelations;
  }
}
```

### 3. Extend StateManager
**File:** `packages/vscode-extension/src/utils/stateManager.ts`

```typescript
export class TreeViewStateManager {
  private static readonly KEYS = {
    // ... existing keys
    SHOW_RELATIONS: 'devsteps.treeView.showRelations',
  };
  
  loadShowRelations(): boolean {
    return this.workspaceState.get<boolean>(
      TreeViewStateManager.KEYS.SHOW_RELATIONS,
      false
    );
  }
  
  async saveShowRelations(show: boolean): Promise<void> {
    await this.workspaceState.update(
      TreeViewStateManager.KEYS.SHOW_RELATIONS,
      show
    );
  }
}
```

### 4. Modify getChildren() Logic
**File:** `packages/vscode-extension/src/treeView/devstepsTreeDataProvider.ts`

```typescript
async getChildren(element?: TreeNode): Promise<TreeNode[]> {
  if (!element) {
    // Root level
    return this.viewMode === 'flat' 
      ? this.getFlatRootNodes()
      : this.getHierarchicalRootNodes();
  }
  
  if (element instanceof WorkItemNode) {
    const children: TreeNode[] = [];
    
    // Always show parent-child (implements/implemented-by)
    const implementedItems = await this.getImplementedItems(element.item);
    children.push(...implementedItems.map(item => 
      new WorkItemNode(item, false, this.filterState)
    ));
    
    // NEW: Show related items if toggle enabled
    if (this.showRelations) {
      const relatedItems = await this.getRelatedItems(element.item);
      children.push(...relatedItems.map(item =>
        new RelatedItemNode(item, 'relates-to') // NEW node type
      ));
    }
    
    return children;
  }
  
  // ... rest
}

private async getRelatedItems(item: WorkItem): Promise<WorkItem[]> {
  const relatedIds = item.linked_items?.['relates-to'] || [];
  const items: WorkItem[] = [];
  
  for (const id of relatedIds) {
    const result = await getItem(this.workspaceRoot.fsPath, id);
    if (result.metadata) {
      items.push(result.metadata);
    }
  }
  
  return items;
}
```

### 5. Visual Distinction - New Node Type
**File:** `packages/vscode-extension/src/treeView/devstepsTreeDataProvider.ts`

```typescript
/**
 * Represents related items (non-hierarchical relationships)
 */
export class RelatedItemNode extends TreeNode {
  constructor(
    public readonly item: WorkItem,
    public readonly relationType: string
  ) {
    super();
  }
  
  toTreeItem(): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(
      `${this.item.id}: ${this.item.title}`,
      vscode.TreeItemCollapsibleState.None
    );
    
    // Visual distinction: different icon + description
    treeItem.iconPath = new vscode.ThemeIcon(
      'link',
      new vscode.ThemeColor('charts.blue')
    );
    treeItem.description = `(${this.relationType})`;
    treeItem.contextValue = 'relatedItem';
    
    // Tooltip
    treeItem.tooltip = `Related via: ${this.relationType}\n${this.item.type} | ${this.item.status}`;
    
    return treeItem;
  }
  
  async getChildren(): Promise<TreeNode[]> {
    return []; // Related items don't expand
  }
}
```

### 6. Register Command
**File:** `packages/vscode-extension/src/commands/index.ts`

```typescript
context.subscriptions.push(
  vscode.commands.registerCommand('devsteps.toggleShowRelations', () => {
    if (!checkDevStepsInitialized(treeDataProvider)) return;
    treeDataProvider.toggleShowRelations();
    
    const state = treeDataProvider.getShowRelationsState();
    const icon = state ? '🔗' : '➖';
    vscode.window.showInformationMessage(
      `${icon} Related items ${state ? 'shown' : 'hidden'}`
    );
  })
);
```

## Visual Design

**Toggle OFF (default):**
```
📦 EPIC-001: Platform Launch
  └─ 📄 STORY-001: User Authentication
      └─ ✅ TASK-001: Login form
```

**Toggle ON:**
```
📦 EPIC-001: Platform Launch
  ├─ 📄 STORY-001: User Authentication
  │   ├─ ✅ TASK-001: Login form
  │   └─ 🔗 BUG-001: Login validation (relates-to)
  └─ 🔗 EPIC-003: VS Code Extension (relates-to)
```

## Testing
- Toggle on/off in hierarchical view
- Verify related items appear
- Check visual distinction (icon + description)
- Verify state persists across restarts
- Test with items having multiple relations

## Success Criteria
- ✅ Toggle button in toolbar (hierarchical view only)
- ✅ Related items show with visual distinction
- ✅ State persists via StateManager
- ✅ Performance acceptable (lazy loading)
- ✅ Clear visual difference from parent-child

## Dependencies
- Depends on: TASK-037 (StateManager implementation)

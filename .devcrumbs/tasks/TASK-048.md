# Task: Add Methodology Sections in Flat View

## User Story
**As a** DevCrumbs user with hybrid methodology,  
**I want** Scrum and Waterfall items visually separated in flat view,  
**so that** I can quickly distinguish between different work item hierarchies.

## Problem
Currently flat view groups items only by type (epic, story, task, etc.), mixing Scrum and Waterfall items together. This makes it hard to distinguish which hierarchy an item belongs to.

**Example Current State:**
```
📦 epic (2)
  ├── EPIC-001 (Scrum)
  └── EPIC-006 (Scrum)
📋 requirement (1)
  └── REQ-001 (Waterfall)
📝 story (9)
🔧 task (47) ← Mixed Scrum + Waterfall
```

## Solution: Dual-Section Root Pattern

**Industry Research:**
- **VS Code Git Extension**: Multi-repository sections with collapsible headers
- **VS Code Test Explorer**: Framework-specific sections (Jest, Mocha, etc.)
- **GitLens**: Grouped views with multiple root nodes
- **Pattern**: Use collapsible root nodes, NOT separators (TreeView doesn't support dividers)

**Proposed Implementation (Option A):**
```
🌲 Scrum Items (45) ← MethodologySectionNode
  📦 epic (2)      ← TypeGroupNode
    ├── EPIC-001: DevCrumbs Platform
    └── EPIC-006: Project Health
  📝 story (9)
  🔧 task (35)
  🐛 bug (6)
  🔍 spike (3)

🏗️ Waterfall Items (12) ← MethodologySectionNode
  📋 requirement (1) ← TypeGroupNode
    └── REQ-001: System Requirements
  ⚙️ feature (4)
  🔧 task (7)
  🐛 bug (1)
```

## Implementation Approach

### 1. Create MethodologySectionNode

**File:** `devcrumbsTreeDataProvider.ts`

```typescript
/**
 * Top-level section for methodology grouping (Scrum/Waterfall)
 */
class MethodologySectionNode extends TreeNode {
  constructor(
    private methodology: 'scrum' | 'waterfall',
    private itemsByType: Record<string, WorkItem[]>,
    private isExpanded: boolean = true
  ) {
    super();
  }

  toTreeItem(): vscode.TreeItem {
    const totalCount = Object.values(this.itemsByType)
      .reduce((sum, items) => sum + items.length, 0);
    
    const icon = this.methodology === 'scrum' ? '🌲' : '🏗️';
    const label = this.methodology === 'scrum' ? 'Scrum Items' : 'Waterfall Items';
    
    const treeItem = new vscode.TreeItem(
      `${icon} ${label} (${totalCount})`,
      this.isExpanded 
        ? vscode.TreeItemCollapsibleState.Expanded 
        : vscode.TreeItemCollapsibleState.Collapsed
    );
    
    treeItem.contextValue = 'methodologySection';
    treeItem.id = `methodology-${this.methodology}`;
    
    return treeItem;
  }

  async getChildren(): Promise<TreeNode[]> {
    // Return TypeGroupNode for each item type
    return Object.entries(this.itemsByType)
      .sort(([typeA], [typeB]) => typeA.localeCompare(typeB))
      .map(([type, items]) => {
        const isExpanded = this.expandedGroups.has(`${this.methodology}-${type}`);
        return new TypeGroupNode(type, items.length, items, isExpanded);
      });
  }
}
```

### 2. Auto-Detect Methodology from Parent Type

**Logic:**
- Load `config.json` to get project methodology
- If `hybrid`: Show both sections
- Group items by detecting parent type:
  - **Scrum types**: epic, story, task, bug, spike, test
  - **Waterfall types**: requirement, feature, task, bug, test
- `task`, `bug`, `test` can belong to either based on `implements` relationship

**Implementation:**
```typescript
function getItemMethodology(item: WorkItem, allItems: Map<string, WorkItem>): 'scrum' | 'waterfall' {
  // Scrum-only types
  if (['epic', 'story', 'spike'].includes(item.type)) return 'scrum';
  
  // Waterfall-only types
  if (['requirement', 'feature'].includes(item.type)) return 'waterfall';
  
  // Shared types (task, bug, test) - check parent
  const parent = item.linked_items?.implements?.[0];
  if (parent) {
    const parentItem = allItems.get(parent);
    if (parentItem) {
      // Recursive check parent's methodology
      return getItemMethodology(parentItem, allItems);
    }
  }
  
  // Default: Assign to Scrum (most common)
  return 'scrum';
}
```

### 3. Update getFlatRootNodes()

```typescript
private async getFlatRootNodes(): Promise<TreeNode[]> {
  try {
    // Load config to get methodology
    const configPath = vscode.Uri.joinPath(this.workspaceRoot, '.devcrumbs', 'config.json');
    const configData = await vscode.workspace.fs.readFile(configPath);
    const config = JSON.parse(Buffer.from(configData).toString('utf-8'));
    
    // Load items
    const indexPath = vscode.Uri.joinPath(this.workspaceRoot, '.devcrumbs', 'index.json');
    const indexData = await vscode.workspace.fs.readFile(indexPath);
    const index = JSON.parse(Buffer.from(indexData).toString('utf-8'));
    
    let items = Object.entries<any>(index.items || {}).map(
      ([id, meta]) => ({ id, ...meta }) as WorkItem
    );
    
    const totalCount = items.length;
    
    // Apply filters
    items = this.applyFilters(items);
    items = this.applySorting(items);
    
    this.updateCounts(totalCount, items.length);
    
    // Group by methodology
    const itemsMap = new Map(items.map(item => [item.id, item]));
    const scrumItems: WorkItem[] = [];
    const waterfallItems: WorkItem[] = [];
    
    for (const item of items) {
      const methodology = getItemMethodology(item, itemsMap);
      if (methodology === 'scrum') {
        scrumItems.push(item);
      } else {
        waterfallItems.push(item);
      }
    }
    
    // Group each methodology's items by type
    const scrumByType = this.groupByType(scrumItems);
    const waterfallByType = this.groupByType(waterfallItems);
    
    // Create section nodes (always show both, even if empty)
    const sections: TreeNode[] = [];
    
    if (scrumItems.length > 0 || config.methodology !== 'waterfall') {
      const isScrumExpanded = this.expandedSections.has('scrum');
      sections.push(new MethodologySectionNode('scrum', scrumByType, isScrumExpanded));
    }
    
    if (waterfallItems.length > 0 || config.methodology !== 'scrum') {
      const isWaterfallExpanded = this.expandedSections.has('waterfall');
      sections.push(new MethodologySectionNode('waterfall', waterfallByType, isWaterfallExpanded));
    }
    
    return sections;
  } catch (error) {
    console.error('Failed to load flat view with methodology sections:', error);
    vscode.window.showErrorMessage('Failed to load DevCrumbs work items');
    return [];
  }
}

private groupByType(items: WorkItem[]): Record<string, WorkItem[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, WorkItem[]>);
}
```

### 4. Persist Section Expanded State

**Add to DevCrumbsTreeDataProvider:**
```typescript
private expandedSections = new Set<string>(['scrum', 'waterfall']); // Both expanded by default

// Listen to tree expansion events
constructor() {
  // ... existing code ...
  
  this.treeView.onDidExpandElement(e => {
    if (e.element instanceof MethodologySectionNode) {
      this.expandedSections.add(e.element.methodology);
    }
  });
  
  this.treeView.onDidCollapseElement(e => {
    if (e.element instanceof MethodologySectionNode) {
      this.expandedSections.delete(e.element.methodology);
    }
  });
}
```

**Store state persistently:**
```typescript
// Save to workspace state
context.workspaceState.update('devcrumbs.expandedSections', Array.from(this.expandedSections));

// Restore on activation
const savedSections = context.workspaceState.get<string[]>('devcrumbs.expandedSections');
if (savedSections) {
  this.expandedSections = new Set(savedSections);
}
```

### 5. Update TypeGroupNode IDs

Ensure unique IDs when sections share type names:
```typescript
class TypeGroupNode extends TreeNode {
  toTreeItem(): vscode.TreeItem {
    // ...existing code...
    treeItem.id = `type-${this.parentMethodology}-${this.type}`; // Make unique per section
  }
}
```

## Filter Behavior

**Requirements:**
1. ✅ "Hide Done" applies to all sections
2. ✅ Keep sections visible even if empty after filtering
3. ✅ Preserve expanded state per section independently
4. ✅ Update count badges to show filtered results

**Implementation:**
- Filter items BEFORE grouping by methodology
- Both sections remain in tree even if one becomes empty
- Each section tracks its own expanded state
- Badge shows: `🌲 Scrum Items (35/45)` when filtered

## State Persistence

**Per-Section State (Workspace):**
- Expanded/collapsed state: `expandedSections: Set<'scrum' | 'waterfall'>`
- Persisted in `context.workspaceState`

**Per-Type-Group State (Session):**
- TypeGroupNode expanded state: `expandedGroups: Set<string>`
- Already implemented in TASK-037 pattern

**Initial State:**
- Both sections expanded by default
- Type groups collapsed (existing behavior)
- User expands/collapses → state remembered across sessions

## Testing Checklist

- [ ] Both sections visible in hybrid project
- [ ] Empty sections show (0) count
- [ ] Items correctly grouped by parent type
- [ ] Orphaned tasks default to Scrum section
- [ ] "Hide Done" filter works across both sections
- [ ] Section expansion state persists across reloads
- [ ] Type group expansion state independent per section
- [ ] Count badges update correctly with filters
- [ ] Performance acceptable with 100+ items

## User Requirements (Confirmed)

1. **Option A**: Dual-section root ✅
2. **Auto-detect**: Based on parent type ✅
3. **Always show both**: Even if empty ✅
4. **Hybrid projects**: Both expanded initially ✅
5. **Hide Done**: Applies to all sections ✅
6. **Keep empty sections**: Don't collapse after filtering ✅
7. **Persist state**: Per-section expansion remembered ✅

## Dependencies

**Depends on:** TASK-037 (TreeView state persistence) - uses same pattern
**Relates to:** EPIC-003 (VS Code Extension)
**Complements:** Hierarchical view (already has Scrum/Waterfall separation)

## Acceptance Criteria

- ✅ Flat view shows two top-level sections: "Scrum Items" and "Waterfall Items"
- ✅ Items auto-grouped by detecting parent type (epic/requirement)
- ✅ Both sections visible even if one is empty
- ✅ Section expanded state persists across VS Code restarts
- ✅ Type group expanded state independent within each section
- ✅ "Hide Done" filter applies to items in both sections
- ✅ Count badges show correct totals and filtered counts
- ✅ Performance remains fast with large item counts
- ✅ Icons: 🌲 for Scrum, 🏗️ for Waterfall (industry-standard metaphors)

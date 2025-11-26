# Feature: Lazy Loading for TreeView (100+ Items Performance)

## Problem
**NO LAZY LOADING** - TreeView loads all items synchronously in memory:

```typescript
// devstepsTreeDataProvider.ts
private async loadAllItems(): Promise<WorkItem[]> {
  const allItems: WorkItem[] = [];
  const types = ['epics', 'stories', 'tasks', ...]; // All at once
  for (const type of types) {
    const items = await this.loadItemsOfType(type);
    allItems.push(...items);
  }
  return allItems; // 843 line file loads everything
}
```

## Impact
- **Performance**: Projects with 100+ items experience slow TreeView rendering
- **Memory**: All items kept in memory simultaneously
- **UX**: No progressive loading feedback (blank screen while loading)

## Internet Research Findings
**VS Code Extension API 1.95+ Best Practices (2025):**
- Use `TreeDataProvider.getChildren()` pagination
- Implement `hasMoreElements` pattern for incremental loading
- Show loading indicators with `vscode.TreeItem.iconPath`

## Proposed Solution
Implement lazy loading with pagination:

```typescript
interface TreeDataProviderOptions {
  pageSize: number; // Default: 50 items per page
  enableVirtualization: boolean; // Default: true
}

class DevStepsTreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
  private loadedPages = new Map<string, WorkItem[]>();
  
  async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    if (!element) {
      // Root level - load first page only
      return this.loadPage(0);
    }
    
    // Child elements - load on demand
    return this.loadChildrenForElement(element);
  }
  
  private async loadPage(pageIndex: number): Promise<TreeItem[]> {
    const pageSize = 50;
    const offset = pageIndex * pageSize;
    
    // Load items with pagination
    const items = await this.loadItemsPaginated(offset, pageSize);
    this.loadedPages.set(`page-${pageIndex}`, items);
    
    return items.map(item => this.toTreeItem(item));
  }
}
```

## Acceptance Criteria
- [ ] TreeView loads first 50 items immediately
- [ ] Scroll triggers loading of next page
- [ ] Loading indicator shown during fetch
- [ ] Performance: < 100ms initial render
- [ ] Projects with 500+ items remain responsive
- [ ] Existing filters/sorting work with pagination

## Implementation Notes
- Use `vscode.TreeItem.collapsibleState` for progressive loading
- Cache loaded pages in memory
- Invalidate cache on FileSystemWatcher events
- Add configuration: `devsteps.treeView.pageSize`

## References
- Internet research: VS Code Extension API 1.95 performance best practices
- Current implementation: Synchronous loading of all items
- Related: SPIKE-002 (WebView performance already optimized)

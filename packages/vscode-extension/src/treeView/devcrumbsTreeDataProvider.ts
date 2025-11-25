/**
 * Copyright © 2025 Thomas Hertel (the@devcrumbs.dev)
 * Licensed under the Apache License, Version 2.0
 * 
 * TreeView Provider with switchable view modes:
 * - Flat: Group by item type
 * - Hierarchical: Show parent-child relationships (Scrum + Waterfall)
 */

import * as vscode from 'vscode';
import { createItemUri } from '../decorationProvider.js';
import { getItemIconWithPriority } from '../utils/icons.js';
import type { ItemType, Priority } from '@devcrumbs/shared';

type ViewMode = 'flat' | 'hierarchical';
type HierarchyType = 'scrum' | 'waterfall' | 'both';

/**
 * Map item types to their directory names
 */
const TYPE_TO_DIRECTORY: Record<string, string> = {
  epic: 'epics',
  story: 'stories',
  task: 'tasks',
  requirement: 'requirements',
  feature: 'features',
  bug: 'bugs',
  spike: 'spikes',
  test: 'tests',
};

/**
 * Load full item data from individual JSON file (includes linked_items)
 * Used for hierarchical view to get relationship data
 */
async function loadItemWithLinks(
  workspaceRoot: vscode.Uri,
  itemId: string
): Promise<WorkItem | null> {
  try {
    // Parse item type from ID (e.g., "EPIC-001" -> "epic")
    const match = itemId.match(/^(EPIC|STORY|TASK|REQ|FEAT|BUG|SPIKE|TEST)-(\d+)$/);
    if (!match) return null;

    const typeMap: Record<string, string> = {
      EPIC: 'epic',
      STORY: 'story',
      TASK: 'task',
      REQ: 'requirement',
      FEAT: 'feature',
      BUG: 'bug',
      SPIKE: 'spike',
      TEST: 'test',
    };

    const itemType = typeMap[match[1]];
    if (!itemType) return null;

    const typeDir = TYPE_TO_DIRECTORY[itemType];
    if (!typeDir) return null;

    // Read full JSON file
    const itemPath = vscode.Uri.joinPath(
      workspaceRoot,
      '.devcrumbs',
      typeDir,
      `${itemId}.json`
    );
    const itemData = await vscode.workspace.fs.readFile(itemPath);
    const item = JSON.parse(Buffer.from(itemData).toString('utf-8'));

    return item as WorkItem;
  } catch (error) {
    console.error(`Failed to load item ${itemId}:`, error);
    return null;
  }
}

/**
 * Detect methodology for a work item based on its type and parent relationships
 */
function getItemMethodology(item: WorkItem, allItems: Map<string, WorkItem>): 'scrum' | 'waterfall' {
  // Scrum-only types
  if (['epic', 'story', 'spike'].includes(item.type)) {
    return 'scrum';
  }

  // Waterfall-only types
  if (['requirement', 'feature'].includes(item.type)) {
    return 'waterfall';
  }

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

interface FilterState {
  statuses: string[];
  priorities: string[];
  types: string[];
  tags: string[];
  searchQuery: string;
  hideDone: boolean;
}

interface SortState {
  by: 'id' | 'title' | 'created' | 'updated' | 'priority' | 'status';
  order: 'asc' | 'desc';
}

interface WorkItem {
  id: string;
  type: string;
  title: string;
  status: string;
  priority: string;
  created?: string;
  updated?: string;
  tags?: string[];
  linked_items?: {
    'implemented-by'?: string[];
    [key: string]: string[] | undefined;
  };
}

/**
 * Abstract base class for all tree nodes
 */
abstract class TreeNode {
  abstract toTreeItem(): vscode.TreeItem;
  abstract getChildren(workspaceRoot: vscode.Uri, filterState?: FilterState): Promise<TreeNode[]>;
}

/**
 * Methodology section node for flat view (e.g., "🌲 Scrum Items (45)")
 */
class MethodologySectionNode extends TreeNode {
  constructor(
    private methodology: 'scrum' | 'waterfall',
    private itemsByType: Record<string, WorkItem[]>,
    private isExpanded: boolean = true,
    private expandedGroups: Set<string>,
  ) {
    super();
  }

  toTreeItem(): vscode.TreeItem {
    const totalCount = Object.values(this.itemsByType).reduce(
      (sum, items) => sum + items.length,
      0,
    );

    const icon = this.methodology === 'scrum' ? '🌲' : '🏗️';
    const label = this.methodology === 'scrum' ? 'Scrum Items' : 'Waterfall Items';

    const treeItem = new vscode.TreeItem(
      `${icon} ${label} (${totalCount})`,
      this.isExpanded
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.Collapsed,
    );

    treeItem.contextValue = 'methodologySection';
    treeItem.id = `methodology-${this.methodology}`;

    return treeItem;
  }

  async getChildren(_workspaceRoot: vscode.Uri, _filterState?: FilterState): Promise<TreeNode[]> {
    // Return TypeGroupNode for each item type
    return Object.entries(this.itemsByType)
      .sort(([typeA], [typeB]) => typeA.localeCompare(typeB))
      .map(([type, items]) => {
        const isExpanded = this.expandedGroups.has(`${this.methodology}-${type}`);
        return new TypeGroupNode(type, items.length, items, isExpanded, this.methodology);
      });
  }

  /**
   * Get methodology identifier for state tracking
   */
  getMethodology(): 'scrum' | 'waterfall' {
    return this.methodology;
  }
}

/**
 * Type group node for flat view (e.g., "EPICS (3)")
 */
class TypeGroupNode extends TreeNode {
  constructor(
    private type: string,
    private count: number,
    private items: WorkItem[],
    private isExpanded: boolean = false,
    private parentMethodology?: 'scrum' | 'waterfall',
  ) {
    super();
  }

  toTreeItem(): vscode.TreeItem {
    const collapsibleState = this.isExpanded
      ? vscode.TreeItemCollapsibleState.Expanded
      : vscode.TreeItemCollapsibleState.Collapsed;

    const item = new vscode.TreeItem(
      `${this.type.toUpperCase()}S (${this.count})`,
      collapsibleState,
    );
    item.contextValue = 'typeGroup';
    item.iconPath = new vscode.ThemeIcon('folder');
    
    // Make ID unique per methodology section
    if (this.parentMethodology) {
      item.id = `type-${this.parentMethodology}-${this.type}`;
    }
    
    return item;
  }

  async getChildren(_workspaceRoot: vscode.Uri, _filterState?: FilterState): Promise<TreeNode[]> {
    return this.items.map((item) => new WorkItemNode(item, false));
  }

  /**
   * Get the type identifier for state tracking
   */
  getType(): string {
    return this.type;
  }

  /**
   * Get full tracking key including methodology
   */
  getTrackingKey(): string {
    return this.parentMethodology ? `${this.parentMethodology}-${this.type}` : this.type;
  }
}

/**
 * Hierarchy root node (Scrum/Waterfall separator)
 */
class HierarchyRootNode extends TreeNode {
  constructor(
    private hierarchy: 'scrum' | 'waterfall',
    private label: string,
  ) {
    super();
  }

  toTreeItem(): vscode.TreeItem {
    const item = new vscode.TreeItem(this.label, vscode.TreeItemCollapsibleState.Expanded);
    item.contextValue = 'hierarchyRoot';
    item.iconPath = new vscode.ThemeIcon('symbol-namespace');
    return item;
  }

  async getChildren(workspaceRoot: vscode.Uri, filterState?: FilterState): Promise<TreeNode[]> {
    try {
      const indexPath = vscode.Uri.joinPath(workspaceRoot, '.devcrumbs', 'index.json');
      const indexData = await vscode.workspace.fs.readFile(indexPath);
      const index = JSON.parse(Buffer.from(indexData).toString('utf-8'));

      // Get top-level items (Epics for Scrum, Requirements for Waterfall)
      const topLevelType = this.hierarchy === 'scrum' ? 'epic' : 'requirement';
      const itemIds = index.items
        .filter((meta: any) => meta.type === topLevelType)
        .map((meta: any) => meta.id);

      // Load full items with linked_items for hierarchical view
      let items: WorkItem[] = [];
      for (const itemId of itemIds) {
        const item = await loadItemWithLinks(workspaceRoot, itemId);
        if (item) items.push(item);
      }

      // Apply hideDone filter in hierarchical view
      if (filterState?.hideDone) {
        items = items.filter((item) => item.status !== 'done');
      }

      return items.map((item) => new WorkItemNode(item, true, filterState));
    } catch (error) {
      console.error('Failed to load hierarchy items:', error);
      return [];
    }
  }
}

/**
 * Work item node (actual DevCrumbs items)
 */
class WorkItemNode extends TreeNode {
  constructor(
    private item: WorkItem,
    private hierarchical: boolean = false,
    private filterState?: FilterState,
  ) {
    super();
  }

  toTreeItem(): vscode.TreeItem {
    const hasChildren = this.hierarchical && this.hasImplementedByLinks();

    const treeItem = new vscode.TreeItem(
      `${this.item.id}: ${this.item.title}`,
      hasChildren ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
    );

    treeItem.contextValue = 'workItem';
    treeItem.iconPath = this.getIcon();
    treeItem.description = this.item.status;
    treeItem.tooltip = `${this.item.type.toUpperCase()} | ${this.item.status} | Priority: ${this.item.priority}`;

    // Set resourceUri for FileDecorationProvider
    treeItem.resourceUri = createItemUri(this.item.id, this.item.status, this.item.priority);

    treeItem.command = {
      command: 'devcrumbs.openItem',
      title: 'Open Item',
      arguments: [this.item.id],
    };

    return treeItem;
  }

  async getChildren(workspaceRoot: vscode.Uri, filterState?: FilterState): Promise<TreeNode[]> {
    if (!this.hierarchical) return [];

    try {
      const implementedBy = this.item.linked_items?.['implemented-by'] || [];
      
      // Load full child items with linked_items for hierarchical display
      let children: WorkItem[] = [];
      for (const childId of implementedBy) {
        const child = await loadItemWithLinks(workspaceRoot, childId);
        if (child) children.push(child);
      }

      // Apply hideDone filter in hierarchical view
      const effectiveFilter = filterState || this.filterState;
      if (effectiveFilter?.hideDone) {
        children = children.filter((item) => item.status !== 'done');
      }

      return children.map((item) => new WorkItemNode(item, true, effectiveFilter));
    } catch (error) {
      console.error('Failed to load child items:', error);
      return [];
    }
  }

  private hasImplementedByLinks(): boolean {
    const links = this.item.linked_items?.['implemented-by'] || [];
    return links.length > 0;
  }

  private getIcon(): vscode.ThemeIcon {
    // Use centralized icon system with priority-based coloring
    return getItemIconWithPriority(
      this.item.type as ItemType,
      this.item.priority as Priority
    );
  }
}

/**
 * TreeDataProvider with switchable view modes (flat vs hierarchical)
 */
export class DevCrumbsTreeDataProvider implements vscode.TreeDataProvider<TreeNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined | null | void> =
    new vscode.EventEmitter<TreeNode | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined | null | void> =
    this._onDidChangeTreeData.event;

  private viewMode: ViewMode = 'flat';
  private hierarchyType: HierarchyType = 'both';
  private filterState: FilterState = {
    statuses: [],
    priorities: [],
    types: [],
    tags: [],
    searchQuery: '',
    hideDone: false,
  };
  private sortState: SortState = {
    by: 'id',
    order: 'asc',
  };
  private treeView?: vscode.TreeView<TreeNode>;
  private expandedGroups = new Set<string>();
  private expandedSections = new Set<string>(['scrum', 'waterfall']); // Both expanded by default

  constructor(private workspaceRoot: vscode.Uri) {}

  /**
   * Set TreeView instance for description badge updates and state tracking
   */
  setTreeView(treeView: vscode.TreeView<TreeNode>): void {
    this.treeView = treeView;
    this.updateDescription();

    // Track expanded state of methodology sections in flat view
    this.treeView.onDidExpandElement((e) => {
      if (e.element instanceof MethodologySectionNode) {
        this.expandedSections.add(e.element.getMethodology());
      } else if (e.element instanceof TypeGroupNode) {
        this.expandedGroups.add(e.element.getTrackingKey());
      }
    });

    this.treeView.onDidCollapseElement((e) => {
      if (e.element instanceof MethodologySectionNode) {
        this.expandedSections.delete(e.element.getMethodology());
      } else if (e.element instanceof TypeGroupNode) {
        this.expandedGroups.delete(e.element.getTrackingKey());
      }
    });
  }

  /**
   * Set view mode and refresh
   */
  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    this.refresh();
    this.updateDescription();
  }

  /**
   * Set hierarchy type (for hierarchical view)
   */
  setHierarchyType(type: HierarchyType): void {
    this.hierarchyType = type;
    if (this.viewMode === 'hierarchical') {
      this.refresh();
    }
  }

  /**
   * Refresh the tree view
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Set status filter
   */
  setStatusFilter(statuses: string[]): void {
    this.filterState.statuses = statuses;
    this.refresh();
    this.updateDescription();
  }

  /**
   * Set priority filter
   */
  setPriorityFilter(priorities: string[]): void {
    this.filterState.priorities = priorities;
    this.refresh();
    this.updateDescription();
  }

  /**
   * Set type filter
   */
  setTypeFilter(types: string[]): void {
    this.filterState.types = types;
    this.refresh();
    this.updateDescription();
  }

  /**
   * Set tag filter
   */
  setTagFilter(tags: string[]): void {
    this.filterState.tags = tags;
    this.refresh();
    this.updateDescription();
  }

  /**
   * Set search query
   */
  setSearchQuery(query: string): void {
    this.filterState.searchQuery = query;
    this.refresh();
    this.updateDescription();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filterState = {
      statuses: [],
      priorities: [],
      types: [],
      tags: [],
      searchQuery: '',
      hideDone: false,
    };
    this.refresh();
    this.updateDescription();
  }

  /**
   * Toggle Hide Done Items (only affects flat view)
   */
  toggleHideDone(): void {
    this.filterState.hideDone = !this.filterState.hideDone;
    this.refresh();
    this.updateDescription();
  }

  /**
   * Get current Hide Done state
   */
  getHideDoneState(): boolean {
    return this.filterState.hideDone;
  }

  /**
   * Update TreeView description badge with filter count
   */
  private updateDescription(): void {
    if (!this.treeView) return;

    try {
      const totalCount = this.getTotalItemCount();
      const filteredCount = this.getFilteredItemCount();

      // Show badge only when filtering is active
      if (filteredCount < totalCount) {
        this.treeView.description = `(${filteredCount}/${totalCount})`;
      } else {
        this.treeView.description = undefined; // Clear badge when showing all
      }
    } catch (error) {
      // Silently fail if counts cannot be determined
      this.treeView.description = undefined;
    }
  }

  /**
   * Get total count of all work items
   */
  private getTotalItemCount(): number {
    try {
      const indexPath = vscode.Uri.joinPath(this.workspaceRoot, '.devcrumbs', 'index.json');
      const indexData = vscode.workspace.fs.readFile(indexPath);
      // Synchronous operation not available, use cached count or estimate
      // For now, return from last loaded data
      return this.lastTotalCount || 0;
    } catch {
      return 0;
    }
  }

  private lastTotalCount = 0;
  private lastFilteredCount = 0;

  /**
   * Get count of filtered items (visible items)
   */
  private getFilteredItemCount(): number {
    return this.lastFilteredCount;
  }

  /**
   * Update item counts (called during tree building)
   */
  private updateCounts(total: number, filtered: number): void {
    this.lastTotalCount = total;
    this.lastFilteredCount = filtered;
    this.updateDescription();
  }

  /**
   * Set sort options
   */
  setSortOptions(by: SortState['by'], order: SortState['order']): void {
    this.sortState = { by, order };
    this.refresh();
    this.updateDescription();
  }

  /**
   * Apply filters to work items (only used in flat view)
   */
  private applyFilters(items: WorkItem[]): WorkItem[] {
    let filtered = items;

    // Hide done items filter (only in flat view)
    if (this.filterState.hideDone) {
      filtered = filtered.filter((item) => item.status !== 'done');
    }

    // Status filter
    if (this.filterState.statuses.length > 0) {
      filtered = filtered.filter((item) => this.filterState.statuses.includes(item.status));
    }

    // Priority filter
    if (this.filterState.priorities.length > 0) {
      filtered = filtered.filter((item) => this.filterState.priorities.includes(item.priority));
    }

    // Type filter
    if (this.filterState.types.length > 0) {
      filtered = filtered.filter((item) => this.filterState.types.includes(item.type));
    }

    // Tag filter (item must have at least one matching tag)
    if (this.filterState.tags.length > 0) {
      filtered = filtered.filter((item) =>
        item.tags?.some((tag) => this.filterState.tags.includes(tag)),
      );
    }

    // Search query (case-insensitive search in title and description)
    if (this.filterState.searchQuery) {
      const query = this.filterState.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    return filtered;
  }

  /**
   * Apply sorting to work items
   */
  private applySorting(items: WorkItem[]): WorkItem[] {
    const sorted = [...items];
    const { by, order } = this.sortState;

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (by) {
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'created':
          comparison = new Date(a.created || 0).getTime() - new Date(b.created || 0).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updated || 0).getTime() - new Date(b.updated || 0).getTime();
          break;
        case 'priority': {
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          comparison = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        }
        case 'status': {
          const statusOrder = {
            'in-progress': 0,
            planned: 1,
            draft: 2,
            review: 3,
            blocked: 4,
            done: 5,
            cancelled: 6,
            obsolete: 7,
          };
          comparison = statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
          break;
        }
      }

      return order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  /**
   * Get tree item for display
   */
  getTreeItem(element: TreeNode): vscode.TreeItem {
    return element.toTreeItem();
  }

  /**
   * Get children of a tree item
   */
  async getChildren(element?: TreeNode): Promise<TreeNode[]> {
    if (!element) {
      // Root level
      if (this.viewMode === 'flat') {
        return this.getFlatRootNodes();
      }
      return this.getHierarchicalRootNodes();
    }

    // Child nodes - pass filterState for hierarchical view filtering
    return element.getChildren(this.workspaceRoot, this.filterState);
  }

  /**
   * Flat view: Group items by methodology, then by type
   */
  private async getFlatRootNodes(): Promise<TreeNode[]> {
    try {
      // Check if .devcrumbs directory exists
      try {
        await vscode.workspace.fs.stat(vscode.Uri.joinPath(this.workspaceRoot, '.devcrumbs'));
      } catch {
        // .devcrumbs doesn't exist yet - return empty state
        return [];
      }

      // Load config to get methodology
      const configPath = vscode.Uri.joinPath(this.workspaceRoot, '.devcrumbs', 'config.json');
      const configData = await vscode.workspace.fs.readFile(configPath);
      const config = JSON.parse(Buffer.from(configData).toString('utf-8'));

      // Load items
      const indexPath = vscode.Uri.joinPath(this.workspaceRoot, '.devcrumbs', 'index.json');
      const indexData = await vscode.workspace.fs.readFile(indexPath);
      const index = JSON.parse(Buffer.from(indexData).toString('utf-8'));

      let items = Object.entries<any>(index.items || {}).map(
        ([id, meta]) => ({ id, ...meta }) as WorkItem,
      );

      // Track counts for badge
      const totalCount = items.length;

      // Apply filters and sorting
      items = this.applyFilters(items);
      items = this.applySorting(items);

      // Update badge with counts
      this.updateCounts(totalCount, items.length);

      // Group by methodology
      const itemsMap = new Map(items.map((item) => [item.id, item]));
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
        sections.push(
          new MethodologySectionNode('scrum', scrumByType, isScrumExpanded, this.expandedGroups),
        );
      }

      if (waterfallItems.length > 0 || config.methodology !== 'scrum') {
        const isWaterfallExpanded = this.expandedSections.has('waterfall');
        sections.push(
          new MethodologySectionNode(
            'waterfall',
            waterfallByType,
            isWaterfallExpanded,
            this.expandedGroups,
          ),
        );
      }

      return sections;
    } catch (error) {
      console.error('Failed to load flat view with methodology sections:', error);
      vscode.window.showErrorMessage('Failed to load DevCrumbs work items');
      return [];
    }
  }

  /**
   * Group items by type
   */
  private groupByType(items: WorkItem[]): Record<string, WorkItem[]> {
    return items.reduce(
      (acc, item) => {
        if (!acc[item.type]) {
          acc[item.type] = [];
        }
        acc[item.type].push(item);
        return acc;
      },
      {} as Record<string, WorkItem[]>,
    );
  }

  /**
   * Hierarchical view: Show parent-child relationships
   */
  private async getHierarchicalRootNodes(): Promise<TreeNode[]> {
    // Check if .devcrumbs directory exists
    try {
      await vscode.workspace.fs.stat(vscode.Uri.joinPath(this.workspaceRoot, '.devcrumbs'));
    } catch {
      // .devcrumbs doesn't exist yet - return empty state
      return [];
    }

    const roots: TreeNode[] = [];

    if (this.hierarchyType === 'both' || this.hierarchyType === 'scrum') {
      roots.push(new HierarchyRootNode('scrum', '🌲 Scrum Hierarchy'));
    }

    if (this.hierarchyType === 'both' || this.hierarchyType === 'waterfall') {
      roots.push(new HierarchyRootNode('waterfall', '🌲 Waterfall Hierarchy'));
    }

    return roots;
  }
}

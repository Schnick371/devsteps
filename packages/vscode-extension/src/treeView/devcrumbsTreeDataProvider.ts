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

interface FilterState {
  statuses: string[];
  priorities: string[];
  types: string[];
  tags: string[];
  searchQuery: string;
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
  abstract getChildren(workspaceRoot: vscode.Uri): Promise<TreeNode[]>;
}

/**
 * Type group node for flat view (e.g., "EPICS (3)")
 */
class TypeGroupNode extends TreeNode {
  constructor(
    private type: string,
    private count: number,
    private items: WorkItem[],
  ) {
    super();
  }

  toTreeItem(): vscode.TreeItem {
    const item = new vscode.TreeItem(
      `${this.type.toUpperCase()}S (${this.count})`,
      vscode.TreeItemCollapsibleState.Collapsed,
    );
    item.contextValue = 'typeGroup';
    item.iconPath = new vscode.ThemeIcon('folder');
    return item;
  }

  async getChildren(_workspaceRoot: vscode.Uri): Promise<TreeNode[]> {
    return this.items.map((item) => new WorkItemNode(item, false));
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

  async getChildren(workspaceRoot: vscode.Uri): Promise<TreeNode[]> {
    try {
      const indexPath = vscode.Uri.joinPath(workspaceRoot, '.devcrumbs', 'index.json');
      const indexData = await vscode.workspace.fs.readFile(indexPath);
      const index = JSON.parse(Buffer.from(indexData).toString('utf-8'));

      // Get top-level items (Epics for Scrum, Requirements for Waterfall)
      const topLevelType = this.hierarchy === 'scrum' ? 'epic' : 'requirement';
      const items = Object.entries<any>(index.items || {})
        .filter(([_, meta]) => meta.type === topLevelType)
        .map(([id, meta]) => ({ id, ...meta }) as WorkItem);

      return items.map((item) => new WorkItemNode(item, true));
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

  async getChildren(workspaceRoot: vscode.Uri): Promise<TreeNode[]> {
    if (!this.hierarchical) return [];

    try {
      const indexPath = vscode.Uri.joinPath(workspaceRoot, '.devcrumbs', 'index.json');
      const indexData = await vscode.workspace.fs.readFile(indexPath);
      const index = JSON.parse(Buffer.from(indexData).toString('utf-8'));

      const implementedBy = this.item.linked_items?.['implemented-by'] || [];
      const children = implementedBy
        .map((childId) => {
          const childMeta = index.items[childId];
          if (!childMeta) return null;
          return { id: childId, ...childMeta } as WorkItem;
        })
        .filter((item): item is WorkItem => item !== null)
        .map((item) => new WorkItemNode(item, true));

      return children;
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
  };
  private sortState: SortState = {
    by: 'id',
    order: 'asc',
  };

  constructor(private workspaceRoot: vscode.Uri) {}

  /**
   * Set view mode and refresh
   */
  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    this.refresh();
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
  }

  /**
   * Set priority filter
   */
  setPriorityFilter(priorities: string[]): void {
    this.filterState.priorities = priorities;
    this.refresh();
  }

  /**
   * Set type filter
   */
  setTypeFilter(types: string[]): void {
    this.filterState.types = types;
    this.refresh();
  }

  /**
   * Set tag filter
   */
  setTagFilter(tags: string[]): void {
    this.filterState.tags = tags;
    this.refresh();
  }

  /**
   * Set search query
   */
  setSearchQuery(query: string): void {
    this.filterState.searchQuery = query;
    this.refresh();
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
    };
    this.refresh();
  }

  /**
   * Set sort options
   */
  setSortOptions(by: SortState['by'], order: SortState['order']): void {
    this.sortState = { by, order };
    this.refresh();
  }

  /**
   * Apply filters to work items
   */
  private applyFilters(items: WorkItem[]): WorkItem[] {
    let filtered = items;

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

    // Child nodes
    return element.getChildren(this.workspaceRoot);
  }

  /**
   * Flat view: Group items by type
   */
  private async getFlatRootNodes(): Promise<TreeNode[]> {
    try {
      const indexPath = vscode.Uri.joinPath(this.workspaceRoot, '.devcrumbs', 'index.json');
      const indexData = await vscode.workspace.fs.readFile(indexPath);
      const index = JSON.parse(Buffer.from(indexData).toString('utf-8'));

      let items = Object.entries<any>(index.items || {}).map(
        ([id, meta]) => ({ id, ...meta }) as WorkItem,
      );

      // Apply filters and sorting
      items = this.applyFilters(items);
      items = this.applySorting(items);

      // Group by type
      const typeGroups = items.reduce(
        (acc, item) => {
          if (!acc[item.type]) {
            acc[item.type] = [];
          }
          acc[item.type].push(item);
          return acc;
        },
        {} as Record<string, WorkItem[]>,
      );

      // Create type group nodes
      return Object.entries(typeGroups)
        .sort(([typeA], [typeB]) => typeA.localeCompare(typeB))
        .map(([type, items]) => new TypeGroupNode(type, items.length, items));
    } catch (error) {
      console.error('Failed to load flat view:', error);
      vscode.window.showErrorMessage('Failed to load DevCrumbs work items');
      return [];
    }
  }

  /**
   * Hierarchical view: Show parent-child relationships
   */
  private getHierarchicalRootNodes(): TreeNode[] {
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

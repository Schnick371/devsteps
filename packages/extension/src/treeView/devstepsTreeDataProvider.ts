/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 * 
 * TreeView Provider with switchable view modes:
 * - Flat: Group by item type
 * - Hierarchical: Show parent-child relationships (Scrum + Waterfall)
 */

import * as vscode from 'vscode';
import {
  TreeNode,
  type ViewMode,
  type HierarchyType,
  type FilterState,
  type SortState,
  type WorkItem,
} from './types.js';
import {
  MethodologySectionNode,
  TypeGroupNode,
  HierarchyRootNode,
  LoadingNode,
} from './nodes/index.js';
import { getItemMethodology } from './utils/methodologyDetector.js';
import type { TreeViewStateManager } from '../utils/stateManager.js';

/**
 * TreeDataProvider with switchable view modes (flat vs hierarchical)
 */
export class DevStepsTreeDataProvider implements vscode.TreeDataProvider<TreeNode> {
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
  private expandedHierarchyItems = new Set<string>();
  private lastTotalCount = 0;
  private lastFilteredCount = 0;
  private decorationProvider?: { refresh: (uris?: vscode.Uri | vscode.Uri[]) => void };
  private initialized = false;
  private cachedRootNodes: TreeNode[] | null = null;

  constructor(
    private workspaceRoot: vscode.Uri,
    private stateManager?: TreeViewStateManager,
  ) {
    // Load persisted state if stateManager is provided
    if (stateManager) {
      this.viewMode = stateManager.loadViewMode();
      this.hierarchyType = stateManager.loadHierarchyType();
      this.filterState = stateManager.loadFilterState();
      this.sortState = stateManager.loadSortState();
      this.expandedGroups = stateManager.loadExpandedGroups();
      this.expandedSections = stateManager.loadExpandedSections();
      this.expandedHierarchyItems = stateManager.loadExpandedHierarchyItems();
    }
  }

  /**
   * Initialize data provider - pre-load root nodes to avoid "no data provider" flash
   * MUST be called before createTreeView() to ensure data is ready
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Pre-load root nodes to populate cache
    const nodes = await (this.viewMode === 'flat' ? this.getFlatRootNodes() : this.getHierarchicalRootNodes());
    this.cachedRootNodes = nodes;
    this.initialized = true;
  }

  /**
   * Set decoration provider for badge refresh
   */
  setDecorationProvider(provider: { refresh: (uris?: vscode.Uri | vscode.Uri[]) => void }): void {
    this.decorationProvider = provider;
  }

  /**
   * Set TreeView instance for description badge updates and state tracking
   */
  setTreeView(treeView: vscode.TreeView<TreeNode>): void {
    this.treeView = treeView;
    this.updateDescription();

    // Track expanded state of methodology sections in flat view and hierarchical nodes
    this.treeView.onDidExpandElement((e) => {
      if (e.element instanceof MethodologySectionNode) {
        this.expandedSections.add(e.element.getMethodology());
        this.stateManager?.saveExpandedSections(this.expandedSections);
      } else if (e.element instanceof TypeGroupNode) {
        this.expandedGroups.add(e.element.getTrackingKey());
        this.stateManager?.saveExpandedGroups(this.expandedGroups);
      } else if (e.element instanceof HierarchyRootNode) {
        this.expandedHierarchyItems.add(e.element.getId());
        this.stateManager?.saveExpandedHierarchyItems(this.expandedHierarchyItems);
      } else {
        // WorkItemNode in hierarchical view
        const id = e.element.getId();
        if (id && this.viewMode === 'hierarchical') {
          this.expandedHierarchyItems.add(id);
          this.stateManager?.saveExpandedHierarchyItems(this.expandedHierarchyItems);
        }
      }
    });

    this.treeView.onDidCollapseElement((e) => {
      if (e.element instanceof MethodologySectionNode) {
        this.expandedSections.delete(e.element.getMethodology());
        this.stateManager?.saveExpandedSections(this.expandedSections);
      } else if (e.element instanceof TypeGroupNode) {
        this.expandedGroups.delete(e.element.getTrackingKey());
        this.stateManager?.saveExpandedGroups(this.expandedGroups);
      } else if (e.element instanceof HierarchyRootNode) {
        this.expandedHierarchyItems.delete(e.element.getId());
        this.stateManager?.saveExpandedHierarchyItems(this.expandedHierarchyItems);
      } else {
        // WorkItemNode in hierarchical view
        const id = e.element.getId();
        if (id && this.viewMode === 'hierarchical') {
          this.expandedHierarchyItems.delete(id);
          this.stateManager?.saveExpandedHierarchyItems(this.expandedHierarchyItems);
        }
      }
    });
  }

  /**
   * Set view mode and refresh
   */
  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    this.stateManager?.saveViewMode(mode);
    this.refresh();
    this.updateDescription();
  }

  /**
   * Set hierarchy type (for hierarchical view)
   */
  setHierarchyType(type: HierarchyType): void {
    this.hierarchyType = type;
    this.stateManager?.saveHierarchyType(type);
    if (this.viewMode === 'hierarchical') {
      this.refresh();
    }
  }

  /**
   * Refresh the tree view - clears cache to force reload
   */
  refresh(): void {
    this.cachedRootNodes = null; // Clear cache to force reload
    this.initialized = false;
    this._onDidChangeTreeData.fire();
    // Refresh decorations (colored badges) for all items
    this.decorationProvider?.refresh();
  }

  /**
   * Set status filter
   */
  setStatusFilter(statuses: string[]): void {
    this.filterState.statuses = statuses;
    this.stateManager?.saveFilterState(this.filterState);
    this.refresh();
    this.updateDescription();
  }

  /**
   * Set priority filter
   */
  setPriorityFilter(priorities: string[]): void {
    this.filterState.priorities = priorities;
    this.stateManager?.saveFilterState(this.filterState);
    this.refresh();
    this.updateDescription();
  }

  /**
   * Set type filter
   */
  setTypeFilter(types: string[]): void {
    this.filterState.types = types;
    this.stateManager?.saveFilterState(this.filterState);
    this.refresh();
    this.updateDescription();
  }

  /**
   * Set tag filter
   */
  setTagFilter(tags: string[]): void {
    this.filterState.tags = tags;
    this.stateManager?.saveFilterState(this.filterState);
    this.refresh();
    this.updateDescription();
  }

  /**
   * Set search query
   */
  setSearchQuery(query: string): void {
    this.filterState.searchQuery = query;
    this.stateManager?.saveFilterState(this.filterState);
    this.refresh();
    this.updateDescription();
  }

  /**
   * Toggle hide done items filter
   */
  toggleHideDone(): void {
    this.filterState.hideDone = !this.filterState.hideDone;
    this.stateManager?.saveFilterState(this.filterState);
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
      hideDone: this.filterState.hideDone, // Preserve hide done toggle
    };
    this.stateManager?.saveFilterState(this.filterState);
    this.refresh();
    this.updateDescription();
  }

  /**
   * Update TreeView description badge (shows filtered count)
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
      // Synchronous operation not available, use cached count or estimate
      // For now, return from last loaded data
      return this.lastTotalCount || 0;
    } catch {
      return 0;
    }
  }

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
    this.stateManager?.saveSortState(this.sortState);
    this.refresh();
    this.updateDescription();
  }

  /**
   * Get current view mode
   */
  getViewMode(): ViewMode {
    return this.viewMode;
  }

  /**
   * Get current hierarchy type
   */
  getHierarchyType(): HierarchyType {
    return this.hierarchyType;
  }

  /**
   * Get current filter state
   */
  getFilterState(): FilterState {
    return { ...this.filterState }; // Return a copy
  }

  /**
   * Get current sort state
   */
  getSortState(): SortState {
    return { ...this.sortState }; // Return a copy
  }

  /**
   * Get hide done state
   */
  getHideDoneState(): boolean {
    return this.filterState.hideDone;
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
   * CRITICAL: Returns SYNCHRONOUSLY with loading placeholder to prevent Welcome View flash
   * 
   * Strategy: Show "Loading..." node while data loads
   * - View is NOT empty → VS Code doesn't show Welcome View
   * - User sees feedback instead of blank view
   * - Once data loads, refresh replaces loading node with real data
   */
  getChildren(element?: TreeNode): TreeNode[] | Promise<TreeNode[]> {
    if (!element) {
      // Root level - return SYNCHRONOUSLY if data available
      if (this.cachedRootNodes !== null) {
        return this.cachedRootNodes; // Real data - SYNCHRONOUS return
      }
      
      // Data not loaded yet - show loading placeholder and trigger async load
      if (!this.initialized) {
        this.loadAndCacheRootNodes(); // Start loading in background
        
        // Return loading placeholder node - View is NOT empty → no Welcome View!
        return [new LoadingNode()]; // SYNCHRONOUS return with proper TreeNode
      }
      
      return []; // Fallback (should never reach here)
    }

    // Child nodes - pass filterState and expandedHierarchyItems for hierarchical view
    return element.getChildren(this.workspaceRoot, this.filterState, this.expandedHierarchyItems);
  }

  /**
   * Load root nodes asynchronously and cache, then refresh view
   */
  private async loadAndCacheRootNodes(): Promise<void> {
    if (this.initialized) return; // Already loading
    this.initialized = true; // Mark as loading
    
    const nodes = this.viewMode === 'flat' 
      ? await this.getFlatRootNodes() 
      : await this.getHierarchicalRootNodes();
    
    this.cachedRootNodes = nodes;
    
    // Trigger refresh to display loaded data
    this._onDidChangeTreeData.fire();
  }

  /**
   * Flat view: Group items by methodology, then by type
   */
  private async getFlatRootNodes(): Promise<TreeNode[]> {
    try {
      // Check if .devsteps directory exists
      try {
        await vscode.workspace.fs.stat(vscode.Uri.joinPath(this.workspaceRoot, '.devsteps'));
      } catch {
        // .devsteps doesn't exist yet - return empty state
        return [];
      }

      // Load config to get methodology
      const configPath = vscode.Uri.joinPath(this.workspaceRoot, '.devsteps', 'config.json');
      const configData = await vscode.workspace.fs.readFile(configPath);
      const config = JSON.parse(Buffer.from(configData).toString('utf-8'));

      // Load items
      const indexPath = vscode.Uri.joinPath(this.workspaceRoot, '.devsteps', 'index.json');
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
      vscode.window.showErrorMessage('Failed to load DevSteps work items');
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
    // Check if .devsteps directory exists
    try {
      await vscode.workspace.fs.stat(vscode.Uri.joinPath(this.workspaceRoot, '.devsteps'));
    } catch {
      // .devsteps doesn't exist yet - return empty state
      return [];
    }

    const roots: TreeNode[] = [];

    if (this.hierarchyType === 'both' || this.hierarchyType === 'scrum') {
      const isExpanded = this.expandedHierarchyItems.has('hierarchy-scrum');
      roots.push(new HierarchyRootNode('scrum', '🌲 Scrum Hierarchy', isExpanded));
    }

    if (this.hierarchyType === 'both' || this.hierarchyType === 'waterfall') {
      const isExpanded = this.expandedHierarchyItems.has('hierarchy-waterfall');
      roots.push(new HierarchyRootNode('waterfall', '🌲 Waterfall Hierarchy', isExpanded));
    }

    return roots;
  }
}

/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * TreeView Provider with switchable view modes:
 * - Flat: Group by item type
 * - Hierarchical: Show parent-child relationships (Scrum + Waterfall)
 */

import * as vscode from 'vscode';
import type { TreeViewStateManager } from '../utils/stateManager.js';
import {
  HierarchyRootNode,
  LoadingNode,
  MethodologySectionNode,
  TypeGroupNode,
  WorkItemNode,
} from './nodes/index.js';
import type {
  FilterState,
  HierarchyType,
  SortState,
  TreeNode,
  ViewMode,
  WorkItem,
} from './types.js';
import { buildFlatSectionNodes, buildFlatViewNodes } from './utils/flatViewBuilder.js';
import { applyFilters, applySorting } from './utils/itemFilter.js';

/**
 * TreeDataProvider with switchable view modes (flat vs hierarchical)
 */
export class DevStepsTreeDataProvider implements vscode.TreeDataProvider<TreeNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined | null | undefined> =
    new vscode.EventEmitter<TreeNode | undefined | null | undefined>();
  readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined | null | undefined> =
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
    hideRelatesTo: false,
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
    private stateManager?: TreeViewStateManager
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
    const nodes = await (this.viewMode === 'flat'
      ? this.getFlatRootNodes()
      : this.getHierarchicalRootNodes());
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

  setStatusFilter(statuses: string[]): void { this.filterState.statuses = statuses; this._saveAndRefresh(); }
  setPriorityFilter(priorities: string[]): void { this.filterState.priorities = priorities; this._saveAndRefresh(); }
  setTypeFilter(types: string[]): void { this.filterState.types = types; this._saveAndRefresh(); }
  setTagFilter(tags: string[]): void { this.filterState.tags = tags; this._saveAndRefresh(); }
  setSearchQuery(query: string): void { this.filterState.searchQuery = query; this._saveAndRefresh(); }

  toggleHideDone(): void {
    this.filterState.hideDone = !this.filterState.hideDone;
    this._saveAndRefresh();
  }

  toggleHideRelatesTo(): void {
    this.filterState.hideRelatesTo = !this.filterState.hideRelatesTo;
    this._saveAndRefresh();
  }

  clearFilters(): void {
    this.filterState = {
      statuses: [], priorities: [], types: [], tags: [], searchQuery: '',
      hideDone: this.filterState.hideDone, hideRelatesTo: this.filterState.hideRelatesTo,
    };
    this._saveAndRefresh();
  }

  private _saveAndRefresh(): void {
    this.stateManager?.saveFilterState(this.filterState);
    this.refresh();
    this.updateDescription();
  }

  private updateDescription(): void {
    if (!this.treeView) return;
    try {
      const total = this.lastTotalCount || 0;
      const filtered = this.lastFilteredCount;
      this.treeView.description = filtered < total ? `(${filtered}/${total})` : undefined;
    } catch { this.treeView.description = undefined; }
  }

  private updateCounts(total: number, filtered: number): void {
    this.lastTotalCount = total;
    this.lastFilteredCount = filtered;
    this.updateDescription();
  }

  setSortOptions(by: SortState['by'], order: SortState['order']): void {
    this.sortState = { by, order };
    this.stateManager?.saveSortState(this.sortState);
    this.refresh();
    this.updateDescription();
  }

  getViewMode(): ViewMode { return this.viewMode; }
  getHierarchyType(): HierarchyType { return this.hierarchyType; }
  getFilterState(): FilterState { return { ...this.filterState }; }
  getSortState(): SortState { return { ...this.sortState }; }
  getHideDoneState(): boolean { return this.filterState.hideDone; }
  getHideRelatesToState(): boolean { return this.filterState.hideRelatesTo; }

  isFiltersActive(): boolean {
    const { statuses, priorities, types, tags, searchQuery } = this.filterState;
    return statuses.length > 0 || priorities.length > 0 || types.length > 0 || tags.length > 0 || (searchQuery ?? '').length > 0;
  }

  /**
   * Get tree item for display
   */
  getTreeItem(element: TreeNode): vscode.TreeItem {
    const treeItem = element.toTreeItem();

    // Re-evaluate collapsible state based on current filter
    // This ensures chevron visibility updates when filters change
    if (
      element instanceof WorkItemNode &&
      treeItem.collapsibleState !== vscode.TreeItemCollapsibleState.None
    ) {
      const hasChildren = element.hasVisibleChildren(this.filterState);
      if (!hasChildren) {
        treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
      }
    }

    return treeItem;
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

    const nodes =
      this.viewMode === 'flat'
        ? await this.getFlatRootNodes()
        : await this.getHierarchicalRootNodes();

    this.cachedRootNodes = nodes;

    // Trigger refresh to display loaded data
    this._onDidChangeTreeData.fire();
  }

  /**
   * Flat view: Group items by methodology, then by type (delegates to flatViewBuilder utility)
   */
  private async getFlatRootNodes(): Promise<TreeNode[]> {
    try {
      // Load all items via utility
      let items = await buildFlatViewNodes({
        workspaceRoot: this.workspaceRoot,
        filterState: this.filterState,
        expandedSections: this.expandedSections,
        expandedGroups: this.expandedGroups,
      });

      const totalCount = items.length;

      // Apply filters and sorting
      items = applyFilters(items, this.filterState);
      items = applySorting(items, this.sortState);

      this.updateCounts(totalCount, items.length);

      return await buildFlatSectionNodes(
        this.workspaceRoot,
        items,
        items,
        this.expandedSections,
        this.expandedGroups
      );
    } catch (error) {
      console.error('Failed to load flat view with methodology sections:', error);
      vscode.window.showErrorMessage('Failed to load DevSteps work items');
      return [];
    }
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

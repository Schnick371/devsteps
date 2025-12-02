/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 * 
 * State persistence manager for TreeView using VS Code Memento API
 */

import * as vscode from 'vscode';
import type { ViewMode, HierarchyType, FilterState, SortState } from '../treeView/types.js';

export class TreeViewStateManager {
  private static readonly KEYS = {
    VIEW_MODE: 'devsteps.treeView.viewMode',
    HIERARCHY_TYPE: 'devsteps.treeView.hierarchyType',
    FILTER_STATE: 'devsteps.treeView.filterState',
    SORT_STATE: 'devsteps.treeView.sortState',
    EXPANDED_GROUPS: 'devsteps.treeView.expandedGroups',
    EXPANDED_SECTIONS: 'devsteps.treeView.expandedSections',
    EXPANDED_HIERARCHY_ITEMS: 'devsteps.treeView.expandedHierarchyItems',
  };

  constructor(private workspaceState: vscode.Memento) {}

  // Load state (called in TreeDataProvider constructor)
  loadViewMode(): ViewMode {
    return this.workspaceState.get<ViewMode>(TreeViewStateManager.KEYS.VIEW_MODE, 'flat');
  }

  loadHierarchyType(): HierarchyType {
    return this.workspaceState.get<HierarchyType>(TreeViewStateManager.KEYS.HIERARCHY_TYPE, 'both');
  }

  loadFilterState(): FilterState {
    return this.workspaceState.get<FilterState>(TreeViewStateManager.KEYS.FILTER_STATE, {
      statuses: [],
      priorities: [],
      types: [],
      tags: [],
      searchQuery: '',
      hideDone: false,
      hideRelatesTo: false,
    });
  }

  loadSortState(): SortState {
    return this.workspaceState.get<SortState>(TreeViewStateManager.KEYS.SORT_STATE, {
      by: 'id',
      order: 'asc',
    });
  }

  loadExpandedGroups(): Set<string> {
    const array = this.workspaceState.get<string[]>(TreeViewStateManager.KEYS.EXPANDED_GROUPS, []);
    return new Set(array);
  }

  loadExpandedSections(): Set<string> {
    const array = this.workspaceState.get<string[]>(TreeViewStateManager.KEYS.EXPANDED_SECTIONS, ['scrum', 'waterfall']);
    return new Set(array);
  }

  loadExpandedHierarchyItems(): Set<string> {
    const array = this.workspaceState.get<string[]>(TreeViewStateManager.KEYS.EXPANDED_HIERARCHY_ITEMS, []);
    return new Set(array);
  }

  // Save state (called on every setter method)
  async saveViewMode(mode: ViewMode): Promise<void> {
    await this.workspaceState.update(TreeViewStateManager.KEYS.VIEW_MODE, mode);
  }

  async saveHierarchyType(type: HierarchyType): Promise<void> {
    await this.workspaceState.update(TreeViewStateManager.KEYS.HIERARCHY_TYPE, type);
  }

  async saveFilterState(filterState: FilterState): Promise<void> {
    await this.workspaceState.update(TreeViewStateManager.KEYS.FILTER_STATE, filterState);
  }

  async saveSortState(sortState: SortState): Promise<void> {
    await this.workspaceState.update(TreeViewStateManager.KEYS.SORT_STATE, sortState);
  }

  async saveExpandedGroups(groups: Set<string>): Promise<void> {
    await this.workspaceState.update(TreeViewStateManager.KEYS.EXPANDED_GROUPS, Array.from(groups));
  }

  async saveExpandedSections(sections: Set<string>): Promise<void> {
    await this.workspaceState.update(TreeViewStateManager.KEYS.EXPANDED_SECTIONS, Array.from(sections));
  }

  async saveExpandedHierarchyItems(items: Set<string>): Promise<void> {
    await this.workspaceState.update(TreeViewStateManager.KEYS.EXPANDED_HIERARCHY_ITEMS, Array.from(items));
  }
}
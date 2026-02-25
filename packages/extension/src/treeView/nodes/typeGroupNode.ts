/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Type Group Node - Groups items by type in flat view (e.g., "STORIES (4)")
 */

import type { ItemType } from '@schnick371/devsteps-shared';
import * as vscode from 'vscode';
import { type FilterState, TreeNode, TYPE_TO_DIRECTORY, type WorkItem } from '../types.js';
import { WorkItemNode } from './workItemNode.js';

export class TypeGroupNode extends TreeNode {
  constructor(
    private type: string,
    private count: number,
    private items: WorkItem[],
    private isExpanded: boolean = false,
    private parentMethodology?: 'scrum' | 'waterfall'
  ) {
    super();
  }

  toTreeItem(): vscode.TreeItem {
    const collapsibleState = this.isExpanded
      ? vscode.TreeItemCollapsibleState.Expanded
      : vscode.TreeItemCollapsibleState.Collapsed;

    // Use TYPE_TO_DIRECTORY for correct pluralization (story → stories, not storys)
    const pluralLabel = TYPE_TO_DIRECTORY[this.type as ItemType] || `${this.type}s`;

    const item = new vscode.TreeItem(
      `${pluralLabel.toUpperCase()} (${this.count})`,
      collapsibleState
    );
    item.contextValue = 'typeGroup';
    item.iconPath = new vscode.ThemeIcon('folder');

    // Ensure consistent ID for expanded state preservation
    // Use methodology prefix if available, otherwise use plain type
    item.id = this.parentMethodology
      ? `type-${this.parentMethodology}-${this.type}`
      : `type-${this.type}`;

    return item;
  }

  async getChildren(
    _workspaceRoot: vscode.Uri,
    _filterState?: FilterState,
    _expandedHierarchyItems?: Set<string>
  ): Promise<TreeNode[]> {
    return this.items.map((item) => new WorkItemNode(item, false));
  }

  /**
   * Get the type identifier for state tracking
   */
  getTypeId(): string {
    return this.parentMethodology ? `${this.parentMethodology}-${this.type}` : this.type;
  }
}

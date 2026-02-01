/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Methodology Section Node - Groups items by Scrum/Waterfall in flat view
 */

import * as vscode from 'vscode';
import { TreeNode, type FilterState, type WorkItem } from '../types.js';
import { TypeGroupNode } from './typeGroupNode.js';

export class MethodologySectionNode extends TreeNode {
  constructor(
    private methodology: 'scrum' | 'waterfall',
    private itemsByType: Record<string, WorkItem[]>,
    private isExpanded: boolean = true,
    private expandedGroups: Set<string>
  ) {
    super();
  }

  toTreeItem(): vscode.TreeItem {
    const totalCount = Object.values(this.itemsByType).reduce(
      (sum, items) => sum + items.length,
      0
    );

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

  async getChildren(
    _workspaceRoot: vscode.Uri,
    _filterState?: FilterState,
    _expandedHierarchyItems?: Set<string>
  ): Promise<TreeNode[]> {
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

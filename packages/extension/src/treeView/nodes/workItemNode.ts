/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 * 
 * Work Item Node - Represents individual work items in TreeView
 */

import * as vscode from 'vscode';
import { createItemUri } from '../../decorationProvider.js';
import { getItemIconWithPriority } from '../../utils/icons.js';
import type { ItemType, Priority } from '@schnick371/devsteps-shared';
import { TreeNode, type FilterState, type WorkItem } from '../types.js';
import { loadItemWithLinks } from '../utils/itemLoader.js';

export class WorkItemNode extends TreeNode {
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
    treeItem.description = undefined;
    treeItem.tooltip = `${this.item.type.toUpperCase()} | ${this.item.status} | Priority: ${this.item.priority}`;

    // Set resourceUri for FileDecorationProvider (colored badges in separate column!)
    treeItem.resourceUri = createItemUri(this.item.id, this.item.status, this.item.priority);

    treeItem.command = {
      command: 'devsteps.openItem',
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

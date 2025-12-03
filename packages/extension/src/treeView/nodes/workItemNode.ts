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
    private isExpanded?: boolean,
  ) {
    super();
  }

  getId(): string {
    return this.item.id;
  }

  toTreeItem(): vscode.TreeItem {
    const hasChildren = this.hierarchical && this.hasImplementedByLinks();

    let collapsibleState = vscode.TreeItemCollapsibleState.None;
    if (hasChildren) {
      if (this.isExpanded !== undefined) {
        collapsibleState = this.isExpanded 
          ? vscode.TreeItemCollapsibleState.Expanded 
          : vscode.TreeItemCollapsibleState.Collapsed;
      } else {
        collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
      }
    }

    const treeItem = new vscode.TreeItem(`${this.item.id}: ${this.item.title}`, collapsibleState);

    treeItem.id = this.item.id;
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

  async getChildren(workspaceRoot: vscode.Uri, filterState?: FilterState, expandedHierarchyItems?: Set<string>): Promise<TreeNode[]> {
    if (!this.hierarchical) return [];

    try {
      const effectiveFilter = filterState || this.filterState;
      
      // Collect child IDs from different relationship types
      const childIds: string[] = [];
      
      // Always include hierarchy and critical relationships
      const implementedBy = this.item.linked_items?.['implemented-by'] || [];
      childIds.push(...implementedBy);
      
      const blockedBy = this.item.linked_items?.['blocked-by'] || [];
      childIds.push(...blockedBy);
      
      const testedBy = this.item.linked_items?.['tested-by'] || [];
      childIds.push(...testedBy);
      
      const requiredBy = this.item.linked_items?.['required-by'] || [];
      childIds.push(...requiredBy);
      
      // Include relates-to if not hidden
      if (!effectiveFilter?.hideRelatesTo) {
        const relatesTo = this.item.linked_items?.['relates-to'] || [];
        childIds.push(...relatesTo);
      }
      
      // Load full child items with linked_items for hierarchical display
      let children: WorkItem[] = [];
      for (const childId of childIds) {
        const child = await loadItemWithLinks(workspaceRoot, childId);
        if (child) children.push(child);
      }

      // Apply hideDone filter in hierarchical view
      if (effectiveFilter?.hideDone) {
        children = children.filter((item) => item.status !== 'done');
      }

      return children.map((item) => {
        const isExpanded = expandedHierarchyItems?.has(item.id);
        return new WorkItemNode(item, true, effectiveFilter, isExpanded);
      });
    } catch (error) {
      console.error('Failed to load child items:', error);
      return [];
    }
  }

  private hasImplementedByLinks(): boolean {
    const implementedBy = this.item.linked_items?.['implemented-by'];
    const blockedBy = this.item.linked_items?.['blocked-by'];
    const testedBy = this.item.linked_items?.['tested-by'];
    const requiredBy = this.item.linked_items?.['required-by'];
    return (
      (Array.isArray(implementedBy) && implementedBy.length > 0) ||
      (Array.isArray(blockedBy) && blockedBy.length > 0) ||
      (Array.isArray(testedBy) && testedBy.length > 0) ||
      (Array.isArray(requiredBy) && requiredBy.length > 0)
    );
  }

  private getIcon(): vscode.ThemeIcon {
    // Use centralized icon system with priority-based coloring
    return getItemIconWithPriority(
      this.item.type as ItemType,
      this.item.priority as Priority
    );
  }
}

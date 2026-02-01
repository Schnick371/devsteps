/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Hierarchy Root Node - Top-level separators for Scrum/Waterfall hierarchies
 */

import * as vscode from 'vscode';
import { TreeNode, type FilterState, type WorkItem } from '../types.js';
import { loadItemWithLinks } from '../utils/itemLoader.js';
import { WorkItemNode } from './workItemNode.js';

export class HierarchyRootNode extends TreeNode {
  private id: string;

  constructor(
    private hierarchy: 'scrum' | 'waterfall',
    private label: string,
    private isExpanded: boolean = true
  ) {
    super();
    this.id = `hierarchy-${hierarchy}`;
  }

  getId(): string {
    return this.id;
  }

  toTreeItem(): vscode.TreeItem {
    const collapsibleState = this.isExpanded
      ? vscode.TreeItemCollapsibleState.Expanded
      : vscode.TreeItemCollapsibleState.Collapsed;
    const item = new vscode.TreeItem(this.label, collapsibleState);
    item.id = this.id;
    item.contextValue = 'hierarchyRoot';
    item.iconPath = new vscode.ThemeIcon('symbol-namespace');
    return item;
  }

  async getChildren(
    workspaceRoot: vscode.Uri,
    filterState?: FilterState,
    expandedHierarchyItems?: Set<string>
  ): Promise<TreeNode[]> {
    try {
      // Determine index file based on hierarchy type (refs-style index)
      const indexFileName = this.hierarchy === 'scrum' ? 'epics.json' : 'requirements.json';
      const indexPath = vscode.Uri.joinPath(
        workspaceRoot,
        '.devsteps',
        'index',
        'by-type',
        indexFileName
      );

      // Check if index exists
      try {
        await vscode.workspace.fs.stat(indexPath);
      } catch {
        // Index doesn't exist - return empty (happens in new/empty projects)
        return [];
      }

      const indexData = await vscode.workspace.fs.readFile(indexPath);
      const index = JSON.parse(Buffer.from(indexData).toString('utf-8'));

      // Refs-style index structure: { version, items: string[], updated }
      const itemIds = index.items || [];

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

      return items.map((item) => {
        const isExpanded = expandedHierarchyItems?.has(item.id);
        // Start cycle detection with empty ancestor set
        return new WorkItemNode(item, true, filterState, isExpanded, this.id, 'root', new Set());
      });
    } catch (error) {
      console.error('Failed to load hierarchy items:', error);
      return [];
    }
  }
}

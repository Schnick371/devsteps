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
      const indexPath = vscode.Uri.joinPath(workspaceRoot, '.devsteps', 'index.json');
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

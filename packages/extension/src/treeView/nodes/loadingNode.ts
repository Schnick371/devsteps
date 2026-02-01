/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Loading placeholder node to prevent Welcome View flash
 */

import * as vscode from 'vscode';
import { type FilterState, TreeNode } from '../types.js';

/**
 * Loading placeholder node shown while data loads
 * Prevents Welcome View from appearing during initial load
 */
export class LoadingNode extends TreeNode {
  toTreeItem(): vscode.TreeItem {
    const item = new vscode.TreeItem(
      '⏳ Loading work items...',
      vscode.TreeItemCollapsibleState.None
    );
    item.description = 'Please wait';
    item.contextValue = 'loading';
    item.tooltip = 'DevSteps is loading your work items from .devsteps directory';
    return item;
  }

  async getChildren(
    _workspaceRoot: vscode.Uri,
    _filterState?: FilterState,
    _expandedHierarchyItems?: Set<string>
  ): Promise<TreeNode[]> {
    // Loading node has no children
    return [];
  }
}

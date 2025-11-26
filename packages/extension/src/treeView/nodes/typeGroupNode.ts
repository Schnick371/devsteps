/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 * 
 * Type Group Node - Groups items by type in flat view (e.g., "EPICS (3)")
 */

import * as vscode from 'vscode';
import { TreeNode, type FilterState, type WorkItem } from '../types.js';
import { WorkItemNode } from './workItemNode.js';

export class TypeGroupNode extends TreeNode {
  constructor(
    private type: string,
    private count: number,
    private items: WorkItem[],
    private isExpanded: boolean = false,
    private parentMethodology?: 'scrum' | 'waterfall',
  ) {
    super();
  }

  toTreeItem(): vscode.TreeItem {
    const collapsibleState = this.isExpanded
      ? vscode.TreeItemCollapsibleState.Expanded
      : vscode.TreeItemCollapsibleState.Collapsed;

    const item = new vscode.TreeItem(
      `${this.type.toUpperCase()}S (${this.count})`,
      collapsibleState,
    );
    item.contextValue = 'typeGroup';
    item.iconPath = new vscode.ThemeIcon('folder');
    
    // Make ID unique per methodology section
    if (this.parentMethodology) {
      item.id = `type-${this.parentMethodology}-${this.type}`;
    }
    
    return item;
  }

  async getChildren(_workspaceRoot: vscode.Uri, _filterState?: FilterState): Promise<TreeNode[]> {
    return this.items.map((item) => new WorkItemNode(item, false));
  }

  /**
   * Get the type identifier for state tracking
   */
  getType(): string {
    return this.type;
  }

  /**
   * Get full tracking key including methodology
   */
  getTrackingKey(): string {
    return this.parentMethodology ? `${this.parentMethodology}-${this.type}` : this.type;
  }
}

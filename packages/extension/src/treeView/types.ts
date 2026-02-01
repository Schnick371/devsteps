/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Shared types and interfaces for TreeView components
 */

import { TYPE_TO_DIRECTORY } from '@schnick371/devsteps-shared';
import type * as vscode from 'vscode';

// Re-export for convenience
export { TYPE_TO_DIRECTORY };

export type ViewMode = 'flat' | 'hierarchical';
export type HierarchyType = 'scrum' | 'waterfall' | 'both';

export interface FilterState {
  statuses: string[];
  priorities: string[];
  types: string[];
  tags: string[];
  searchQuery: string;
  hideDone: boolean;
  hideRelatesTo: boolean;
}

export interface SortState {
  by: 'id' | 'title' | 'created' | 'updated' | 'priority' | 'status';
  order: 'asc' | 'desc';
}

export interface WorkItem {
  id: string;
  type: string;
  title: string;
  status: string;
  eisenhower: string; // Source data: urgent-important, not-urgent-important, etc.
  priority: string; // Computed: critical, high, medium, low
  created?: string;
  updated?: string;
  tags?: string[];
  linked_items?: {
    'implemented-by'?: string[];
    blocks?: string[];
    'blocked-by'?: string[];
    'relates-to'?: string[];
    'tested-by'?: string[];
    'required-by'?: string[];
  };
}

/**
 * Abstract base class for all tree nodes
 */
export abstract class TreeNode {
  abstract toTreeItem(): vscode.TreeItem;
  abstract getChildren(
    workspaceRoot: vscode.Uri,
    filterState?: FilterState,
    expandedHierarchyItems?: Set<string>
  ): Promise<TreeNode[]>;

  /**
   * Get unique ID for this node (used for expansion tracking)
   * Returns empty string for nodes that don't need tracking
   */
  getId(): string {
    return '';
  }
}

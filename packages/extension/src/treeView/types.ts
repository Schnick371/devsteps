/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 * 
 * Shared types and interfaces for TreeView components
 */

import * as vscode from 'vscode';

export type ViewMode = 'flat' | 'hierarchical';
export type HierarchyType = 'scrum' | 'waterfall' | 'both';

/**
 * Map item types to their directory names
 */
export const TYPE_TO_DIRECTORY: Record<string, string> = {
  epic: 'epics',
  story: 'stories',
  task: 'tasks',
  requirement: 'requirements',
  feature: 'features',
  bug: 'bugs',
  spike: 'spikes',
  test: 'tests',
};

export interface FilterState {
  statuses: string[];
  priorities: string[];
  types: string[];
  tags: string[];
  searchQuery: string;
  hideDone: boolean;
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
  priority: string;
  created?: string;
  updated?: string;
  tags?: string[];
  linked_items?: {
    'implemented-by'?: string[];
    [key: string]: string[] | undefined;
  };
}

/**
 * Abstract base class for all tree nodes
 */
export abstract class TreeNode {
  abstract toTreeItem(): vscode.TreeItem;
  abstract getChildren(workspaceRoot: vscode.Uri, filterState?: FilterState): Promise<TreeNode[]>;
}

/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * TreeView utilities — flat view tree node builder
 */

import * as vscode from 'vscode';
import { MethodologySectionNode } from '../nodes/index.js';
import type { FilterState, TreeNode, WorkItem } from '../types.js';
import { loadItemWithLinks } from './itemLoader.js';
import { getItemMethodology } from './methodologyDetector.js';

export interface FlatViewOptions {
  workspaceRoot: vscode.Uri;
  filterState: FilterState;
  expandedSections: Set<string>;
  expandedGroups: Set<string>;
}

/**
 * Build flat view root nodes: load all items from index
 * Returns raw WorkItem[] (caller applies filters/sorting before building sections)
 */
export async function buildFlatViewNodes(options: FlatViewOptions): Promise<WorkItem[]> {
  const { workspaceRoot } = options;

  try {
    // Check if .devsteps directory exists
    try {
      await vscode.workspace.fs.stat(vscode.Uri.joinPath(workspaceRoot, '.devsteps'));
    } catch {
      return [];
    }

    // Load config for methodology
    const configPath = vscode.Uri.joinPath(workspaceRoot, '.devsteps', 'config.json');
    const configData = await vscode.workspace.fs.readFile(configPath);
    const config = JSON.parse(Buffer.from(configData).toString('utf-8'));

    // Load all item IDs from by-type index files
    const byTypeDir = vscode.Uri.joinPath(workspaceRoot, '.devsteps', 'index', 'by-type');
    const typeFiles = await vscode.workspace.fs.readDirectory(byTypeDir);

    const allItemIds: string[] = [];
    for (const [fileName, fileType] of typeFiles) {
      if (fileType === vscode.FileType.File && fileName.endsWith('.json')) {
        const filePath = vscode.Uri.joinPath(byTypeDir, fileName);
        const fileData = await vscode.workspace.fs.readFile(filePath);
        const typeIndex = JSON.parse(Buffer.from(fileData).toString('utf-8'));
        allItemIds.push(...(typeIndex.items || []));
      }
    }

    // Load full item data
    let items: WorkItem[] = [];
    for (const itemId of allItemIds) {
      const item = await loadItemWithLinks(workspaceRoot, itemId);
      if (item) items.push(item);
    }

    return items;
  } catch (error) {
    console.error('buildFlatViewNodes: failed to load items', error);
    vscode.window.showErrorMessage('Failed to load DevSteps work items');
    return [];
  }
}

/**
 * Build methodology section nodes from filtered+sorted items
 */
export async function buildFlatSectionNodes(
  workspaceRoot: vscode.Uri,
  filteredItems: WorkItem[],
  allItems: WorkItem[],
  expandedSections: Set<string>,
  expandedGroups: Set<string>
): Promise<TreeNode[]> {
  // Load config for methodology
  const configPath = vscode.Uri.joinPath(workspaceRoot, '.devsteps', 'config.json');
  const configData = await vscode.workspace.fs.readFile(configPath);
  const config = JSON.parse(Buffer.from(configData).toString('utf-8'));

  const itemsMap = new Map(filteredItems.map((item) => [item.id, item]));
  const scrumItems: WorkItem[] = [];
  const waterfallItems: WorkItem[] = [];

  for (const item of filteredItems) {
    const methodology = getItemMethodology(item, itemsMap);
    if (methodology === 'scrum') { scrumItems.push(item); } else { waterfallItems.push(item); }
  }

  const scrumByType = groupByType(scrumItems);
  const waterfallByType = groupByType(waterfallItems);

  const sections: TreeNode[] = [];

  if (scrumItems.length > 0 || config.methodology !== 'waterfall') {
    sections.push(
      new MethodologySectionNode('scrum', scrumByType, expandedSections.has('scrum'), expandedGroups)
    );
  }

  if (waterfallItems.length > 0 || config.methodology !== 'scrum') {
    sections.push(
      new MethodologySectionNode('waterfall', waterfallByType, expandedSections.has('waterfall'), expandedGroups)
    );
  }

  return sections;
}

/**
 * Group work items by type
 */
export function groupByType(items: WorkItem[]): Record<string, WorkItem[]> {
  return items.reduce(
    (acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item);
      return acc;
    },
    {} as Record<string, WorkItem[]>
  );
}

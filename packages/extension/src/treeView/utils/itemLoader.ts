/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 * 
 * Item loader - Filesystem operations for loading work items
 */

import * as vscode from 'vscode';
import { TYPE_TO_DIRECTORY, type WorkItem } from '../types.js';

/**
 * Load full item data from individual JSON file (includes linked_items)
 * Used for hierarchical view to get relationship data
 */
export async function loadItemWithLinks(
  workspaceRoot: vscode.Uri,
  itemId: string
): Promise<WorkItem | null> {
  try {
    // Parse item type from ID (e.g., "EPIC-001" -> "epic")
    const match = itemId.match(/^(EPIC|STORY|TASK|REQ|FEAT|BUG|SPIKE|TEST)-(\d+)$/);
    if (!match) return null;

    const typeMap: Record<string, string> = {
      EPIC: 'epic',
      STORY: 'story',
      TASK: 'task',
      REQ: 'requirement',
      FEAT: 'feature',
      BUG: 'bug',
      SPIKE: 'spike',
      TEST: 'test',
    };

    const itemType = typeMap[match[1]];
    if (!itemType) return null;

    const typeDir = TYPE_TO_DIRECTORY[itemType];
    if (!typeDir) return null;

    // Read full JSON file (TYPE_TO_DIRECTORY already includes 'items/' prefix)
    const itemPath = vscode.Uri.joinPath(
      workspaceRoot,
      '.devsteps',
      typeDir,
      `${itemId}.json`
    );
    const itemData = await vscode.workspace.fs.readFile(itemPath);
    const item = JSON.parse(Buffer.from(itemData).toString('utf-8'));

    return item as WorkItem;
  } catch (error) {
    console.error(`Failed to load item ${itemId}:`, error);
    return null;
  }
}

/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Core archive and purge operations
 * Moves items to .devsteps/archive/ and updates the distributed index.
 */

import { existsSync, mkdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import type { ItemStatus, ItemType } from '../schemas/index.js';
import { getCurrentTimestamp, parseItemId, TYPE_TO_DIRECTORY } from '../utils/index.js';
import { getItem } from './get.js';
import { removeItemFromIndex } from './index-refs.js';
import { listItems } from './list.js';
export interface ArchiveItemResult {
  itemId: string;
  archivedAt: string;
  originalStatus: ItemStatus;
}

/**
 * Core business logic for archiving a single item
 */
export async function archiveItem(devstepsDir: string, itemId: string): Promise<ArchiveItemResult> {
  if (!existsSync(devstepsDir)) {
    throw new Error('Project not initialized. Run devsteps-init first.');
  }

  const parsed = parseItemId(itemId);
  if (!parsed) {
    throw new Error(`Invalid item ID: ${itemId}`);
  }

  const typeFolder = TYPE_TO_DIRECTORY[parsed.type];
  const metadataPath = join(devstepsDir, typeFolder, `${itemId}.json`);
  const descriptionPath = join(devstepsDir, typeFolder, `${itemId}.md`);

  if (!existsSync(metadataPath)) {
    throw new Error(`Item not found: ${itemId}`);
  }

  // Read metadata
  const { metadata } = await getItem(devstepsDir, itemId);
  const originalStatus = metadata.status;

  // Create archive directory if not exists
  const archiveDir = join(devstepsDir, 'archive', typeFolder);
  mkdirSync(archiveDir, { recursive: true });

  // Move files to archive
  const archiveMetadataPath = join(archiveDir, `${itemId}.json`);
  const archiveDescriptionPath = join(archiveDir, `${itemId}.md`);

  renameSync(metadataPath, archiveMetadataPath);
  if (existsSync(descriptionPath)) {
    renameSync(descriptionPath, archiveDescriptionPath);
  }

  // Update index (auto-migration ensures refs-style always available)
  // Remove from all indexes (by-type, by-status, by-priority)
  removeItemFromIndex(devstepsDir, itemId, metadata.type, metadata.status, metadata.eisenhower);

  // Note: refs-style doesn't track archived_items in index
  // Archive metadata already contains all needed info

  return {
    itemId,
    archivedAt: getCurrentTimestamp(),
    originalStatus,
  };
}

export interface PurgeItemsArgs {
  status?: ItemStatus[];
  type?: string;
  olderThan?: Date;
}

export interface PurgeItemsResult {
  count: number;
  archivedIds: string[];
}

/**
 * Core business logic for bulk archiving items
 */
export async function purgeItems(
  devstepsDir: string,
  args: PurgeItemsArgs = {}
): Promise<PurgeItemsResult> {
  if (!existsSync(devstepsDir)) {
    throw new Error('Project not initialized. Run devsteps-init first.');
  }

  // Collect candidate items using the refs-style index (via listItems).
  // listItems() handles both legacy index.json and the current directory-based index.
  const statusFilter: ItemStatus[] = args.status ?? ['done', 'cancelled'];
  const seen = new Set<string>();
  const candidates: Array<{ id: string; updated: string }> = [];

  for (const status of statusFilter) {
    const result = await listItems(devstepsDir, {
      status,
      type: args.type ? (args.type as ItemType) : undefined,
    });
    for (const item of result.items) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        candidates.push({ id: item.id, updated: item.updated });
      }
    }
  }

  // Apply optional date filter
  const itemsToArchive =
    args.olderThan != null
      ? candidates.filter((i) => new Date(i.updated) < (args.olderThan as Date))
      : candidates;

  // Archive each item
  const archivedIds: string[] = [];
  for (const item of itemsToArchive) {
    try {
      await archiveItem(devstepsDir, item.id);
      archivedIds.push(item.id);
    } catch (error) {
      // Continue with next item on error
      console.error(`Failed to archive ${item.id}:`, error);
    }
  }

  return {
    count: archivedIds.length,
    archivedIds,
  };
}

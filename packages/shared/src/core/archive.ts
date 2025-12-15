import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DevStepsIndex, ItemStatus } from '../schemas/index.js';
import { TYPE_TO_DIRECTORY, getCurrentTimestamp, parseItemId } from '../utils/index.js';import { hasRefsStyleIndex, removeItemFromIndex } from './index-refs.js';
import { getItem } from './get.js';
export interface ArchiveItemResult {
  itemId: string;
  archivedAt: string;
  originalStatus: ItemStatus;
}

/**
 * Core business logic for archiving a single item
 */
export async function archiveItem(devstepsir: string, itemId: string): Promise<ArchiveItemResult> {
  if (!existsSync(devstepsir)) {
    throw new Error('Project not initialized. Run devsteps-init first.');
  }

  const parsed = parseItemId(itemId);
  if (!parsed) {
    throw new Error(`Invalid item ID: ${itemId}`);
  }

  const typeFolder = TYPE_TO_DIRECTORY[parsed.type];
  const metadataPath = join(devstepsir, typeFolder, `${itemId}.json`);
  const descriptionPath = join(devstepsir, typeFolder, `${itemId}.md`);

  if (!existsSync(metadataPath)) {
    throw new Error(`Item not found: ${itemId}`);
  }

  // Read metadata
  const { metadata } = await getItem(devstepsir, itemId);
  const originalStatus = metadata.status;

  // Create archive directory if not exists
  const archiveDir = join(devstepsir, 'archive', typeFolder);
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
  removeItemFromIndex(
    devstepsir,
    itemId,
    metadata.type,
    metadata.status,
    metadata.eisenhower,
  );
  
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
  devstepsir: string,
  args: PurgeItemsArgs = {}
): Promise<PurgeItemsResult> {
  if (!existsSync(devstepsir)) {
    throw new Error('Project not initialized. Run devsteps-init first.');
  }

  const indexPath = join(devstepsir, 'index.json');
  const index: DevStepsIndex = JSON.parse(readFileSync(indexPath, 'utf-8'));

  // Find items to archive
  let itemsToArchive = [...index.items];

  // Filter by status (default: done, cancelled)
  const statusFilter = args.status || ['done', 'cancelled'];
  itemsToArchive = itemsToArchive.filter((i) => statusFilter.includes(i.status));

  // Filter by type
  if (args.type) {
    itemsToArchive = itemsToArchive.filter((i) => i.type === args.type);
  }

  // Filter by date
  if (args.olderThan) {
    const cutoffDate = args.olderThan;
    itemsToArchive = itemsToArchive.filter((i) => {
      const updated = new Date(i.updated);
      return updated < cutoffDate;
    });
  }

  // Archive each item
  const archivedIds: string[] = [];
  for (const item of itemsToArchive) {
    try {
      await archiveItem(devstepsir, item.id);
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

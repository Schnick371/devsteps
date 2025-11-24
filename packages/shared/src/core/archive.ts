import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DevCrumbsIndex, ItemStatus } from '../schemas/index.js';
import { TYPE_TO_DIRECTORY, getCurrentTimestamp, parseItemId } from '../utils/index.js';

export interface ArchiveItemResult {
  itemId: string;
  archivedAt: string;
  originalStatus: ItemStatus;
}

/**
 * Core business logic for archiving a single item
 */
export async function archiveItem(devcrumbsDir: string, itemId: string): Promise<ArchiveItemResult> {
  if (!existsSync(devcrumbsDir)) {
    throw new Error('Project not initialized. Run devcrumbs-init first.');
  }

  const parsed = parseItemId(itemId);
  if (!parsed) {
    throw new Error(`Invalid item ID: ${itemId}`);
  }

  const typeFolder = TYPE_TO_DIRECTORY[parsed.type];
  const metadataPath = join(devcrumbsDir, typeFolder, `${itemId}.json`);
  const descriptionPath = join(devcrumbsDir, typeFolder, `${itemId}.md`);

  if (!existsSync(metadataPath)) {
    throw new Error(`Item not found: ${itemId}`);
  }

  // Read metadata
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
  const originalStatus = metadata.status;

  // Create archive directory if not exists
  const archiveDir = join(devcrumbsDir, 'archive', typeFolder);
  mkdirSync(archiveDir, { recursive: true });

  // Move files to archive
  const archiveMetadataPath = join(archiveDir, `${itemId}.json`);
  const archiveDescriptionPath = join(archiveDir, `${itemId}.md`);

  renameSync(metadataPath, archiveMetadataPath);
  if (existsSync(descriptionPath)) {
    renameSync(descriptionPath, archiveDescriptionPath);
  }

  // Update index
  const indexPath = join(devcrumbsDir, 'index.json');
  const index: DevCrumbsIndex = JSON.parse(readFileSync(indexPath, 'utf-8'));

  // Remove from items
  const itemIndex = index.items.findIndex((i) => i.id === itemId);
  if (itemIndex !== -1) {
    index.items.splice(itemIndex, 1);
  }

  // Add to archived_items
  const archivedAt = getCurrentTimestamp();
  index.archived_items = index.archived_items || [];
  index.archived_items.push({
    id: itemId,
    type: parsed.type,
    title: metadata.title,
    archived_at: archivedAt,
    original_status: originalStatus,
  });

  // Update stats
  if (index.stats) {
    index.stats.total = index.items.length;
    index.stats.by_status[originalStatus] = Math.max(
      (index.stats.by_status[originalStatus] || 1) - 1,
      0
    );
    index.stats.archived = (index.stats.archived || 0) + 1;
  }

  index.last_updated = archivedAt;
  writeFileSync(indexPath, JSON.stringify(index, null, 2));

  return {
    itemId,
    archivedAt,
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
  devcrumbsDir: string,
  args: PurgeItemsArgs = {}
): Promise<PurgeItemsResult> {
  if (!existsSync(devcrumbsDir)) {
    throw new Error('Project not initialized. Run devcrumbs-init first.');
  }

  const indexPath = join(devcrumbsDir, 'index.json');
  const index: DevCrumbsIndex = JSON.parse(readFileSync(indexPath, 'utf-8'));

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
      await archiveItem(devcrumbsDir, item.id);
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

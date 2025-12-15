import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ItemMetadata, ItemStatus } from '../schemas/index.js';
import { getCurrentTimestamp } from '../utils/index.js';
import { updateItem } from './update.js';
import { getItem } from './get.js';

export interface BulkUpdateResult {
  success: string[];
  failed: Array<{ id: string; error: string }>;
  total: number;
}

/**
 * Bulk update multiple items at once
 * @param devstepsir Path to .devsteps directory
 * @param itemIds Array of item IDs to update
 * @param updates Partial item metadata to apply to all items
 * @returns Result with success and failure lists
 */
export async function bulkUpdateItems(
  devstepsir: string,
  itemIds: string[],
  updates: Partial<ItemMetadata>
): Promise<BulkUpdateResult> {
  const result: BulkUpdateResult = {
    success: [],
    failed: [],
    total: itemIds.length,
  };

  for (const id of itemIds) {
    try {
      await updateItem(devstepsir, {
        id,
        ...updates,
      });
      result.success.push(id);
    } catch (error) {
      result.failed.push({
        id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return result;
}

/**
 * Bulk add tags to multiple items
 * @param devstepsir Path to .devsteps directory
 * @param itemIds Array of item IDs
 * @param tagsToAdd Tags to add
 * @returns Result with success and failure lists
 */
export async function bulkAddTags(
  devstepsir: string,
  itemIds: string[],
  tagsToAdd: string[]
): Promise<BulkUpdateResult> {
  const result: BulkUpdateResult = {
    success: [],
    failed: [],
    total: itemIds.length,
  };

  for (const id of itemIds) {
    try {
      const { type, folder } = await import('../utils/index.js').then((m) => ({
        type: m.parseItemId(id)?.type,
        folder: m.TYPE_TO_DIRECTORY[m.parseItemId(id)?.type || 'task'],
      }));

      if (!type) {
        throw new Error(`Invalid item ID: ${id}`);
      }

      const metadataPath = join(devstepsir, folder, `${id}.json`);
      if (!existsSync(metadataPath)) {
        throw new Error(`Item ${id} not found`);
      }

      const { metadata } = await getItem(devstepsir, id);

      // Add new tags (avoid duplicates)
      const existingTags = new Set(metadata.tags);
      for (const tag of tagsToAdd) {
        existingTags.add(tag);
      }

      metadata.tags = Array.from(existingTags);
      metadata.updated = getCurrentTimestamp();

      writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      // Update index
      const indexPath = join(devstepsir, 'index.json');
      const index = JSON.parse(readFileSync(indexPath, 'utf-8'));
      const itemIndex = index.items.findIndex((i: { id: string }) => i.id === id);
      if (itemIndex >= 0) {
        index.items[itemIndex].updated = metadata.updated;
      }
      index.last_updated = getCurrentTimestamp();
      writeFileSync(indexPath, JSON.stringify(index, null, 2));

      result.success.push(id);
    } catch (error) {
      result.failed.push({
        id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return result;
}

/**
 * Bulk remove tags from multiple items
 * @param devstepsir Path to .devsteps directory
 * @param itemIds Array of item IDs
 * @param tagsToRemove Tags to remove
 * @returns Result with success and failure lists
 */
export async function bulkRemoveTags(
  devstepsir: string,
  itemIds: string[],
  tagsToRemove: string[]
): Promise<BulkUpdateResult> {
  const result: BulkUpdateResult = {
    success: [],
    failed: [],
    total: itemIds.length,
  };

  for (const id of itemIds) {
    try {
      const { type, folder } = await import('../utils/index.js').then((m) => ({
        type: m.parseItemId(id)?.type,
        folder: m.TYPE_TO_DIRECTORY[m.parseItemId(id)?.type || 'task'],
      }));

      if (!type) {
        throw new Error(`Invalid item ID: ${id}`);
      }

      const metadataPath = join(devstepsir, folder, `${id}.json`);
      if (!existsSync(metadataPath)) {
        throw new Error(`Item ${id} not found`);
      }

      const { metadata } = await getItem(devstepsir, id);

      // Remove tags
      metadata.tags = metadata.tags.filter((tag) => !tagsToRemove.includes(tag));
      metadata.updated = getCurrentTimestamp();

      writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      // Update index
      const indexPath = join(devstepsir, 'index.json');
      const index = JSON.parse(readFileSync(indexPath, 'utf-8'));
      const itemIndex = index.items.findIndex((i: { id: string }) => i.id === id);
      if (itemIndex >= 0) {
        index.items[itemIndex].updated = metadata.updated;
      }
      index.last_updated = getCurrentTimestamp();
      writeFileSync(indexPath, JSON.stringify(index, null, 2));

      result.success.push(id);
    } catch (error) {
      result.failed.push({
        id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return result;
}

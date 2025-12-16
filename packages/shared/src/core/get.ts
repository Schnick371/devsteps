import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ItemMetadata } from '../schemas/index.js';
import { TYPE_TO_DIRECTORY, parseItemId } from '../utils/index.js';

export interface GetItemResult {
  metadata: ItemMetadata;
  description: string;
}

/**
 * Core business logic for getting an item
 */
export async function getItem(devstepsDir: string, itemId: string): Promise<GetItemResult> {
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

  const metadata: ItemMetadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
  const description = existsSync(descriptionPath) ? readFileSync(descriptionPath, 'utf-8') : '';

  return {
    metadata,
    description,
  };
}

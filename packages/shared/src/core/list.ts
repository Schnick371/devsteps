import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  DevCrumbsIndex,
  EisenhowerQuadrant,
  ItemStatus,
  ItemType,
  Priority,
} from '../schemas/index.js';
import { TYPE_TO_DIRECTORY } from '../utils/index.js';

export interface ListItemsArgs {
  type?: ItemType;
  status?: ItemStatus;
  priority?: Priority;
  assignee?: string;
  tags?: string[];
  eisenhower?: EisenhowerQuadrant;
  limit?: number;
}

export interface ListItemsResult {
  count: number;
  items: DevCrumbsIndex['items'];
}

/**
 * Core business logic for listing items with filters
 */
export async function listItems(
  devcrumbsDir: string,
  args: ListItemsArgs = {}
): Promise<ListItemsResult> {
  if (!existsSync(devcrumbsDir)) {
    throw new Error('Project not initialized. Run devcrumbs-init first.');
  }

  const indexPath = join(devcrumbsDir, 'index.json');
  const index: DevCrumbsIndex = JSON.parse(readFileSync(indexPath, 'utf-8'));

  let items = [...index.items];

  // Apply filters
  if (args.type) {
    items = items.filter((i) => i.type === args.type);
  }

  if (args.status) {
    items = items.filter((i) => i.status === args.status);
  }

  if (args.priority) {
    items = items.filter((i) => i.priority === args.priority);
  }

  if (args.assignee) {
    // Load full metadata for assignee filter
    items = items.filter((i) => {
      const metadataPath = join(devcrumbsDir, TYPE_TO_DIRECTORY[i.type], `${i.id}.json`);
      if (!existsSync(metadataPath)) return false;
      const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
      return metadata.assignee === args.assignee;
    });
  }

  if (args.tags && args.tags.length > 0) {
    // Load full metadata for tags filter
    const filterTags = args.tags;
    items = items.filter((i) => {
      const metadataPath = join(devcrumbsDir, TYPE_TO_DIRECTORY[i.type], `${i.id}.json`);
      if (!existsSync(metadataPath)) return false;
      const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
      return filterTags.every((tag) => metadata.tags.includes(tag));
    });
  }

  if (args.eisenhower) {
    // Load full metadata for eisenhower filter
    items = items.filter((i) => {
      const metadataPath = join(devcrumbsDir, TYPE_TO_DIRECTORY[i.type], `${i.id}.json`);
      if (!existsSync(metadataPath)) return false;
      const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
      return metadata.eisenhower === args.eisenhower;
    });
  }

  // Apply limit
  if (args.limit && args.limit > 0) {
    items = items.slice(0, args.limit);
  }

  return {
    count: items.length,
    items,
  };
}

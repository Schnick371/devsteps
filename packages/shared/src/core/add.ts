import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  DevCrumbsConfig,
  DevCrumbsIndex,
  EisenhowerQuadrant,
  ItemMetadata,
  ItemType,
  Priority,
} from '../schemas/index.js';
import { TYPE_TO_DIRECTORY, generateItemId, getCurrentTimestamp } from '../utils/index.js';

export interface AddItemArgs {
  type: ItemType;
  title: string;
  description?: string;
  category?: string;
  priority?: Priority;
  tags?: string[];
  affected_paths?: string[];
  assignee?: string;
  eisenhower?: EisenhowerQuadrant;
}

export interface AddItemResult {
  itemId: string;
  metadata: ItemMetadata;
  config: DevCrumbsConfig;
}

/**
 * Core business logic for adding a new item to devcrumbs
 * Pure function that handles all file I/O and validation
 */
export async function addItem(devcrumbsDir: string, args: AddItemArgs): Promise<AddItemResult> {
  // Check if initialized
  if (!existsSync(devcrumbsDir)) {
    throw new Error('Project not initialized. Run devcrumbs-init first.');
  }

  // Read config and index
  const configPath = join(devcrumbsDir, 'config.json');
  const indexPath = join(devcrumbsDir, 'index.json');

  const config: DevCrumbsConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
  const index: DevCrumbsIndex = JSON.parse(readFileSync(indexPath, 'utf-8'));

  // Migration: Initialize counters if missing (for legacy projects)
  if (!index.counters) {
    index.counters = {};
    // Calculate existing max IDs per type
    for (const item of index.items) {
      const match = item.id.match(/-(\d+)$/);
      if (match) {
        const num = Number.parseInt(match[1], 10);
        index.counters[item.type] = Math.max(index.counters[item.type] || 0, num);
      }
    }
  }

  // Generate ID using global counter
  const typeFolder = TYPE_TO_DIRECTORY[args.type];
  const counter = (index.counters[args.type] || 0) + 1;
  const itemId = generateItemId(args.type, counter);

  // Check for duplicate ID (data integrity validation)
  const existingIds = index.items.map((i) => i.id);
  if (existingIds.includes(itemId)) {
    throw new Error(
      `Duplicate ID detected: ${itemId}. Index may be corrupted or counter was reset. Please check .devcrumbs/index.json`
    );
  }

  // Increment counter
  index.counters[args.type] = counter;

  // Create metadata
  const now = getCurrentTimestamp();
  const metadata: ItemMetadata = {
    id: itemId,
    type: args.type,
    category: args.category || 'general',
    title: args.title,
    status: 'draft',
    priority: args.priority || 'medium',
    eisenhower: args.eisenhower,
    created: now,
    updated: now,
    author: args.assignee || config.settings.default_author,
    assignee: args.assignee,
    affected_paths: args.affected_paths || [],
    linked_items: {
      implements: [],
      'implemented-by': [],
      'tested-by': [],
      tests: [],
      blocks: [],
      'blocked-by': [],
      'relates-to': [],
      'depends-on': [],
      'required-by': [],
      supersedes: [],
      'superseded-by': [],
    },
    tags: args.tags || [],
    commits: [],
    metadata: {},
  };

  // Save metadata
  const itemDir = join(devcrumbsDir, typeFolder);
  const metadataPath = join(itemDir, `${itemId}.json`);
  const descriptionPath = join(itemDir, `${itemId}.md`);

  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  // Save description
  const description =
    args.description || `# ${args.title}\n\n<!-- Add detailed description here -->\n`;
  writeFileSync(descriptionPath, description);

  // Update index
  index.items.push({
    id: itemId,
    type: args.type,
    title: args.title,
    status: 'draft',
    priority: args.priority || 'medium',
    updated: now,
  });

  index.last_updated = now;
  index.stats = index.stats || { total: 0, by_type: {}, by_status: {} };
  index.stats.total = index.items.length;
  index.stats.by_type[args.type] = (index.stats.by_type[args.type] || 0) + 1;
  index.stats.by_status.draft = (index.stats.by_status.draft || 0) + 1;

  writeFileSync(indexPath, JSON.stringify(index, null, 2));

  return {
    itemId,
    metadata,
    config,
  };
}

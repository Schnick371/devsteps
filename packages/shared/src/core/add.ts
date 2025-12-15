import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  DevStepsConfig,
  DevStepsIndex,
  EisenhowerQuadrant,
  ItemMetadata,
  ItemType,
} from '../schemas/index.js';
import {
	TYPE_TO_DIRECTORY,
	generateItemId,
	getCurrentTimestamp,
	getTypePrefix,
} from '../utils/index.js';
import {
  hasRefsStyleIndex,
  loadCounters,
  updateCounters,
  addItemToIndex,
  loadLegacyIndex,
} from './index-refs.js';
import { getConfig } from './config.js';

export interface AddItemArgs {
  type: ItemType;
  title: string;
  description?: string;
  category?: string;
  eisenhower?: EisenhowerQuadrant;
  tags?: string[];
  affected_paths?: string[];
  assignee?: string;
}

export interface AddItemResult {
  itemId: string;
  metadata: ItemMetadata;
  config: DevStepsConfig;
}

/**
 * Core business logic for adding a new item to devsteps
 * Pure function that handles all file I/O and validation
 */
export async function addItem(devstepsir: string, args: AddItemArgs): Promise<AddItemResult> {
  // Check if initialized
  if (!existsSync(devstepsir)) {
    throw new Error('Project not initialized. Run devsteps-init first.');
  }

  // Read config and index
  const config = await getConfig(devstepsir);

  // Get counter - try refs-style first, fallback to legacy
  let counter: number;
  const counterKey = getTypePrefix(args.type); // Use uppercase prefix for consistency
  
  if (hasRefsStyleIndex(devstepsir)) {
    const counters = loadCounters(devstepsir);
    counter = (counters[counterKey] || 0) + 1;
  } else {
    // Legacy index.json
    const indexPath = join(devstepsir, 'index.json');
    const index: DevStepsIndex = JSON.parse(readFileSync(indexPath, 'utf-8'));
    
    // Migration: Initialize counters if missing (for legacy projects)
    if (!index.counters) {
      index.counters = {};
      // Calculate existing max IDs per type
      for (const item of index.items) {
        const match = item.id.match(/-(\d+)$/);
        if (match) {
          const num = Number.parseInt(match[1], 10);
          const prefix = item.id.replace(/-\d+$/, ''); // Extract prefix from ID (uppercase)
          index.counters[prefix] = Math.max(index.counters[prefix] || 0, num);
        }
      }
    }
    counter = (index.counters[counterKey] || 0) + 1;
  }
  
  // Generate ID using global counter
  const typeFolder = TYPE_TO_DIRECTORY[args.type];
  const itemId = generateItemId(args.type, counter);

  // Create metadata
  const now = getCurrentTimestamp();
  const metadata: ItemMetadata = {
    id: itemId,
    type: args.type,
    category: args.category || 'general',
    title: args.title,
    status: 'draft',
    eisenhower: args.eisenhower || 'not-urgent-important',
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
  const itemDir = join(devstepsir, typeFolder);
  const metadataPath = join(itemDir, `${itemId}.json`);
  const descriptionPath = join(itemDir, `${itemId}.md`);

  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  // Save description
  const description =
    args.description || `# ${args.title}\n\n<!-- Add detailed description here -->\n`;
  writeFileSync(descriptionPath, description);

  // Update index - use refs-style if available, otherwise legacy
  if (hasRefsStyleIndex(devstepsir)) {
    // Update counters (use uppercase prefix key for consistency)
    const currentCounters = loadCounters(devstepsir);
    currentCounters[counterKey] = counter;
    updateCounters(devstepsir, currentCounters);
    
    // Add to all relevant indexes (by-type, by-status, by-priority)
    addItemToIndex(devstepsir, metadata);
  } else {
    // Legacy index.json update
    const indexPath = join(devstepsir, 'index.json');
    const index: DevStepsIndex = JSON.parse(readFileSync(indexPath, 'utf-8'));
    
    // Increment counter (use uppercase prefix key for consistency)
    if (!index.counters) index.counters = {};
    index.counters[counterKey] = counter;

    index.items.push({
      id: itemId,
      type: args.type,
      title: args.title,
      status: 'draft',
      eisenhower: args.eisenhower || 'not-urgent-important',
      updated: now,
    });

    index.last_updated = now;
    index.stats = index.stats || { total: 0, by_type: {}, by_status: {} };
    index.stats.total = index.items.length;
    index.stats.by_type[args.type] = (index.stats.by_type[args.type] || 0) + 1;
    index.stats.by_status.draft = (index.stats.by_status.draft || 0) + 1;

    writeFileSync(indexPath, JSON.stringify(index, null, 2));
  }

  return {
    itemId,
    metadata,
    config,
  };
}

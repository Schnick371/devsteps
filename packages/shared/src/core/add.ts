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
export async function addItem(devstepsDir: string, args: AddItemArgs): Promise<AddItemResult> {
  // Check if initialized
  if (!existsSync(devstepsDir)) {
    throw new Error('Project not initialized. Run devsteps-init first.');
  }

  // Read config and index
  const config = await getConfig(devstepsDir);

  // Get counter (auto-migration ensures refs-style index is always available)
  const counterKey = getTypePrefix(args.type); // Use uppercase prefix for consistency
  const counters = loadCounters(devstepsDir);
  const counter = (counters[counterKey] || 0) + 1;

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
  const itemDir = join(devstepsDir, typeFolder);
  const metadataPath = join(itemDir, `${itemId}.json`);
  const descriptionPath = join(itemDir, `${itemId}.md`);

  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  // Save description
  const description =
    args.description || `# ${args.title}\n\n<!-- Add detailed description here -->\n`;
  writeFileSync(descriptionPath, description);

  // Update index (auto-migration ensures refs-style always available)
  const currentCounters = loadCounters(devstepsDir);
  currentCounters[counterKey] = counter;
  updateCounters(devstepsDir, currentCounters);

  // Add to all relevant indexes (by-type, by-status, by-priority)
  addItemToIndex(devstepsDir, metadata);

  return {
    itemId,
    metadata,
    config,
  };
}

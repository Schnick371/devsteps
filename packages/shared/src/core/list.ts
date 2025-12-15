import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  DevStepsIndex,
  EisenhowerQuadrant,
  ItemStatus,
  ItemType,
} from '../schemas/index.js';
import { TYPE_TO_DIRECTORY } from '../utils/index.js';
import {
  hasRefsStyleIndex,
  loadIndexByType,
  loadIndexByStatus,
  loadIndexByPriority,
  loadLegacyIndex,
} from './index-refs.js';
import type { CategoryIndex } from '../types/index-refs.types.js';

export interface ListItemsArgs {
  type?: ItemType;
  status?: ItemStatus;
  eisenhower?: EisenhowerQuadrant;
  assignee?: string;
  tags?: string[];
  limit?: number;
}

export interface ListItemsResult {
  count: number;
  items: DevStepsIndex['items'];
}

/**
 * Core business logic for listing items with filters
 */
export async function listItems(
  devstepsir: string,
  args: ListItemsArgs = {}
): Promise<ListItemsResult> {
  if (!existsSync(devstepsir)) {
    throw new Error('Project not initialized. Run devsteps-init first.');
  }

  // Try new refs-style index first, fall back to legacy
  let allIndexItems: string[] = [];
  
  if (hasRefsStyleIndex(devstepsir)) {
    // Use optimized index lookups based on filter
    // For multi-dimensional filters, choose most selective index first
    if (args.status) {
      // Status index is usually most selective
      allIndexItems = loadIndexByStatus(devstepsir, args.status);
    } else if (args.type) {
      allIndexItems = loadIndexByType(devstepsir, args.type);
    } else if (args.eisenhower) {
      allIndexItems = loadIndexByPriority(devstepsir, args.eisenhower);
    } else {
      // No filter - load all via type indexes
      const allTypes: ItemType[] = ['epic', 'story', 'task', 'bug', 'spike', 'test', 'feature', 'requirement'];
      for (const type of allTypes) {
        const typeItems = loadIndexByType(devstepsir, type);
        allIndexItems.push(...typeItems);
      }
    }
  } else {
    // Legacy index.json
    const legacyIndex = loadLegacyIndex(devstepsir);
    allIndexItems = legacyIndex.items.map((item) => item.id);
  }

  // Load item metadata for filtering (now we only have IDs)
  let items: DevStepsIndex['items'] = allIndexItems
    .map((id) => {
      const typeMatch = id.match(/^([A-Z]+)-/);
      if (!typeMatch) return null;
      
      const typePrefix = typeMatch[1];
      const type = Object.entries({
        EPIC: 'epic' as const,
        STORY: 'story' as const,
        TASK: 'task' as const,
        BUG: 'bug' as const,
        SPIKE: 'spike' as const,
        TEST: 'test' as const,
        FEAT: 'feature' as const,
        REQ: 'requirement' as const,
      }).find(([prefix]) => prefix === typePrefix)?.[1];
      
      if (!type) return null;
      
      const metadataPath = join(devstepsir, TYPE_TO_DIRECTORY[type], `${id}.json`);
      if (!existsSync(metadataPath)) return null;
      
      const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
      return {
        id: metadata.id,
        type: metadata.type,
        title: metadata.title,
        status: metadata.status,
        eisenhower: metadata.eisenhower,
        updated: metadata.updated,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Apply remaining filters for multi-dimensional queries
  // (e.g., status index loaded, but need to filter by type)
  if (args.type) {
    items = items.filter((i) => i.type === args.type);
  }

  if (args.status) {
    items = items.filter((i) => i.status === args.status);
  }

  // For assignee and tags, always load full metadata
  if (args.assignee) {
    items = items.filter((i) => {
      const metadataPath = join(devstepsir, TYPE_TO_DIRECTORY[i.type], `${i.id}.json`);
      if (!existsSync(metadataPath)) return false;
      const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
      return metadata.assignee === args.assignee;
    });
  }

  if (args.tags && args.tags.length > 0) {
    const filterTags = args.tags;
    items = items.filter((i) => {
      const metadataPath = join(devstepsir, TYPE_TO_DIRECTORY[i.type], `${i.id}.json`);
      if (!existsSync(metadataPath)) return false;
      const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
      return filterTags.every((tag) => metadata.tags.includes(tag));
    });
  }

  // Apply eisenhower filter if not already done via index
  if (args.eisenhower) {
    items = items.filter((i) => {
      const metadataPath = join(devstepsir, TYPE_TO_DIRECTORY[i.type], `${i.id}.json`);
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

/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Core list-items operation
 * Queries work items with filtering by type, status, priority, and tag.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  DevStepsIndex,
  EisenhowerQuadrant,
  ItemMetadata,
  ItemStatus,
  ItemType,
} from '../schemas/index.js';
import { TYPE_TO_DIRECTORY } from '../utils/index.js';
import { getItem } from './get.js';
import {
  hasRefsStyleIndex,
  loadIndexByPriority,
  loadIndexByStatus,
  loadIndexByType,
  loadLegacyIndex,
} from './index-refs.js';

export interface ListItemsArgs {
  type?: ItemType;
  status?: ItemStatus;
  eisenhower?: EisenhowerQuadrant;
  assignee?: string;
  tags?: string[];
  limit?: number;
  archived?: boolean;
}

export interface ListItemsResult {
  count: number;
  items: DevStepsIndex['items'];
}

/**
 * List items from the archive directory
 */
async function listArchivedItems(
  devstepsDir: string,
  args: ListItemsArgs
): Promise<ListItemsResult> {
  const allTypes: ItemType[] = [
    'epic',
    'story',
    'task',
    'bug',
    'spike',
    'test',
    'feature',
    'requirement',
  ];
  const typesToScan = args.type ? [args.type] : allTypes;

  const results: DevStepsIndex['items'] = [];

  for (const type of typesToScan) {
    const archiveDir = join(devstepsDir, 'archive', TYPE_TO_DIRECTORY[type]);
    if (!existsSync(archiveDir)) continue;

    let files: string[];
    try {
      files = readdirSync(archiveDir).filter((f) => f.endsWith('.json'));
    } catch {
      continue;
    }

    for (const file of files) {
      try {
        const raw = readFileSync(join(archiveDir, file), 'utf-8');
        const metadata = JSON.parse(raw) as ItemMetadata;

        if (args.status && metadata.status !== args.status) continue;
        if (args.eisenhower && metadata.eisenhower !== args.eisenhower) continue;
        if (args.assignee && metadata.assignee !== args.assignee) continue;
        if (args.tags && args.tags.length > 0) {
          if (!args.tags.every((tag) => (metadata.tags ?? []).includes(tag))) continue;
        }

        results.push({
          id: metadata.id,
          type: metadata.type,
          title: metadata.title,
          status: metadata.status,
          eisenhower: metadata.eisenhower,
          updated: metadata.updated,
        });
      } catch {
        // Skip corrupt files
      }
    }
  }

  const limited = args.limit && args.limit > 0 ? results.slice(0, args.limit) : results;
  return { count: limited.length, items: limited };
}

/**
 * Core business logic for listing items with filters
 */
export async function listItems(
  devstepsDir: string,
  args: ListItemsArgs = {}
): Promise<ListItemsResult> {
  if (!existsSync(devstepsDir)) {
    throw new Error('Project not initialized. Run devsteps-init first.');
  }

  // Handle archived items separately
  if (args.archived) {
    return listArchivedItems(devstepsDir, args);
  }

  // Try new refs-style index first, fall back to legacy
  let allIndexItems: string[] = [];

  if (hasRefsStyleIndex(devstepsDir)) {
    // Use optimized index lookups based on filter
    // For multi-dimensional filters, choose most selective index first
    if (args.status) {
      // Status index is usually most selective
      allIndexItems = loadIndexByStatus(devstepsDir, args.status);
    } else if (args.type) {
      allIndexItems = loadIndexByType(devstepsDir, args.type);
    } else if (args.eisenhower) {
      allIndexItems = loadIndexByPriority(devstepsDir, args.eisenhower);
    } else {
      // No filter - load all via type indexes
      const allTypes: ItemType[] = [
        'epic',
        'story',
        'task',
        'bug',
        'spike',
        'test',
        'feature',
        'requirement',
      ];
      for (const type of allTypes) {
        const typeItems = loadIndexByType(devstepsDir, type);
        allIndexItems.push(...typeItems);
      }
    }
  } else {
    // Legacy index.json
    const legacyIndex = loadLegacyIndex(devstepsDir);
    allIndexItems = legacyIndex.items.map((item) => item.id);
  }

  // Load item metadata for filtering (now we only have IDs)
  const itemPromises = allIndexItems.map(async (id) => {
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

    const metadataPath = join(devstepsDir, TYPE_TO_DIRECTORY[type], `${id}.json`);
    if (!existsSync(metadataPath)) return null;

    try {
      const { metadata } = await getItem(devstepsDir, id);
      return {
        id: metadata.id,
        type: metadata.type,
        title: metadata.title,
        status: metadata.status,
        assignee: metadata.assignee,
        tags: metadata.tags,
        eisenhower: metadata.eisenhower,
        updated: metadata.updated,
      };
    } catch {
      return null;
    }
  });

  let items = (await Promise.all(itemPromises)).filter(
    (item): item is NonNullable<typeof item> => item !== null
  );

  // Apply remaining filters for multi-dimensional queries
  // (e.g., status index loaded, but need to filter by type)
  if (args.type) {
    items = items.filter((i) => i.type === args.type);
  }

  if (args.status) {
    items = items.filter((i) => i.status === args.status);
  }

  // For assignee filter
  if (args.assignee) {
    items = items.filter((i) => i.assignee === args.assignee);
  }

  // For tags filter
  if (args.tags && args.tags.length > 0) {
    const filterTags = args.tags;
    items = items.filter((i) => filterTags.every((tag) => i.tags.includes(tag)));
  }

  // Apply eisenhower filter if not already done via index
  if (args.eisenhower) {
    items = items.filter((i) => i.eisenhower === args.eisenhower);
  }

  // Apply limit
  if (args.limit && args.limit > 0) {
    items = items.slice(0, args.limit);
  }

  return {
    count: items.length,
    items: items.map((i) => ({
      id: i.id,
      type: i.type,
      title: i.title,
      status: i.status,
      eisenhower: i.eisenhower,
      updated: i.updated,
    })),
  };
}

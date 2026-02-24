/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Core update-item operation
 * Patches item metadata fields and synchronizes the distributed index.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RELATIONSHIP_TYPE, STATUS } from '../constants/index.js';
import type { EisenhowerQuadrant, ItemMetadata, ItemStatus } from '../schemas/index.js';
import { getCurrentTimestamp, normalizeMarkdown, parseItemId, TYPE_TO_DIRECTORY } from '../utils/index.js';
import { getItem } from './get.js';
import { updateItemInIndex } from './index-refs.js';

export interface UpdateItemArgs {
  id: string;
  status?: ItemStatus;
  eisenhower?: EisenhowerQuadrant;
  superseded_by?: string;
  title?: string;
  description?: string;
  append_description?: string;
  assignee?: string;
  tags?: string[];
  affected_paths?: string[];
}

export interface UpdateItemResult {
  metadata: ItemMetadata;
  oldStatus: ItemStatus;
}

/**
 * Core business logic for updating an item
 */
export async function updateItem(
  devstepsDir: string,
  args: UpdateItemArgs
): Promise<UpdateItemResult> {
  if (!existsSync(devstepsDir)) {
    throw new Error('Project not initialized. Run devsteps-init first.');
  }

  const parsed = parseItemId(args.id);
  if (!parsed) {
    throw new Error(`Invalid item ID: ${args.id}`);
  }

  const typeFolder = TYPE_TO_DIRECTORY[parsed.type];
  const metadataPath = join(devstepsDir, typeFolder, `${args.id}.json`);
  const descriptionPath = join(devstepsDir, typeFolder, `${args.id}.md`);

  if (!existsSync(metadataPath)) {
    throw new Error(`Item not found: ${args.id}`);
  }

  // Read and update metadata
  const { metadata } = await getItem(devstepsDir, args.id);
  const oldStatus = metadata.status;

  // Validate status transitions (parent-child rules)
  if (args.status === STATUS.DONE) {
    // Helper function to validate children are complete
    const validateChildren = async (
      relationshipType: typeof RELATIONSHIP_TYPE.IMPLEMENTED_BY | typeof RELATIONSHIP_TYPE.TESTED_BY
    ): Promise<void> => {
      // Guard: old-format items may lack linked_items or specific relation keys
      const children = metadata.linked_items?.[relationshipType] ?? [];
      if (children.length > 0) {
        const openChildren: string[] = [];
        for (const childId of children) {
          const childParsed = parseItemId(childId);
          if (childParsed) {
            try {
              const { metadata: childMeta } = await getItem(devstepsDir, childId);
              if (
                childMeta.status !== STATUS.DONE &&
                childMeta.status !== STATUS.CANCELLED &&
                childMeta.status !== STATUS.OBSOLETE
              ) {
                openChildren.push(childId);
              }
            } catch {
              // Child not found - skip
            }
          }
        }
        if (openChildren.length > 0) {
          const relationLabel =
            relationshipType === RELATIONSHIP_TYPE.IMPLEMENTED_BY ? 'implementation' : 'test';
          throw new Error(
            `Cannot close ${args.id}: ${openChildren.length} ${relationLabel} item(s) still open: ${openChildren.join(', ')}`
          );
        }
      }
    };

    // Validate implemented-by children (Scrum: Epic→Story/Spike, Story→Task, Bug→Task; Waterfall: Requirement→Feature/Spike, Feature→Task, Bug→Task)
    if (['epic', 'story', 'requirement', 'feature', 'bug'].includes(metadata.type)) {
      await validateChildren(RELATIONSHIP_TYPE.IMPLEMENTED_BY);
    }

    // Validate tested-by children (all parent types must have tests complete)
    if (['epic', 'story', 'requirement', 'feature'].includes(metadata.type)) {
      await validateChildren(RELATIONSHIP_TYPE.TESTED_BY);
    }
  }

  if (args.status) metadata.status = args.status;
  if (args.eisenhower) metadata.eisenhower = args.eisenhower;
  if (args.superseded_by !== undefined) metadata.superseded_by = args.superseded_by;
  if (args.title) metadata.title = args.title;
  if (args.assignee !== undefined) metadata.assignee = args.assignee;
  if (args.tags) metadata.tags = args.tags;
  if (args.affected_paths) metadata.affected_paths = args.affected_paths;

  metadata.updated = getCurrentTimestamp();

  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  // Update description
  if (args.description && args.append_description) {
    throw new Error('Cannot use both description and append_description simultaneously');
  }

  if (args.description) {
    // Replace entire description — normalize escape sequences from MCP clients (BUG-056)
    writeFileSync(descriptionPath, normalizeMarkdown(args.description));
  } else if (args.append_description) {
    // Append to existing (or create new if doesn't exist)
    const existing = existsSync(descriptionPath) ? readFileSync(descriptionPath, 'utf-8') : '';
    writeFileSync(descriptionPath, existing + normalizeMarkdown(args.append_description));
  }

  // Update index (auto-migration ensures refs-style always available)
  // Only update if status or eisenhower changed (triggers re-indexing)
  if (args.status || args.eisenhower) {
    updateItemInIndex(
      devstepsDir,
      args.id,
      oldStatus,
      args.status,
      undefined, // oldEisenhower - we don't track changes
      args.eisenhower
    );
  }

  return {
    metadata,
    oldStatus,
  };
}

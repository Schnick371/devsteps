/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handler: update
 * Patches metadata fields or applies bulk tag changes to work items.
 */

import { join } from 'node:path';
import {
  STATUS,
  bulkAddTags,
  bulkRemoveTags,
  bulkUpdateItems,
  type EisenhowerQuadrant,
  type ItemMetadata,
  type ItemStatus,
  type UpdateItemArgs,
  updateItem,
} from '@schnick371/devsteps-shared';
import { simpleGit } from 'simple-git';
import { getWorkspacePath } from '../workspace.js';

/**
 * Update one or multiple items (MCP wrapper).
 *
 * Single-item mode:  { id: string, ...fields }
 * Multi-item mode:   { ids: string[], ...fields } — applies same patch to all
 * Tag-add mode:      { id|ids, add_tags: string[] }
 * Tag-remove mode:   { id|ids, remove_tags: string[] }
 */
export default async function updateHandler(args: Record<string, unknown>) {
  try {
    const devstepsDir = join(getWorkspacePath(), '.devsteps');

    // Resolve ID(s)
    const singleId = args.id as string | undefined;
    const multiIds = args.ids as string[] | undefined;
    const ids: string[] = multiIds ?? (singleId ? [singleId] : []);

    if (ids.length === 0) {
      return { success: false, error: 'Either id or ids must be provided' };
    }

    // --- Bulk tag operations (incremental, no replacement) ---
    const addTags = args.add_tags as string[] | undefined;
    const removeTags = args.remove_tags as string[] | undefined;

    if (addTags && addTags.length > 0) {
      const result = await bulkAddTags(devstepsDir, ids, addTags);
      return {
        success: true,
        count: result.success.length,
        updated: result.success,
        failed: result.failed,
        total: result.total,
      };
    }

    if (removeTags && removeTags.length > 0) {
      const result = await bulkRemoveTags(devstepsDir, ids, removeTags);
      return {
        success: true,
        count: result.success.length,
        updated: result.success,
        failed: result.failed,
        total: result.total,
      };
    }

    // --- Multi-item patch (same fields applied to all ids) ---
    if (ids.length > 1) {
      const patch: Partial<ItemMetadata> = {};
      if (args.status !== undefined) patch.status = args.status as ItemStatus;
      if (args.assignee !== undefined) patch.assignee = args.assignee as string;
      if (args.category !== undefined) patch.category = args.category as string;
      if (args.priority !== undefined) patch.eisenhower = args.priority as EisenhowerQuadrant;

      const result = await bulkUpdateItems(devstepsDir, ids, patch);
      return {
        success: true,
        count: result.success.length,
        updated: result.success,
        failed: result.failed,
        total: result.total,
      };
    }

    // --- Single-item update (full field support) ---

    // Validation: Cannot use both description flags
    if (args.description && args.append_description) {
      throw new Error('Cannot specify both description and append_description simultaneously');
    }

    // Map external 'priority' parameter → internal 'eisenhower' field
    const mappedArgs: UpdateItemArgs = {
      id: ids[0],
      status: args.status as ItemStatus | undefined,
      title: args.title as string | undefined,
      eisenhower: args.priority as EisenhowerQuadrant | undefined,
      assignee: args.assignee as string | undefined,
      tags: args.tags as string[] | undefined,
      affected_paths: args.affected_paths as string[] | undefined,
      superseded_by: args.superseded_by as string | undefined,
      description: args.description as string | undefined,
      append_description: args.append_description as string | undefined,
    };
    const result = await updateItem(devstepsDir, mappedArgs);

    // Git hints (MCP-specific presentation)
    let gitHint = '';
    try {
      const git = simpleGit(getWorkspacePath());
      const isRepo = await git.checkIsRepo();

      if (isRepo && args.status === STATUS.DONE) {
        gitHint = `\n\n💡 Git Hint: Task completed! Consider: git add . && git commit -m "feat: completed ${ids[0]}"`;

        // Check if this completes any parent items
        const { getItem } = await import('@schnick371/devsteps-shared');

        for (const parentId of result.metadata.linked_items?.implements ?? []) {
          try {
            const { metadata: parentMeta } = await getItem(devstepsDir, parentId);
            const siblings = parentMeta.linked_items['implemented-by'] || [];

            // Check if all siblings are done
            let allDone = true;
            for (const siblingId of siblings) {
              try {
                const { metadata: sibMeta } = await getItem(devstepsDir, siblingId);
                if (sibMeta.status !== STATUS.DONE && sibMeta.status !== STATUS.CANCELLED) {
                  allDone = false;
                  break;
                }
              } catch {
                // Sibling not found - consider incomplete
                allDone = false;
                break;
              }
            }

            if (allDone && parentMeta.status !== STATUS.DONE) {
              gitHint += `\n💡 All implementations of ${parentId} are complete! Consider closing it.`;
            }
          } catch {
            // Parent not found - skip
          }
        }
      } else if (isRepo && args.status === STATUS.IN_PROGRESS) {
        gitHint = `\n\n💡 Git Hint: Started work on ${ids[0]}. Track progress with commits!`;
      }
    } catch {
      // Not a git repo or error checking parents
    }

    return {
      success: true,
      message: `Updated ${ids[0]}${gitHint}`,
      item: result.metadata,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

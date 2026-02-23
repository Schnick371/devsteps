import { join } from 'node:path';
import {
  type EisenhowerQuadrant,
  type ItemMetadata,
  type ItemStatus,
  bulkUpdateItems,
} from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

/**
 * Bulk update status/assignee/category/eisenhower for multiple items (MCP wrapper)
 */
export default async function bulk_updateHandler(args: {
  ids: string[];
  status?: ItemStatus;
  assignee?: string;
  category?: string;
  eisenhower?: EisenhowerQuadrant;
}) {
  try {
    const devstepsDir = join(getWorkspacePath(), '.devsteps');
    const { ids, ...rawUpdates } = args;

    // Build partial update — only include defined fields
    const patch: Partial<ItemMetadata> = {};
    if (rawUpdates.status !== undefined) patch.status = rawUpdates.status;
    if (rawUpdates.assignee !== undefined) patch.assignee = rawUpdates.assignee;
    if (rawUpdates.category !== undefined) patch.category = rawUpdates.category;
    if (rawUpdates.eisenhower !== undefined) patch.eisenhower = rawUpdates.eisenhower;

    const result = await bulkUpdateItems(devstepsDir, ids, patch);
    return {
      success: true,
      count: result.success.length,
      updated: result.success,
      failed: result.failed,
      total: result.total,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}


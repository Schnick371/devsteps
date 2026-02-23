import { join } from 'node:path';
import { bulkRemoveTags } from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

/**
 * Bulk remove tags from multiple items (MCP wrapper)
 */
export default async function bulk_tag_removeHandler(args: {
  ids: string[];
  tags: string[];
}) {
  try {
    const devstepsDir = join(getWorkspacePath(), '.devsteps');
    const result = await bulkRemoveTags(devstepsDir, args.ids, args.tags);
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

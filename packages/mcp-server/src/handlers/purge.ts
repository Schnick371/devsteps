import { join } from 'node:path';
import { getWorkspacePath } from '../workspace.js';
import { type PurgeItemsArgs, purgeItems } from '@schnick371/devsteps-shared';

/**
 * Bulk archive items (MCP wrapper)
 */
export default async function purgeHandler(args: PurgeItemsArgs) {
  const devstepsDir = join(getWorkspacePath(), '.devsteps');
  const result = await purgeItems(devstepsDir, args);

  return {
    success: true,
    message: `Archived ${result.count} item(s)`,
    count: result.count,
    archived_ids: result.archivedIds,
  };
}

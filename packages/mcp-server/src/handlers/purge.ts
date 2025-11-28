import { type PurgeItemsArgs, purgeItems } from '@schnick371/devsteps-shared';
import { getDevStepsDir } from '../workspace.js';

/**
 * Bulk archive items with filters (MCP wrapper)
 */
export default async function purgeHandler(args: PurgeItemsArgs) {
  const devstepsDir = getDevStepsDir();
  const result = await purgeItems(devstepsDir, args);

  return {
    success: true,
    message: `Archived ${result.count} item(s)`,
    count: result.count,
    archived_ids: result.archivedIds,
  };
}

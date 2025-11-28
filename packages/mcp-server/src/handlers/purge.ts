import { join } from 'node:path';
import { type PurgeItemsArgs, purgeItems } from '@schnick371/devsteps-shared';

/**
 * Bulk archive items (MCP wrapper)
 */
export default async function purgeHandler(args: PurgeItemsArgs) {
  const devstepsDir = join(process.cwd(), '.devsteps');
  const result = await purgeItems(devstepsDir, args);

  return {
    success: true,
    message: `Archived ${result.count} item(s)`,
    count: result.count,
    archived_ids: result.archivedIds,
  };
}

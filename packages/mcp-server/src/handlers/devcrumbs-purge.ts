import { join } from 'node:path';
import { type PurgeItemsArgs, purgeItems } from '@devcrumbs/shared';

/**
 * Bulk archive items (MCP wrapper)
 */
export default async function purgeHandler(args: PurgeItemsArgs) {
  const devcrumbsDir = join(process.cwd(), '.devcrumbs');
  const result = await purgeItems(devcrumbsDir, args);

  return {
    success: true,
    message: `Archived ${result.count} item(s)`,
    count: result.count,
    archived_ids: result.archivedIds,
  };
}

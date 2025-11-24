import { join } from 'node:path';
import { archiveItem } from '@devcrumbs/shared';

/**
 * Archive a single item (MCP wrapper)
 */
export default async function archiveHandler(args: { id: string }) {
  const devcrumbsDir = join(process.cwd(), '.devcrumbs');
  const result = await archiveItem(devcrumbsDir, args.id);

  return {
    success: true,
    message: `Archived ${result.itemId} (was ${result.originalStatus})`,
    archived: {
      id: result.itemId,
      archived_at: result.archivedAt,
      original_status: result.originalStatus,
    },
  };
}

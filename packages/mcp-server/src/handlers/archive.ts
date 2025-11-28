import { archiveItem } from '@schnick371/devsteps-shared';
import { getDevStepsDir } from '../workspace.js';

/**
 * Archive a single item (MCP wrapper)
 */
export default async function archiveHandler(args: { id: string }) {
  const devstepsDir = getDevStepsDir();
  const result = await archiveItem(devstepsDir, args.id);

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

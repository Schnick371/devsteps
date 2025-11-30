import { join } from 'node:path';
import { getWorkspacePath } from '../workspace.js';
import { archiveItem } from '@schnick371/devsteps-shared';

/**
 * Archive a single item (MCP wrapper)
 */
export default async function archiveHandler(args: { id: string }) {
  const devstepsDir = join(getWorkspacePath(), '.devsteps');
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

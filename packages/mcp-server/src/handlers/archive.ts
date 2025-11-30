import { join } from 'node:path';
import { getWorkspacePath } from '../workspace.js';
import { archiveItem } from '@schnick371/devsteps-shared';

/**
 * Archive a single item (MCP wrapper)
 */
export default async function archiveHandler(args: { id: string }) {
  try {
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
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

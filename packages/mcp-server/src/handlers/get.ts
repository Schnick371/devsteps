import { join } from 'node:path';
import { getItem } from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

/**
 * Get detailed information about an item (MCP wrapper)
 */
export default async function getHandler(args: { id: string }) {
  try {
    const devstepsDir = join(getWorkspacePath(), '.devsteps');
    const result = await getItem(devstepsDir, args.id);

    return {
      success: true,
      item: {
        ...result.metadata,
        description: result.description,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

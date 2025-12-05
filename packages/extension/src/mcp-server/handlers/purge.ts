import { join } from 'node:path';
import { getWorkspacePath } from '../workspace.js';
import { type PurgeItemsArgs, purgeItems } from '@schnick371/devsteps-shared';

/**
 * Bulk archive items (MCP wrapper)
 */
export default async function purgeHandler(args: PurgeItemsArgs) {
  try {
    const devstepsDir = join(getWorkspacePath(), '.devsteps');
    const result = await purgeItems(devstepsDir, args);
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

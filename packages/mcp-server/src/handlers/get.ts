import { getItem } from '@schnick371/devsteps-shared';
import { getDevStepsDir } from '../workspace.js';

/**
 * Get detailed information about an item (MCP wrapper)
 */
export default async function getHandler(args: { id: string }) {
  const devstepsDir = getDevStepsDir();
  const result = await getItem(devstepsDir, args.id);

  return {
    success: true,
    item: {
      ...result.metadata,
      description: result.description,
    },
  };
}

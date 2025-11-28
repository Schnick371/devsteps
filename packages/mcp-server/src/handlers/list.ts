import { listItems } from '@schnick371/devsteps-shared';
import { getDevStepsDir } from '../workspace.js';

/**
 * List items with optional filtering (MCP wrapper)
 */
export default async function listHandler(args: any) {
  const devstepsDir = getDevStepsDir();
  const result = await listItems(devstepsDir, args);

  return {
    success: true,
    count: result.count,
    items: result.items,
  };
}

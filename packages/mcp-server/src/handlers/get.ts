import { join } from 'node:path';
import { getItem } from '@schnick371/devsteps-shared';

/**
 * Get detailed information about an item (MCP wrapper)
 */
export default async function getHandler(args: { id: string }) {
  const devstepsDir = join(process.cwd(), '.devsteps');
  const result = await getItem(devstepsDir, args.id);

  return {
    success: true,
    item: {
      ...result.metadata,
      description: result.description,
    },
  };
}

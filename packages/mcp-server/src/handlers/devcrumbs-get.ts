import { join } from 'node:path';
import { getItem } from '@devcrumbs/shared';

/**
 * Get detailed information about an item (MCP wrapper)
 */
export default async function getHandler(args: { id: string }) {
  const devcrumbsDir = join(process.cwd(), '.devcrumbs');
  const result = await getItem(devcrumbsDir, args.id);

  return {
    success: true,
    item: {
      ...result.metadata,
      description: result.description,
    },
  };
}

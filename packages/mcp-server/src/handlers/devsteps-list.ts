import { join } from 'node:path';
import { type ListItemsArgs, listItems } from '@schnick371/devsteps-shared';

/**
 * List items with optional filtering (MCP wrapper)
 */
export default async function listHandler(args: ListItemsArgs) {
  const devcrumbsDir = join(process.cwd(), '.devsteps');
  const result = await listItems(devcrumbsDir, args);

  return {
    success: true,
    count: result.count,
    items: result.items,
  };
}

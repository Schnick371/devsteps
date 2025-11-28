import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getDevStepsDir } from '../workspace.js';

/**
 * Get project status and statistics
 */
export default async function statusHandler(args: { detailed?: boolean }) {
  const devstepsDir = getDevStepsDir();

  if (!existsSync(devstepsDir)) {
    throw new Error('Project not initialized. Run devsteps-init first.');
  }

  const configPath = join(devstepsDir, 'config.json');
  const indexPath = join(devstepsDir, 'index.json');

  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const index = JSON.parse(readFileSync(indexPath, 'utf-8'));

  // Check for stale items
  const staleItems = index.items.filter((item: any) => {
    if (item.status === 'in-progress') {
      const daysSinceUpdate =
        (Date.now() - new Date(item.updated).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate > 7;
    }
    return false;
  });

  const result: any = {
    success: true,
    project: {
      name: config.project_name,
      created: config.created,
      updated: config.updated,
    },
    stats: {
      total: index.stats.total,
      by_type: index.stats.by_type,
      by_status: index.stats.by_status,
    },
  };

  if (staleItems.length > 0) {
    result.warnings = {
      stale_items: staleItems.map((item: any) => ({
        id: item.id,
        title: item.title,
        days_since_update: Math.floor(
          (Date.now() - new Date(item.updated).getTime()) / (1000 * 60 * 60 * 24)
        ),
      })),
    };
  }

  if (args.detailed) {
    // Group items by status
    const byStatus: Record<string, any[]> = {};

    for (const item of index.items) {
      if (!byStatus[item.status]) {
        byStatus[item.status] = [];
      }
      byStatus[item.status].push(item);
    }

    result.items_by_status = byStatus;

    // Recent updates
    const recentItems = [...index.items]
      .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
      .slice(0, 10);

    result.recent_updates = recentItems;
  }

  return result;
}

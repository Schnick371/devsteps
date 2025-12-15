import { existsSync, readFileSync } from 'node:fs';
import { getWorkspacePath } from '../workspace.js';
import { join } from 'node:path';
import { STATUS, listItems } from '@schnick371/devsteps-shared';

/**
 * Get project status and statistics
 */
export default async function statusHandler(args: { detailed?: boolean }) {
  try {
    const devstepsDir = join(getWorkspacePath(), '.devsteps');

    if (!existsSync(devstepsDir)) {
      throw new Error('Project not initialized. Run devsteps-init first.');
    }

    const configPath = join(devstepsDir, 'config.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    
    // Use new index-refs API (await because it's async)
    const itemsResult = await listItems(devstepsDir, {});
    const allItems = itemsResult.items;
    
    // Calculate stats from items
    const stats = {
      total: allItems.length,
      by_type: {} as Record<string, number>,
      by_status: {} as Record<string, number>,
    };
    
    for (const item of allItems) {
      stats.by_type[item.type] = (stats.by_type[item.type] || 0) + 1;
      stats.by_status[item.status] = (stats.by_status[item.status] || 0) + 1;
    }

    // Check for stale items
    const staleItems = allItems.filter((item: any) => {
      if (item.status === STATUS.IN_PROGRESS) {
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
        total: stats.total,
        by_type: stats.by_type,
        by_status: stats.by_status,
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
      
      for (const item of allItems) {
        if (!byStatus[item.status]) {
          byStatus[item.status] = [];
        }
        byStatus[item.status].push(item);
      }      
      
      result.items_by_status = byStatus;

      // Recent updates
      const recentItems = [...allItems]
        .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
        .slice(0, 10);

      result.recent_updates = recentItems;
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

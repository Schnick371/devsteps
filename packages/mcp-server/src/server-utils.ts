/**
 * MCP Server Utilities
 *
 * Heartbeat monitoring and tool summary generation for request logging.
 */

import { getLogger } from './logger.js';

/**
 * Setup heartbeat monitoring at the given interval
 */
export function setupHeartbeat(intervalSeconds: number): void {
  setInterval(() => {
    const logger = getLogger();
    const uptime = process.uptime();
    const memory = process.memoryUsage();

    logger.info(
      {
        uptime_seconds: Math.floor(uptime),
        memory_mb: {
          rss: Math.round(memory.rss / 1024 / 1024),
          heap_used: Math.round(memory.heapUsed / 1024 / 1024),
          heap_total: Math.round(memory.heapTotal / 1024 / 1024),
        },
      },
      '💓 Server heartbeat'
    );
  }, intervalSeconds * 1000);
}

/**
 * Result type for tool operations with optional fields
 */
export interface ToolResult {
  success?: boolean;
  itemId?: string;
  count?: number;
  items?: Array<{ id: string; [key: string]: unknown }>;
  stats?: { total: number; [key: string]: unknown };
  [key: string]: unknown;
}

/**
 * Generate one-line command summary for request logging
 */
export function generateToolSummary(
  toolName: string,
  args: Record<string, unknown>,
  result: ToolResult,
  duration: number
): string {
  const durationStr = `(${duration}ms)`;

  switch (toolName) {
    case 'add':
      return `[add] Created ${result.itemId}: "${args.title}" → success ${durationStr}`;

    case 'update': {
      if (Array.isArray(args.ids)) {
        const count = (result as { count?: number })?.count ?? 0;
        const op = args.add_tags ? '+tags' : args.remove_tags ? '-tags' : 'patch';
        return `[update:batch] ${op} ${(args.ids as string[]).length} items → ${count} updated ${durationStr}`;
      }
      const changes = Object.keys(args).filter((k) => k !== 'id');
      return `[update] ${args.id} [${changes.join(', ')}] → success ${durationStr}`;
    }

    case 'get':
      return `[get] ${args.id} → success ${durationStr}`;

    case 'search': {
      const count = result.count || result.items?.length || 0;
      return `[search] "${args.query}" → ${count} results ${durationStr}`;
    }

    case 'list': {
      const itemCount = result.count || result.items?.length || 0;
      const filters = [];
      if (args.status) filters.push(`status=${args.status}`);
      if (args.type) filters.push(`type=${args.type}`);
      if (args.priority) filters.push(`priority=${args.priority}`);
      const filterStr = filters.length > 0 ? ` [${filters.join(', ')}]` : '';
      return `[list]${filterStr} → ${itemCount} items ${durationStr}`;
    }

    case 'link':
      return `[link] ${args.source_id} --${args.relation_type}--> ${args.target_id} → success ${durationStr}`;

    case 'unlink':
      return `[unlink] ${args.source_id} -/${args.relation_type}/-> ${args.target_id} → success ${durationStr}`;

    case 'status': {
      const total = result.stats?.total || 0;
      return `[status] → ${total} items ${durationStr}`;
    }

    case 'trace':
      return `[trace] ${args.id} → traced ${durationStr}`;

    case 'archive':
      return `[archive] ${args.id} → archived ${durationStr}`;

    case 'purge': {
      const purgeCount = result.count || 0;
      return `[purge] → ${purgeCount} items archived ${durationStr}`;
    }

    case 'init':
      return `[init] "${args.project_name}" → initialized ${durationStr}`;

    case 'export':
      return `[export] format=${args.format} → exported ${durationStr}`;

    case 'context': {
      const level = args.level || 'quick';
      return `[context] level=${level} → generated ${durationStr}`;
    }

    case 'health':
      return `[health] → ${result.status} ${durationStr}`;

    case 'metrics':
      return `[metrics] → collected ${durationStr}`;

    default:
      return `[${toolName}] → success ${durationStr}`;
  }
}

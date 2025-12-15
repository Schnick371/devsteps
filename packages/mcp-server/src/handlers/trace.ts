import { existsSync, readFileSync } from 'node:fs';
import { getWorkspacePath } from '../workspace.js';
import { join } from 'node:path';
import { TYPE_TO_DIRECTORY, parseItemId, getItem } from '@schnick371/devsteps-shared';

/**
 * Trace relationships for an item
 */
interface TraceNode {
  id: string;
  type: string;
  title: string;
  status: string;
  priority: string;
  relationships: Record<string, TraceNode[]>;
}

export default async function traceHandler(args: { id: string; depth?: number }) {
  try {
    const devstepsDir = join(getWorkspacePath(), '.devsteps');
    const maxDepth = args.depth || 3;

    if (!existsSync(devstepsDir)) {
      throw new Error('Project not initialized. Run devsteps-init first.');
    }

    const visited = new Set<string>();

    async function traceItem(itemId: string, currentDepth: number): Promise<TraceNode | null> {
      if (currentDepth > maxDepth || visited.has(itemId)) {
        return null;
      }

      visited.add(itemId);

      // Use shared getItem() instead of manual parsing
      try {
        const { metadata } = await getItem(devstepsDir, itemId);

      const node: TraceNode = {
        id: metadata.id,
        type: metadata.type,
        title: metadata.title,
        status: metadata.status,
        priority: metadata.eisenhower, // Use eisenhower (new field name)
        relationships: {},
      };

      // Trace linked items
      if (currentDepth < maxDepth) {
        for (const [relType, linkedIds] of Object.entries(metadata.linked_items)) {
          if (Array.isArray(linkedIds) && linkedIds.length > 0) {
            const traced = await Promise.all(
              linkedIds.map((id: string) => traceItem(id, currentDepth + 1))
            );
            node.relationships[relType] = traced.filter((item): item is TraceNode => item !== null);
          }
        }
      }

      return node;
      } catch (error) {
        // Item not found or error - skip
        return null;
      }
    }

  const tree = await traceItem(args.id, 0);

  if (!tree) {
    throw new Error(`Item not found: ${args.id}`);
  }

  return {
    success: true,
    root_id: args.id,
    max_depth: maxDepth,
    tree,
  };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

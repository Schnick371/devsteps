import { existsSync, readFileSync } from 'node:fs';
import { getWorkspacePath } from '../workspace.js';
import { join } from 'node:path';
import { TYPE_TO_DIRECTORY, parseItemId } from '@schnick371/devsteps-shared';

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

    function traceItem(itemId: string, currentDepth: number): TraceNode | null {
      if (currentDepth > maxDepth || visited.has(itemId)) {
        return null;
      }

      visited.add(itemId);

      const parsed = parseItemId(itemId);
      if (!parsed) return null;

      const typeFolder = TYPE_TO_DIRECTORY[parsed.type];
      const metadataPath = join(devstepsDir, 'items', typeFolder, `${itemId}.json`);

      if (!existsSync(metadataPath)) return null;

      const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));

      const node: TraceNode = {
        id: metadata.id,
        type: metadata.type,
        title: metadata.title,
        status: metadata.status,
        priority: metadata.priority,
        relationships: {},
      };

      // Trace linked items
      if (currentDepth < maxDepth) {
        for (const [relType, linkedIds] of Object.entries(metadata.linked_items)) {
          if (Array.isArray(linkedIds) && linkedIds.length > 0) {
            node.relationships[relType] = linkedIds
              .map((id: string) => traceItem(id, currentDepth + 1))
              .filter((item): item is TraceNode => item !== null);
          }
        }
      }

      return node;
    }

  const tree = traceItem(args.id, 0);

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

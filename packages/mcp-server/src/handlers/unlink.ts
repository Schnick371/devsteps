/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handler: unlink
 * Removes a relationship between two work items on both sides.
 */

import { join } from 'node:path';
import { type RelationType, unlinkItem } from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

/**
 * Remove a relationship between two items (MCP wrapper)
 */
export default async function unlinkHandler(args: {
  source_id: string;
  relation_type: RelationType;
  target_id: string;
}) {
  try {
    const devstepsDir = join(getWorkspacePath(), '.devsteps');
    const result = await unlinkItem(devstepsDir, {
      sourceId: args.source_id,
      relationType: args.relation_type,
      targetId: args.target_id,
    });
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

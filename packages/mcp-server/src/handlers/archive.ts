/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handler: archive
 * Archives a single work item by moving it to .devsteps/archive/.
 */

import { join } from 'node:path';
import { archiveItem } from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

/**
 * Archive a single item (MCP wrapper)
 */
export default async function archiveHandler(args: { id: string }) {
  try {
    const devstepsDir = join(getWorkspacePath(), '.devsteps');
    const result = await archiveItem(devstepsDir, args.id);

    return {
      success: true,
      message: `Archived ${result.itemId} (was ${result.originalStatus})`,
      archived: {
        id: result.itemId,
        archived_at: result.archivedAt,
        original_status: result.originalStatus,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

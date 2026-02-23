/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handler: purge
 * Bulk-archives items matching status or type filters.
 */

import { join } from 'node:path';
import { type PurgeItemsArgs, purgeItems } from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

/**
 * Bulk archive items (MCP wrapper)
 */
export default async function purgeHandler(args: PurgeItemsArgs) {
  try {
    const devstepsDir = join(getWorkspacePath(), '.devsteps');
    const result = await purgeItems(devstepsDir, args);
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

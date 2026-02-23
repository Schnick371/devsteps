/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handler: list
 * Returns work items filtered by type, status, priority, tag, or assignee.
 */

import { join } from 'node:path';
import { type ListItemsArgs, listItems } from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

/**
 * List items with optional filtering (MCP wrapper)
 */
export default async function listHandler(args: ListItemsArgs) {
  try {
    const devstepsDir = join(getWorkspacePath(), '.devsteps');
    const result = await listItems(devstepsDir, args);

    return {
      success: true,
      count: result.count,
      items: result.items,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

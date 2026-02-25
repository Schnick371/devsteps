/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handler: devsteps_context
 * Returns structured project context at quick/standard/deep level for AI agents.
 *
 * @see STORY-121 TASK-273 (standard level), TASK-276 (context_meta staleness)
 */

import path from 'node:path';
import type { ContextLevel } from '@schnick371/devsteps-shared';
import { getQuickContext, getStandardContext } from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

interface ContextArgs {
  level?: ContextLevel;
}

/**
 * Handler for devsteps_context tool
 */
export async function contextHandler(
  args: ContextArgs = {}
): Promise<{ success: boolean; context?: unknown; message?: string; error?: string }> {
  const level = args.level || 'quick';
  const cwd = getWorkspacePath();
  const devstepsDir = path.join(cwd, '.devsteps');

  try {
    let context: Awaited<ReturnType<typeof getQuickContext>>;

    if (level === 'quick') {
      context = await getQuickContext(cwd, devstepsDir);
    } else if (level === 'standard') {
      context = await getStandardContext(cwd, devstepsDir);
    } else {
      // deep level: not yet implemented, fall back to standard with a notice
      context = await getStandardContext(cwd, devstepsDir);
      context = {
        ...context,
        context_level: 'deep',
        suggestions: [
          ...(context.suggestions ?? []),
          'Deep context level returns standard context for now — full implementation pending.',
        ],
      };
    }

    // Build stale warning prefix for message field
    const staleWarning =
      context.context_meta?.is_stale
        ? ` ⚠️ PROJECT.md is ${context.context_meta.project_md_age_hours.toFixed(1)}h old — run \`devsteps context generate\` to refresh.`
        : '';

    return {
      success: true,
      context,
      message: `Retrieved ${level} context (${context.tokens_used} tokens).${staleWarning}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default contextHandler;

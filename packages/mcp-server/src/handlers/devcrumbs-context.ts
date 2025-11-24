import path from 'node:path';
import { getQuickContext } from '@devcrumbs/shared';
import type { ContextLevel } from '@devcrumbs/shared';

interface ContextArgs {
  level?: ContextLevel;
}

/**
 * Handler for devcrumbs-context tool
 */
export async function contextHandler(
  args: ContextArgs = {}
): Promise<{ success: boolean; context?: unknown; message?: string; error?: string }> {
  const level = args.level || 'quick';
  const cwd = process.cwd();
  const devcrumbsDir = path.join(cwd, '.devcrumbs');

  try {
    // Currently only quick level is implemented
    if (level !== 'quick') {
      return {
        success: false,
        error: `Context level "${level}" is not yet implemented. Currently only "quick" is available.`,
      };
    }

    const context = await getQuickContext(cwd, devcrumbsDir);

    return {
      success: true,
      context,
      message: `Retrieved ${level} context (${context.tokens_used} tokens)`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default contextHandler;

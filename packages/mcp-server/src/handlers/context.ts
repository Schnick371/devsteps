import path from 'node:path';
import { getQuickContext } from '@schnick371/devsteps-shared';
import type { ContextLevel } from '@schnick371/devsteps-shared';

interface ContextArgs {
  level?: ContextLevel;
}

/**
 * Handler for devsteps-context tool
 */
export async function contextHandler(
  args: ContextArgs = {}
): Promise<{ success: boolean; context?: unknown; message?: string; error?: string }> {
  const level = args.level || 'quick';
  const cwd = process.cwd();
  const devstepsDir = path.join(cwd, '.devsteps');

  try {
    // Currently only quick level is implemented
    if (level !== 'quick') {
      return {
        success: false,
        error: `Context level "${level}" is not yet implemented. Currently only "quick" is available.`,
      };
    }

    const context = await getQuickContext(cwd, devstepsDir);

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

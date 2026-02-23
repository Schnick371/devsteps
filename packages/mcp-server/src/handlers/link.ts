import { join } from 'node:path';
import { linkItem, type RelationType } from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

/**
 * Link two items together — delegates to shared linkItem() core function.
 * Validates methodology hierarchy rules and conflict constraints before writing.
 */
export default async function linkHandler(args: {
  source_id: string;
  relation_type: RelationType;
  target_id: string;
}) {
  try {
    const devstepsDir = join(getWorkspacePath(), '.devsteps');

    const result = await linkItem(devstepsDir, {
      sourceId: args.source_id,
      relationType: args.relation_type,
      targetId: args.target_id,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        suggestion: result.suggestion,
        validation_failed: result.validation_failed ?? false,
        source_type: result.source_type,
        target_type: result.target_type,
        relation: result.relation,
        methodology: result.methodology,
      };
    }

    return {
      success: true,
      message: result.message,
      source_id: args.source_id,
      target_id: args.target_id,
      relation: args.relation_type,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}


import { join } from 'node:path';
import {
  type AddItemArgs,
  addItem,
  type EisenhowerQuadrant,
  type ItemType,
} from '@schnick371/devsteps-shared';
import { simpleGit } from 'simple-git';
import { getWorkspacePath } from '../workspace.js';

/**
 * Add a new item to devsteps (MCP wrapper)
 */
export default async function addHandler(args: Record<string, unknown>) {
  try {
    const devstepsDir = join(getWorkspacePath(), '.devsteps');

    // Map external 'priority' parameter → internal 'eisenhower' field
    const mappedArgs: AddItemArgs = {
      type: args.type as ItemType,
      title: args.title as string,
      description: args.description as string | undefined,
      category: args.category as string | undefined,
      eisenhower: args.priority as EisenhowerQuadrant | undefined,
      tags: args.tags as string[] | undefined,
      affected_paths: args.affected_paths as string[] | undefined,
      assignee: args.assignee as string | undefined,
    };
    const result = await addItem(devstepsDir, mappedArgs);

    // Git hints (MCP-specific presentation)
    let gitHint = '';
    if (result.config.settings.git_integration) {
      try {
        const projectRoot = getWorkspacePath();
        const git = simpleGit(projectRoot);

        if (await git.checkIsRepo()) {
          const status = await git.status();
          const uncommitted = status.files.length;

          if (uncommitted > 0) {
            gitHint = `\n\n💡 Git: ${uncommitted} uncommitted changes. Commit with: git commit -am "feat: ${result.itemId} - ${args.title}"`;
          } else {
            gitHint = `\n\n💡 Git: Commit this with: git commit -am "feat: ${result.itemId} - ${args.title}"`;
          }
        }
      } catch (_error) {
        // Silently fail - not in git repo or git not available
      }
    }

    return {
      success: true,
      message: `Created ${result.itemId}: ${args.title}${gitHint}`,
      item: result.metadata,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

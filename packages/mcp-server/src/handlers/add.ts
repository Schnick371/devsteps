import { join } from 'node:path';
import { getWorkspacePath } from '../workspace.js';
import { type AddItemArgs, addItem } from '@schnick371/devsteps-shared';
import { simpleGit } from 'simple-git';

/**
 * Add a new item to devsteps (MCP wrapper)
 */
export default async function addHandler(args: AddItemArgs) {
  try {
    const devstepsDir = join(getWorkspacePath(), '.devsteps');

    // Use shared core logic
    const result = await addItem(devstepsDir, args);

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
      } catch (error) {
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
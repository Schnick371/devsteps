import { join } from 'node:path';
import { type AddItemArgs, addItem } from '@devcrumbs/shared';
import simpleGit from 'simple-git';

/**
 * Add a new item to devcrumbs (MCP wrapper)
 */
export default async function addHandler(args: AddItemArgs) {
  const devcrumbsDir = join(process.cwd(), '.devcrumbs');

  // Use shared core logic
  const result = await addItem(devcrumbsDir, args);

  // Git hints (MCP-specific presentation)
  let gitHint = '';
  if (result.config.settings.git_integration) {
    try {
      const projectRoot = process.cwd();
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
}

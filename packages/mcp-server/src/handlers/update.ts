import { join } from 'node:path';
import { type UpdateItemArgs, updateItem } from '@schnick371/devsteps-shared';
import simpleGit from 'simple-git';
import { getDevStepsDir, getWorkspaceRoot } from '../workspace.js';

/**
 * Update an existing item (MCP wrapper)
 */
export default async function updateHandler(args: UpdateItemArgs) {
  // Validation: Cannot use both description flags
  if (args.description && args.append_description) {
    throw new Error('Cannot specify both description and append_description simultaneously');
  }
  
  const devstepsDir = getDevStepsDir();
  const result = await updateItem(devstepsDir, args);

  // Git hints (MCP-specific presentation)
  let gitHint = '';
  try {
    const git = simpleGit(getWorkspaceRoot());
    const isRepo = await git.checkIsRepo();

    if (isRepo && args.status === 'done') {
      gitHint = `\n\n💡 Git Hint: Task completed! Consider: git add . && git commit -m "feat: completed ${args.id}"`;

      // Check if this completes any parent items
      const { readFileSync, existsSync } = await import('node:fs');
      const { parseItemId, TYPE_TO_DIRECTORY } = await import('@schnick371/devsteps-shared');

      for (const parentId of result.metadata.linked_items.implements) {
        const parsed = parseItemId(parentId);
        if (parsed) {
          const parentFolder = TYPE_TO_DIRECTORY[parsed.type];
          const parentPath = join(devstepsDir, parentFolder, `${parentId}.json`);
          if (existsSync(parentPath)) {
            const parentMeta = JSON.parse(readFileSync(parentPath, 'utf-8'));
            const siblings = parentMeta.linked_items['implemented-by'] || [];

            // Check if all siblings are done
            let allDone = true;
            for (const siblingId of siblings) {
              const sibParsed = parseItemId(siblingId);
              if (sibParsed) {
                const sibFolder = TYPE_TO_DIRECTORY[sibParsed.type];
                const sibPath = join(devstepsDir, sibFolder, `${siblingId}.json`);
                if (existsSync(sibPath)) {
                  const sibMeta = JSON.parse(readFileSync(sibPath, 'utf-8'));
                  if (sibMeta.status !== 'done' && sibMeta.status !== 'cancelled') {
                    allDone = false;
                    break;
                  }
                }
              }
            }

            if (allDone && parentMeta.status !== 'done') {
              gitHint += `\n💡 All implementations of ${parentId} are complete! Consider closing it.`;
            }
          }
        }
      }
    } else if (isRepo && args.status === 'in-progress') {
      gitHint = `\n\n💡 Git Hint: Started work on ${args.id}. Track progress with commits!`;
    }
  } catch {
    // Not a git repo or error checking parents
  }

  return {
    success: true,
    message: `Updated ${args.id}${gitHint}`,
    item: result.metadata,
  };
}

import { join } from 'node:path';
import { getWorkspacePath } from '../workspace.js';
import { type UpdateItemArgs, updateItem, STATUS } from '@schnick371/devsteps-shared';
import { simpleGit } from 'simple-git';

/**
 * Update an existing item (MCP wrapper)
 */
export default async function updateHandler(args: any) {
  try {
    // Validation: Cannot use both description flags
    if (args.description && args.append_description) {
      throw new Error('Cannot specify both description and append_description simultaneously');
    }

    // Map external 'priority' parameter → internal 'eisenhower' field
    const mappedArgs: UpdateItemArgs = {
      ...args,
      eisenhower: args.priority, // External API uses 'priority', internal uses 'eisenhower'
    };
    delete (mappedArgs as any).priority; // Remove external parameter

    const devstepsDir = join(getWorkspacePath(), '.devsteps');
    const result = await updateItem(devstepsDir, mappedArgs);

    // Git hints (MCP-specific presentation)
    let gitHint = '';
    try {
      const git = simpleGit(getWorkspacePath());
      const isRepo = await git.checkIsRepo();

      if (isRepo && args.status === STATUS.DONE) {
        gitHint = `\n\n💡 Git Hint: Task completed! Consider: git add . && git commit -m "feat: completed ${args.id}"`;

        // Check if this completes any parent items
        const { getItem } = await import('@schnick371/devsteps-shared');

        for (const parentId of result.metadata.linked_items.implements) {
          try {
            const { metadata: parentMeta } = await getItem(devstepsDir, parentId);
            const siblings = parentMeta.linked_items['implemented-by'] || [];

            // Check if all siblings are done
            let allDone = true;
            for (const siblingId of siblings) {
              try {
                const { metadata: sibMeta } = await getItem(devstepsDir, siblingId);
                if (sibMeta.status !== STATUS.DONE && sibMeta.status !== STATUS.CANCELLED) {
                  allDone = false;
                  break;
                }
              } catch {
                // Sibling not found - consider incomplete
                allDone = false;
                break;
              }
            }

            if (allDone && parentMeta.status !== STATUS.DONE) {
              gitHint += `\n💡 All implementations of ${parentId} are complete! Consider closing it.`;
            }
          } catch {
            // Parent not found - skip
          }
        }
      } else if (isRepo && args.status === STATUS.IN_PROGRESS) {
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
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
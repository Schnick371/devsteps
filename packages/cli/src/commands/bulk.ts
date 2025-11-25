import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  type BulkUpdateResult,
  bulkAddTags,
  bulkRemoveTags,
  bulkUpdateItems,
} from '@schnick371/devsteps-shared';
import type { ItemMetadata } from '@schnick371/devsteps-shared';
import chalk from 'chalk';
import ora from 'ora';

function getDevStepsDir(): string {
  const dir = join(process.cwd(), '.devsteps');
  if (!existsSync(dir)) {
    console.error(
      chalk.red('Error:'),
      'Project not initialized. Run',
      chalk.cyan('devcrumbs init'),
      'first.'
    );
    process.exit(1);
  }
  return dir;
}

function displayBulkResult(result: BulkUpdateResult, operation: string): void {
  console.log();
  if (result.success.length > 0) {
    console.log(chalk.green(`✓ ${operation}: ${result.success.length} item(s)`));
    for (const id of result.success) {
      console.log(chalk.gray(`  - ${id}`));
    }
  }

  if (result.failed.length > 0) {
    console.log();
    console.log(chalk.red(`✗ Failed: ${result.failed.length} item(s)`));
    for (const fail of result.failed) {
      console.log(chalk.red(`  - ${fail.id}: ${fail.error}`));
    }
  }

  console.log();
  console.log(
    chalk.gray(
      `Total: ${result.success.length} succeeded, ${result.failed.length} failed out of ${result.total}`
    )
  );
}

/**
 * Bulk update multiple items
 */
export async function bulkUpdateCommand(itemIds: string[], options: any) {
  const spinner = ora(`Updating ${itemIds.length} item(s)...`).start();

  try {
    const devcrumbsDir = getDevStepsDir();

    const updates: Partial<ItemMetadata> = {};
    if (options.status) updates.status = options.status;
    if (options.priority) updates.priority = options.priority;
    if (options.assignee) updates.assignee = options.assignee;
    if (options.category) updates.category = options.category;

    const result = await bulkUpdateItems(devcrumbsDir, itemIds, updates);

    spinner.stop();
    displayBulkResult(result, 'Updated');
  } catch (error: unknown) {
    spinner.fail('Bulk update failed');
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
    }
    process.exit(1);
  }
}

/**
 * Bulk add tags
 */
export async function bulkTagAddCommand(itemIds: string[], tags: string[]) {
  const spinner = ora(`Adding tags to ${itemIds.length} item(s)...`).start();

  try {
    const devcrumbsDir = getDevStepsDir();
    const result = await bulkAddTags(devcrumbsDir, itemIds, tags);

    spinner.stop();
    displayBulkResult(result, `Added tags: ${tags.join(', ')}`);
  } catch (error: unknown) {
    spinner.fail('Bulk tag add failed');
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
    }
    process.exit(1);
  }
}

/**
 * Bulk remove tags
 */
export async function bulkTagRemoveCommand(itemIds: string[], tags: string[]) {
  const spinner = ora(`Removing tags from ${itemIds.length} item(s)...`).start();

  try {
    const devcrumbsDir = getDevStepsDir();
    const result = await bulkRemoveTags(devcrumbsDir, itemIds, tags);

    spinner.stop();
    displayBulkResult(result, `Removed tags: ${tags.join(', ')}`);
  } catch (error: unknown) {
    spinner.fail('Bulk tag remove failed');
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
    }
    process.exit(1);
  }
}

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { archiveItem, purgeItems } from '@devcrumbs/shared';
import chalk from 'chalk';
import ora from 'ora';

function getDevCrumbsDir(): string {
  const dir = join(process.cwd(), '.devcrumbs');
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

export async function archiveCommand(id: string) {
  const spinner = ora(`Archiving ${id}...`).start();

  try {
    const devcrumbsDir = getDevCrumbsDir();
    const result = await archiveItem(devcrumbsDir, id);

    spinner.succeed(
      `Archived ${chalk.cyan(result.itemId)} (was ${chalk.gray(result.originalStatus)})`
    );
    console.log(chalk.gray('  Moved to:'), '.devcrumbs/archive/');
    console.log(chalk.gray('  Archived at:'), new Date(result.archivedAt).toLocaleString());
  } catch (error: unknown) {
    spinner.fail('Failed to archive item');
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
    }
    process.exit(1);
  }
}

export async function purgeCommand(options: { status?: string[]; type?: string }) {
  const spinner = ora('Finding items to archive...').start();

  try {
    const devcrumbsDir = getDevCrumbsDir();

    const result = await purgeItems(devcrumbsDir, {
      status: options.status as
        | ('draft' | 'planned' | 'in-progress' | 'review' | 'done' | 'blocked' | 'cancelled')[]
        | undefined,
      type: options.type,
    });

    spinner.succeed(`Archived ${chalk.cyan(result.count.toString())} item(s)`);

    if (result.count > 0) {
      console.log(chalk.gray('  Archived items:'));
      for (const itemId of result.archivedIds) {
        console.log(chalk.gray(`    - ${itemId}`));
      }
    } else {
      console.log(chalk.yellow('  No items matched the criteria'));
    }
  } catch (error: unknown) {
    spinner.fail('Failed to purge items');
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
    }
    process.exit(1);
  }
}

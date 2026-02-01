import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  checkMigrationNeeded,
  type MigrationStats,
  migrateItemsDirectory,
  needsItemsDirectoryMigration,
  performMigration,
} from '@schnick371/devsteps-shared';
import chalk from 'chalk';
import ora from 'ora';

function getDevStepsDir(): string {
  const dir = join(process.cwd(), '.devsteps');
  if (!existsSync(dir)) {
    console.error(
      chalk.red('Error:'),
      'Project not initialized. Run',
      chalk.cyan('devsteps init'),
      'first.'
    );
    process.exit(1);
  }
  return dir;
}

/**
 * Migrate command - Auto-detect and migrate legacy index to refs-style
 */
export async function migrateCommand(options: {
  check?: boolean;
  skipBackup?: boolean;
  force?: boolean;
}) {
  const devstepsDir = getDevStepsDir();

  // Check mode - dry run only
  if (options.check) {
    console.log(chalk.bold('🔍 Migration Check\n'));

    const indexResult = checkMigrationNeeded(devstepsDir);
    const itemsNeeded = needsItemsDirectoryMigration(devstepsDir);

    console.log(chalk.gray('Index Migration:'));
    console.log(
      `  Legacy index.json:  ${indexResult.hasLegacy ? chalk.green('✓') : chalk.gray('✗')}`
    );
    console.log(
      `  Refs-style index:   ${indexResult.hasRefs ? chalk.green('✓') : chalk.gray('✗')}`
    );

    if (indexResult.itemCount !== undefined) {
      console.log(`  Items to migrate:   ${chalk.cyan(indexResult.itemCount.toString())}`);
    }

    console.log();
    console.log(chalk.gray('Directory Structure:'));
    console.log(
      `  Needs items/ migration:  ${itemsNeeded ? chalk.yellow('Yes') : chalk.green('No')}`
    );

    console.log();

    if (indexResult.needed || itemsNeeded) {
      console.log(chalk.yellow('⚠️  Migration needed'));
      console.log(chalk.gray('\nRun'), chalk.cyan('devsteps migrate'), chalk.gray('to proceed'));
    } else if (indexResult.hasRefs && !itemsNeeded) {
      console.log(chalk.green('✅ Project fully migrated'));
    } else {
      console.log(chalk.gray('ℹ️  No migration needed'));
    }

    return;
  }

  // Migration mode
  const spinner = ora('Checking migration status...').start();

  try {
    const check = checkMigrationNeeded(devstepsDir);
    const itemsNeeded = needsItemsDirectoryMigration(devstepsDir);

    if (!check.needed && !itemsNeeded) {
      spinner.stop();
      console.log(chalk.green('✅ Project fully migrated (refs-style index + items/ structure)'));
      return;
    }

    // Variables for stats
    let stats: MigrationStats | undefined;
    let itemsStats: { moved: number; types: Record<string, number> } | undefined;

    // Perform index migration if needed
    if (check.needed) {
      spinner.text = 'Migrating index to refs-style...';

      stats = await performMigration(devstepsDir, {
        skipBackup: options.skipBackup,
      });

      console.log(chalk.gray(`   Index migrated: ${stats.totalItems} items`));
      if (stats.backupPath) {
        console.log(chalk.gray(`   Backup: ${stats.backupPath}`));
      }
    }

    // Perform directory structure migration if needed
    if (itemsNeeded) {
      spinner.text = 'Migrating to items/ directory structure...';

      itemsStats = migrateItemsDirectory(devstepsDir, { silent: true });

      console.log(chalk.gray(`   Moved ${itemsStats.moved} files to items/ subdirectories`));
    }

    spinner.succeed(chalk.green('✨ Migration complete!'));

    // Print summary only if we have stats
    if (stats) {
      console.log();
      console.log(chalk.bold('Migration Summary:'));
      console.log(`  Total items:  ${chalk.cyan(stats.totalItems.toString())}`);

      if (stats.backupPath) {
        console.log(chalk.gray(`  Backup:       ${stats.backupPath}`));
      }
      if (stats.archivePath) {
        console.log(chalk.gray(`  Archived:     ${stats.archivePath}`));
      }

      console.log();
      console.log(chalk.gray('By Type:'));
      for (const [type, count] of Object.entries(stats.byType)) {
        console.log(chalk.gray(`  ${type}: ${count}`));
      }

      console.log();
      console.log(chalk.gray('By Status:'));
      for (const [status, count] of Object.entries(stats.byStatus)) {
        console.log(chalk.gray(`  ${status}: ${count}`));
      }
    }

    if (itemsStats) {
      console.log();
      console.log(chalk.bold('Directory Migration:'));
      console.log(chalk.gray(`  Moved: ${itemsStats.moved} files`));
      console.log(
        chalk.gray(
          `  Types: ${Object.entries(itemsStats.types)
            .map(([k, v]) => `${k}=${v}`)
            .join(', ')}`
        )
      );
    }

    console.log();
    console.log(chalk.bold('Next Steps:'));
    console.log(chalk.gray('  1. Verify items:'), chalk.cyan('devsteps list'));
    console.log(chalk.gray('  2. Check project:'), chalk.cyan('devsteps status'));
  } catch (error: unknown) {
    spinner.fail(chalk.red('Migration failed'));

    if (error instanceof Error) {
      console.error(chalk.red(`\n${error.message}`));
    }

    console.error(
      chalk.gray('\nTip: Use'),
      chalk.cyan('devsteps migrate --check'),
      chalk.gray('to verify first')
    );
    process.exit(1);
  }
}

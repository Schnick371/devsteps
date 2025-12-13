import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
	checkMigrationNeeded,
	ensureIndexMigrated,
	getMigrationStatusMessage,
	performMigration,
	type MigrationStats,
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
			'first.',
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

		const result = checkMigrationNeeded(devstepsDir);

		console.log(chalk.gray('Status:'));
		console.log(`  Legacy index.json:  ${result.hasLegacy ? chalk.green('✓') : chalk.gray('✗')}`);
		console.log(`  Refs-style index:   ${result.hasRefs ? chalk.green('✓') : chalk.gray('✗')}`);

		if (result.itemCount !== undefined) {
			console.log(`  Items to migrate:   ${chalk.cyan(result.itemCount.toString())}`);
		}

		console.log();

		if (result.needed) {
			console.log(chalk.yellow('⚠️  Migration needed'));
			console.log(chalk.gray('\nRun'), chalk.cyan('devsteps migrate'), chalk.gray('to proceed'));
		} else if (result.hasRefs) {
			console.log(chalk.green('✅ Project already using refs-style index'));
		} else if (result.hasLegacy && result.hasRefs) {
			console.log(chalk.red('⚠️  Both index formats detected - manual cleanup needed'));
		} else {
			console.log(chalk.gray('ℹ️  No index found (new project or not initialized)'));
		}

		return;
	}

	// Migration mode
	const spinner = ora('Checking migration status...').start();

	try {
		const check = checkMigrationNeeded(devstepsDir);

		if (!check.needed) {
			spinner.stop();

			if (check.hasRefs) {
				console.log(chalk.green('✅ Project already using refs-style index'));
			} else if (check.hasLegacy && check.hasRefs) {
				console.error(chalk.red('⚠️  Both index formats detected'));
				console.error(chalk.gray('Manual cleanup required - please resolve manually'));
				process.exit(1);
			} else {
				console.log(chalk.gray('ℹ️  No migration needed'));
			}

			return;
		}

		// Perform migration
		spinner.text = 'Migrating index...';

		const stats: MigrationStats = await performMigration(devstepsDir, {
			skipBackup: options.skipBackup,
		});

		spinner.succeed(chalk.green('✨ Migration complete!'));

		// Print summary
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

		console.log();
		console.log(chalk.bold('Next Steps:'));
		console.log(chalk.gray('  1. Verify items:'), chalk.cyan('devsteps list'));
		console.log(
			chalk.gray('  2. Check project:'),
			chalk.cyan('devsteps status'),
		);
	} catch (error: unknown) {
		spinner.fail(chalk.red('Migration failed'));

		if (error instanceof Error) {
			console.error(chalk.red(`\n${error.message}`));
		}

		console.error(chalk.gray('\nTip: Use'), chalk.cyan('devsteps migrate --check'), chalk.gray('to verify first'));
		process.exit(1);
	}
}

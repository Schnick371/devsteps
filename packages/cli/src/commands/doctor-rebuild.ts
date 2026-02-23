/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * CLI doctor — index rebuild command
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { rebuildIndex } from '@schnick371/devsteps-shared';
import chalk from 'chalk';
import ora from 'ora';

export async function rebuildIndexCommand(options: { dryRun: boolean; skipConfirm: boolean }) {
  const { dryRun, skipConfirm } = options;
  console.log();
  console.log(chalk.bold.cyan('🔧 DevSteps Index Rebuild'));
  console.log();

  const devstepsDir = join(process.cwd(), '.devsteps');
  if (!existsSync(devstepsDir)) {
    console.log(chalk.red('✗ Project not initialized'));
    console.log(chalk.gray('  Run: devsteps init <project-name>'));
    console.log();
    process.exit(1);
  }

  if (!dryRun && !skipConfirm) {
    console.log(chalk.yellow('⚠️  This will rebuild the index from scratch'));
    console.log(chalk.gray('  Current index will be backed up first'));
    console.log();
    console.log(chalk.gray('  Use --yes to skip this confirmation'));
    console.log();
  }

  if (dryRun) {
    console.log(chalk.cyan('ℹ️  Dry-run mode: no changes will be made'));
    console.log();
  }

  const spinner = ora('Scanning item files...').start();
  let currentMessage = '';

  try {
    const result = await rebuildIndex(devstepsDir, {
      backup: !dryRun,
      dryRun,
      onProgress: (_current: number, _total: number, message: string) => {
        if (message !== currentMessage) { currentMessage = message; spinner.text = message; }
      },
    });

    spinner.stop();

    console.log(chalk.bold('📊 Index Analysis:'));
    console.log();
    console.log(chalk.cyan('Items:'));
    console.log(chalk.gray(`  Total found:  ${result.totalItems}`));
    console.log(chalk.gray(`  Processed:    ${result.processedItems}`));
    if (result.skippedItems > 0) console.log(chalk.yellow(`  Skipped:      ${result.skippedItems}`));
    console.log();

    console.log(chalk.cyan('By Type:'));
    for (const [type, count] of Object.entries(result.stats.byType).sort()) console.log(chalk.gray(`  ${type.padEnd(12)} ${count}`));
    console.log();

    console.log(chalk.cyan('By Status:'));
    for (const [status, count] of Object.entries(result.stats.byStatus).sort()) console.log(chalk.gray(`  ${status.padEnd(12)} ${count}`));
    console.log();

    console.log(chalk.cyan('By Priority:'));
    for (const [priority, count] of Object.entries(result.stats.byPriority).sort()) console.log(chalk.gray(`  ${priority.padEnd(30)} ${count}`));
    console.log();

    if (!dryRun) {
      if (result.backupPath) console.log(chalk.green(`✅ Backed up to: ${result.backupPath.replace(process.cwd(), '.')}`));
      console.log(chalk.green(`✅ Created ${result.filesCreated} index files`));
      console.log(chalk.green(`✅ Verified: ${result.processedItems}/${result.totalItems} items`));
      console.log();
      console.log(chalk.bold.green('✨ Index rebuild complete!'));
    } else {
      console.log(chalk.cyan('✓ Dry-run complete (no changes made)'));
    }

    if (result.errors.length > 0) {
      console.log();
      console.log(chalk.yellow.bold(`⚠️  ${result.errors.length} errors encountered:`));
      console.log();
      for (const error of result.errors.slice(0, 10)) {
        console.log(chalk.yellow(`  ${error.file.replace(process.cwd(), '.')}`));
        console.log(chalk.gray(`    ${error.error}`));
      }
      if (result.errors.length > 10) console.log(chalk.gray(`  ... and ${result.errors.length - 10} more`));
    }
    console.log();
  } catch (error) {
    spinner.stop();
    console.log(chalk.red('✗ Index rebuild failed'));
    console.log(chalk.gray(`  ${error instanceof Error ? error.message : String(error)}`));
    console.log();
    process.exit(1);
  }
}

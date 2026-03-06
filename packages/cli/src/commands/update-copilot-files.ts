/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * CLI command: update-copilot-files
 * devsteps update-copilot-files — update devsteps-managed .github Copilot files
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { updateCopilotFiles } from '@schnick371/devsteps-shared';
import chalk from 'chalk';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// dist/commands/ → packages/cli/ (two levels up)
const packageRoot = join(__dirname, '..', '..');
const packageJson = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')) as {
  version: string;
};

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

export async function updateCopilotFilesCommand(options: {
  dryRun?: boolean;
  force?: boolean;
  maxBackups?: number;
}) {
  const dryRun = options.dryRun ?? false;
  const label = dryRun ? 'Previewing Copilot file updates...' : 'Updating Copilot files...';
  const spinner = ora(label).start();

  try {
    const devstepsDir = getDevStepsDir();
    const projectPath = process.cwd();
    const sourceGithubDir = join(packageRoot, '.github');
    const targetGithubDir = join(projectPath, '.github');

    if (!existsSync(sourceGithubDir)) {
      spinner.fail('Source .github directory not found in devsteps package');
      process.exit(1);
    }

    const result = updateCopilotFiles(sourceGithubDir, targetGithubDir, devstepsDir, {
      packageVersion: packageJson.version,
      dryRun,
      force: options.force ?? false,
      maxBackups: options.maxBackups ?? 5,
    });

    if (!result.success) {
      spinner.fail(result.message);
      if (result.error) {
        console.error(chalk.red('  Error:'), result.error);
      }
      process.exit(1);
    }

    spinner.succeed(result.message);

    if (result.files.length > 0) {
      for (const f of result.files) {
        if (f.status === 'updated') {
          console.log(chalk.yellow('  ↑'), chalk.white(`.github/${f.file}`), chalk.gray(`(${f.reason ?? 'changed'})`));
        } else if (f.status === 'added') {
          console.log(chalk.green('  +'), chalk.white(`.github/${f.file}`));
        } else {
          console.log(chalk.gray('  ='), chalk.gray(`.github/${f.file}`));
        }
      }
    }

    if (result.backupDir) {
      console.log(chalk.gray('  Backup:'), result.backupDir);
    }

    if (dryRun) {
      console.log(chalk.cyan('\n  Run without --dry-run to apply changes.'));
    }
  } catch (error: unknown) {
    spinner.fail('Failed to update Copilot files');
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
    }
    process.exit(1);
  }
}

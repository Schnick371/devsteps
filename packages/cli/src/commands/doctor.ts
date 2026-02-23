/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * CLI doctor command — orchestrates health checks and index rebuild
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';
import ora from 'ora';
import {
  checkDependencies,
  checkDevStepsProject,
  checkGit,
  checkMCPConfig,
  checkNode,
  checkPackageManager,
  checkTypeScript,
  type CheckResult,
} from './doctor-checks.js';
import { runIntegrityChecks } from './doctor-integrity.js';
import { rebuildIndexCommand } from './doctor-rebuild.js';

export async function doctorCommand(options?: {
  rebuildIndex?: boolean;
  check?: boolean;
  yes?: boolean;
}) {
  const { rebuildIndex: shouldRebuild = false, check = false, yes = false } = options || {};

  if (shouldRebuild || check) {
    await rebuildIndexCommand({ dryRun: check, skipConfirm: yes });
    return;
  }

  console.log();
  console.log(chalk.bold.cyan('🏥 DevSteps Health Check'));
  console.log();

  const spinner = ora('Running diagnostics...').start();

  const checks: CheckResult[] = [
    checkNode(),
    checkPackageManager(),
    checkGit(),
    checkTypeScript(),
    checkDependencies(),
    checkDevStepsProject(),
    checkMCPConfig(),
  ];

  const devstepsDir = join(process.cwd(), '.devsteps');
  if (existsSync(devstepsDir)) {
    const integrityChecks = await runIntegrityChecks(devstepsDir);
    checks.push(...integrityChecks);
  }

  spinner.stop();

  let hasFailures = false;
  let hasWarnings = false;

  for (const check of checks) {
    const isPass = check.status === 'pass';
    const isWarn = check.status === 'warn';
    const icon = isPass ? '✓' : isWarn ? '⚠' : '✗';
    const color = isPass ? chalk.green : isWarn ? chalk.yellow : chalk.red;

    if (isWarn) hasWarnings = true;
    if (!isPass && !isWarn) hasFailures = true;

    console.log(color(`${icon} ${check.name}`));
    console.log(chalk.gray(`  ${check.message}`));
    if (check.details?.length) { for (const d of check.details) console.log(chalk.gray(`    • ${d}`)); }
    if (check.fix) console.log(chalk.cyan(`  Fix: ${check.fix}`));
    console.log();
  }

  if (hasFailures) {
    console.log(chalk.red.bold('❌ Health check failed'));
    console.log(chalk.yellow('Fix the issues above and run again'));
    process.exit(1);
  } else if (hasWarnings) {
    console.log(chalk.yellow.bold('⚠️  Health check passed with warnings'));
    console.log(chalk.gray('Consider fixing the warnings above'));
  } else {
    console.log(chalk.green.bold('✅ All checks passed!'));
    console.log(chalk.gray('Your development environment is healthy'));
  }

  console.log();
}

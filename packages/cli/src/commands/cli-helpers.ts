/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * CLI commands — shared helpers used across all command files
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { type DevStepsConfig, getConfig } from '@schnick371/devsteps-shared';
import chalk from 'chalk';

export function getDevStepsDir(): string {
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

export async function loadConfig(devstepsDir: string): Promise<DevStepsConfig> {
  return await getConfig(devstepsDir);
}

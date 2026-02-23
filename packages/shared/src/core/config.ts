/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Project configuration loader
 * Reads and validates devsteps.config.json from the .devsteps directory.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DevStepsConfig } from '../schemas/index.js';

/**
 * Core business logic for loading project configuration
 * Follows same pattern as getItem() for consistency
 */
export async function getConfig(devstepsDir: string): Promise<DevStepsConfig> {
  if (!existsSync(devstepsDir)) {
    throw new Error('Project not initialized. Run devsteps-init first.');
  }

  const configPath = join(devstepsDir, 'config.json');

  if (!existsSync(configPath)) {
    throw new Error('Configuration file not found. Project may be corrupted.');
  }

  const config: DevStepsConfig = JSON.parse(readFileSync(configPath, 'utf-8'));

  return config;
}

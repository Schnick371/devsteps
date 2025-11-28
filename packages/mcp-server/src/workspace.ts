/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 * 
 * Workspace Resolution - Finds DevSteps workspace directory
 */

import { join } from 'node:path';
import { existsSync } from 'node:fs';

/**
 * Get the workspace root directory
 * 
 * Priority order:
 * 1. DEVSTEPS_WORKSPACE environment variable (set by VS Code extension)
 * 2. process.cwd() (for CLI usage)
 * 
 * @returns Absolute path to workspace root
 */
export function getWorkspaceRoot(): string {
  // Check environment variable (set by VS Code extension)
  if (process.env.DEVSTEPS_WORKSPACE) {
    return process.env.DEVSTEPS_WORKSPACE;
  }

  // Fallback to current working directory (CLI usage)
  return process.cwd();
}

/**
 * Get the .devsteps directory path
 * 
 * @returns Absolute path to .devsteps directory
 */
export function getDevStepsDir(): string {
  return join(getWorkspaceRoot(), '.devsteps');
}

/**
 * Verify .devsteps directory exists
 * 
 * @throws Error if .devsteps directory not found
 */
export function verifyDevStepsProject(): void {
  const devstepsDir = getDevStepsDir();
  if (!existsSync(devstepsDir)) {
    throw new Error(
      'DevSteps project not initialized. ' +
      `Expected .devsteps directory at: ${devstepsDir}. ` +
      'Run "devsteps init" first or check DEVSTEPS_WORKSPACE environment variable.'
    );
  }
}

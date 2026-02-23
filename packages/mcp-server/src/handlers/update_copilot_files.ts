/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handler: update_copilot_files
 * Updates devsteps-managed GitHub Copilot files in the workspace.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { updateCopilotFiles } from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// dist/handlers/ → package root (two levels up)
const packageRoot = join(__dirname, '..', '..');
const packageJson = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')) as {
  version: string;
};

export default async function updateCopilotFilesHandler(args: {
  dry_run?: boolean;
  force?: boolean;
  max_backups?: number;
}) {
  try {
    const projectPath = getWorkspacePath();
    const sourceGithubDir = join(packageRoot, '.github');
    const targetGithubDir = join(projectPath, '.github');
    const devstepsDir = join(projectPath, '.devsteps');

    const result = updateCopilotFiles(sourceGithubDir, targetGithubDir, devstepsDir, {
      packageVersion: packageJson.version,
      dryRun: args.dry_run ?? false,
      force: args.force ?? false,
      maxBackups: args.max_backups ?? 5,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error ?? result.message,
      };
    }

    let report = result.message + '\n';

    if (result.files.length > 0) {
      report += '\nFiles:\n';
      for (const f of result.files) {
        const icon = f.status === 'updated' ? '↑' : f.status === 'added' ? '+' : '=';
        const note = f.reason ? ` (${f.reason})` : '';
        report += `  ${icon} .github/${f.file}${note}\n`;
      }
    }

    if (result.backupDir) {
      report += `\nBackup: ${result.backupDir}`;
    }

    return {
      success: true,
      message: report.trim(),
      updatedCount: result.updatedCount,
      addedCount: result.addedCount,
      skippedCount: result.skippedCount,
      backupDir: result.backupDir,
      dryRun: args.dry_run ?? false,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

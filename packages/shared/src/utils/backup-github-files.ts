/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * GitHub Copilot file backup utilities
 * Creates timestamped backups of devsteps-managed .github files before updates.
 */

import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

export interface BackupResult {
  success: boolean;
  backupDir: string;
  timestamp: string;
  fileCount: number;
  files: string[];
  error?: Error;
}

export interface BackupOptions {
  /** Maximum number of backups to retain (default: 5) */
  maxBackups?: number;
  /** DevSteps package version for manifest */
  packageVersion?: string;
  /** Skip backup entirely (dry-run / test mode) */
  skip?: boolean;
}

const DEFAULT_MAX_BACKUPS = 5;
const BACKUP_DIR_PREFIX = 'github-';

/**
 * Compute sha256 hex digest of a string.
 */
function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Format a Date as a filesystem-safe ISO timestamp: YYYY-MM-DDTHH-MM-SS
 */
function formatTimestamp(date: Date): string {
  return date
    .toISOString()
    .replace(/\.\d{3}Z$/, '')
    .replace(/:/g, '-');
}

/**
 * Collect all devsteps-managed .github files from the three subdirectories.
 * Returns an array of { rel, abs } objects where rel is the subdirectory-relative path.
 */
function collectManagedFiles(githubDir: string): Array<{ rel: string; abs: string }> {
  const subdirs = ['agents', 'instructions', 'prompts'] as const;
  const collected: Array<{ rel: string; abs: string }> = [];

  for (const sub of subdirs) {
    const dir = join(githubDir, sub);
    if (!existsSync(dir)) continue;

    const files = readdirSync(dir).filter(
      (f) => f.startsWith('devsteps') && (f.endsWith('.agent.md') || f.endsWith('.instructions.md') || f.endsWith('.prompt.md'))
    );

    for (const file of files) {
      collected.push({ rel: join(sub, file), abs: join(dir, file) });
    }
  }

  return collected;
}

/**
 * Remove oldest backup directories, keeping only `maxBackups` most recent.
 */
function pruneOldBackups(backupsRoot: string, maxBackups: number): void {
  if (!existsSync(backupsRoot)) return;

  const entries = readdirSync(backupsRoot)
    .filter((d) => d.startsWith(BACKUP_DIR_PREFIX))
    .sort(); // ISO-ish timestamps sort lexicographically

  const toRemove = entries.slice(0, Math.max(0, entries.length - maxBackups));
  for (const dir of toRemove) {
    rmSync(join(backupsRoot, dir), { recursive: true, force: true });
  }
}

/**
 * Create a timestamped backup of all devsteps-managed .github files.
 *
 * Backup location: `<devstepsDir>/backups/github-<timestamp>/`
 * A `manifest.json` is written alongside the backed-up files.
 *
 * On any error the partially-created backup directory is cleaned up
 * and `success: false` is returned — callers must abort the update.
 */
export function backupGithubFiles(
  githubDir: string,
  devstepsDir: string,
  options?: BackupOptions
): BackupResult {
  const maxBackups = options?.maxBackups ?? DEFAULT_MAX_BACKUPS;
  const packageVersion = options?.packageVersion ?? 'unknown';
  const timestamp = formatTimestamp(new Date());

  if (options?.skip) {
    return { success: true, backupDir: '', timestamp, fileCount: 0, files: [] };
  }

  const backupsRoot = join(devstepsDir, 'backups');
  const backupDir = join(backupsRoot, `${BACKUP_DIR_PREFIX}${timestamp}`);

  let partiallyCreated = false;

  try {
    const managedFiles = collectManagedFiles(githubDir);

    if (managedFiles.length === 0) {
      // Nothing to back up — not an error
      return { success: true, backupDir: '', timestamp, fileCount: 0, files: [] };
    }

    // Create backup directory structure
    mkdirSync(join(backupDir, 'agents'), { recursive: true });
    mkdirSync(join(backupDir, 'instructions'), { recursive: true });
    mkdirSync(join(backupDir, 'prompts'), { recursive: true });
    partiallyCreated = true;

    const manifestEntries: Array<{ file: string; sha256: string }> = [];
    const copiedFiles: string[] = [];

    for (const { rel, abs } of managedFiles) {
      const dest = join(backupDir, rel);
      copyFileSync(abs, dest);
      const content = readFileSync(abs, 'utf8');
      manifestEntries.push({ file: rel, sha256: sha256(content) });
      copiedFiles.push(rel);
    }

    // Write manifest
    const manifest = {
      timestamp,
      packageVersion,
      githubDir,
      files: manifestEntries,
    };
    writeFileSync(join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

    // Prune old backups AFTER successful write
    pruneOldBackups(backupsRoot, maxBackups);

    return {
      success: true,
      backupDir,
      timestamp,
      fileCount: copiedFiles.length,
      files: copiedFiles,
    };
  } catch (error) {
    // Clean up partial backup to avoid corrupted state
    if (partiallyCreated) {
      try {
        rmSync(backupDir, { recursive: true, force: true });
      } catch {
        // Best-effort cleanup — ignore secondary errors
      }
    }

    return {
      success: false,
      backupDir,
      timestamp,
      fileCount: 0,
      files: [],
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

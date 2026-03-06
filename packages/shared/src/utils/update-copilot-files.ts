/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * GitHub Copilot files update utilities
 * Compares installed devsteps-managed .github files against the package source
 * using SHA-256 hashes stored in HTML comments, then selectively updates changed
 * files after creating a timestamped backup.
 */

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { backupGithubFiles } from './backup-github-files.js';
import { injectDevstepsComment } from './init-helpers.js';

/** Regex that matches `<!-- devsteps-managed: ... | hash: sha256:<hex> ... -->` */
const MANAGED_COMMENT_RE = /<!--\s*devsteps-managed:.*?hash:\s*sha256:([0-9a-f]{64}).*?-->/;

/**
 * Extract the sha256 hash embedded in a devsteps-managed HTML comment.
 * Returns null if the file is not managed or has no hash.
 */
function extractManagedHash(content: string): string | null {
  const match = content.match(MANAGED_COMMENT_RE);
  return match ? match[1] : null;
}

/**
 * Compute sha256 of content (UTF-8) — same function used by injectDevstepsComment.
 */
function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

export interface FileUpdateStatus {
  file: string;
  status: 'updated' | 'skipped' | 'added';
  reason?: string;
}

export interface UpdateCopilotFilesResult {
  success: boolean;
  updatedCount: number;
  skippedCount: number;
  addedCount: number;
  backupDir: string;
  files: FileUpdateStatus[];
  message: string;
  error?: string;
}

export interface UpdateCopilotFilesOptions {
  /** DevSteps package version (for comment annotation) */
  packageVersion?: string;
  /** Maximum backup rotations to keep (default: 5) */
  maxBackups?: number;
  /**
   * If true, report what would change but do not write anything.
   * No backup is created in dry-run mode.
   */
  dryRun?: boolean;
  /** If true, overwrite even when hashes match (force reinstall) */
  force?: boolean;
}

interface SubdirConfig {
  sub: 'agents' | 'instructions' | 'prompts';
  suffix: string;
}

const SUBDIRS: SubdirConfig[] = [
  { sub: 'agents', suffix: '.agent.md' },
  { sub: 'instructions', suffix: '.instructions.md' },
  { sub: 'prompts', suffix: '.prompt.md' },
];

/**
 * Update all devsteps-managed .github Copilot files in a target project.
 *
 * Algorithm per source file:
 *   1. Compute sha256 of raw source content (before annotation).
 *   2. If a corresponding file exists in the target:
 *      a. Extract the stored hash from its devsteps HTML comment.
 *      b. If hashes match (and `force` is not set): skip — no change needed.
 *      c. If hashes differ: mark as "update" candidate.
 *   3. If no corresponding file exists: mark as "add" candidate.
 * After collecting candidates:
 *   4. If there are changes and not dryRun: create a backup first.
 *      Abort on backup failure (prevents partial states).
 *   5. Write each candidate with a fresh `injectDevstepsComment`.
 *
 * @param sourceGithubDir  Path to the package's bundled `.github` directory.
 * @param targetGithubDir  Path to the target project's `.github` directory.
 * @param devstepsDir      Path to the target project's `.devsteps` directory (for backups).
 * @param options          Optional settings.
 */
export function updateCopilotFiles(
  sourceGithubDir: string,
  targetGithubDir: string,
  devstepsDir: string,
  options?: UpdateCopilotFilesOptions
): UpdateCopilotFilesResult {
  const packageVersion = options?.packageVersion ?? 'unknown';
  const dryRun = options?.dryRun ?? false;
  const force = options?.force ?? false;
  const maxBackups = options?.maxBackups ?? 5;

  const fileStatuses: FileUpdateStatus[] = [];
  const updateCandidates: Array<{
    sourceFile: string;
    targetFile: string;
    rawContent: string;
    hash: string;
    rel: string;
    status: 'updated' | 'added';
  }> = [];

  // ── Phase 1: Diff source vs. target ─────────────────────────────────────────
  for (const { sub, suffix } of SUBDIRS) {
    const sourceSubDir = join(sourceGithubDir, sub);
    const targetSubDir = join(targetGithubDir, sub);

    if (!existsSync(sourceSubDir)) continue;

    const sourceFiles = readdirSync(sourceSubDir).filter(
      (f) => f.startsWith('devsteps') && f.endsWith(suffix)
    );

    for (const file of sourceFiles) {
      const sourceFile = join(sourceSubDir, file);
      const targetFile = join(targetSubDir, file);
      const rawContent = readFileSync(sourceFile, 'utf8');
      const sourceHash = sha256(rawContent);
      const rel = `${sub}/${file}`;

      if (existsSync(targetFile)) {
        const installed = readFileSync(targetFile, 'utf8');
        const installedHash = extractManagedHash(installed);

        if (!force && installedHash === sourceHash) {
          fileStatuses.push({ file: rel, status: 'skipped', reason: 'hash-match' });
          continue;
        }

        const reasonSuffix = installedHash === null
          ? 'no-marker'
          : force
            ? 'force'
            : 'hash-mismatch';
        updateCandidates.push({ sourceFile, targetFile, rawContent, hash: sourceHash, rel, status: 'updated' });
        fileStatuses.push({ file: rel, status: 'updated', reason: reasonSuffix });
      } else {
        updateCandidates.push({ sourceFile, targetFile, rawContent, hash: sourceHash, rel, status: 'added' });
        fileStatuses.push({ file: rel, status: 'added' });
      }
    }
  }

  const updatedCount = fileStatuses.filter((f) => f.status === 'updated').length;
  const skippedCount = fileStatuses.filter((f) => f.status === 'skipped').length;
  const addedCount = fileStatuses.filter((f) => f.status === 'added').length;

  // ── Phase 2: If nothing to do, return early ──────────────────────────────────
  if (updateCandidates.length === 0) {
    return {
      success: true,
      updatedCount: 0,
      skippedCount,
      addedCount: 0,
      backupDir: '',
      files: fileStatuses,
      message: `All ${skippedCount} files are up-to-date. No changes needed.`,
    };
  }

  if (dryRun) {
    const summary = [
      updatedCount > 0 ? `${updatedCount} to update` : '',
      addedCount > 0 ? `${addedCount} to add` : '',
      skippedCount > 0 ? `${skippedCount} unchanged` : '',
    ]
      .filter(Boolean)
      .join(', ');

    return {
      success: true,
      updatedCount,
      skippedCount,
      addedCount,
      backupDir: '',
      files: fileStatuses,
      message: `[dry-run] Would apply: ${summary}`,
    };
  }

  // ── Phase 3: Backup before writing ───────────────────────────────────────────
  const backupResult = backupGithubFiles(targetGithubDir, devstepsDir, {
    maxBackups,
    packageVersion,
  });

  if (!backupResult.success) {
    return {
      success: false,
      updatedCount: 0,
      skippedCount,
      addedCount: 0,
      backupDir: backupResult.backupDir,
      files: fileStatuses,
      message: 'Backup failed — update aborted to prevent partial state.',
      error: backupResult.error?.message ?? 'Unknown backup error',
    };
  }

  // ── Phase 4: Write updated files ─────────────────────────────────────────────
  try {
    for (const candidate of updateCandidates) {
      const annotated = injectDevstepsComment(candidate.rawContent, candidate.hash, packageVersion);
      writeFileSync(candidate.targetFile, annotated, 'utf8');
    }
  } catch (writeError) {
    return {
      success: false,
      updatedCount,
      skippedCount,
      addedCount,
      backupDir: backupResult.backupDir,
      files: fileStatuses,
      message: `Write error after backup. Backup preserved at: ${backupResult.backupDir}`,
      error: writeError instanceof Error ? writeError.message : String(writeError),
    };
  }

  const summary = [
    updatedCount > 0 ? `${updatedCount} updated` : '',
    addedCount > 0 ? `${addedCount} added` : '',
    skippedCount > 0 ? `${skippedCount} unchanged` : '',
  ]
    .filter(Boolean)
    .join(', ');

  return {
    success: true,
    updatedCount,
    skippedCount,
    addedCount,
    backupDir: backupResult.backupDir,
    files: fileStatuses,
    message: `Copilot files updated (${summary}).${backupResult.fileCount > 0 ? ` Backup: ${backupResult.backupDir}` : ''}`,
  };
}

/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * CLI docs subcommand — import and classify documentation files
 */

import { lstatSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { addItem, type ClassificationResult, heuristicClassify } from '@schnick371/devsteps-shared';
import chalk from 'chalk';
import ora from 'ora';
import { getDevStepsDir } from './cli-helpers.js';

const EXCERPT_LINES = 100;

interface ScanEntry {
  absolutePath: string;
  relativePath: string;
  classification: ClassificationResult;
}

/**
 * Recursively scan a directory for markdown files.
 * Security: resolve + prefix assert + symlink skip (SPIKE-043).
 */
function scanDirectory(basePath: string, rootPath: string): string[] {
  const results: string[] = [];
  const resolved = resolve(basePath);

  // Path traversal guard
  if (!resolved.startsWith(resolve(rootPath))) {
    return results;
  }

  let entries: string[];
  try {
    entries = readdirSync(resolved);
  } catch {
    return results;
  }

  for (const entry of entries) {
    const fullPath = join(resolved, entry);

    // Symlink skip
    try {
      if (lstatSync(fullPath).isSymbolicLink()) continue;
    } catch {
      continue;
    }

    const stat = lstatSync(fullPath);
    if (stat.isDirectory()) {
      // Skip hidden dirs, node_modules, .devsteps
      if (entry.startsWith('.') || entry === 'node_modules') continue;
      results.push(...scanDirectory(fullPath, rootPath));
    } else if (entry.endsWith('.md') && !entry.startsWith('.')) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Read first N lines of a file for heuristic classification.
 */
function readExcerpt(filePath: string): string {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return content.split('\n').slice(0, EXCERPT_LINES).join('\n');
  } catch {
    return '';
  }
}

/**
 * Format classification table for dry-run display.
 */
function formatTable(entries: ScanEntry[]): void {
  console.log();
  console.log(
    chalk.bold('  File'),
    ' '.repeat(38),
    chalk.bold('Type'),
    ' '.repeat(6),
    chalk.bold('Confidence'),
    '  ',
    chalk.bold('Mixed?')
  );
  console.log('  ' + '─'.repeat(90));

  for (const entry of entries.slice(0, 50)) {
    const path = entry.relativePath.padEnd(44).slice(0, 44);
    const type = entry.classification.winner.padEnd(14);
    const conf = (entry.classification.confidence * 100).toFixed(0).padStart(4) + '%';
    const mixed = entry.classification.mixed
      ? chalk.yellow(`⚠ ${entry.classification.secondType}`)
      : chalk.green('✓');

    console.log(`  ${path} ${type} ${conf}     ${mixed}`);
  }

  if (entries.length > 50) {
    console.log(chalk.gray(`  ... and ${entries.length - 50} more files`));
  }
  console.log();
}

export interface DocsImportOptions {
  yes?: boolean;
  dryRun?: boolean;
  heuristicOnly?: boolean;
}

/**
 * Main docs import command handler.
 */
export async function docsImportCommand(
  scanPath: string,
  options: DocsImportOptions
): Promise<void> {
  const spinner = ora('Scanning for markdown files...').start();

  try {
    const resolvedPath = resolve(scanPath);
    const devstepsDir = getDevStepsDir();

    // Phase 1: Scan
    const files = scanDirectory(resolvedPath, resolvedPath);

    if (files.length === 0) {
      spinner.warn('No markdown files found in ' + scanPath);
      return;
    }

    spinner.text = `Classifying ${files.length} files...`;

    // Phase 2: Classify
    const entries: ScanEntry[] = files.map((f) => {
      const excerpt = readExcerpt(f);
      return {
        absolutePath: f,
        relativePath: relative(resolvedPath, f),
        classification: heuristicClassify(excerpt, f),
      };
    });

    spinner.succeed(`Found ${entries.length} files, classified ${entries.length}`);

    // Phase 3: Dry-run display
    formatTable(entries);

    const mixedCount = entries.filter((e) => e.classification.mixed).length;
    if (mixedCount > 0) {
      console.log(
        chalk.yellow(`  ⚠ ${mixedCount} files have mixed type signals — review recommended`)
      );
      console.log(
        chalk.gray('    Use MCP prompt devsteps-docs-classify for interactive classification')
      );
      console.log();
    }

    if (options.heuristicOnly || options.dryRun) {
      console.log(chalk.gray('  Dry-run mode — no items created'));
      return;
    }

    if (!options.yes) {
      console.log(chalk.cyan(`  → Will create ${entries.length} DOC items`));
      console.log(chalk.gray('  Use --yes to skip confirmation, --dry-run to preview only'));
      return;
    }

    // Phase 4: Create DOC items
    const createSpinner = ora(`Creating ${entries.length} DOC items...`).start();
    let created = 0;

    for (const entry of entries) {
      try {
        const result = await addItem(devstepsDir, {
          type: 'doc',
          title: entry.relativePath,
          description: readFileSync(entry.absolutePath, 'utf-8'),
          tags: [
            'diataxis',
            entry.classification.winner,
            ...(entry.classification.mixed ? ['mixed-type'] : []),
          ],
        });
        created++;
        createSpinner.text = `Created ${created}/${entries.length}: ${result.itemId}`;
      } catch (error) {
        createSpinner.warn(
          `Failed to create item for ${entry.relativePath}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    createSpinner.succeed(`Created ${created} DOC items`);
  } catch (error: unknown) {
    spinner.fail('Docs import failed');
    throw error;
  }
}

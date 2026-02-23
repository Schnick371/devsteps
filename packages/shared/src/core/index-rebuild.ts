/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Index Rebuild Operations
 *
 * Rebuilds the refs-style index from source of truth (item files).
 * Scans all item directories and reconstructs index files from scratch.
 *
 * Use Cases:
 * - Index corruption recovery
 * - Manual index repair after direct file edits
 * - Migration validation
 * - Development/debugging
 *
 * @see STORY-074 Index Rebuild Command
 * @see EPIC-018 Index Architecture Refactoring
 */

import { existsSync, readdirSync, readFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import type { EisenhowerQuadrant, ItemMetadata, ItemStatus, ItemType } from '../schemas/index.js';
import { getCurrentTimestamp, TYPE_TO_DIRECTORY } from '../utils/index.js';
import {
  getIndexPaths,
  initializeRefsStyleIndex,
  updateCounters,
  updateIndexByPriority,
  updateIndexByStatus,
  updateIndexByType,
} from './index-refs.js';

/**
 * Result of index rebuild operation
 */
export interface RebuildResult {
  /** Total items found in source files */
  totalItems: number;

  /** Items processed successfully */
  processedItems: number;

  /** Items skipped due to errors */
  skippedItems: number;

  /** Files created/updated in index */
  filesCreated: number;

  /** Backup path (if backup was created) */
  backupPath?: string;

  /** Errors encountered during rebuild */
  errors: Array<{ file: string; error: string }>;

  /** Statistics per dimension */
  stats: {
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  };
}

/**
 * Options for rebuild operation
 */
export interface RebuildOptions {
  /** Create backup before rebuilding (default: true) */
  backup?: boolean;

  /** Dry-run mode: analyze but don't modify (default: false) */
  dryRun?: boolean;

  /** Progress callback for UI updates */
  onProgress?: (current: number, total: number, message: string) => void;
}

/**
 * Scan all item files and rebuild index from scratch
 *
 * Algorithm:
 * 1. Backup current index (if requested)
 * 2. Scan all .devsteps/{type}s/ directories
 * 3. Load and validate each JSON file
 * 4. Group items by type, status, eisenhower
 * 5. Write new index files
 * 6. Verify item count consistency
 *
 * @param devstepsDir Path to .devsteps directory
 * @param options Rebuild options
 * @returns Statistics about rebuild operation
 *
 * @example
 * ```typescript
 * const result = await rebuildIndex('.devsteps', { backup: true });
 * console.log(`Rebuilt index: ${result.processedItems} items`);
 * ```
 */
export async function rebuildIndex(
  devstepsDir: string,
  options: RebuildOptions = {}
): Promise<RebuildResult> {
  const { backup = true, dryRun = false, onProgress } = options;

  if (!existsSync(devstepsDir)) {
    throw new Error(`DevSteps directory not found: ${devstepsDir}`);
  }

  // Initialize result
  const result: RebuildResult = {
    totalItems: 0,
    processedItems: 0,
    skippedItems: 0,
    filesCreated: 0,
    errors: [],
    stats: {
      byType: {},
      byStatus: {},
      byPriority: {},
    },
  };

  onProgress?.(0, 100, 'Scanning item files...');

  // Step 1: Backup current index
  if (backup && !dryRun) {
    try {
      const backupPath = await backupIndexBeforeRebuild(devstepsDir);
      result.backupPath = backupPath;
      onProgress?.(10, 100, `Backed up to: ${backupPath}`);
    } catch (_error) {
      // Non-fatal: index might not exist yet
      onProgress?.(10, 100, 'No existing index to backup');
    }
  }

  // Step 2: Load all items from files
  onProgress?.(20, 100, 'Loading items from disk...');
  const items = await loadAllItemsFromFiles(devstepsDir, (error) => {
    result.errors.push(error);
    result.skippedItems++;
  });

  result.totalItems = items.length + result.skippedItems;
  result.processedItems = items.length;

  onProgress?.(50, 100, `Found ${items.length} valid items`);

  // Step 3: Group items by dimensions
  const byType = new Map<ItemType, string[]>();
  const byStatus = new Map<ItemStatus, string[]>();
  const byPriority = new Map<EisenhowerQuadrant, string[]>();

  for (const item of items) {
    // Group by type
    if (!byType.has(item.type)) {
      byType.set(item.type, []);
    }
    byType.get(item.type)?.push(item.id);

    // Group by status
    if (!byStatus.has(item.status)) {
      byStatus.set(item.status, []);
    }
    byStatus.get(item.status)?.push(item.id);

    // Group by priority
    if (!byPriority.has(item.eisenhower)) {
      byPriority.set(item.eisenhower, []);
    }
    byPriority.get(item.eisenhower)?.push(item.id);
  }

  // Calculate stats
  for (const [type, ids] of byType) {
    result.stats.byType[type] = ids.length;
  }
  for (const [status, ids] of byStatus) {
    result.stats.byStatus[status] = ids.length;
  }
  for (const [priority, ids] of byPriority) {
    result.stats.byPriority[priority] = ids.length;
  }

  if (dryRun) {
    onProgress?.(100, 100, 'Dry-run complete (no changes made)');
    return result;
  }

  // Step 4: Initialize index structure
  onProgress?.(60, 100, 'Initializing index structure...');

  // Extract counters from existing index or calculate from items
  const counters = extractCountersFromItems(items);

  initializeRefsStyleIndex(devstepsDir, counters);

  // Step 5: Write new index files
  onProgress?.(70, 100, 'Writing index files...');
  let filesWritten = 0;

  // Write type indexes
  for (const [type, ids] of byType) {
    updateIndexByType(devstepsDir, type, ids);
    filesWritten++;
  }

  // Write status indexes
  for (const [status, ids] of byStatus) {
    updateIndexByStatus(devstepsDir, status, ids);
    filesWritten++;
  }

  // Write priority indexes
  for (const [priority, ids] of byPriority) {
    updateIndexByPriority(devstepsDir, priority, ids);
    filesWritten++;
  }

  // Write counters
  updateCounters(devstepsDir, counters);
  filesWritten++;

  result.filesCreated = filesWritten;

  onProgress?.(100, 100, `Rebuild complete: ${result.processedItems} items, ${filesWritten} files`);

  return result;
}

/**
 * Scan all item files from .devsteps/items/{type}s/ directories
 *
 * If old flat structure is detected, automatically migrates to new structure first.
 *
 * @param devstepsDir Path to .devsteps directory
 * @param onError Error callback for handling corrupt files
 * @returns Array of item metadata
 */
async function loadAllItemsFromFiles(
  devstepsDir: string,
  onError?: (error: { file: string; error: string }) => void
): Promise<ItemMetadata[]> {
  // Auto-migrate if old structure detected
  const { needsItemsDirectoryMigration, migrateItemsDirectory } = await import('./auto-migrate.js');
  if (needsItemsDirectoryMigration(devstepsDir)) {
    migrateItemsDirectory(devstepsDir, { silent: true });
  }

  const items: ItemMetadata[] = [];

  // Scan each item type directory (new structure only)
  for (const [_type, directory] of Object.entries(TYPE_TO_DIRECTORY)) {
    const dirPath = join(devstepsDir, directory);

    if (!existsSync(dirPath)) {
      continue; // Skip missing directories (empty projects)
    }

    try {
      const files = readdirSync(dirPath);

      for (const file of files) {
        // Only process JSON metadata files
        if (!file.endsWith('.json')) {
          continue;
        }

        const filePath = join(dirPath, file);

        try {
          const item = await loadItemMetadata(filePath);
          items.push(item);
        } catch (error) {
          // Handle corrupt/invalid files
          onError?.({
            file: filePath,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    } catch (error) {
      // Handle directory read errors
      onError?.({
        file: dirPath,
        error: `Failed to read directory: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  return items;
}

/**
 * Load item metadata from JSON file
 *
 * @param filePath Absolute path to item JSON file
 * @returns Item metadata
 */
async function loadItemMetadata(filePath: string): Promise<ItemMetadata> {
  const content = readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);

  // Validate required fields
  if (!data.id || !data.type || !data.status) {
    throw new Error(`Invalid item metadata: missing required fields (id, type, status)`);
  }

  // Ensure eisenhower field exists (default to not-urgent-not-important)
  if (!data.eisenhower) {
    data.eisenhower = 'not-urgent-not-important';
  }

  return data as ItemMetadata;
}

/**
 * Extract counters from items by finding highest ID per type
 *
 * @param items Array of item metadata
 * @returns Counter map for ID generation
 */
function extractCountersFromItems(items: ItemMetadata[]): Record<string, number> {
  const counters: Record<string, number> = {};

  for (const item of items) {
    // Extract number from ID (e.g., "TASK-160" -> 160)
    const match = item.id.match(/-(\d+)$/);
    if (match) {
      const num = Number.parseInt(match[1], 10);
      const prefix = item.id.replace(/-\d+$/, '');

      if (!counters[prefix] || num > counters[prefix]) {
        counters[prefix] = num;
      }
    }
  }

  return counters;
}

/**
 * Backup current index before rebuilding
 *
 * Creates timestamped backup directory:
 * .devsteps/index.backup-2025-12-13T14-30-00/
 *
 * @param devstepsDir Path to .devsteps directory
 * @returns Path to backup directory
 */
async function backupIndexBeforeRebuild(devstepsDir: string): Promise<string> {
  const paths = getIndexPaths(devstepsDir);

  if (!existsSync(paths.root)) {
    throw new Error('No index to backup');
  }

  // Create timestamped backup name
  const timestamp = getCurrentTimestamp().replace(/:/g, '-').replace(/\./g, '-');
  const backupPath = join(devstepsDir, `index.backup-${timestamp}`);

  // Rename index to backup
  renameSync(paths.root, backupPath);

  return backupPath;
}

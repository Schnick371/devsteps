/**
 * Auto-Migration Module
 *
 * Provides auto-detection and migration for external DevSteps projects.
 * Safely migrates from legacy index.json to refs-style distributed index.
 *
 * Safe to call repeatedly - only migrates once.
 *
 * @see STORY-073 External Project Migration Auto-Detection
 * @see EPIC-018 Index Architecture Refactoring
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmdirSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import type { ItemType } from '../schemas/index.js';
import { TYPE_TO_DIRECTORY } from '../utils/index.js';
import {
  addItemToIndex,
  getIndexPaths,
  hasLegacyIndex,
  hasRefsStyleIndex,
  initializeRefsStyleIndex,
  loadAllIndexes,
  loadLegacyIndex,
} from './index-refs.js';

/**
 * Migration check result
 */
export interface MigrationCheckResult {
  /** Whether migration is needed */
  needed: boolean;

  /** Whether legacy index exists */
  hasLegacy: boolean;

  /** Whether refs-style index exists */
  hasRefs: boolean;

  /** Number of items in legacy index (if exists) */
  itemCount?: number;

  /** Human-readable status message */
  message: string;
}

/**
 * Auto-migration options
 */
export interface AutoMigrationOptions {
  /** Skip backup creation (advanced users only) */
  skipBackup?: boolean;

  /** Silent mode - suppress console output */
  silent?: boolean;

  /** Dry-run mode - check only, don't migrate */
  dryRun?: boolean;
}

/**
 * Migration statistics
 */
export interface MigrationStats {
  totalItems: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  backupPath?: string;
  archivePath?: string;
}

/**
 * Check if migration is needed
 *
 * Migration is needed when:
 * - Legacy index.json exists
 * - Refs-style index/ doesn't exist
 *
 * @param devstepsDir Path to .devsteps directory
 * @returns Migration check result with details
 *
 * @example
 * ```typescript
 * const result = checkMigrationNeeded('/path/to/.devsteps');
 * if (result.needed) {
 *   console.log(result.message);
 *   await ensureIndexMigrated('/path/to/.devsteps');
 * }
 * ```
 */
export function checkMigrationNeeded(devstepsDir: string): MigrationCheckResult {
  if (!existsSync(devstepsDir)) {
    return {
      needed: false,
      hasLegacy: false,
      hasRefs: false,
      message: 'Not a DevSteps project (no .devsteps directory)',
    };
  }

  const hasLegacy = hasLegacyIndex(devstepsDir);
  const hasRefs = hasRefsStyleIndex(devstepsDir);

  // Already migrated
  if (!hasLegacy && hasRefs) {
    return {
      needed: false,
      hasLegacy: false,
      hasRefs: true,
      message: 'Project already using refs-style index ✓',
    };
  }

  // Both exist - error state (migration partially completed?)
  if (hasLegacy && hasRefs) {
    return {
      needed: false,
      hasLegacy: true,
      hasRefs: true,
      message: 'Both index formats exist - manual intervention required',
    };
  }

  // No index at all - new project
  if (!hasLegacy && !hasRefs) {
    return {
      needed: false,
      hasLegacy: false,
      hasRefs: false,
      message: 'No index found - new project or not initialized',
    };
  }

  // Migration needed
  let itemCount: number | undefined;
  try {
    const legacy = loadLegacyIndex(devstepsDir);
    itemCount = legacy.items.length;
  } catch (_error) {
    // Ignore - legacy index might be corrupted
  }

  return {
    needed: true,
    hasLegacy: true,
    hasRefs: false,
    itemCount,
    message: `Migration needed: ${itemCount ?? 'unknown'} items to migrate`,
  };
}

/**
 * Perform index migration (internal implementation)
 *
 * This is the core migration logic without console output.
 * Use ensureIndexMigrated() for auto-migration with user feedback.
 *
 * @param devstepsDir Path to .devsteps directory
 * @param options Migration options
 * @returns Migration statistics
 * @throws Error if migration fails or preconditions not met
 * @internal
 */
export async function performMigration(
  devstepsDir: string,
  options: AutoMigrationOptions = {}
): Promise<MigrationStats> {
  const { skipBackup = false } = options;
  const paths = getIndexPaths(devstepsDir);

  // Pre-flight checks
  if (!existsSync(devstepsDir)) {
    throw new Error('.devsteps directory not found. Is this a DevSteps project?');
  }

  if (!hasLegacyIndex(devstepsDir)) {
    throw new Error('No index.json found. Nothing to migrate.');
  }

  if (hasRefsStyleIndex(devstepsDir)) {
    throw new Error('Refs-style index already exists. Aborting to prevent data loss.');
  }

  const stats: MigrationStats = {
    totalItems: 0,
    byType: {},
    byStatus: {},
    byPriority: {},
  };

  // Backup old index
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  if (!skipBackup) {
    const backupPath = `${paths.legacy}.backup-${timestamp}`;
    const indexContent = readFileSync(paths.legacy, 'utf-8');
    writeFileSync(backupPath, indexContent);
    stats.backupPath = backupPath;
  }

  // Load and validate old index
  const indexContent = readFileSync(paths.legacy, 'utf-8');
  const legacyIndex = JSON.parse(indexContent);
  const _itemCount = legacyIndex.items.length;

  // Initialize new index structure
  initializeRefsStyleIndex(devstepsDir, legacyIndex.counters || {});

  // Migrate items
  for (const item of legacyIndex.items) {
    // Load full metadata for each item to get eisenhower quadrant
    const typeFolder = TYPE_TO_DIRECTORY[item.type as ItemType];
    const metadataPath = join(devstepsDir, typeFolder, `${item.id}.json`);

    if (!existsSync(metadataPath)) {
      // Skip items with missing metadata
      continue;
    }

    const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));

    // Ensure eisenhower field exists (old items don't have it)
    if (!metadata.eisenhower) {
      metadata.eisenhower = 'not-urgent-important'; // Default Q2
    }

    addItemToIndex(devstepsDir, metadata);

    stats.totalItems++;
    stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
    stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
    stats.byPriority[metadata.eisenhower] = (stats.byPriority[metadata.eisenhower] || 0) + 1;
  }

  // Verify migration
  const newIndexes = loadAllIndexes(devstepsDir);

  // Count items in new index
  let newItemCount = 0;
  for (const items of newIndexes.byType.values()) {
    newItemCount += items.length;
  }

  if (newItemCount !== stats.totalItems) {
    throw new Error(
      `Item count mismatch! Migrated: ${stats.totalItems}, Verified: ${newItemCount}`
    );
  }

  // Check for duplicates
  const allIds = new Set<string>();
  for (const items of newIndexes.byType.values()) {
    for (const id of items) {
      if (allIds.has(id)) {
        throw new Error(`Duplicate item detected: ${id}`);
      }
      allIds.add(id);
    }
  }

  // Archive old index
  const archivePath = `${paths.legacy}.archived-${timestamp}`;
  renameSync(paths.legacy, archivePath);
  stats.archivePath = archivePath;

  return stats;
}

/**
 * Get user-friendly status message
 *
 * @param devstepsDir Path to .devsteps directory
 * @returns Human-readable status message
 *
 * @example
 * ```typescript
 * console.log(getMigrationStatusMessage('/path/to/.devsteps'));
 * // Output: "📦 DevSteps project using refs-style index ✓"
 * ```
 */
export function getMigrationStatusMessage(devstepsDir: string): string {
  const result = checkMigrationNeeded(devstepsDir);

  if (!existsSync(devstepsDir)) {
    return '❌ Not a DevSteps project';
  }

  if (result.needed) {
    const count = result.itemCount ?? 'unknown';
    return `🔄 Migration available: ${count} items can be migrated to refs-style index`;
  }

  if (result.hasRefs) {
    return '✅ Project using refs-style index';
  }

  if (result.hasLegacy && result.hasRefs) {
    return '⚠️  Both index formats detected - manual cleanup needed';
  }

  return '📦 DevSteps project (no index yet)';
}

/**
 * Automatically migrate if needed
 *
 * Safe to call repeatedly - only migrates once.
 * Checks if migration is needed and runs it if necessary.
 *
 * @param devstepsDir Path to .devsteps directory
 * @param options Migration options
 * @returns True if migration was performed, false if not needed
 * @throws Error if migration fails
 *
 * @example
 * ```typescript
 * // Auto-migrate with user feedback
 * const migrated = await ensureIndexMigrated('/path/to/.devsteps');
 * if (migrated) {
 *   console.log('✨ Migration complete!');
 * }
 *
 * // Silent auto-migration (for background tasks)
 * await ensureIndexMigrated('/path/to/.devsteps', { silent: true });
 *
 * // Dry-run (check only)
 * const needed = await ensureIndexMigrated('/path/to/.devsteps', { dryRun: true });
 * ```
 */
export async function ensureIndexMigrated(
  devstepsDir: string,
  options: AutoMigrationOptions = {}
): Promise<boolean> {
  const { silent = false, dryRun = false } = options;

  // Check if migration needed
  const check = checkMigrationNeeded(devstepsDir);

  if (!check.needed) {
    if (!silent && check.hasRefs) {
      console.log('✅ Project already using refs-style index');
    }
    return false;
  }

  // Dry-run mode - just report
  if (dryRun) {
    if (!silent) {
      console.log('🔍 Migration Check (Dry-Run)');
      console.log(`   Legacy index.json: ${check.hasLegacy ? '✓' : '✗'}`);
      console.log(`   Refs-style index:  ${check.hasRefs ? '✓' : '✗'}`);
      console.log(`   Items to migrate:  ${check.itemCount ?? 'unknown'}`);
      console.log('\n✅ Migration would proceed');
    }
    return true;
  }

  // Run migration
  if (!silent) {
    console.log('📦 DevSteps Project Detected');
    console.log(`🔍 Legacy index.json found (${check.itemCount ?? 'unknown'} items)`);
    console.log('🆕 Refs-style index not found');
    console.log('🔄 Auto-migrating...\n');
  }

  try {
    // Run migration
    const stats = await performMigration(devstepsDir, options);

    if (!silent) {
      if (stats.backupPath) {
        console.log(`   ✅ Backed up to: ${stats.backupPath}`);
      }
      console.log(`   ✅ Verified: ${stats.totalItems} items migrated`);
      console.log('✨ Migration complete!\n');
    }

    return true;
  } catch (error) {
    if (!silent) {
      console.error('❌ Migration failed:', error instanceof Error ? error.message : String(error));
    }
    throw error;
  }
}

/**
 * Check if items/ directory migration is needed
 *
 * Returns true if using flat structure (epics/, stories/)
 * instead of nested structure (items/epics/, items/stories/)
 */
export function needsItemsDirectoryMigration(devstepsDir: string): boolean {
  // Check if old flat structure exists
  const hasOldStructure =
    existsSync(join(devstepsDir, 'epics')) ||
    existsSync(join(devstepsDir, 'stories')) ||
    existsSync(join(devstepsDir, 'tasks'));

  // Check if new items/ structure exists
  const hasNewStructure = existsSync(join(devstepsDir, 'items'));

  // Need migration if old exists and new doesn't
  return hasOldStructure && !hasNewStructure;
}

/**
 * Migrate from flat directory structure to items/ subdirectory
 *
 * Moves files from:
 *   .devsteps/epics/EPIC-001.json → .devsteps/items/epics/EPIC-001.json
 *   .devsteps/stories/...         → .devsteps/items/stories/...
 *
 * @param devstepsDir Path to .devsteps directory
 * @param options Migration options
 * @returns Migration statistics
 */
export function migrateItemsDirectory(
  devstepsDir: string,
  options: AutoMigrationOptions = {}
): { moved: number; types: Record<string, number> } {
  const { silent = false } = options;

  if (!silent) {
    console.log('📂 Migrating to items/ directory structure...');
  }

  const oldDirs = [
    'epics',
    'stories',
    'tasks',
    'bugs',
    'spikes',
    'tests',
    'requirements',
    'features',
  ];
  const stats = { moved: 0, types: {} as Record<string, number> };

  // Create items/ directory
  const itemsDir = join(devstepsDir, 'items');
  if (!existsSync(itemsDir)) {
    mkdirSync(itemsDir, { recursive: true });
  }

  // Move each type directory
  for (const dirName of oldDirs) {
    const oldPath = join(devstepsDir, dirName);
    const newPath = join(itemsDir, dirName);

    if (!existsSync(oldPath)) continue;

    // Create new subdirectory
    mkdirSync(newPath, { recursive: true });

    // Move all files
    const files = readdirSync(oldPath);
    let count = 0;

    for (const file of files) {
      const srcPath = join(oldPath, file);
      const dstPath = join(newPath, file);

      // Use renameSync for atomic move
      renameSync(srcPath, dstPath);
      count++;
    }

    stats.types[dirName] = count;
    stats.moved += count;

    // Remove old empty directory (best effort)
    try {
      rmdirSync(oldPath);
    } catch {
      // Directory not empty or other error - ignore
    }
  }

  if (!silent) {
    console.log(`   ✅ Moved ${stats.moved} files to items/ subdirectories`);
  }

  return stats;
}

/**
 * Ensure index is migrated AND items are in correct directory structure
 *
 * Combines both migrations:
 * 1. Legacy index.json → refs-style index/ (if needed)
 * 2. Flat structure → items/ subdirectory (if needed)
 * 3. Cleanup: Remove legacy index.json if migration complete
 *
 * Safe to call on every operation - only migrates when needed.
 */
export async function ensureFullMigration(
  devstepsDir: string,
  options: AutoMigrationOptions = {}
): Promise<void> {
  const { silent = false } = options;

  // Step 1: Index migration (legacy → refs-style)
  await ensureIndexMigrated(devstepsDir, options);

  // Step 2: Directory structure migration (flat → items/)
  if (needsItemsDirectoryMigration(devstepsDir)) {
    migrateItemsDirectory(devstepsDir, options);
  }

  // Step 3: Cleanup legacy index.json if both exist (partial migration state)
  // This can happen if index migration completed but archiving failed
  const paths = getIndexPaths(devstepsDir);
  if (hasRefsStyleIndex(devstepsDir) && existsSync(paths.legacy)) {
    // Verify refs-style index is valid before removing legacy
    try {
      const indexes = loadAllIndexes(devstepsDir);
      if (indexes.byType.size > 0) {
        // Refs-style index is valid - safe to remove legacy
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const archivePath = `${paths.legacy}.archived-${timestamp}`;
        renameSync(paths.legacy, archivePath);

        if (!silent) {
          console.log(`   🗑️  Archived legacy index: ${archivePath}`);
        }
      }
    } catch (_error) {
      // If refs-style index is invalid, keep legacy as fallback
      if (!silent) {
        console.warn('   ⚠️  Keeping legacy index.json (refs-style index validation failed)');
      }
    }
  }
}

/**
 * Auto-Migration Module — Orchestrator
 *
 * Provides auto-detection and migration for DevSteps projects.
 * Safely migrates from legacy index.json to refs-style distributed index.
 *
 * Safe to call repeatedly — only migrates once.
 *
 * @see STORY-073 External Project Migration Auto-Detection
 * @see EPIC-018 Index Architecture Refactoring
 */

import { existsSync, renameSync } from 'node:fs';
import { getIndexPaths, hasRefsStyleIndex, loadAllIndexes } from './index-refs.js';
import {
  type AutoMigrationOptions,
  type MigrationCheckResult,
  type MigrationStats,
  checkMigrationNeeded,
  getMigrationStatusMessage,
  needsItemsDirectoryMigration,
} from './auto-migrate-detect.js';
import { migrateItemsDirectory, performMigration } from './auto-migrate-impl.js';

// Re-export types and detection helpers for convenience
export type { AutoMigrationOptions, MigrationCheckResult, MigrationStats };
export { checkMigrationNeeded, getMigrationStatusMessage, needsItemsDirectoryMigration };
// Re-export impl functions (callers may import directly from auto-migrate)
export { performMigration, migrateItemsDirectory };

/**
 * Automatically migrate if needed — safe to call repeatedly.
 *
 * @param devstepsDir Path to .devsteps directory
 * @param options Migration options
 * @returns True if migration was performed, false if not needed
 * @throws Error if migration fails
 */
export async function ensureIndexMigrated(
  devstepsDir: string,
  options: AutoMigrationOptions = {}
): Promise<boolean> {
  const { silent = false, dryRun = false } = options;
  const check = checkMigrationNeeded(devstepsDir);

  if (!check.needed) {
    if (!silent && check.hasRefs) console.log('✅ Project already using refs-style index');
    return false;
  }

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

  if (!silent) {
    console.log('📦 DevSteps Project Detected');
    console.log(`🔍 Legacy index.json found (${check.itemCount ?? 'unknown'} items)`);
    console.log('🆕 Refs-style index not found');
    console.log('🔄 Auto-migrating...\n');
  }

  try {
    const stats = await performMigration(devstepsDir, options);
    if (!silent) {
      if (stats.backupPath) console.log(`   ✅ Backed up to: ${stats.backupPath}`);
      console.log(`   ✅ Verified: ${stats.totalItems} items migrated`);
      console.log('✨ Migration complete!\n');
    }
    return true;
  } catch (error) {
    if (!silent) console.error('❌ Migration failed:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Ensure index is migrated AND items are in correct directory structure.
 *
 * Combines:
 * 1. Legacy index.json → refs-style index/ (if needed)
 * 2. Flat structure → items/ subdirectory (if needed)
 * 3. Cleanup orphaned legacy index.json if refs-style is valid
 *
 * Safe to call on every operation — only migrates when needed.
 */
export async function ensureFullMigration(
  devstepsDir: string,
  options: AutoMigrationOptions = {}
): Promise<void> {
  const { silent = false } = options;

  await ensureIndexMigrated(devstepsDir, options);

  if (needsItemsDirectoryMigration(devstepsDir)) {
    migrateItemsDirectory(devstepsDir, options);
  }

  // Cleanup: archive stale legacy index.json if refs-style is valid
  const paths = getIndexPaths(devstepsDir);
  if (hasRefsStyleIndex(devstepsDir) && existsSync(paths.legacy)) {
    try {
      const indexes = loadAllIndexes(devstepsDir);
      if (indexes.byType.size > 0) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const archivePath = `${paths.legacy}.archived-${timestamp}`;
        renameSync(paths.legacy, archivePath);
        if (!silent) console.log(`   🗑️  Archived legacy index: ${archivePath}`);
      }
    } catch (_error) {
      if (!silent) console.warn('   ⚠️  Keeping legacy index.json (refs-style index validation failed)');
    }
  }
}

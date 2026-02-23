/**
 * Auto-Migration Implementation
 *
 * Stateful migration operations: performs actual index and directory migrations.
 * Contains all I/O-heavy transformation logic.
 *
 * @see STORY-073 External Project Migration Auto-Detection
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
} from './index-refs.js';
import type { AutoMigrationOptions, MigrationStats } from './auto-migrate-detect.js';

/**
 * Perform core index migration: legacy index.json → refs-style distributed index
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

  if (!existsSync(devstepsDir)) throw new Error('.devsteps directory not found. Is this a DevSteps project?');
  if (!hasLegacyIndex(devstepsDir)) throw new Error('No index.json found. Nothing to migrate.');
  if (hasRefsStyleIndex(devstepsDir)) throw new Error('Refs-style index already exists. Aborting to prevent data loss.');

  const stats: MigrationStats = { totalItems: 0, byType: {}, byStatus: {}, byPriority: {} };

  // Backup old index
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  if (!skipBackup) {
    const backupPath = `${paths.legacy}.backup-${timestamp}`;
    writeFileSync(backupPath, readFileSync(paths.legacy, 'utf-8'));
    stats.backupPath = backupPath;
  }

  // Load legacy index + initialize new structure
  const legacyIndex = JSON.parse(readFileSync(paths.legacy, 'utf-8'));
  initializeRefsStyleIndex(devstepsDir, legacyIndex.counters || {});

  // Migrate each item into new index
  for (const item of legacyIndex.items) {
    const typeFolder = TYPE_TO_DIRECTORY[item.type as ItemType];
    const metadataPath = join(devstepsDir, typeFolder, `${item.id}.json`);
    if (!existsSync(metadataPath)) continue;

    const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
    if (!metadata.eisenhower) metadata.eisenhower = 'not-urgent-important'; // Default Q2

    addItemToIndex(devstepsDir, metadata);
    stats.totalItems++;
    stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
    stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
    stats.byPriority[metadata.eisenhower] = (stats.byPriority[metadata.eisenhower] || 0) + 1;
  }

  // Verify migration: count + deduplicate
  const newIndexes = loadAllIndexes(devstepsDir);
  let newItemCount = 0;
  for (const items of newIndexes.byType.values()) { newItemCount += items.length; }

  if (newItemCount !== stats.totalItems) {
    throw new Error(`Item count mismatch! Migrated: ${stats.totalItems}, Verified: ${newItemCount}`);
  }

  const allIds = new Set<string>();
  for (const items of newIndexes.byType.values()) {
    for (const id of items) {
      if (allIds.has(id)) throw new Error(`Duplicate item detected: ${id}`);
      allIds.add(id);
    }
  }

  // Archive old index and return stats
  const archivePath = `${paths.legacy}.archived-${timestamp}`;
  renameSync(paths.legacy, archivePath);
  stats.archivePath = archivePath;

  return stats;
}

/**
 * Migrate from flat directory structure to items/ subdirectory
 *
 * Moves: `.devsteps/epics/…` → `.devsteps/items/epics/…`
 */
export function migrateItemsDirectory(
  devstepsDir: string,
  options: AutoMigrationOptions = {}
): { moved: number; types: Record<string, number> } {
  const { silent = false } = options;
  if (!silent) console.log('📂 Migrating to items/ directory structure...');

  const oldDirs = ['epics', 'stories', 'tasks', 'bugs', 'spikes', 'tests', 'requirements', 'features'];
  const stats = { moved: 0, types: {} as Record<string, number> };
  const itemsDir = join(devstepsDir, 'items');
  if (!existsSync(itemsDir)) mkdirSync(itemsDir, { recursive: true });

  for (const dirName of oldDirs) {
    const oldPath = join(devstepsDir, dirName);
    const newPath = join(itemsDir, dirName);
    if (!existsSync(oldPath)) continue;

    mkdirSync(newPath, { recursive: true });
    const files = readdirSync(oldPath);
    let count = 0;

    for (const file of files) { renameSync(join(oldPath, file), join(newPath, file)); count++; }
    stats.types[dirName] = count;
    stats.moved += count;

    try { rmdirSync(oldPath); } catch { /* ignore — not empty or other error */ }
  }

  if (!silent) console.log(`   ✅ Moved ${stats.moved} files to items/ subdirectories`);
  return stats;
}

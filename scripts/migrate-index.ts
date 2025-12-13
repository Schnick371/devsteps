#!/usr/bin/env tsx
/**
 * Migrate index.json to refs-style distributed index
 * 
 * Usage:
 *   npm run migrate:index
 *   node --loader tsx scripts/migrate-index.ts
 * 
 * What it does:
 * 1. Backs up existing index.json
 * 2. Reads and validates old index
 * 3. Creates new refs-style structure
 * 4. Distributes items to by-type, by-status, by-priority indexes
 * 5. Verifies data integrity
 * 6. Archives old index.json
 */

import { existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { 
  initializeRefsStyleIndex, 
  addItemToIndex, 
  hasRefsStyleIndex,
  hasLegacyIndex,
  loadLegacyIndex,
  loadAllIndexes,
} from '../packages/shared/src/core/index-refs.js';
import type { DevStepsIndex } from '../packages/shared/src/schemas/index.js';

const DEVSTEPS_DIR = join(process.cwd(), '.devsteps');
const LEGACY_INDEX = join(DEVSTEPS_DIR, 'index.json');

interface MigrationStats {
  totalItems: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  duration: number;
}

/**
 * Main migration function
 */
async function migrateIndex(): Promise<MigrationStats> {
  const startTime = Date.now();

  console.log('🔄 DevSteps Index Migration');
  console.log('=============================\n');

  // Pre-flight checks
  console.log('1. Running pre-flight checks...');
  
  if (!existsSync(DEVSTEPS_DIR)) {
    throw new Error('❌ .devsteps directory not found. Is this a DevSteps project?');
  }

  if (!hasLegacyIndex(DEVSTEPS_DIR)) {
    throw new Error('❌ No index.json found. Nothing to migrate.');
  }

  if (hasRefsStyleIndex(DEVSTEPS_DIR)) {
    throw new Error('❌ Refs-style index already exists. Aborting to prevent data loss.');
  }

  console.log('✅ Pre-flight checks passed\n');

  // Backup old index
  console.log('2. Creating backup...');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${LEGACY_INDEX}.backup-${timestamp}`;
  
  const indexContent = readFileSync(LEGACY_INDEX, 'utf-8');
  writeFileSync(backupPath, indexContent);
  console.log(`✅ Backup created: ${backupPath}\n`);

  // Load and validate old index
  console.log('3. Loading legacy index...');
  const legacyIndex: DevStepsIndex = JSON.parse(indexContent);
  
  const itemCount = legacyIndex.items.length;
  console.log(`   Found ${itemCount} items`);
  console.log(`   Counters: ${JSON.stringify(legacyIndex.counters || {})}\n`);

  // Initialize new index structure
  console.log('4. Initializing refs-style index...');
  initializeRefsStyleIndex(DEVSTEPS_DIR, legacyIndex.counters || {});
  console.log('✅ Index structure created\n');

  // Migrate items
  console.log('5. Migrating items...');
  const stats: MigrationStats = {
    totalItems: 0,
    byType: {},
    byStatus: {},
    byPriority: {},
    duration: 0,
  };

  for (const item of legacyIndex.items) {
    // Load full metadata for each item to get eisenhower quadrant
    const typeFolder = getTypeFolder(item.type);
    const metadataPath = join(DEVSTEPS_DIR, typeFolder, `${item.id}.json`);
    
    if (!existsSync(metadataPath)) {
      console.warn(`⚠️  Metadata missing for ${item.id} - skipping`);
      continue;
    }

    const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
    
    addItemToIndex(DEVSTEPS_DIR, metadata);
    
    stats.totalItems++;
    stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
    stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
    stats.byPriority[metadata.eisenhower] = (stats.byPriority[metadata.eisenhower] || 0) + 1;

    if (stats.totalItems % 50 === 0) {
      process.stdout.write(`   Migrated ${stats.totalItems}/${itemCount} items...\r`);
    }
  }
  console.log(`✅ Migrated ${stats.totalItems}/${itemCount} items\n`);

  // Verify migration
  console.log('6. Verifying data integrity...');
  const newIndexes = loadAllIndexes(DEVSTEPS_DIR);
  
  // Count items in new index
  let newItemCount = 0;
  for (const items of newIndexes.byType.values()) {
    newItemCount += items.length;
  }

  if (newItemCount !== itemCount) {
    throw new Error(`❌ Item count mismatch! Old: ${itemCount}, New: ${newItemCount}`);
  }

  // Check for duplicates
  const allIds = new Set<string>();
  for (const items of newIndexes.byType.values()) {
    for (const id of items) {
      if (allIds.has(id)) {
        throw new Error(`❌ Duplicate item detected: ${id}`);
      }
      allIds.add(id);
    }
  }

  console.log(`✅ Integrity verified: ${newItemCount} items, no duplicates\n`);

  // Archive old index
  console.log('7. Archiving old index...');
  const archivePath = `${LEGACY_INDEX}.archived-${timestamp}`;
  renameSync(LEGACY_INDEX, archivePath);
  console.log(`✅ Old index archived: ${archivePath}\n`);

  stats.duration = Date.now() - startTime;

  return stats;
}

/**
 * Helper: Get type folder name
 */
function getTypeFolder(type: string): string {
  const map: Record<string, string> = {
    epic: 'epics',
    story: 'stories',
    task: 'tasks',
    bug: 'bugs',
    spike: 'spikes',
    test: 'tests',
    feature: 'features',
    requirement: 'requirements',
  };
  return map[type] || 'tasks';
}

/**
 * Print migration summary
 */
function printSummary(stats: MigrationStats): void {
  console.log('=============================');
  console.log('✨ Migration Complete!\n');
  console.log(`Total Items: ${stats.totalItems}`);
  console.log(`Duration: ${(stats.duration / 1000).toFixed(2)}s\n`);
  
  console.log('By Type:');
  for (const [type, count] of Object.entries(stats.byType)) {
    console.log(`  ${type}: ${count}`);
  }
  console.log('');
  
  console.log('By Status:');
  for (const [status, count] of Object.entries(stats.byStatus)) {
    console.log(`  ${status}: ${count}`);
  }
  console.log('');
  
  console.log('By Priority:');
  for (const [priority, count] of Object.entries(stats.byPriority)) {
    console.log(`  ${priority}: ${count}`);
  }
  console.log('');
  
  console.log('Next Steps:');
  console.log('  1. Verify items with: devsteps-list');
  console.log('  2. Run validation: npm run validate:index');
  console.log('  3. If issues arise, rollback with:');
  console.log('     npm run rollback:index\n');
}

/**
 * Main entry point
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateIndex()
    .then(printSummary)
    .catch((error) => {
      console.error('\n❌ Migration failed:', error.message);
      console.error('\nStack trace:', error.stack);
      process.exit(1);
    });
}

export { migrateIndex, type MigrationStats };

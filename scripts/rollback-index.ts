#!/usr/bin/env tsx
/**
 * Rollback refs-style index to legacy index.json
 * 
 * Usage:
 *   npm run rollback:index
 *   node --loader tsx scripts/rollback-index.ts
 * 
 * What it does:
 * 1. Finds most recent backup
 * 2. Removes refs-style index directory
 * 3. Restores index.json from backup
 * 4. Verifies restoration
 */

import { existsSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const DEVSTEPS_DIR = join(process.cwd(), '.devsteps');
const INDEX_DIR = join(DEVSTEPS_DIR, 'index');
const LEGACY_INDEX = join(DEVSTEPS_DIR, 'index.json');

/**
 * Find most recent backup file
 */
function findLatestBackup(): string | null {
  if (!existsSync(DEVSTEPS_DIR)) {
    return null;
  }

  const files = readdirSync(DEVSTEPS_DIR);
  const backups = files
    .filter(f => f.startsWith('index.json.backup-') || f.startsWith('index.json.archived-'))
    .map(f => ({
      name: f,
      path: join(DEVSTEPS_DIR, f),
      timestamp: f.match(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/)?.[0] || '',
    }))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return backups.length > 0 ? backups[0].path : null;
}

/**
 * Main rollback function
 */
async function rollbackIndex(): Promise<void> {
  console.log('⏪ DevSteps Index Rollback');
  console.log('=============================\n');

  // Check if rollback is needed
  console.log('1. Checking current state...');
  
  if (existsSync(LEGACY_INDEX) && !existsSync(INDEX_DIR)) {
    console.log('✅ Already using legacy index. No rollback needed.\n');
    return;
  }

  if (!existsSync(INDEX_DIR)) {
    console.log('⚠️  No refs-style index found. Nothing to rollback.\n');
    return;
  }

  // Find backup
  console.log('2. Finding backup...');
  const backupPath = findLatestBackup();
  
  if (!backupPath) {
    throw new Error('❌ No backup found. Cannot rollback safely.');
  }

  console.log(`✅ Found backup: ${backupPath}\n`);

  // Remove refs-style index
  console.log('3. Removing refs-style index...');
  rmSync(INDEX_DIR, { recursive: true, force: true });
  console.log('✅ Refs-style index removed\n');

  // Restore backup
  console.log('4. Restoring legacy index...');
  renameSync(backupPath, LEGACY_INDEX);
  console.log(`✅ Restored from: ${backupPath}\n`);

  // Verify
  console.log('5. Verifying restoration...');
  if (!existsSync(LEGACY_INDEX)) {
    throw new Error('❌ Restoration failed: index.json not found');
  }
  console.log('✅ Restoration verified\n');

  console.log('=============================');
  console.log('✨ Rollback Complete!\n');
  console.log('You are now using the legacy index.json format.\n');
  console.log('Verify with: devsteps-status\n');
}

/**
 * Main entry point
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  rollbackIndex()
    .catch((error) => {
      console.error('\n❌ Rollback failed:', error.message);
      console.error('\nStack trace:', error.stack);
      process.exit(1);
    });
}

export { rollbackIndex };

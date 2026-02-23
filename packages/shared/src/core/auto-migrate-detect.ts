/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Auto-Migration Detection
 *
 * Pure analysis/detection functions — no side effects, no I/O mutations.
 * These functions only read state and return status information.
 *
 * @see STORY-073 External Project Migration Auto-Detection
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { hasLegacyIndex, hasRefsStyleIndex, loadLegacyIndex } from './index-refs.js';

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
 * Check if index migration is needed (legacy → refs-style)
 */
export function checkMigrationNeeded(devstepsDir: string): MigrationCheckResult {
  if (!existsSync(devstepsDir)) {
    return { needed: false, hasLegacy: false, hasRefs: false, message: 'Not a DevSteps project (no .devsteps directory)' };
  }

  const hasLegacy = hasLegacyIndex(devstepsDir);
  const hasRefs = hasRefsStyleIndex(devstepsDir);

  if (!hasLegacy && hasRefs) {
    return { needed: false, hasLegacy: false, hasRefs: true, message: 'Project already using refs-style index ✓' };
  }

  if (hasLegacy && hasRefs) {
    return { needed: false, hasLegacy: true, hasRefs: true, message: 'Both index formats exist - manual intervention required' };
  }

  if (!hasLegacy && !hasRefs) {
    return { needed: false, hasLegacy: false, hasRefs: false, message: 'No index found - new project or not initialized' };
  }

  let itemCount: number | undefined;
  try {
    const legacy = loadLegacyIndex(devstepsDir);
    itemCount = legacy.items.length;
  } catch (_error) {
    // Ignore - legacy index might be corrupted
  }

  return { needed: true, hasLegacy: true, hasRefs: false, itemCount, message: `Migration needed: ${itemCount ?? 'unknown'} items to migrate` };
}

/**
 * Get user-friendly migration status message
 */
export function getMigrationStatusMessage(devstepsDir: string): string {
  const result = checkMigrationNeeded(devstepsDir);

  if (!existsSync(devstepsDir)) return '❌ Not a DevSteps project';
  if (result.needed) return `🔄 Migration available: ${result.itemCount ?? 'unknown'} items can be migrated to refs-style index`;
  if (result.hasRefs) return '✅ Project using refs-style index';
  if (result.hasLegacy && result.hasRefs) return '⚠️  Both index formats detected - manual cleanup needed';
  return '📦 DevSteps project (no index yet)';
}

/**
 * Check if items/ directory migration is needed (flat → nested structure)
 */
export function needsItemsDirectoryMigration(devstepsDir: string): boolean {
  const hasOldStructure =
    existsSync(join(devstepsDir, 'epics')) ||
    existsSync(join(devstepsDir, 'stories')) ||
    existsSync(join(devstepsDir, 'tasks'));
  const hasNewStructure = existsSync(join(devstepsDir, 'items'));
  return hasOldStructure && !hasNewStructure;
}

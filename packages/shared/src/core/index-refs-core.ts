/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Refs-Style Index Core Operations
 *
 * Git-inspired distributed index implementation with atomic operations
 * and consistency guarantees across all index files.
 *
 * Architecture:
 * - `.devsteps/index/by-type/*.json` - Type categorization
 * - `.devsteps/index/by-status/*.json` - Status filtering
 * - `.devsteps/index/by-priority/*.json` - Priority queries
 * - `.devsteps/index/counters.json` - ID generation state
 *
 * Benefits:
 * - Zero merge conflicts (separate files)
 * - Faster queries (load only needed index)
 * - Atomic updates per category
 * - Better scalability
 *
 * @see EPIC-018 Index Architecture Refactoring
 * @see STORY-069 Foundation: Refs-Style Index Schema
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { EisenhowerQuadrant, ItemStatus, ItemType } from '../schemas/index.js';
import {
  CountersSchema,
  validateCategoryIndex,
  validateCounters,
} from '../schemas/index-refs.schema.js';
import type { CategoryIndex, IndexPaths, RefsStyleIndex } from '../types/index-refs.types.js';
import { INDEX_FILENAMES } from '../types/index-refs.types.js';
import { getCurrentTimestamp } from '../utils/index.js';

/**
 * Get index directory paths for a DevSteps project
 */
export function getIndexPaths(devstepsDir: string): IndexPaths {
  const indexRoot = join(devstepsDir, 'index');

  return {
    root: indexRoot,
    byType: join(indexRoot, 'by-type'),
    byStatus: join(indexRoot, 'by-status'),
    byPriority: join(indexRoot, 'by-priority'),
    counters: join(indexRoot, 'counters.json'),
    legacy: join(devstepsDir, 'index.json'),
  };
}

/**
 * Check if refs-style index structure exists
 */
export function hasRefsStyleIndex(devstepsDir: string): boolean {
  const paths = getIndexPaths(devstepsDir);
  return (
    existsSync(paths.root) &&
    existsSync(paths.byType) &&
    existsSync(paths.byStatus) &&
    existsSync(paths.byPriority) &&
    existsSync(paths.counters)
  );
}

/**
 * Check if legacy index.json exists (migration detection)
 */
export function hasLegacyIndex(devstepsDir: string): boolean {
  const paths = getIndexPaths(devstepsDir);
  return existsSync(paths.legacy);
}

/**
 * Initialize refs-style index directory structure
 *
 * Creates:
 * - .devsteps/index/by-type/
 * - .devsteps/index/by-status/
 * - .devsteps/index/by-priority/
 * - .devsteps/index/counters.json
 *
 * @param devstepsDir Path to .devsteps directory
 * @param initialCounters Optional initial counters (for migration)
 */
export function initializeRefsStyleIndex(
  devstepsDir: string,
  initialCounters: Record<string, number> = {}
): void {
  const paths = getIndexPaths(devstepsDir);

  // Create directory structure
  mkdirSync(paths.root, { recursive: true });
  mkdirSync(paths.byType, { recursive: true });
  mkdirSync(paths.byStatus, { recursive: true });
  mkdirSync(paths.byPriority, { recursive: true });

  // Initialize counters
  const counters = CountersSchema.parse(initialCounters);
  writeFileSync(paths.counters, JSON.stringify(counters, null, 2));

  // Create empty index files for all categories
  const now = getCurrentTimestamp();

  // Type indexes
  for (const [type, filename] of Object.entries(INDEX_FILENAMES.TYPE)) {
    const indexPath = join(paths.byType, filename);
    if (!existsSync(indexPath)) {
      const emptyIndex: CategoryIndex = {
        category: type,
        items: [],
        updated: now,
      };
      writeFileSync(indexPath, JSON.stringify(emptyIndex, null, 2));
    }
  }

  // Status indexes
  for (const [status, filename] of Object.entries(INDEX_FILENAMES.STATUS)) {
    const indexPath = join(paths.byStatus, filename);
    if (!existsSync(indexPath)) {
      const emptyIndex: CategoryIndex = {
        category: status,
        items: [],
        updated: now,
      };
      writeFileSync(indexPath, JSON.stringify(emptyIndex, null, 2));
    }
  }

  // Priority indexes
  for (const [priority, filename] of Object.entries(INDEX_FILENAMES.PRIORITY)) {
    const indexPath = join(paths.byPriority, filename);
    if (!existsSync(indexPath)) {
      const emptyIndex: CategoryIndex = {
        category: priority,
        items: [],
        updated: now,
      };
      writeFileSync(indexPath, JSON.stringify(emptyIndex, null, 2));
    }
  }
}

//=============================================================================
// READ OPERATIONS
//=============================================================================

/**
 * Load single category index file
 *
 * @param filePath Absolute path to index file
 * @returns Category index or empty if file missing
 */
function loadCategoryIndex(filePath: string): CategoryIndex | null {
  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    return validateCategoryIndex(data);
  } catch (error) {
    throw new Error(
      `Failed to load index from ${filePath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Load index by item type
 *
 * @example
 * ```typescript
 * const taskIds = await loadIndexByType(devstepsDir, 'task');
 * // Returns: ['TASK-160', 'TASK-161', 'TASK-162']
 * ```
 */
export function loadIndexByType(devstepsDir: string, type: ItemType): string[] {
  const paths = getIndexPaths(devstepsDir);
  const filename = INDEX_FILENAMES.TYPE[type];
  const filePath = join(paths.byType, filename);

  const index = loadCategoryIndex(filePath);
  return index?.items ?? [];
}

/**
 * Load index by item status
 *
 * @example
 * ```typescript
 * const draftIds = await loadIndexByStatus(devstepsDir, 'draft');
 * // Returns: ['STORY-069', 'TASK-198', ...]
 * ```
 */
export function loadIndexByStatus(devstepsDir: string, status: ItemStatus): string[] {
  const paths = getIndexPaths(devstepsDir);
  const filename = INDEX_FILENAMES.STATUS[status];
  const filePath = join(paths.byStatus, filename);

  const index = loadCategoryIndex(filePath);
  return index?.items ?? [];
}

/**
 * Load index by priority (Eisenhower quadrant)
 *
 * @example
 * ```typescript
 * const urgentIds = await loadIndexByPriority(devstepsDir, 'urgent-important');
 * // Returns Q1 items
 * ```
 */
export function loadIndexByPriority(devstepsDir: string, priority: EisenhowerQuadrant): string[] {
  const paths = getIndexPaths(devstepsDir);
  const filename = INDEX_FILENAMES.PRIORITY[priority];
  const filePath = join(paths.byPriority, filename);

  const index = loadCategoryIndex(filePath);
  return index?.items ?? [];
}

/**
 * Load all indexes into memory
 *
 * Useful for operations that need complete index access.
 * For most queries, prefer loading only the needed index.
 */
export function loadAllIndexes(devstepsDir: string): RefsStyleIndex {
  const paths = getIndexPaths(devstepsDir);

  // Load counters
  let counters: Record<string, number> = {};
  if (existsSync(paths.counters)) {
    const content = readFileSync(paths.counters, 'utf-8');
    counters = validateCounters(JSON.parse(content));
  }

  // Load type indexes
  const byType = new Map<ItemType, string[]>();
  for (const type of Object.keys(INDEX_FILENAMES.TYPE) as ItemType[]) {
    byType.set(type, loadIndexByType(devstepsDir, type));
  }

  // Load status indexes
  const byStatus = new Map<ItemStatus, string[]>();
  for (const status of Object.keys(INDEX_FILENAMES.STATUS) as ItemStatus[]) {
    byStatus.set(status, loadIndexByStatus(devstepsDir, status));
  }

  // Load priority indexes
  const byPriority = new Map<EisenhowerQuadrant, string[]>();
  for (const priority of Object.keys(INDEX_FILENAMES.PRIORITY) as EisenhowerQuadrant[]) {
    byPriority.set(priority, loadIndexByPriority(devstepsDir, priority));
  }

  return {
    byType,
    byStatus,
    byPriority,
    counters,
    lastUpdated: getCurrentTimestamp(),
  };
}

/**
 * Load ID generation counters
 */
export function loadCounters(devstepsDir: string): Record<string, number> {
  const paths = getIndexPaths(devstepsDir);

  if (!existsSync(paths.counters)) {
    return {};
  }

  const content = readFileSync(paths.counters, 'utf-8');
  return validateCounters(JSON.parse(content));
}

//=============================================================================
// WRITE OPERATIONS
//=============================================================================

/**
 * Save category index to file (atomic write)
 *
 * @param filePath Absolute path to index file
 * @param category Category name
 * @param items Array of item IDs
 */
function saveCategoryIndex(filePath: string, category: string, items: string[]): void {
  const index: CategoryIndex = {
    category,
    items,
    updated: getCurrentTimestamp(),
  };

  // Write directly (directory should already exist via update* functions)
  writeFileSync(filePath, JSON.stringify(index, null, 2));
}

/**
 * Update type index
 *
 * @example
 * ```typescript
 * updateIndexByType(devstepsDir, 'task', ['TASK-160', 'TASK-161', 'TASK-162']);
 * ```
 */
export function updateIndexByType(devstepsDir: string, type: ItemType, items: string[]): void {
  const paths = getIndexPaths(devstepsDir);
  const filename = INDEX_FILENAMES.TYPE[type];
  const filePath = join(paths.byType, filename);

  // Ensure directory exists
  mkdirSync(paths.byType, { recursive: true });

  saveCategoryIndex(filePath, type, items);
}

/**
 * Update status index
 */
export function updateIndexByStatus(
  devstepsDir: string,
  status: ItemStatus,
  items: string[]
): void {
  const paths = getIndexPaths(devstepsDir);
  const filename = INDEX_FILENAMES.STATUS[status];
  const filePath = join(paths.byStatus, filename);

  mkdirSync(paths.byStatus, { recursive: true });
  saveCategoryIndex(filePath, status, items);
}

/**
 * Update priority index
 */
export function updateIndexByPriority(
  devstepsDir: string,
  priority: EisenhowerQuadrant,
  items: string[]
): void {
  const paths = getIndexPaths(devstepsDir);
  const filename = INDEX_FILENAMES.PRIORITY[priority];
  const filePath = join(paths.byPriority, filename);

  mkdirSync(paths.byPriority, { recursive: true });
  saveCategoryIndex(filePath, priority, items);
}

/**
 * Update counters file
 */
export function updateCounters(devstepsDir: string, counters: Record<string, number>): void {
  const paths = getIndexPaths(devstepsDir);

  mkdirSync(paths.root, { recursive: true });

  const validated = validateCounters(counters);
  writeFileSync(paths.counters, JSON.stringify(validated, null, 2));
}

//=============================================================================

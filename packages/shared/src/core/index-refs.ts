/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Refs-Style Index — Public API
 *
 * Re-exports setup + I/O primitives from index-refs-core.ts
 * and provides synchronization operations that coordinate changes
 * across multiple index dimensions (type, status, priority).
 *
 * @see EPIC-018 Index Architecture Refactoring
 */

import { existsSync, readFileSync } from 'node:fs';
import type { EisenhowerQuadrant, ItemMetadata, ItemStatus, ItemType } from '../schemas/index.js';
import { INDEX_FILENAMES } from '../types/index-refs.types.js';
import {
  getIndexPaths,
  loadIndexByPriority,
  loadIndexByStatus,
  loadIndexByType,
  updateIndexByPriority,
  updateIndexByStatus,
  updateIndexByType,
} from './index-refs-core.js';

// Re-export all core I/O primitives for backward compatibility
export * from './index-refs-core.js';

//=============================================================================
// INDEX SYNCHRONIZATION
//=============================================================================

/**
 * Add item to all relevant indexes (type, status, priority)
 */
export function addItemToIndex(devstepsDir: string, item: ItemMetadata): void {
  const typeItems = loadIndexByType(devstepsDir, item.type);
  if (!typeItems.includes(item.id)) { typeItems.push(item.id); updateIndexByType(devstepsDir, item.type, typeItems); }

  const statusItems = loadIndexByStatus(devstepsDir, item.status);
  if (!statusItems.includes(item.id)) { statusItems.push(item.id); updateIndexByStatus(devstepsDir, item.status, statusItems); }

  const priorityItems = loadIndexByPriority(devstepsDir, item.eisenhower);
  if (!priorityItems.includes(item.id)) { priorityItems.push(item.id); updateIndexByPriority(devstepsDir, item.eisenhower, priorityItems); }
}

/**
 * Remove item from all indexes
 */
export function removeItemFromIndex(
  devstepsDir: string,
  itemId: string,
  type?: ItemType,
  status?: ItemStatus,
  priority?: EisenhowerQuadrant
): void {
  if (type) {
    updateIndexByType(devstepsDir, type, loadIndexByType(devstepsDir, type).filter((id) => id !== itemId));
  } else {
    for (const t of Object.keys(INDEX_FILENAMES.TYPE) as ItemType[]) {
      const items = loadIndexByType(devstepsDir, t);
      if (items.includes(itemId)) { updateIndexByType(devstepsDir, t, items.filter((id) => id !== itemId)); break; }
    }
  }

  if (status) {
    updateIndexByStatus(devstepsDir, status, loadIndexByStatus(devstepsDir, status).filter((id) => id !== itemId));
  } else {
    for (const s of Object.keys(INDEX_FILENAMES.STATUS) as ItemStatus[]) {
      const items = loadIndexByStatus(devstepsDir, s);
      if (items.includes(itemId)) { updateIndexByStatus(devstepsDir, s, items.filter((id) => id !== itemId)); break; }
    }
  }

  if (priority) {
    updateIndexByPriority(devstepsDir, priority, loadIndexByPriority(devstepsDir, priority).filter((id) => id !== itemId));
  } else {
    for (const p of Object.keys(INDEX_FILENAMES.PRIORITY) as EisenhowerQuadrant[]) {
      const items = loadIndexByPriority(devstepsDir, p);
      if (items.includes(itemId)) { updateIndexByPriority(devstepsDir, p, items.filter((id) => id !== itemId)); break; }
    }
  }
}

/**
 * Update item in indexes when status/priority changes
 */
export function updateItemInIndex(
  devstepsDir: string,
  itemId: string,
  oldStatus?: ItemStatus,
  newStatus?: ItemStatus,
  oldPriority?: EisenhowerQuadrant,
  newPriority?: EisenhowerQuadrant
): void {
  if (oldStatus && newStatus && oldStatus !== newStatus) {
    updateIndexByStatus(devstepsDir, oldStatus, loadIndexByStatus(devstepsDir, oldStatus).filter((id) => id !== itemId));
    const newItems = loadIndexByStatus(devstepsDir, newStatus);
    if (!newItems.includes(itemId)) { newItems.push(itemId); updateIndexByStatus(devstepsDir, newStatus, newItems); }
  }

  if (oldPriority && newPriority && oldPriority !== newPriority) {
    updateIndexByPriority(devstepsDir, oldPriority, loadIndexByPriority(devstepsDir, oldPriority).filter((id) => id !== itemId));
    const newItems = loadIndexByPriority(devstepsDir, newPriority);
    if (!newItems.includes(itemId)) { newItems.push(itemId); updateIndexByPriority(devstepsDir, newPriority, newItems); }
  }
}

//=============================================================================
// BACKWARD COMPATIBILITY
//=============================================================================

/**
 * Load legacy index.json (for migration/fallback)
 * @deprecated Use refs-style index operations instead
 */
export function loadLegacyIndex(devstepsDir: string): {
  items: Array<{ id: string; type: ItemType; status: ItemStatus; eisenhower?: EisenhowerQuadrant }>;
  counters: Record<string, number>;
} {
  const paths = getIndexPaths(devstepsDir);
  if (!existsSync(paths.legacy)) throw new Error('Legacy index.json not found');
  return JSON.parse(readFileSync(paths.legacy, 'utf-8'));
}

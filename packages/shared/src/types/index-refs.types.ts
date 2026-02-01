/**
 * Refs-Style Index Types
 *
 * Git-inspired distributed index architecture where each category
 * (type, status, priority) maintains its own index file containing
 * only item IDs.
 *
 * Benefits:
 * - Eliminates merge conflicts (separate files = no collisions)
 * - Faster queries (load only needed index)
 * - Atomic updates per category
 * - Scales better than monolithic index.json
 *
 * @see EPIC-018 Index Architecture Refactoring
 * @see STORY-069 Foundation: Refs-Style Index Schema
 */

import type { EisenhowerQuadrant, ItemStatus, ItemType } from '../schemas/index.js';

/**
 * Single category index file structure
 *
 * Example: .devsteps/index/by-type/tasks.json
 * ```json
 * {
 *   "category": "tasks",
 *   "items": ["TASK-160", "TASK-161", "TASK-162"],
 *   "updated": "2025-12-13T13:30:00.000Z"
 * }
 * ```
 */
export interface CategoryIndex {
  /** Category name (e.g., "tasks", "draft", "critical") */
  category: string;

  /** Array of item IDs in this category */
  items: string[];

  /** Last update timestamp (ISO 8601) */
  updated: string;
}

/**
 * Type-based index (by-type/*.json)
 * Maps each ItemType to its own file
 */
export interface TypeIndex extends CategoryIndex {
  category: ItemType;
}

/**
 * Status-based index (by-status/*.json)
 * Maps each ItemStatus to its own file
 */
export interface StatusIndex extends CategoryIndex {
  category: ItemStatus;
}

/**
 * Priority-based index (by-priority/*.json)
 * Maps each EisenhowerQuadrant to its own file
 */
export interface PriorityIndex extends CategoryIndex {
  category: EisenhowerQuadrant;
}

/**
 * Complete refs-style index structure
 * Aggregates all category indexes
 */
export interface RefsStyleIndex {
  /** Type indexes (epics.json, stories.json, tasks.json, etc.) */
  byType: Map<ItemType, string[]>;

  /** Status indexes (draft.json, in-progress.json, done.json, etc.) */
  byStatus: Map<ItemStatus, string[]>;

  /** Priority indexes (urgent-important.json, etc.) */
  byPriority: Map<EisenhowerQuadrant, string[]>;

  /** Counters for ID generation (preserved from legacy index) */
  counters: Record<string, number>;

  /** Last update timestamp across all indexes */
  lastUpdated: string;
}

/**
 * Index directory paths
 */
export interface IndexPaths {
  /** Root index directory (.devsteps/index/) */
  root: string;

  /** By-type directory (.devsteps/index/by-type/) */
  byType: string;

  /** By-status directory (.devsteps/index/by-status/) */
  byStatus: string;

  /** By-priority directory (.devsteps/index/by-priority/) */
  byPriority: string;

  /** Counters file (.devsteps/index/counters.json) */
  counters: string;

  /** Legacy index (.devsteps/index.json) - for migration detection */
  legacy: string;
}

/**
 * Index file naming conventions
 */
export const INDEX_FILENAMES = {
  /** Type index filenames */
  TYPE: {
    epic: 'epics.json',
    story: 'stories.json',
    task: 'tasks.json',
    requirement: 'requirements.json',
    feature: 'features.json',
    bug: 'bugs.json',
    spike: 'spikes.json',
    test: 'tests.json',
  } as Record<ItemType, string>,

  /** Status index filenames */
  STATUS: {
    draft: 'draft.json',
    planned: 'planned.json',
    'in-progress': 'in-progress.json',
    review: 'review.json',
    done: 'done.json',
    obsolete: 'obsolete.json',
    blocked: 'blocked.json',
    cancelled: 'cancelled.json',
  } as Record<ItemStatus, string>,

  /** Priority index filenames */
  PRIORITY: {
    'urgent-important': 'urgent-important.json',
    'not-urgent-important': 'not-urgent-important.json',
    'urgent-not-important': 'urgent-not-important.json',
    'not-urgent-not-important': 'not-urgent-not-important.json',
  } as Record<EisenhowerQuadrant, string>,
} as const;

/**
 * Index consistency rules
 */
export const INDEX_RULES = {
  /**
   * Every item MUST appear in exactly one file per dimension:
   * - Exactly one by-type/*.json file
   * - Exactly one by-status/*.json file
   * - Exactly one by-priority/*.json file
   */
  UNIQUE_PER_DIMENSION: true,

  /**
   * Performance targets (290 items)
   */
  PERFORMANCE: {
    loadSingleIndex: 10, // ms
    updateSingleIndex: 20, // ms
    loadFullIndex: 100, // ms
  },
} as const;

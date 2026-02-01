/**
 * Unit Tests for Auto-Migration Module
 *
 * @see STORY-073 External Project Migration Auto-Detection
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ItemMetadata, ItemType, ItemStatus, EisenhowerQuadrant } from '../schemas/index.js';
import {
  checkMigrationNeeded,
  getMigrationStatusMessage,
  ensureIndexMigrated,
  performMigration,
  type MigrationCheckResult,
  type MigrationStats,
} from './auto-migrate.js';
import {
  hasRefsStyleIndex,
  hasLegacyIndex,
  initializeRefsStyleIndex,
  loadAllIndexes,
} from './index-refs.js';

describe('Auto-Migration Module', () => {
  let testDir: string;
  let devstepsDir: string;

  // Helper to create minimal valid metadata
  const createMetadata = (
    id: string,
    type: ItemType,
    status: ItemStatus,
    eisenhower: EisenhowerQuadrant
  ): ItemMetadata => ({
    id,
    type,
    category: 'general',
    title: `Test ${type} ${id}`,
    status,
    eisenhower,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    linked_items: {
      implements: [],
      'implemented-by': [],
      'tested-by': [],
      tests: [],
      blocks: [],
      'blocked-by': [],
      'relates-to': [],
      'depends-on': [],
      'required-by': [],
      supersedes: [],
      'superseded-by': [],
    },
    tags: [],
    affected_paths: [],
    commits: [],
    metadata: {},
  });

  beforeEach(() => {
    // Create temporary test directory
    testDir = join(tmpdir(), `devsteps-test-${Date.now()}`);
    devstepsDir = join(testDir, '.devsteps');
    mkdirSync(devstepsDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('checkMigrationNeeded', () => {
    it('should return false when .devsteps directory does not exist', () => {
      const nonExistentDir = join(tmpdir(), 'non-existent-dir');
      const result = checkMigrationNeeded(nonExistentDir);

      expect(result.needed).toBe(false);
      expect(result.hasLegacy).toBe(false);
      expect(result.hasRefs).toBe(false);
      expect(result.message).toContain('Not a DevSteps project');
    });

    it('should return false when no index exists (new project)', () => {
      const result = checkMigrationNeeded(devstepsDir);

      expect(result.needed).toBe(false);
      expect(result.hasLegacy).toBe(false);
      expect(result.hasRefs).toBe(false);
      expect(result.message).toContain('No index found');
    });

    it('should return false when refs-style index already exists', () => {
      // Create refs-style index
      initializeRefsStyleIndex(devstepsDir);

      const result = checkMigrationNeeded(devstepsDir);

      expect(result.needed).toBe(false);
      expect(result.hasLegacy).toBe(false);
      expect(result.hasRefs).toBe(true);
      expect(result.message).toContain('already using refs-style index');
    });

    it('should return true when migration is needed', () => {
      // Create legacy index
      const legacyIndex = {
        version: '0.6.0',
        items: [
          { id: 'TASK-001', type: 'task', status: 'draft' },
          { id: 'STORY-001', type: 'story', status: 'in-progress' },
        ],
        counters: { task: 1, story: 1 },
      };
      writeFileSync(join(devstepsDir, 'index.json'), JSON.stringify(legacyIndex, null, 2));

      const result = checkMigrationNeeded(devstepsDir);

      expect(result.needed).toBe(true);
      expect(result.hasLegacy).toBe(true);
      expect(result.hasRefs).toBe(false);
      expect(result.itemCount).toBe(2);
      expect(result.message).toContain('Migration needed');
      expect(result.message).toContain('2 items');
    });

    it('should detect error state when both indexes exist', () => {
      // Create both legacy and refs-style index
      const legacyIndex = {
        version: '0.6.0',
        items: [{ id: 'TASK-001', type: 'task', status: 'draft' }],
        counters: { task: 1 },
      };
      writeFileSync(join(devstepsDir, 'index.json'), JSON.stringify(legacyIndex, null, 2));
      initializeRefsStyleIndex(devstepsDir);

      const result = checkMigrationNeeded(devstepsDir);

      expect(result.needed).toBe(false);
      expect(result.hasLegacy).toBe(true);
      expect(result.hasRefs).toBe(true);
      expect(result.message).toContain('Both index formats exist');
      expect(result.message).toContain('manual intervention');
    });

    it('should handle corrupted legacy index gracefully', () => {
      // Create invalid JSON
      writeFileSync(join(devstepsDir, 'index.json'), 'invalid json {]');

      const result = checkMigrationNeeded(devstepsDir);

      expect(result.needed).toBe(true);
      expect(result.hasLegacy).toBe(true);
      expect(result.hasRefs).toBe(false);
      expect(result.itemCount).toBeUndefined();
    });
  });

  describe('getMigrationStatusMessage', () => {
    it('should return appropriate message when not a DevSteps project', () => {
      const nonExistentDir = join(tmpdir(), 'non-existent-dir');
      const message = getMigrationStatusMessage(nonExistentDir);

      expect(message).toContain('Not a DevSteps project');
    });

    it('should return success message when using refs-style index', () => {
      initializeRefsStyleIndex(devstepsDir);
      const message = getMigrationStatusMessage(devstepsDir);

      expect(message).toContain('using refs-style index');
    });

    it('should return migration available message', () => {
      const legacyIndex = {
        version: '0.6.0',
        items: [
          { id: 'TASK-001', type: 'task', status: 'draft' },
          { id: 'TASK-002', type: 'task', status: 'draft' },
          { id: 'STORY-001', type: 'story', status: 'in-progress' },
        ],
        counters: { task: 2, story: 1 },
      };
      writeFileSync(join(devstepsDir, 'index.json'), JSON.stringify(legacyIndex, null, 2));

      const message = getMigrationStatusMessage(devstepsDir);

      expect(message).toContain('Migration available');
      expect(message).toContain('3 items');
    });
  });

  describe('ensureIndexMigrated', () => {
    it('should return false when migration not needed', async () => {
      initializeRefsStyleIndex(devstepsDir);

      const migrated = await ensureIndexMigrated(devstepsDir, { silent: true });

      expect(migrated).toBe(false);
    });

    it('should return true in dry-run mode when migration needed', async () => {
      const legacyIndex = {
        version: '0.6.0',
        items: [{ id: 'TASK-001', type: 'task', status: 'draft' }],
        counters: { task: 1 },
      };
      writeFileSync(join(devstepsDir, 'index.json'), JSON.stringify(legacyIndex, null, 2));

      // Create metadata file
      mkdirSync(join(devstepsDir, 'items', 'tasks'), { recursive: true });
      const metadata = createMetadata('TASK-001', 'task', 'draft', 'not-urgent-important');
      writeFileSync(
        join(devstepsDir, 'items', 'tasks', 'TASK-001.json'),
        JSON.stringify(metadata, null, 2)
      );

      const result = await ensureIndexMigrated(devstepsDir, { silent: true, dryRun: true });

      expect(result).toBe(true);
      // Index should NOT be created in dry-run
      expect(hasRefsStyleIndex(devstepsDir)).toBe(false);
      // Legacy index should still exist
      expect(hasLegacyIndex(devstepsDir)).toBe(true);
    });

    it('should be idempotent - safe to call multiple times', async () => {
      initializeRefsStyleIndex(devstepsDir);

      const result1 = await ensureIndexMigrated(devstepsDir, { silent: true });
      const result2 = await ensureIndexMigrated(devstepsDir, { silent: true });
      const result3 = await ensureIndexMigrated(devstepsDir, { silent: true });

      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });
  });

  describe('performMigration', () => {
    it('should throw error when .devsteps directory does not exist', async () => {
      const nonExistentDir = join(tmpdir(), 'non-existent-dir');

      await expect(performMigration(nonExistentDir)).rejects.toThrow(
        '.devsteps directory not found'
      );
    });

    it('should throw error when no legacy index exists', async () => {
      await expect(performMigration(devstepsDir)).rejects.toThrow('No index.json found');
    });

    it('should throw error when refs-style index already exists', async () => {
      // Create both indexes (error state)
      const legacyIndex = {
        version: '0.6.0',
        items: [{ id: 'TASK-001', type: 'task', status: 'draft' }],
        counters: { task: 1 },
      };
      writeFileSync(join(devstepsDir, 'index.json'), JSON.stringify(legacyIndex, null, 2));
      initializeRefsStyleIndex(devstepsDir);

      await expect(performMigration(devstepsDir)).rejects.toThrow(
        'Refs-style index already exists'
      );
    });

    it('should successfully migrate single item', async () => {
      // Create legacy index
      const legacyIndex = {
        version: '0.6.0',
        items: [{ id: 'TASK-001', type: 'task', status: 'draft' }],
        counters: { task: 1 },
      };
      writeFileSync(join(devstepsDir, 'index.json'), JSON.stringify(legacyIndex, null, 2));

      // Create metadata file
      mkdirSync(join(devstepsDir, 'items', 'tasks'), { recursive: true });
      const metadata = createMetadata('TASK-001', 'task', 'draft', 'not-urgent-important');
      writeFileSync(
        join(devstepsDir, 'items', 'tasks', 'TASK-001.json'),
        JSON.stringify(metadata, null, 2)
      );

      const stats = await performMigration(devstepsDir);

      expect(stats.totalItems).toBe(1);
      expect(stats.byType.task).toBe(1);
      expect(stats.byStatus.draft).toBe(1);
      expect(stats.backupPath).toBeDefined();
      expect(stats.archivePath).toBeDefined();
      expect(hasRefsStyleIndex(devstepsDir)).toBe(true);
      expect(hasLegacyIndex(devstepsDir)).toBe(false);

      // Verify migrated data
      const indexes = loadAllIndexes(devstepsDir);
      expect(indexes.byType.get('task')).toContain('TASK-001');
      expect(indexes.byStatus.get('draft')).toContain('TASK-001');
    });

    it('should successfully migrate multiple items of different types', async () => {
      // Create legacy index with multiple items
      const legacyIndex = {
        version: '0.6.0',
        items: [
          { id: 'TASK-001', type: 'task', status: 'draft' },
          { id: 'TASK-002', type: 'task', status: 'done' },
          { id: 'STORY-001', type: 'story', status: 'in-progress' },
          { id: 'BUG-001', type: 'bug', status: 'review' },
        ],
        counters: { task: 2, story: 1, bug: 1 },
      };
      writeFileSync(join(devstepsDir, 'index.json'), JSON.stringify(legacyIndex, null, 2));

      // Create metadata files
      mkdirSync(join(devstepsDir, 'items', 'tasks'), { recursive: true });
      mkdirSync(join(devstepsDir, 'items', 'stories'), { recursive: true });
      mkdirSync(join(devstepsDir, 'items', 'bugs'), { recursive: true });

      const items: ItemMetadata[] = [
        createMetadata('TASK-001', 'task', 'draft', 'not-urgent-important'),
        createMetadata('TASK-002', 'task', 'done', 'urgent-important'),
        createMetadata('STORY-001', 'story', 'in-progress', 'urgent-important'),
        createMetadata('BUG-001', 'bug', 'review', 'not-urgent-not-important'),
      ];

      for (const item of items) {
        const folder =
          item.type === 'task'
            ? 'items/tasks'
            : item.type === 'story'
              ? 'items/stories'
              : 'items/bugs';
        writeFileSync(join(devstepsDir, folder, `${item.id}.json`), JSON.stringify(item, null, 2));
      }

      const stats = await performMigration(devstepsDir);

      expect(stats.totalItems).toBe(4);
      expect(stats.byType.task).toBe(2);
      expect(stats.byType.story).toBe(1);
      expect(stats.byType.bug).toBe(1);
      expect(stats.byStatus.draft).toBe(1);
      expect(stats.byStatus.done).toBe(1);
      expect(stats.byStatus['in-progress']).toBe(1);
      expect(stats.byStatus.review).toBe(1);

      // Verify all items migrated correctly
      const indexes = loadAllIndexes(devstepsDir);
      expect(indexes.byType.get('task')).toEqual(expect.arrayContaining(['TASK-001', 'TASK-002']));
      expect(indexes.byType.get('story')).toContain('STORY-001');
      expect(indexes.byType.get('bug')).toContain('BUG-001');
    });

    it('should skip items with missing metadata files', async () => {
      // Create legacy index with 3 items, but only 2 metadata files
      const legacyIndex = {
        version: '0.6.0',
        items: [
          { id: 'TASK-001', type: 'task', status: 'draft' },
          { id: 'TASK-002', type: 'task', status: 'done' },
          { id: 'TASK-003', type: 'task', status: 'draft' },
        ],
        counters: { task: 3 },
      };
      writeFileSync(join(devstepsDir, 'index.json'), JSON.stringify(legacyIndex, null, 2));

      // Create only 2 metadata files
      mkdirSync(join(devstepsDir, 'items', 'tasks'), { recursive: true });
      const items: ItemMetadata[] = [
        createMetadata('TASK-001', 'task', 'draft', 'not-urgent-important'),
        createMetadata('TASK-002', 'task', 'done', 'urgent-important'),
        // TASK-003 metadata is missing
      ];

      for (const item of items) {
        writeFileSync(
          join(devstepsDir, 'items', 'tasks', `${item.id}.json`),
          JSON.stringify(item, null, 2)
        );
      }

      const stats = await performMigration(devstepsDir);

      // Should only migrate 2 items (skip missing TASK-003)
      expect(stats.totalItems).toBe(2);
      expect(stats.byType.task).toBe(2);
    });

    it('should create backup by default', async () => {
      const legacyIndex = {
        version: '0.6.0',
        items: [{ id: 'TASK-001', type: 'task', status: 'draft' }],
        counters: { task: 1 },
      };
      writeFileSync(join(devstepsDir, 'index.json'), JSON.stringify(legacyIndex, null, 2));

      mkdirSync(join(devstepsDir, 'items', 'tasks'), { recursive: true });
      const metadata = createMetadata('TASK-001', 'task', 'draft', 'not-urgent-important');
      writeFileSync(
        join(devstepsDir, 'items', 'tasks', 'TASK-001.json'),
        JSON.stringify(metadata, null, 2)
      );

      const stats = await performMigration(devstepsDir);

      expect(stats.backupPath).toBeDefined();
      expect(existsSync(stats.backupPath!)).toBe(true);
    });

    it('should skip backup when skipBackup option is true', async () => {
      const legacyIndex = {
        version: '0.6.0',
        items: [{ id: 'TASK-001', type: 'task', status: 'draft' }],
        counters: { task: 1 },
      };
      writeFileSync(join(devstepsDir, 'index.json'), JSON.stringify(legacyIndex, null, 2));

      mkdirSync(join(devstepsDir, 'items', 'tasks'), { recursive: true });
      const metadata = createMetadata('TASK-001', 'task', 'draft', 'not-urgent-important');
      writeFileSync(
        join(devstepsDir, 'items', 'tasks', 'TASK-001.json'),
        JSON.stringify(metadata, null, 2)
      );

      const stats = await performMigration(devstepsDir, { skipBackup: true });

      expect(stats.backupPath).toBeUndefined();
    });

    it('should archive original index.json after migration', async () => {
      const legacyIndex = {
        version: '0.6.0',
        items: [{ id: 'TASK-001', type: 'task', status: 'draft' }],
        counters: { task: 1 },
      };
      const legacyPath = join(devstepsDir, 'index.json');
      writeFileSync(legacyPath, JSON.stringify(legacyIndex, null, 2));

      mkdirSync(join(devstepsDir, 'items', 'tasks'), { recursive: true });
      const metadata = createMetadata('TASK-001', 'task', 'draft', 'not-urgent-important');
      writeFileSync(
        join(devstepsDir, 'items', 'tasks', 'TASK-001.json'),
        JSON.stringify(metadata, null, 2)
      );

      const stats = await performMigration(devstepsDir);

      // Original should be moved
      expect(existsSync(legacyPath)).toBe(false);
      // Archive should exist
      expect(stats.archivePath).toBeDefined();
      expect(existsSync(stats.archivePath!)).toBe(true);
      expect(stats.archivePath).toContain('.archived-');
    });

    it('should detect and prevent duplicate items via count mismatch', async () => {
      // This is a data integrity test - create corrupted legacy index with duplicates
      const legacyIndex = {
        version: '0.6.0',
        items: [
          { id: 'TASK-001', type: 'task', status: 'draft' },
          { id: 'TASK-001', type: 'task', status: 'draft' }, // Duplicate!
        ],
        counters: { task: 1 },
      };
      writeFileSync(join(devstepsDir, 'index.json'), JSON.stringify(legacyIndex, null, 2));

      mkdirSync(join(devstepsDir, 'items', 'tasks'), { recursive: true });
      const metadata = createMetadata('TASK-001', 'task', 'draft', 'not-urgent-important');
      writeFileSync(
        join(devstepsDir, 'items', 'tasks', 'TASK-001.json'),
        JSON.stringify(metadata, null, 2)
      );

      // Migration should fail with count mismatch (duplicate handling in addItemToIndex)
      await expect(performMigration(devstepsDir)).rejects.toThrow('Item count mismatch');
    });
  });
});

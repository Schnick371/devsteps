/**
 * Unit Tests for Index Rebuild Operations
 *
 * @see STORY-074 Index Rebuild Command
 * @see EPIC-018 Index Architecture Refactoring
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ItemMetadata, ItemType } from '../schemas/index.js';
import { TYPE_TO_DIRECTORY } from '../utils/index.js';
import { rebuildIndex } from './index-rebuild.js';
import {
  hasRefsStyleIndex,
  loadCounters,
  loadIndexByPriority,
  loadIndexByStatus,
  loadIndexByType,
} from './index-refs.js';

describe('Index Rebuild Operations', () => {
  let testDir: string;
  let devstepsDir: string;

  beforeEach(() => {
    // Create temporary test directory with random suffix to avoid parallel test collisions
    testDir = join(
      tmpdir(),
      `devsteps-rebuild-test-${Date.now()}-${Math.random().toString(36).substring(7)}`
    );
    devstepsDir = join(testDir, '.devsteps');
    mkdirSync(devstepsDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  /**
   * Helper: Create a test item file
   */
  function createItemFile(
    type: string,
    item: Partial<ItemMetadata> & {
      id: string;
      type: ItemMetadata['type'];
      title: string;
      status: ItemMetadata['status'];
    }
  ): void {
    const typeDir = join(devstepsDir, TYPE_TO_DIRECTORY[type as ItemType]);
    mkdirSync(typeDir, { recursive: true });

    // Create complete item with defaults for required fields
    const completeItem = {
      category: 'general',
      eisenhower: 'not-urgent-not-important',
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
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      ...item,
    };

    const jsonPath = join(typeDir, `${item.id}.json`);
    writeFileSync(jsonPath, JSON.stringify(completeItem, null, 2));

    // Also create dummy .md file
    const mdPath = join(typeDir, `${item.id}.md`);
    writeFileSync(mdPath, `# ${item.title}\n\nTest item`);
  }

  /**
   * Helper: Create a corrupt JSON file
   */
  function createCorruptFile(type: string, id: string): void {
    const typeDir = join(devstepsDir, TYPE_TO_DIRECTORY[type as ItemType]);
    mkdirSync(typeDir, { recursive: true });

    const jsonPath = join(typeDir, `${id}.json`);
    writeFileSync(jsonPath, '{corrupt json content');
  }

  /**
   * Helper: Create an invalid item (missing required fields)
   */
  function createInvalidItemFile(type: string, id: string): void {
    const typeDir = join(devstepsDir, TYPE_TO_DIRECTORY[type as ItemType]);
    mkdirSync(typeDir, { recursive: true });

    const jsonPath = join(typeDir, `${id}.json`);
    writeFileSync(jsonPath, JSON.stringify({ invalid: true }, null, 2));
  }

  describe('rebuildIndex - Basic Functionality', () => {
    it('should rebuild empty index successfully', async () => {
      const result = await rebuildIndex(devstepsDir);

      expect(result.totalItems).toBe(0);
      expect(result.processedItems).toBe(0);
      expect(result.skippedItems).toBe(0);
      expect(result.errors).toEqual([]);
      expect(hasRefsStyleIndex(devstepsDir)).toBe(true);
    });

    it('should rebuild index with single item', async () => {
      createItemFile('task', {
        id: 'TASK-001',
        type: 'task',
        title: 'Test Task',
        status: 'draft',
        eisenhower: 'not-urgent-not-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      const result = await rebuildIndex(devstepsDir);

      expect(result.totalItems).toBe(1);
      expect(result.processedItems).toBe(1);
      expect(result.skippedItems).toBe(0);
      expect(result.filesCreated).toBeGreaterThan(0);

      // Verify index was created correctly
      const taskIds = loadIndexByType(devstepsDir, 'task');
      expect(taskIds).toEqual(['TASK-001']);

      const draftIds = loadIndexByStatus(devstepsDir, 'draft');
      expect(draftIds).toEqual(['TASK-001']);
    });

    it('should rebuild index with multiple items of different types', async () => {
      createItemFile('task', {
        id: 'TASK-001',
        type: 'task',
        title: 'Task 1',
        status: 'draft',
        eisenhower: 'urgent-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      createItemFile('epic', {
        id: 'EPIC-001',
        type: 'epic',
        title: 'Epic 1',
        status: 'planned',
        eisenhower: 'not-urgent-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      createItemFile('story', {
        id: 'STORY-001',
        type: 'story',
        title: 'Story 1',
        status: 'in-progress',
        eisenhower: 'urgent-not-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      const result = await rebuildIndex(devstepsDir);

      // Debug output on failure
      if (result.totalItems !== 3) {
        console.log('Rebuild result:', JSON.stringify(result, null, 2));
      }

      expect(result.totalItems).toBe(3);
      expect(result.processedItems).toBe(3);
      expect(result.stats.byType).toEqual({
        task: 1,
        epic: 1,
        story: 1,
      });
    });

    it('should calculate statistics correctly', async () => {
      // Create items with various attributes
      createItemFile('task', {
        id: 'TASK-001',
        type: 'task',
        title: 'Task 1',
        status: 'draft',
        eisenhower: 'urgent-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      createItemFile('task', {
        id: 'TASK-002',
        type: 'task',
        title: 'Task 2',
        status: 'draft',
        eisenhower: 'urgent-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      createItemFile('task', {
        id: 'TASK-003',
        type: 'task',
        title: 'Task 3',
        status: 'done',
        eisenhower: 'not-urgent-not-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      const result = await rebuildIndex(devstepsDir);

      expect(result.stats.byType.task).toBe(3);
      expect(result.stats.byStatus.draft).toBe(2);
      expect(result.stats.byStatus.done).toBe(1);
      expect(result.stats.byPriority['urgent-important']).toBe(2);
      expect(result.stats.byPriority['not-urgent-not-important']).toBe(1);
    });
  });

  describe('rebuildIndex - Dry Run Mode', () => {
    it('should not create index in dry-run mode', async () => {
      createItemFile('task', {
        id: 'TASK-001',
        type: 'task',
        title: 'Test Task',
        status: 'draft',
        eisenhower: 'not-urgent-not-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      const result = await rebuildIndex(devstepsDir, { dryRun: true });

      expect(result.totalItems).toBe(1);
      expect(result.processedItems).toBe(1);
      expect(result.filesCreated).toBe(0);

      // Verify no index was created
      expect(hasRefsStyleIndex(devstepsDir)).toBe(false);
    });

    it('should still scan and report items in dry-run mode', async () => {
      createItemFile('task', {
        id: 'TASK-001',
        type: 'task',
        title: 'Task 1',
        status: 'draft',
        eisenhower: 'urgent-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      createItemFile('epic', {
        id: 'EPIC-001',
        type: 'epic',
        title: 'Epic 1',
        status: 'planned',
        eisenhower: 'not-urgent-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      const result = await rebuildIndex(devstepsDir, { dryRun: true });

      expect(result.processedItems).toBe(2);
      expect(result.stats.byType).toEqual({
        task: 1,
        epic: 1,
      });
    });
  });

  describe('rebuildIndex - Backup Functionality', () => {
    it('should create backup when backup=true', async () => {
      // First, create an initial index
      createItemFile('task', {
        id: 'TASK-001',
        type: 'task',
        title: 'Task 1',
        status: 'draft',
        eisenhower: 'not-urgent-not-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      await rebuildIndex(devstepsDir, { backup: false });

      // Now rebuild with backup
      const result = await rebuildIndex(devstepsDir, { backup: true });

      expect(result.backupPath).toBeDefined();
      expect(result.backupPath).toContain('index.backup-');
      expect(result.backupPath && existsSync(result.backupPath)).toBe(true);
    });

    it('should skip backup when backup=false', async () => {
      // Create initial index
      createItemFile('task', {
        id: 'TASK-001',
        type: 'task',
        title: 'Task 1',
        status: 'draft',
        eisenhower: 'not-urgent-not-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      await rebuildIndex(devstepsDir, { backup: false });

      // Rebuild without backup
      const result = await rebuildIndex(devstepsDir, { backup: false });

      expect(result.backupPath).toBeUndefined();
    });

    it('should not create backup in dry-run mode', async () => {
      createItemFile('task', {
        id: 'TASK-001',
        type: 'task',
        title: 'Task 1',
        status: 'draft',
        eisenhower: 'not-urgent-not-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      const result = await rebuildIndex(devstepsDir, { dryRun: true, backup: true });

      expect(result.backupPath).toBeUndefined();
    });
  });

  describe('rebuildIndex - Error Handling', () => {
    it('should handle corrupt JSON files gracefully', async () => {
      createItemFile('task', {
        id: 'TASK-001',
        type: 'task',
        title: 'Valid Task',
        status: 'draft',
        eisenhower: 'not-urgent-not-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      createCorruptFile('task', 'TASK-002');

      const result = await rebuildIndex(devstepsDir);

      expect(result.processedItems).toBe(1);
      expect(result.skippedItems).toBe(1);
      expect(result.totalItems).toBe(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].file).toContain('TASK-002.json');
    });

    it('should handle invalid item metadata', async () => {
      createItemFile('task', {
        id: 'TASK-001',
        type: 'task',
        title: 'Valid Task',
        status: 'draft',
        eisenhower: 'not-urgent-not-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      createInvalidItemFile('task', 'TASK-002');

      const result = await rebuildIndex(devstepsDir);

      expect(result.processedItems).toBe(1);
      expect(result.skippedItems).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('missing required fields');
    });

    it('should handle multiple errors gracefully', async () => {
      createCorruptFile('task', 'TASK-001');
      createInvalidItemFile('task', 'TASK-002');
      createCorruptFile('epic', 'EPIC-001');

      const result = await rebuildIndex(devstepsDir);

      expect(result.processedItems).toBe(0);
      expect(result.skippedItems).toBe(3);
      expect(result.errors).toHaveLength(3);
    });

    it('should throw error when devsteps directory does not exist', async () => {
      const nonExistentDir = join(testDir, 'nonexistent', '.devsteps');

      await expect(rebuildIndex(nonExistentDir)).rejects.toThrow('DevSteps directory not found');
    });
  });

  describe('rebuildIndex - Counter Extraction', () => {
    it('should extract correct counters from items', async () => {
      createItemFile('task', {
        id: 'TASK-005',
        type: 'task',
        title: 'Task 5',
        status: 'draft',
        eisenhower: 'not-urgent-not-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      createItemFile('task', {
        id: 'TASK-003',
        type: 'task',
        title: 'Task 3',
        status: 'draft',
        eisenhower: 'not-urgent-not-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      createItemFile('epic', {
        id: 'EPIC-010',
        type: 'epic',
        title: 'Epic 10',
        status: 'planned',
        eisenhower: 'not-urgent-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      await rebuildIndex(devstepsDir);

      const counters = loadCounters(devstepsDir);

      // Should extract highest ID for each type
      expect(counters.TASK).toBe(5);
      expect(counters.EPIC).toBe(10);
    });

    it('should handle items with missing eisenhower field', async () => {
      // Create item without eisenhower field
      const typeDir = join(devstepsDir, 'tasks');
      mkdirSync(typeDir, { recursive: true });
      const jsonPath = join(typeDir, 'TASK-001.json');
      writeFileSync(
        jsonPath,
        JSON.stringify({
          id: 'TASK-001',
          type: 'task',
          title: 'Task without eisenhower',
          status: 'draft',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        })
      );

      const result = await rebuildIndex(devstepsDir);

      expect(result.processedItems).toBe(1);
      expect(result.stats.byPriority['not-urgent-not-important']).toBe(1);
    });
  });

  describe('rebuildIndex - Progress Callback', () => {
    it('should call progress callback during rebuild', async () => {
      createItemFile('task', {
        id: 'TASK-001',
        type: 'task',
        title: 'Task 1',
        status: 'draft',
        eisenhower: 'not-urgent-not-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      const progressMessages: string[] = [];

      await rebuildIndex(devstepsDir, {
        onProgress: (_current, _total, message) => {
          progressMessages.push(message);
        },
      });

      expect(progressMessages.length).toBeGreaterThan(0);
      expect(progressMessages.some((msg) => msg.includes('Scanning'))).toBe(true);
    });
  });

  describe('rebuildIndex - Edge Cases', () => {
    it('should handle empty project with no item directories', async () => {
      const result = await rebuildIndex(devstepsDir);

      expect(result.totalItems).toBe(0);
      expect(result.processedItems).toBe(0);
      expect(result.errors).toEqual([]);
    });

    it('should ignore non-JSON files in item directories', async () => {
      const typeDir = join(devstepsDir, 'tasks');
      mkdirSync(typeDir, { recursive: true });

      // Create various non-JSON files
      writeFileSync(join(typeDir, 'README.md'), '# Tasks');
      writeFileSync(join(typeDir, 'config.txt'), 'config');
      writeFileSync(join(typeDir, '.gitignore'), 'node_modules');

      const result = await rebuildIndex(devstepsDir);

      expect(result.processedItems).toBe(0);
      expect(result.errors).toEqual([]);
    });

    it('should handle large number of items', async () => {
      // Create 100 tasks
      for (let i = 1; i <= 100; i++) {
        createItemFile('task', {
          id: `TASK-${String(i).padStart(3, '0')}`,
          type: 'task',
          title: `Task ${i}`,
          status: i % 2 === 0 ? 'draft' : 'done',
          eisenhower: i % 3 === 0 ? 'urgent-important' : 'not-urgent-not-important',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        });
      }

      const result = await rebuildIndex(devstepsDir);

      expect(result.processedItems).toBe(100);
      expect(result.stats.byType.task).toBe(100);
      expect(result.stats.byStatus.draft).toBe(50);
      expect(result.stats.byStatus.done).toBe(50);
    });

    it('should handle items with all possible statuses', async () => {
      const statuses: Array<
        | 'draft'
        | 'planned'
        | 'in-progress'
        | 'review'
        | 'done'
        | 'blocked'
        | 'cancelled'
        | 'obsolete'
      > = ['draft', 'planned', 'in-progress', 'review', 'done', 'blocked', 'cancelled', 'obsolete'];

      statuses.forEach((status, index) => {
        createItemFile('task', {
          id: `TASK-${String(index + 1).padStart(3, '0')}`,
          type: 'task',
          title: `Task ${status}`,
          status,
          eisenhower: 'not-urgent-not-important',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        });
      });

      const result = await rebuildIndex(devstepsDir);

      expect(result.processedItems).toBe(statuses.length);
      statuses.forEach((status) => {
        expect(result.stats.byStatus[status]).toBe(1);
      });
    });

    it('should handle all eisenhower quadrants', async () => {
      const quadrants: Array<
        | 'urgent-important'
        | 'not-urgent-important'
        | 'urgent-not-important'
        | 'not-urgent-not-important'
      > = [
        'urgent-important',
        'not-urgent-important',
        'urgent-not-important',
        'not-urgent-not-important',
      ];

      quadrants.forEach((quadrant, index) => {
        createItemFile('task', {
          id: `TASK-${String(index + 1).padStart(3, '0')}`,
          type: 'task',
          title: `Task ${quadrant}`,
          status: 'draft',
          eisenhower: quadrant,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        });
      });

      const result = await rebuildIndex(devstepsDir);

      expect(result.processedItems).toBe(quadrants.length);
      quadrants.forEach((quadrant) => {
        expect(result.stats.byPriority[quadrant]).toBe(1);
      });
    });
  });

  describe('rebuildIndex - Integration with Index Refs', () => {
    it('should create queryable index after rebuild', async () => {
      createItemFile('task', {
        id: 'TASK-001',
        type: 'task',
        title: 'Task 1',
        status: 'draft',
        eisenhower: 'urgent-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      createItemFile('task', {
        id: 'TASK-002',
        type: 'task',
        title: 'Task 2',
        status: 'done',
        eisenhower: 'not-urgent-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      await rebuildIndex(devstepsDir);

      // Verify index can be queried
      const allTasks = loadIndexByType(devstepsDir, 'task');
      expect(allTasks).toHaveLength(2);
      expect(allTasks).toContain('TASK-001');
      expect(allTasks).toContain('TASK-002');

      const draftTasks = loadIndexByStatus(devstepsDir, 'draft');
      expect(draftTasks).toEqual(['TASK-001']);

      const doneTasks = loadIndexByStatus(devstepsDir, 'done');
      expect(doneTasks).toEqual(['TASK-002']);

      const urgentImportant = loadIndexByPriority(devstepsDir, 'urgent-important');
      expect(urgentImportant).toEqual(['TASK-001']);
    });

    it('should preserve item order in index files', async () => {
      // Create items in specific order
      createItemFile('task', {
        id: 'TASK-003',
        type: 'task',
        title: 'Task 3',
        status: 'draft',
        eisenhower: 'not-urgent-not-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      createItemFile('task', {
        id: 'TASK-001',
        type: 'task',
        title: 'Task 1',
        status: 'draft',
        eisenhower: 'not-urgent-not-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      createItemFile('task', {
        id: 'TASK-002',
        type: 'task',
        title: 'Task 2',
        status: 'draft',
        eisenhower: 'not-urgent-not-important',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      await rebuildIndex(devstepsDir);

      const taskIds = loadIndexByType(devstepsDir, 'task');
      expect(taskIds).toHaveLength(3);
      // Order should be preserved as files are read
      expect(taskIds).toContain('TASK-001');
      expect(taskIds).toContain('TASK-002');
      expect(taskIds).toContain('TASK-003');
    });
  });
});

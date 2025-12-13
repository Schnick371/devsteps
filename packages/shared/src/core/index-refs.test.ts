/**
 * Unit Tests for Refs-Style Index Core Operations
 * 
 * @see STORY-069 Foundation: Refs-Style Index Schema & Core Operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ItemMetadata } from '../schemas/index.js';
import {
	getIndexPaths,
	hasRefsStyleIndex,
	hasLegacyIndex,
	initializeRefsStyleIndex,
	loadIndexByType,
	loadIndexByStatus,
	loadIndexByPriority,
	loadAllIndexes,
	loadCounters,
	updateIndexByType,
	updateIndexByStatus,
	updateIndexByPriority,
	updateCounters,
	addItemToIndex,
	removeItemFromIndex,
	updateItemInIndex,
} from './index-refs.js';

describe('Refs-Style Index Operations', () => {
	let testDir: string;
	let devstepsDir: string;

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

	describe('getIndexPaths', () => {
		it('should return correct index paths', () => {
			const paths = getIndexPaths(devstepsDir);

			expect(paths.root).toBe(join(devstepsDir, 'index'));
			expect(paths.byType).toBe(join(devstepsDir, 'index', 'by-type'));
			expect(paths.byStatus).toBe(join(devstepsDir, 'index', 'by-status'));
			expect(paths.byPriority).toBe(join(devstepsDir, 'index', 'by-priority'));
			expect(paths.counters).toBe(join(devstepsDir, 'index', 'counters.json'));
			expect(paths.legacy).toBe(join(devstepsDir, 'index.json'));
		});
	});

	describe('hasRefsStyleIndex', () => {
		it('should return false when index does not exist', () => {
			expect(hasRefsStyleIndex(devstepsDir)).toBe(false);
		});

		it('should return true after initialization', () => {
			initializeRefsStyleIndex(devstepsDir);
			expect(hasRefsStyleIndex(devstepsDir)).toBe(true);
		});
	});

	describe('hasLegacyIndex', () => {
		it('should return false when legacy index does not exist', () => {
			expect(hasLegacyIndex(devstepsDir)).toBe(false);
		});
	});

	describe('initializeRefsStyleIndex', () => {
		it('should create all required directories', () => {
			initializeRefsStyleIndex(devstepsDir);

			const paths = getIndexPaths(devstepsDir);
			expect(existsSync(paths.root)).toBe(true);
			expect(existsSync(paths.byType)).toBe(true);
			expect(existsSync(paths.byStatus)).toBe(true);
			expect(existsSync(paths.byPriority)).toBe(true);
			expect(existsSync(paths.counters)).toBe(true);
		});

		it('should create empty index files for all types', () => {
			initializeRefsStyleIndex(devstepsDir);

			const taskIds = loadIndexByType(devstepsDir, 'task');
			const epicIds = loadIndexByType(devstepsDir, 'epic');
			const storyIds = loadIndexByType(devstepsDir, 'story');

			expect(taskIds).toEqual([]);
			expect(epicIds).toEqual([]);
			expect(storyIds).toEqual([]);
		});

		it('should create empty index files for all statuses', () => {
			initializeRefsStyleIndex(devstepsDir);

			const draftIds = loadIndexByStatus(devstepsDir, 'draft');
			const doneIds = loadIndexByStatus(devstepsDir, 'done');

			expect(draftIds).toEqual([]);
			expect(doneIds).toEqual([]);
		});

		it('should initialize counters with provided values', () => {
			const initialCounters = { task: 10, epic: 5 };
			initializeRefsStyleIndex(devstepsDir, initialCounters);

			const counters = loadCounters(devstepsDir);
			expect(counters).toEqual(initialCounters);
		});
	});

	describe('loadIndexByType', () => {
		beforeEach(() => {
			initializeRefsStyleIndex(devstepsDir);
		});

		it('should return empty array for empty index', () => {
			const taskIds = loadIndexByType(devstepsDir, 'task');
			expect(taskIds).toEqual([]);
		});

		it('should return item IDs after update', () => {
			updateIndexByType(devstepsDir, 'task', ['TASK-001', 'TASK-002']);

			const taskIds = loadIndexByType(devstepsDir, 'task');
			expect(taskIds).toEqual(['TASK-001', 'TASK-002']);
		});

		it('should return empty array for non-existent index file', () => {
			rmSync(join(devstepsDir, 'index'), { recursive: true, force: true });

			const taskIds = loadIndexByType(devstepsDir, 'task');
			expect(taskIds).toEqual([]);
		});
	});

	describe('loadIndexByStatus', () => {
		beforeEach(() => {
			initializeRefsStyleIndex(devstepsDir);
		});

		it('should return empty array for empty index', () => {
			const draftIds = loadIndexByStatus(devstepsDir, 'draft');
			expect(draftIds).toEqual([]);
		});

		it('should return item IDs after update', () => {
			updateIndexByStatus(devstepsDir, 'draft', ['STORY-001', 'TASK-001']);

			const draftIds = loadIndexByStatus(devstepsDir, 'draft');
			expect(draftIds).toEqual(['STORY-001', 'TASK-001']);
		});
	});

	describe('loadIndexByPriority', () => {
		beforeEach(() => {
			initializeRefsStyleIndex(devstepsDir);
		});

		it('should return empty array for empty index', () => {
			const urgentIds = loadIndexByPriority(devstepsDir, 'urgent-important');
			expect(urgentIds).toEqual([]);
		});

		it('should return item IDs after update', () => {
			updateIndexByPriority(devstepsDir, 'urgent-important', ['EPIC-001']);

			const urgentIds = loadIndexByPriority(devstepsDir, 'urgent-important');
			expect(urgentIds).toEqual(['EPIC-001']);
		});
	});

	describe('loadAllIndexes', () => {
		beforeEach(() => {
			initializeRefsStyleIndex(devstepsDir, { task: 100, epic: 50 });
		});

		it('should load all indexes into memory', () => {
			updateIndexByType(devstepsDir, 'task', ['TASK-100', 'TASK-101']);
			updateIndexByStatus(devstepsDir, 'draft', ['TASK-100']);
			updateIndexByStatus(devstepsDir, 'done', ['TASK-101']);

			const indexes = loadAllIndexes(devstepsDir);

			expect(indexes.byType.get('task')).toEqual(['TASK-100', 'TASK-101']);
			expect(indexes.byStatus.get('draft')).toEqual(['TASK-100']);
			expect(indexes.byStatus.get('done')).toEqual(['TASK-101']);
			expect(indexes.counters).toEqual({ task: 100, epic: 50 });
		});
	});

	describe('updateIndexByType', () => {
		beforeEach(() => {
			initializeRefsStyleIndex(devstepsDir);
		});

		it('should update type index atomically', () => {
			updateIndexByType(devstepsDir, 'task', ['TASK-001', 'TASK-002']);

			const taskIds = loadIndexByType(devstepsDir, 'task');
			expect(taskIds).toEqual(['TASK-001', 'TASK-002']);
		});

		it('should overwrite previous index', () => {
			updateIndexByType(devstepsDir, 'task', ['TASK-001']);
			updateIndexByType(devstepsDir, 'task', ['TASK-002', 'TASK-003']);

			const taskIds = loadIndexByType(devstepsDir, 'task');
			expect(taskIds).toEqual(['TASK-002', 'TASK-003']);
		});
	});

	describe('updateCounters', () => {
		beforeEach(() => {
			initializeRefsStyleIndex(devstepsDir);
		});

		it('should update counters file', () => {
			updateCounters(devstepsDir, { task: 200, epic: 100 });

			const counters = loadCounters(devstepsDir);
			expect(counters).toEqual({ task: 200, epic: 100 });
		});
	});

	describe('addItemToIndex', () => {
		beforeEach(() => {
			initializeRefsStyleIndex(devstepsDir);
		});

		it('should add item to all relevant indexes', () => {
			const item: ItemMetadata = {
				id: 'TASK-001',
				type: 'task',
				category: 'test',
				title: 'Test Task',
				status: 'draft',
				eisenhower: 'urgent-important',
				created: '2025-12-13T00:00:00.000Z',
				updated: '2025-12-13T00:00:00.000Z',
				affected_paths: [],
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
				commits: [],
				metadata: {},
			};

			addItemToIndex(devstepsDir, item);

			expect(loadIndexByType(devstepsDir, 'task')).toEqual(['TASK-001']);
			expect(loadIndexByStatus(devstepsDir, 'draft')).toEqual(['TASK-001']);
			expect(loadIndexByPriority(devstepsDir, 'urgent-important')).toEqual(['TASK-001']);
		});

		it('should not add duplicate entries', () => {
			const item: ItemMetadata = {
				id: 'TASK-001',
				type: 'task',
				category: 'test',
				title: 'Test Task',
				status: 'draft',
				eisenhower: 'urgent-important',
				created: '2025-12-13T00:00:00.000Z',
				updated: '2025-12-13T00:00:00.000Z',
				affected_paths: [],
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
				commits: [],
				metadata: {},
			};

			addItemToIndex(devstepsDir, item);
			addItemToIndex(devstepsDir, item); // Add again

			expect(loadIndexByType(devstepsDir, 'task')).toEqual(['TASK-001']);
		});
	});

	describe('removeItemFromIndex', () => {
		beforeEach(() => {
			initializeRefsStyleIndex(devstepsDir);
		});

		it('should remove item from all indexes', () => {
			const item: ItemMetadata = {
				id: 'TASK-001',
				type: 'task',
				category: 'test',
				title: 'Test Task',
				status: 'draft',
				eisenhower: 'urgent-important',
				created: '2025-12-13T00:00:00.000Z',
				updated: '2025-12-13T00:00:00.000Z',
				affected_paths: [],
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
				commits: [],
				metadata: {},
			};

			addItemToIndex(devstepsDir, item);
			removeItemFromIndex(devstepsDir, 'TASK-001', 'task', 'draft', 'urgent-important');

			expect(loadIndexByType(devstepsDir, 'task')).toEqual([]);
			expect(loadIndexByStatus(devstepsDir, 'draft')).toEqual([]);
			expect(loadIndexByPriority(devstepsDir, 'urgent-important')).toEqual([]);
		});
	});

	describe('updateItemInIndex', () => {
		beforeEach(() => {
			initializeRefsStyleIndex(devstepsDir);
		});

		it('should update item when status changes', () => {
			const item: ItemMetadata = {
				id: 'TASK-001',
				type: 'task',
				category: 'test',
				title: 'Test Task',
				status: 'draft',
				eisenhower: 'urgent-important',
				created: '2025-12-13T00:00:00.000Z',
				updated: '2025-12-13T00:00:00.000Z',
				affected_paths: [],
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
				commits: [],
				metadata: {},
			};

			addItemToIndex(devstepsDir, item);
			updateItemInIndex(devstepsDir, 'TASK-001', 'draft', 'done');

			expect(loadIndexByStatus(devstepsDir, 'draft')).toEqual([]);
			expect(loadIndexByStatus(devstepsDir, 'done')).toEqual(['TASK-001']);
		});

		it('should update item when priority changes', () => {
			const item: ItemMetadata = {
				id: 'TASK-001',
				type: 'task',
				category: 'test',
				title: 'Test Task',
				status: 'draft',
				eisenhower: 'urgent-important',
				created: '2025-12-13T00:00:00.000Z',
				updated: '2025-12-13T00:00:00.000Z',
				affected_paths: [],
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
				commits: [],
				metadata: {},
			};

			addItemToIndex(devstepsDir, item);
			updateItemInIndex(
				devstepsDir,
				'TASK-001',
				undefined,
				undefined,
				'urgent-important',
				'not-urgent-important',
			);

			expect(loadIndexByPriority(devstepsDir, 'urgent-important')).toEqual([]);
			expect(loadIndexByPriority(devstepsDir, 'not-urgent-important')).toEqual(['TASK-001']);
		});
	});

	describe('Performance', () => {
		beforeEach(() => {
			initializeRefsStyleIndex(devstepsDir);
		});

		it('should load single index in < 10ms (small dataset)', () => {
			// Create small dataset
			const ids = Array.from({ length: 100 }, (_, i) => `TASK-${String(i + 1).padStart(3, '0')}`);
			updateIndexByType(devstepsDir, 'task', ids);

			const start = performance.now();
			loadIndexByType(devstepsDir, 'task');
			const elapsed = performance.now() - start;

			expect(elapsed).toBeLessThan(10);
		});
	});
});

/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Unit tests for methodologyDetector — cross-cutting, scrum, waterfall classification
 */

import { describe, expect, it } from 'vitest';
import type { WorkItem } from '../types.js';
import { getItemMethodology } from './methodologyDetector.js';

function makeItem(id: string, type: string, linked_items?: WorkItem['linked_items']): WorkItem {
  return {
    id,
    type,
    title: `${type} item`,
    status: 'draft',
    eisenhower: 'not-urgent-not-important',
    priority: 'low',
    linked_items,
  };
}

describe('getItemMethodology', () => {
  describe('cross-cutting types', () => {
    it('returns cross-cutting for doc items', () => {
      const item = makeItem('DOC-001', 'doc');
      const map = new Map([[item.id, item]]);
      expect(getItemMethodology(item, map)).toBe('cross-cutting');
    });

    it('returns cross-cutting for test items with no parent', () => {
      const item = makeItem('TEST-001', 'test');
      const map = new Map([[item.id, item]]);
      expect(getItemMethodology(item, map)).toBe('cross-cutting');
    });
  });

  describe('scrum types', () => {
    it('returns scrum for epic', () => {
      const item = makeItem('EPIC-001', 'epic');
      const map = new Map([[item.id, item]]);
      expect(getItemMethodology(item, map)).toBe('scrum');
    });

    it('returns scrum for story', () => {
      const item = makeItem('STORY-001', 'story');
      const map = new Map([[item.id, item]]);
      expect(getItemMethodology(item, map)).toBe('scrum');
    });

    it('returns scrum for spike', () => {
      const item = makeItem('SPIKE-001', 'spike');
      const map = new Map([[item.id, item]]);
      expect(getItemMethodology(item, map)).toBe('scrum');
    });
  });

  describe('waterfall types', () => {
    it('returns waterfall for requirement', () => {
      const item = makeItem('REQ-001', 'requirement');
      const map = new Map([[item.id, item]]);
      expect(getItemMethodology(item, map)).toBe('waterfall');
    });

    it('returns waterfall for feature', () => {
      const item = makeItem('FEAT-001', 'feature');
      const map = new Map([[item.id, item]]);
      expect(getItemMethodology(item, map)).toBe('waterfall');
    });
  });

  describe('shared types inherit from parent', () => {
    it('returns scrum for task implementing a story', () => {
      const story = makeItem('STORY-001', 'story');
      const task = makeItem('TASK-001', 'task', { implements: ['STORY-001'] });
      const map = new Map([
        [story.id, story],
        [task.id, task],
      ]);
      expect(getItemMethodology(task, map)).toBe('scrum');
    });

    it('returns waterfall for task implementing a feature', () => {
      const feature = makeItem('FEAT-001', 'feature');
      const task = makeItem('TASK-001', 'task', { implements: ['FEAT-001'] });
      const map = new Map([
        [feature.id, feature],
        [task.id, task],
      ]);
      expect(getItemMethodology(task, map)).toBe('waterfall');
    });

    it('returns scrum for task with unknown parent (default)', () => {
      const task = makeItem('TASK-001', 'task', { implements: ['MISSING-999'] });
      const map = new Map([[task.id, task]]);
      expect(getItemMethodology(task, map)).toBe('scrum');
    });

    it('returns scrum for task with no parent (default)', () => {
      const task = makeItem('TASK-001', 'task');
      const map = new Map([[task.id, task]]);
      expect(getItemMethodology(task, map)).toBe('scrum');
    });

    it('returns cross-cutting for test implementing a doc', () => {
      const doc = makeItem('DOC-001', 'doc');
      const test = makeItem('TEST-001', 'test', { implements: ['DOC-001'] });
      const map = new Map([
        [doc.id, doc],
        [test.id, test],
      ]);
      expect(getItemMethodology(test, map)).toBe('cross-cutting');
    });

    it('inherits scrum for bug relating to a story', () => {
      const story = makeItem('STORY-001', 'story');
      const bug = makeItem('BUG-001', 'bug', { 'relates-to': ['STORY-001'] });
      const map = new Map([
        [story.id, story],
        [bug.id, bug],
      ]);
      expect(getItemMethodology(bug, map)).toBe('scrum');
    });
  });

  describe('cycle guard', () => {
    it('returns scrum without crashing for a self-implements loop (BUG-088)', () => {
      const bug = makeItem('BUG-032', 'bug', { implements: ['BUG-032'] });
      const map = new Map([[bug.id, bug]]);
      expect(getItemMethodology(bug, map)).toBe('scrum');
    });

    it('returns scrum without crashing for a mutual implements cycle (A→B→A)', () => {
      const bugA = makeItem('BUG-A', 'bug', { implements: ['BUG-B'] });
      const bugB = makeItem('BUG-B', 'bug', { implements: ['BUG-A'] });
      const map = new Map([
        [bugA.id, bugA],
        [bugB.id, bugB],
      ]);
      expect(getItemMethodology(bugA, map)).toBe('scrum');
    });
  });
});

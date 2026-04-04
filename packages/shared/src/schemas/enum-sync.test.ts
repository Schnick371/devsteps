/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Freeze tests: assert all enum consumers stay in sync with Zod source of truth.
 * Prevents the BUG-077 class of silent desync failures.
 */

import { describe, expect, it } from 'vitest';
import { TYPE_SHORTCUTS } from '../types/commands.js';
import { EisenhowerQuadrant, ItemStatus, ItemType } from './index.js';

describe('Enum synchronization freeze tests', () => {
  it('TYPE_SHORTCUTS covers every ItemType value', () => {
    const shortcutValues = new Set(Object.values(TYPE_SHORTCUTS));
    for (const type of ItemType.options) {
      expect(shortcutValues).toContain(type);
    }
  });

  it('TYPE_SHORTCUTS contains no values outside ItemType', () => {
    const validTypes = new Set<string>(ItemType.options);
    for (const value of Object.values(TYPE_SHORTCUTS)) {
      expect(validTypes).toContain(value);
    }
  });

  it('ItemType.options snapshot matches expected set', () => {
    expect([...ItemType.options].sort()).toEqual([
      'bug',
      'doc',
      'epic',
      'feature',
      'requirement',
      'spike',
      'story',
      'task',
      'test',
    ]);
  });

  it('ItemStatus.options snapshot matches expected set', () => {
    expect([...ItemStatus.options].sort()).toEqual([
      'blocked',
      'cancelled',
      'done',
      'draft',
      'in-progress',
      'obsolete',
      'planned',
      'review',
    ]);
  });

  it('EisenhowerQuadrant.options snapshot matches expected set', () => {
    expect([...EisenhowerQuadrant.options].sort()).toEqual([
      'not-urgent-important',
      'not-urgent-not-important',
      'urgent-important',
      'urgent-not-important',
    ]);
  });
});

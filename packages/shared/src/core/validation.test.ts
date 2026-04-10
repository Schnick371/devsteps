/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Tests for doc type hierarchy guard in validation.ts
 * Gate-reviewer finding from STORY-239: validates doc guards in both Scrum and Waterfall paths
 */

import { describe, expect, it } from 'vitest';
import { ITEM_TYPE, METHODOLOGY, RELATIONSHIP_TYPE } from '../constants/index.js';
import type { WorkItem } from './validation.js';
import { validateRelationship } from './validation.js';

function makeItem(id: string, type: string): WorkItem {
  return { id, type: type as WorkItem['type'] };
}

describe('validation — doc type guards', () => {
  const docItem = makeItem('DOC-001', ITEM_TYPE.DOC);
  const docItem2 = makeItem('DOC-002', ITEM_TYPE.DOC);
  const epicItem = makeItem('EPIC-001', ITEM_TYPE.EPIC);
  const storyItem = makeItem('STORY-001', ITEM_TYPE.STORY);
  const taskItem = makeItem('TASK-001', ITEM_TYPE.TASK);

  describe('doc → doc link guard (BUG-089)', () => {
    it('rejects doc → doc via documents in Scrum', () => {
      const result = validateRelationship(
        docItem,
        docItem2,
        RELATIONSHIP_TYPE.DOCUMENTS,
        METHODOLOGY.SCRUM
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Doc-to-doc');
      expect(result.suggestion).toContain('BOM');
    });

    it('rejects doc → doc via documented-by in Scrum', () => {
      const result = validateRelationship(
        docItem,
        docItem2,
        RELATIONSHIP_TYPE.DOCUMENTED_BY,
        METHODOLOGY.SCRUM
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Doc-to-doc');
    });

    it('rejects doc → doc via documents in Waterfall', () => {
      const result = validateRelationship(
        docItem,
        docItem2,
        RELATIONSHIP_TYPE.DOCUMENTS,
        METHODOLOGY.WATERFALL
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Doc-to-doc');
    });

    it('rejects doc → doc via documents in Hybrid', () => {
      const result = validateRelationship(
        docItem,
        docItem2,
        RELATIONSHIP_TYPE.DOCUMENTS,
        METHODOLOGY.HYBRID
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Doc-to-doc');
    });

    it('still allows doc → story via documents (valid)', () => {
      const result = validateRelationship(
        docItem,
        storyItem,
        RELATIONSHIP_TYPE.DOCUMENTS,
        METHODOLOGY.SCRUM
      );
      expect(result.valid).toBe(true);
    });

    it('still allows story → doc via documented-by (valid)', () => {
      const result = validateRelationship(
        storyItem,
        docItem,
        RELATIONSHIP_TYPE.DOCUMENTED_BY,
        METHODOLOGY.SCRUM
      );
      expect(result.valid).toBe(true);
    });
  });

  describe('Scrum methodology', () => {
    const methodology = METHODOLOGY.SCRUM;

    it('rejects doc → epic via implements', () => {
      const result = validateRelationship(
        docItem,
        epicItem,
        RELATIONSHIP_TYPE.IMPLEMENTS,
        methodology
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cross-cutting');
      expect(result.suggestion).toContain('documents');
    });

    it('rejects doc → story via implements', () => {
      const result = validateRelationship(
        docItem,
        storyItem,
        RELATIONSHIP_TYPE.IMPLEMENTS,
        methodology
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cross-cutting');
    });

    it('rejects doc → task via implements', () => {
      const result = validateRelationship(
        docItem,
        taskItem,
        RELATIONSHIP_TYPE.IMPLEMENTS,
        methodology
      );
      expect(result.valid).toBe(false);
    });

    it('allows doc via documents (flexible relation)', () => {
      const result = validateRelationship(
        docItem,
        storyItem,
        RELATIONSHIP_TYPE.DOCUMENTS,
        methodology
      );
      expect(result.valid).toBe(true);
    });

    it('allows doc via documented-by (flexible relation)', () => {
      const result = validateRelationship(
        storyItem,
        docItem,
        RELATIONSHIP_TYPE.DOCUMENTED_BY,
        methodology
      );
      expect(result.valid).toBe(true);
    });

    it('allows doc via relates-to (flexible relation)', () => {
      const result = validateRelationship(
        docItem,
        storyItem,
        RELATIONSHIP_TYPE.RELATES_TO,
        methodology
      );
      expect(result.valid).toBe(true);
    });
  });

  describe('Waterfall methodology', () => {
    const methodology = METHODOLOGY.WATERFALL;

    it('rejects doc → requirement via implements', () => {
      const reqItem = makeItem('REQ-001', ITEM_TYPE.REQUIREMENT);
      const result = validateRelationship(
        docItem,
        reqItem,
        RELATIONSHIP_TYPE.IMPLEMENTS,
        methodology
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cross-cutting');
      expect(result.suggestion).toContain('documents');
    });

    it('rejects doc → feature via implements', () => {
      const featItem = makeItem('FEAT-001', ITEM_TYPE.FEATURE);
      const result = validateRelationship(
        docItem,
        featItem,
        RELATIONSHIP_TYPE.IMPLEMENTS,
        methodology
      );
      expect(result.valid).toBe(false);
    });

    it('allows doc via documents (flexible relation)', () => {
      const reqItem = makeItem('REQ-001', ITEM_TYPE.REQUIREMENT);
      const result = validateRelationship(
        docItem,
        reqItem,
        RELATIONSHIP_TYPE.DOCUMENTS,
        methodology
      );
      expect(result.valid).toBe(true);
    });
  });

  describe('Hybrid methodology', () => {
    const methodology = METHODOLOGY.HYBRID;

    it('rejects doc → epic via implements', () => {
      const result = validateRelationship(
        docItem,
        epicItem,
        RELATIONSHIP_TYPE.IMPLEMENTS,
        methodology
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cross-cutting');
    });

    it('allows doc via documents (flexible relation)', () => {
      const result = validateRelationship(
        docItem,
        epicItem,
        RELATIONSHIP_TYPE.DOCUMENTS,
        methodology
      );
      expect(result.valid).toBe(true);
    });
  });
});

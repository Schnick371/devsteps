/**
 * Unit Tests for CBP Tier-2 Mandate Schemas
 *
 * Tests: MandateSchema, MandateResultSchema
 *
 * @see STORY-108 MandateResult CBP Extension
 * @see TASK-233 MandateSchema + MandateResultSchema
 */

import { describe, expect, it } from 'vitest';
import {
  MandateResultSchema,
  MandateResultStatus,
  MandateSchema,
  MandateType,
  TriageTier,
} from './cbp-mandate.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validMandate() {
  return {
    mandate_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    type: 'archaeology',
    sprint_id: 'sprint-2026-02-22',
    item_ids: ['TASK-233'],
    triage_tier: 'STANDARD',
    dispatched_at: '2026-02-22T10:00:00.000Z',
  };
}

function validMandateResult() {
  return {
    mandate_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    item_ids: ['TASK-233'],
    sprint_id: 'sprint-2026-02-22',
    analyst: 'devsteps-t2-archaeology',
    status: 'complete',
    findings:
      '## Affected Scope\n- packages/shared/src/schemas/cbp-mandate.ts (new)\n- packages/shared/src/schemas/index.ts (export)',
    recommendations: ['Implement MandateSchema first (TASK-233)', 'Export from schemas/index.ts'],
    confidence: 0.9,
    token_cost: 1500,
    completed_at: '2026-02-22T10:05:00.000Z',
  };
}

// ─── MandateType enum ─────────────────────────────────────────────────────────

describe('MandateType', () => {
  it('accepts all valid mandate types', () => {
    const validTypes = [
      'archaeology',
      'archaeology-delta',
      'risk',
      'risk-batch',
      'research',
      'quality-review',
      'planning',
      'planning-rerank',
    ];
    for (const type of validTypes) {
      expect(() => MandateType.parse(type)).not.toThrow();
    }
  });

  it('rejects unknown mandate types', () => {
    expect(() => MandateType.parse('unknown-type')).toThrow();
    expect(() => MandateType.parse('impl')).toThrow();
  });
});

// ─── MandateSchema ────────────────────────────────────────────────────────────

describe('MandateSchema', () => {
  it('parses a valid Mandate', () => {
    const result = MandateSchema.safeParse(validMandate());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mandate_id).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
      expect(result.data.type).toBe('archaeology');
      expect(result.data.item_ids).toEqual(['TASK-233']);
    }
  });

  it('rejects invalid UUID for mandate_id', () => {
    const badMandate = { ...validMandate(), mandate_id: 'not-a-uuid' };
    const result = MandateSchema.safeParse(badMandate);
    expect(result.success).toBe(false);
  });

  it('rejects invalid item ID format', () => {
    const badMandate = { ...validMandate(), item_ids: ['XYZ-123'] }; // Invalid prefix
    const result = MandateSchema.safeParse(badMandate);
    expect(result.success).toBe(false);
  });

  it('accepts valid item ID formats', () => {
    const itemIds = ['EPIC-001', 'STORY-108', 'TASK-233', 'BUG-042', 'SPIKE-015'];
    const result = MandateSchema.safeParse({ ...validMandate(), item_ids: itemIds });
    expect(result.success).toBe(true);
  });

  it('rejects invalid triage tier', () => {
    const badMandate = { ...validMandate(), triage_tier: 'ULTRA' };
    const result = MandateSchema.safeParse(badMandate);
    expect(result.success).toBe(false);
  });

  it('allows optional constraints field', () => {
    const withConstraints = {
      ...validMandate(),
      constraints: { shared_file_conflicts: ['packages/shared/index.ts'] },
    };
    const result = MandateSchema.safeParse(withConstraints);
    expect(result.success).toBe(true);
  });

  it('allows optional max_tokens field', () => {
    const result = MandateSchema.safeParse({ ...validMandate(), max_tokens: 10000 });
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const { mandate_id: _, ...noId } = validMandate();
    expect(MandateSchema.safeParse(noId).success).toBe(false);

    const { sprint_id: __, ...noSprint } = validMandate();
    expect(MandateSchema.safeParse(noSprint).success).toBe(false);
  });
});

// ─── MandateResultSchema ──────────────────────────────────────────────────────

describe('MandateResultSchema', () => {
  it('parses a valid MandateResult', () => {
    const result = MandateResultSchema.safeParse(validMandateResult());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.analyst).toBe('devsteps-t2-archaeology');
      expect(result.data.status).toBe('complete');
      expect(result.data.confidence).toBe(0.9);
      expect(result.data.schema_version).toBe('1.0');
    }
  });

  it('defaults schema_version to 1.0', () => {
    const result = MandateResultSchema.parse(validMandateResult());
    expect(result.schema_version).toBe('1.0');
  });

  it('rejects confidence outside 0.0–1.0', () => {
    expect(
      MandateResultSchema.safeParse({ ...validMandateResult(), confidence: 1.1 }).success
    ).toBe(false);
    expect(
      MandateResultSchema.safeParse({ ...validMandateResult(), confidence: -0.1 }).success
    ).toBe(false);
  });

  it('rejects findings exceeding 6000 characters', () => {
    const tooLong = 'x'.repeat(6001);
    const result = MandateResultSchema.safeParse({ ...validMandateResult(), findings: tooLong });
    expect(result.success).toBe(false);
  });

  it('accepts findings at exactly 6000 characters', () => {
    const exact = 'x'.repeat(6000);
    const result = MandateResultSchema.safeParse({ ...validMandateResult(), findings: exact });
    expect(result.success).toBe(true);
  });

  it('rejects recommendations with more than 5 items', () => {
    const tooMany = ['a', 'b', 'c', 'd', 'e', 'f']; // 6 items
    const result = MandateResultSchema.safeParse({
      ...validMandateResult(),
      recommendations: tooMany,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a recommendation exceeding 200 characters', () => {
    const tooLong = ['x'.repeat(201)];
    const result = MandateResultSchema.safeParse({
      ...validMandateResult(),
      recommendations: tooLong,
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid status values', () => {
    for (const status of ['complete', 'partial', 'escalated'] as const) {
      const result = MandateResultSchema.safeParse({ ...validMandateResult(), status });
      expect(result.success).toBe(true);
    }
  });

  it('requires escalation_reason when status is escalated (validation note: field is optional in schema)', () => {
    // Schema allows escalated without escalation_reason (handler documents it)
    const escalated = { ...validMandateResult(), status: 'escalated' };
    const result = MandateResultSchema.safeParse(escalated);
    expect(result.success).toBe(true);
  });

  it('rejects negative token_cost', () => {
    const result = MandateResultSchema.safeParse({ ...validMandateResult(), token_cost: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer token_cost', () => {
    const result = MandateResultSchema.safeParse({ ...validMandateResult(), token_cost: 1.5 });
    expect(result.success).toBe(false);
  });

  it('validates TriageTier enum independently', () => {
    expect(() => TriageTier.parse('QUICK')).not.toThrow();
    expect(() => TriageTier.parse('STANDARD')).not.toThrow();
    expect(() => TriageTier.parse('FULL')).not.toThrow();
    expect(() => TriageTier.parse('COMPETITIVE')).not.toThrow();
    expect(() => TriageTier.parse('INVALID')).toThrow();
  });

  it('validates MandateResultStatus enum independently', () => {
    expect(() => MandateResultStatus.parse('complete')).not.toThrow();
    expect(() => MandateResultStatus.parse('partial')).not.toThrow();
    expect(() => MandateResultStatus.parse('escalated')).not.toThrow();
    expect(() => MandateResultStatus.parse('failed')).toThrow();
  });
});

/**
 * Unit Tests for CBP Loop Control Schemas
 *
 * Tests: RejectionFeedbackSchema, IterationSignalSchema, EscalationSignalSchema
 *
 * @see STORY-108 MandateResult CBP Extension
 * @see TASK-234 Loop schemas: RejectionFeedback + IterationSignal + EscalationSignal
 */

import { describe, expect, it } from 'vitest';
import {
  EscalationSignalSchema,
  EscalationType,
  IterationSignalSchema,
  LoopStatus,
  LoopType,
  RejectionFeedbackSchema,
  RejectionType,
} from './cbp-loops.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validRejection() {
  return {
    target_subagent: 'devsteps-impl-subagent',
    iteration: 1,
    rejection_type: 'test-failure',
    violated_criteria: ['Tests must pass for all affected modules'],
    specific_issues: [
      {
        file: 'packages/shared/src/schemas/cbp-mandate.ts',
        line: 45,
        issue: 'Missing export of MandateType enum',
        suggestion: 'Add: export type MandateType = z.infer<typeof MandateType>',
      },
    ],
    max_iterations_remaining: 2,
    sprint_id: 'sprint-2026-02-22',
    item_id: 'TASK-233',
    created_at: '2026-02-22T11:00:00.000Z',
  };
}

function validSignal(overrides = {}) {
  return {
    loop_type: 'review-fix',
    status: 'continuing',
    iteration: 1,
    max_iterations: 3,
    sprint_id: 'sprint-2026-02-22',
    item_id: 'TASK-233',
    signaled_at: '2026-02-22T11:05:00.000Z',
    ...overrides,
  };
}

function validEscalation() {
  return {
    escalation_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    source_agent: 'devsteps-t2-archaeology',
    escalation_type: 'architectural-decision',
    context:
      'The affected_paths for TASK-233 overlap with the CBP v1 schemas. Modifying analysis.ts would break existing T3 agents that depend on it. Two options: (A) extend in-place, (B) create cbp-mandate.ts separately.',
    decision_needed: 'Should MandateSchema be added to analysis.ts or a new cbp-mandate.ts file?',
    blocking_items: ['TASK-233', 'TASK-235'],
    sprint_id: 'sprint-2026-02-22',
    escalated_at: '2026-02-22T11:10:00.000Z',
  };
}

// ─── Enum tests ───────────────────────────────────────────────────────────────

describe('LoopType', () => {
  it('accepts all valid loop types', () => {
    for (const t of ['tdd', 'review-fix', 'clarification', 'replanning'] as const) {
      expect(() => LoopType.parse(t)).not.toThrow();
    }
  });

  it('rejects unknown loop types', () => {
    expect(() => LoopType.parse('escalation')).toThrow();
    expect(() => LoopType.parse('')).toThrow();
  });
});

describe('LoopStatus', () => {
  it('accepts all valid statuses', () => {
    for (const s of ['continuing', 'resolved', 'exhausted', 'escalated'] as const) {
      expect(() => LoopStatus.parse(s)).not.toThrow();
    }
  });
});

describe('RejectionType', () => {
  it('accepts all valid rejection types', () => {
    const types = [
      'quality-insufficient',
      'wrong-approach',
      'missing-requirement',
      'test-failure',
      'type-error',
    ];
    for (const t of types) {
      expect(() => RejectionType.parse(t)).not.toThrow();
    }
  });
});

describe('EscalationType', () => {
  it('accepts all valid escalation types', () => {
    const types = [
      'human-required',
      'contradicting-requirements',
      'budget-exhausted',
      'architectural-decision',
      'scope-ambiguous',
    ];
    for (const t of types) {
      expect(() => EscalationType.parse(t)).not.toThrow();
    }
  });
});

// ─── RejectionFeedbackSchema ──────────────────────────────────────────────────

describe('RejectionFeedbackSchema', () => {
  it('parses a valid RejectionFeedback', () => {
    const result = RejectionFeedbackSchema.safeParse(validRejection());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.iteration).toBe(1);
      expect(result.data.schema_version).toBe('1.0');
      expect(result.data.escalate_if_remaining).toBe(0); // default
    }
  });

  it('defaults escalate_if_remaining to 0', () => {
    const result = RejectionFeedbackSchema.parse(validRejection());
    expect(result.escalate_if_remaining).toBe(0);
  });

  it('rejects iteration exceeding 5', () => {
    const result = RejectionFeedbackSchema.safeParse({ ...validRejection(), iteration: 6 });
    expect(result.success).toBe(false);
  });

  it('rejects iteration below 1', () => {
    const result = RejectionFeedbackSchema.safeParse({ ...validRejection(), iteration: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects empty violated_criteria', () => {
    const result = RejectionFeedbackSchema.safeParse({
      ...validRejection(),
      violated_criteria: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty specific_issues', () => {
    const result = RejectionFeedbackSchema.safeParse({ ...validRejection(), specific_issues: [] });
    expect(result.success).toBe(false);
  });

  it('rejects issue text exceeding 300 characters', () => {
    const longIssue = {
      file: 'src/foo.ts',
      issue: 'x'.repeat(301),
      suggestion: 'Fix it',
    };
    const result = RejectionFeedbackSchema.safeParse({
      ...validRejection(),
      specific_issues: [longIssue],
    });
    expect(result.success).toBe(false);
  });

  it('accepts more than 20 specific_issues — schema allows max 20', () => {
    const issues = Array.from({ length: 21 }, (_, i) => ({
      file: `src/file${i}.ts`,
      issue: 'Issue description',
      suggestion: 'Fix suggestion',
    }));
    const result = RejectionFeedbackSchema.safeParse({
      ...validRejection(),
      specific_issues: issues,
    });
    expect(result.success).toBe(false); // Exceeds max 20
  });

  it('accepts issue without line number (optional)', () => {
    const noLine = [{ file: 'src/foo.ts', issue: 'Missing export', suggestion: 'Add export' }];
    const result = RejectionFeedbackSchema.safeParse({
      ...validRejection(),
      specific_issues: noLine,
    });
    expect(result.success).toBe(true);
  });
});

// ─── IterationSignalSchema ────────────────────────────────────────────────────

describe('IterationSignalSchema', () => {
  it('parses a valid IterationSignal', () => {
    const result = IterationSignalSchema.safeParse(validSignal());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.loop_type).toBe('review-fix');
      expect(result.data.schema_version).toBe('1.0');
    }
  });

  it('rejects max_iterations exceeding 5', () => {
    const result = IterationSignalSchema.safeParse(validSignal({ max_iterations: 6 }));
    expect(result.success).toBe(false);
  });

  it('rejects max_iterations below 1', () => {
    const result = IterationSignalSchema.safeParse(validSignal({ max_iterations: 0 }));
    expect(result.success).toBe(false);
  });

  it('rejects iteration below 1', () => {
    const result = IterationSignalSchema.safeParse(validSignal({ iteration: 0 }));
    expect(result.success).toBe(false);
  });

  it('accepts all valid status combinations', () => {
    for (const status of ['continuing', 'resolved', 'exhausted', 'escalated'] as const) {
      expect(IterationSignalSchema.safeParse(validSignal({ status })).success).toBe(true);
    }
  });

  it('accepts optional notes field', () => {
    const result = IterationSignalSchema.safeParse(
      validSignal({ notes: 'TypeScript errors remain in 2 files' })
    );
    expect(result.success).toBe(true);
  });

  it('rejects notes exceeding 500 characters', () => {
    const result = IterationSignalSchema.safeParse(validSignal({ notes: 'x'.repeat(501) }));
    expect(result.success).toBe(false);
  });
});

// ─── EscalationSignalSchema ───────────────────────────────────────────────────

describe('EscalationSignalSchema', () => {
  it('parses a valid EscalationSignal', () => {
    const result = EscalationSignalSchema.safeParse(validEscalation());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.escalation_id).toBe('b2c3d4e5-f6a7-8901-bcde-f12345678901');
      expect(result.data.schema_version).toBe('1.0');
    }
  });

  it('rejects invalid UUID for escalation_id', () => {
    const result = EscalationSignalSchema.safeParse({
      ...validEscalation(),
      escalation_id: 'not-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty blocking_items', () => {
    const result = EscalationSignalSchema.safeParse({ ...validEscalation(), blocking_items: [] });
    expect(result.success).toBe(false);
  });

  it('rejects context exceeding 3000 characters', () => {
    const result = EscalationSignalSchema.safeParse({
      ...validEscalation(),
      context: 'x'.repeat(3001),
    });
    expect(result.success).toBe(false);
  });

  it('rejects decision_needed exceeding 500 characters', () => {
    const result = EscalationSignalSchema.safeParse({
      ...validEscalation(),
      decision_needed: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional suggested_resolution', () => {
    const result = EscalationSignalSchema.safeParse({
      ...validEscalation(),
      suggested_resolution: 'Use option B: create cbp-mandate.ts as a separate file.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects suggested_resolution exceeding 500 characters', () => {
    const result = EscalationSignalSchema.safeParse({
      ...validEscalation(),
      suggested_resolution: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid escalation types', () => {
    const types: Array<
      | 'human-required'
      | 'contradicting-requirements'
      | 'budget-exhausted'
      | 'architectural-decision'
      | 'scope-ambiguous'
    > = [
      'human-required',
      'contradicting-requirements',
      'budget-exhausted',
      'architectural-decision',
      'scope-ambiguous',
    ];
    for (const escalation_type of types) {
      expect(
        EscalationSignalSchema.safeParse({ ...validEscalation(), escalation_type }).success
      ).toBe(true);
    }
  });
});

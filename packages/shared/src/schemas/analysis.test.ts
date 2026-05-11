/**
 * Unit Tests for AnalysisBriefingSchema scope_shard field
 *
 * @see STORY-294 scope_shard for write_analysis_report
 * @see ADP I-13 (scope-split fan-out)
 */

import { describe, expect, it } from 'vitest';
import { AnalysisBriefingSchema } from './analysis.js';

function validBriefing(overrides: Record<string, unknown> = {}) {
  return {
    task_id: 'STORY-294',
    aspect: 'impact',
    analyst: 'devsteps-R2-aspect-impact',
    created: '2026-05-11T10:00:00.000Z',
    envelope: {
      aspect: 'impact',
      verdict: 'PROCEED',
      confidence: 0.9,
      top3_findings: ['finding-1'],
      report_path: '.devsteps/analysis/STORY-294/impact-report.json',
      timestamp: '2026-05-11T10:00:00.000Z',
    },
    full_analysis: '## Test\nBody',
    ...overrides,
  };
}

describe('AnalysisBriefingSchema — scope_shard', () => {
  it('accepts briefing without scope_shard (backward compatible)', () => {
    const result = AnalysisBriefingSchema.safeParse(validBriefing());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.scope_shard).toBeUndefined();
    }
  });

  it('accepts valid scope_shard with alphanumeric, underscore, hyphen', () => {
    for (const shard of ['packages', 'pkg_shared', 'pkg-mcp-server', 'shard1', 'a-b_c-1']) {
      const result = AnalysisBriefingSchema.safeParse(validBriefing({ scope_shard: shard }));
      expect(result.success, `expected ${shard} to be valid`).toBe(true);
      if (result.success) {
        expect(result.data.scope_shard).toBe(shard);
      }
    }
  });

  it('rejects scope_shard with invalid characters', () => {
    for (const shard of ['pkg/sub', 'pkg.sub', 'pkg sub', 'pkg!', 'pkg$', '../etc']) {
      const result = AnalysisBriefingSchema.safeParse(validBriefing({ scope_shard: shard }));
      expect(result.success, `expected ${shard} to be rejected`).toBe(false);
    }
  });

  it('rejects scope_shard longer than 32 chars', () => {
    const tooLong = 'a'.repeat(33);
    const result = AnalysisBriefingSchema.safeParse(validBriefing({ scope_shard: tooLong }));
    expect(result.success).toBe(false);
  });

  it('accepts scope_shard exactly 32 chars', () => {
    const exact = 'a'.repeat(32);
    const result = AnalysisBriefingSchema.safeParse(validBriefing({ scope_shard: exact }));
    expect(result.success).toBe(true);
  });
});

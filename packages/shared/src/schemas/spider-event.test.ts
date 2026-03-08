import { describe, expect, it } from 'vitest';
import { SpiderEventSchema } from './spider-event.js';

const validBase = {
  event: 'ring_start' as const,
  ring: 1,
  agent_name: 'devsteps-R1-analyst-archaeology',
  agent_type: 'analyst',
  ring_phase: 'Analysis',
  timestamp: '2026-03-08T12:00:00.000Z',
  session_id: 'abc-123',
  parent_session_id: null,
  duration_ms: null,
  mandate_id: null,
};

describe('SpiderEventSchema', () => {
  it('accepts a valid ring_start event', () => {
    expect(SpiderEventSchema.safeParse(validBase).success).toBe(true);
  });

  it('accepts ring_stop with duration_ms', () => {
    const parsed = SpiderEventSchema.safeParse({
      ...validBase,
      event: 'ring_stop',
      ring: 4,
      duration_ms: 1234,
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts a valid session_end event', () => {
    const parsed = SpiderEventSchema.safeParse({
      ...validBase,
      event: 'session_end',
      ring: 0,
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects a missing required field', () => {
    const { session_id: _omitted, ...noSessionId } = validBase;
    expect(SpiderEventSchema.safeParse(noSessionId).success).toBe(false);
  });

  it('rejects ring number out of 0-5 range', () => {
    expect(SpiderEventSchema.safeParse({ ...validBase, ring: 6 }).success).toBe(false);
    expect(SpiderEventSchema.safeParse({ ...validBase, ring: -1 }).success).toBe(false);
  });
});

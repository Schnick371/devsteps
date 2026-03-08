import { describe, expect, it } from 'vitest';
import { extractRingNumber } from './ring-extractor.js';

describe('extractRingNumber', () => {
  it('extracts ring 1 from analyst agent', () => {
    expect(extractRingNumber('devsteps-R1-analyst-archaeology')).toBe(1);
  });

  it('extracts ring 4 from exec-impl agent', () => {
    expect(extractRingNumber('devsteps-R4-exec-impl')).toBe(4);
  });

  it('extracts ring 0 from coord agent', () => {
    expect(extractRingNumber('devsteps-R0-coord')).toBe(0);
  });

  it('extracts ring 5 from gate-reviewer', () => {
    expect(extractRingNumber('devsteps-R5-gate-reviewer')).toBe(5);
  });

  it('returns null for non-ring agent name', () => {
    expect(extractRingNumber('some-non-ring-agent')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(extractRingNumber('')).toBeNull();
  });

  it('extracts double-digit ring number (future-proof)', () => {
    expect(extractRingNumber('devsteps-R10-future-agent')).toBe(10);
  });
});

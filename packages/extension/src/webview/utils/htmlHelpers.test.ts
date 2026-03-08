import { describe, expect, it } from 'vitest';
import { getNonce } from './htmlHelpers.js';

describe('getNonce', () => {
  it('returns a string of at least 32 characters', () => {
    expect(getNonce().length).toBeGreaterThanOrEqual(32);
  });

  it('returns different values on successive calls', () => {
    expect(getNonce()).not.toBe(getNonce());
  });
});

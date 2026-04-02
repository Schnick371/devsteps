import { describe, expect, it } from 'vitest';
import { isVersionAtLeast, parseVersion } from '../../extension.js';

describe('version comparison', () => {
  it('parses semver-like version strings into numeric parts', () => {
    expect(parseVersion('1.109.0')).toEqual([1, 109, 0]);
    expect(parseVersion('1.109.1')).toEqual([1, 109, 1]);
    expect(parseVersion('1.100.20')).toEqual([1, 100, 20]);
    expect(parseVersion('1.109.0-insiders')).toEqual([1, 109, 0]);
    expect(parseVersion('1.109')).toEqual([1, 109, 0]);
    expect(parseVersion('1')).toEqual([1, 0, 0]);
  });

  it('returns true when current version is equal or greater than required', () => {
    expect(isVersionAtLeast('1.109.0', '1.109.0')).toBe(true);
    expect(isVersionAtLeast('1.110.0', '1.109.0')).toBe(true);
    expect(isVersionAtLeast('2.0.0', '1.109.0')).toBe(true);
    expect(isVersionAtLeast('1.109.1', '1.109.0')).toBe(true);
  });

  it('returns false when current version is lower than required', () => {
    expect(isVersionAtLeast('1.108.9', '1.109.0')).toBe(false);
    expect(isVersionAtLeast('1.100.99', '1.109.0')).toBe(false);
    expect(isVersionAtLeast('0.99.5', '1.109.0')).toBe(false);
  });
});

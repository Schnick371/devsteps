/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Unit tests for adjustHeadingLevels
 * @see TASK-436
 */

import { describe, expect, it } from 'vitest';
import { adjustHeadingLevels } from './heading-shift.js';

describe('adjustHeadingLevels', () => {
  it('offset 0 → identity, returns same reference', () => {
    const input = '# Hello\n## World';
    const result = adjustHeadingLevels(input, 0);
    expect(result).toBe(input);
  });

  it('shifts H1 to H2 with offset 1', () => {
    expect(adjustHeadingLevels('# Title', 1)).toBe('## Title');
  });

  it('shifts H2 to H4 with offset 2', () => {
    expect(adjustHeadingLevels('## Section', 2)).toBe('#### Section');
  });

  it('caps at H6, never emits H7+', () => {
    expect(adjustHeadingLevels('#### Deep', 5)).toBe('###### Deep');
    expect(adjustHeadingLevels('###### Already-6', 1)).toBe('###### Already-6');
  });

  it('handles multiple headings in one document', () => {
    const input = '# H1\n## H2\n### H3\nsome text';
    const expected = '## H1\n### H2\n#### H3\nsome text';
    expect(adjustHeadingLevels(input, 1)).toBe(expected);
  });

  it('does not touch regular text lines', () => {
    const input = 'Plain text\nAnother line';
    expect(adjustHeadingLevels(input, 2)).toBe(input);
  });

  it('does not modify headings inside backtick fenced block', () => {
    const input = '```\n# inside fence\n```\n# outside';
    expect(adjustHeadingLevels(input, 1)).toBe('```\n# inside fence\n```\n## outside');
  });

  it('does not modify headings inside tilde fenced block', () => {
    const input = '~~~\n# inside tilde\n~~~\n# outside';
    expect(adjustHeadingLevels(input, 1)).toBe('~~~\n# inside tilde\n~~~\n## outside');
  });

  it('handles fence that is never closed (treats rest as fenced)', () => {
    const input = '```\n# unclosed fence heading\n# another';
    // No closing fence → entire content after ``` is inside fence
    expect(adjustHeadingLevels(input, 1)).toBe('```\n# unclosed fence heading\n# another');
  });

  it('handles heading immediately followed by newline (no space after #)', () => {
    // HEADING_RE allows $ after # group so "#\n" matches level 1
    const input = '#\nsome content';
    expect(adjustHeadingLevels(input, 1)).toBe('##\nsome content');
  });

  it('empty string → empty string', () => {
    expect(adjustHeadingLevels('', 3)).toBe('');
  });

  it('no heading in content → unchanged', () => {
    const input = 'Just plain\nparagraph text\n- list item';
    expect(adjustHeadingLevels(input, 2)).toBe(input);
  });

  it('shift by large offset caps all levels at 6', () => {
    const input = '# A\n## B\n### C';
    const result = adjustHeadingLevels(input, 10);
    expect(result).toBe('###### A\n###### B\n###### C');
  });
});

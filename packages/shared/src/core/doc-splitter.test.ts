/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Unit tests for parseDocumentFragments
 * @see TASK-537
 */

import { describe, expect, it } from 'vitest';
import { parseDocumentFragments } from './doc-splitter.js';

describe('parseDocumentFragments', () => {
  it('empty string → []', () => {
    expect(parseDocumentFragments('', 1)).toEqual([]);
    expect(parseDocumentFragments('   \n\n  ', 1)).toEqual([]);
  });

  it('splits at H1 into two fragments', () => {
    const input = '# First\nContent A\n# Second\nContent B';
    const result = parseDocumentFragments(input, 1);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('First');
    expect(result[0].description).toContain('Content A');
    expect(result[1].title).toBe('Second');
    expect(result[1].description).toContain('Content B');
  });

  it('splits at H2 only (H1 is NOT a boundary)', () => {
    const input = '# Doc Title\n## Section A\ntext A\n## Section B\ntext B';
    const result = parseDocumentFragments(input, 2);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Section A');
    expect(result[1].title).toBe('Section B');
  });

  it('preserves subordinate headings inside a fragment', () => {
    const input = '# Top\n## Sub\ntext';
    const result = parseDocumentFragments(input, 1);
    expect(result).toHaveLength(1);
    expect(result[0].description).toContain('## Sub');
  });

  it('content before first split-level heading is prepended to first fragment', () => {
    const input = 'preamble\n# First\ncontent';
    const result = parseDocumentFragments(input, 1);
    expect(result).toHaveLength(1);
    expect(result[0].description).toContain('preamble');
    expect(result[0].description).toContain('# First');
  });

  it('no heading at splitLevel → single fragment with whole content', () => {
    const input = '## Subsection\nsome text';
    const result = parseDocumentFragments(input, 1);
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe(input);
  });

  it('no heading at splitLevel → title derived from H1 fallback', () => {
    const input = '# Main Title\n## Subsection\nsome text';
    const result = parseDocumentFragments(input, 3);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Main Title');
  });

  it('headings inside backtick fence are NOT split boundaries', () => {
    const input = '# Real section\n```\n# fake heading\n```\n# Next real';
    const result = parseDocumentFragments(input, 1);
    expect(result).toHaveLength(2);
    expect(result[0].description).toContain('# fake heading');
    expect(result[1].title).toBe('Next real');
  });

  it('headings inside tilde fence are NOT split boundaries', () => {
    const input = '# Real\n~~~\n# inside tilde\n~~~\n# Next';
    const result = parseDocumentFragments(input, 1);
    expect(result).toHaveLength(2);
    expect(result[0].description).toContain('# inside tilde');
  });

  it('headingRange reflects correct 1-based line positions', () => {
    const input = '# A\nline2\nline3\n# B\nline5';
    const result = parseDocumentFragments(input, 1);
    expect(result[0].headingRange[0]).toBe(1); // H1 "A" is line 1
    expect(result[1].headingRange[0]).toBe(4); // H1 "B" is line 4
  });

  it('strips YAML frontmatter before splitting', () => {
    const input = '---\ntitle: My Doc\n---\n# First\ncontent';
    const result = parseDocumentFragments(input, 1);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('First');
    // frontmatter should NOT appear in the split fragment lines
    expect(result[0].description).not.toContain('---');
  });

  it('splits at H3 boundaries', () => {
    const input = '# Doc\n## Section\n### Alpha\ntext\n### Beta\ntext2';
    const result = parseDocumentFragments(input, 3);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Alpha');
    expect(result[1].title).toBe('Beta');
  });

  it('single H1 with no following content → one fragment', () => {
    const input = '# Just a title';
    const result = parseDocumentFragments(input, 1);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Just a title');
  });
});

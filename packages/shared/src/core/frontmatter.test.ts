/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Tests for YAML frontmatter extraction and validation.
 * @see STORY-278
 */

import { describe, expect, it } from 'vitest';
import { DocFrontmatterSchema, extractFrontmatter } from './frontmatter.js';

describe('extractFrontmatter', () => {
  it('should return null frontmatter for content without frontmatter', () => {
    const content = '# My Document\n\nSome content here.';
    const result = extractFrontmatter(content);

    expect(result.frontmatter).toBeNull();
    expect(result.body).toBe(content);
    expect(result.warnings).toEqual([]);
  });

  it('should parse valid frontmatter with all fields', () => {
    const content = [
      '---',
      'diataxis: reference',
      'related_items:',
      '  - STORY-267',
      '  - EPIC-010',
      'status: approved',
      'author: the@devsteps.dev',
      'tags:',
      '  - security',
      '  - rbcd',
      '---',
      '# Kerberos RBCD',
      '',
      'Content here.',
    ].join('\n');

    const result = extractFrontmatter(content);

    expect(result.frontmatter).not.toBeNull();
    expect(result.frontmatter?.diataxis).toBe('reference');
    expect(result.frontmatter?.related_items).toEqual(['STORY-267', 'EPIC-010']);
    expect(result.frontmatter?.status).toBe('approved');
    expect(result.frontmatter?.author).toBe('the@devsteps.dev');
    expect(result.frontmatter?.tags).toEqual(['security', 'rbcd']);
    expect(result.body).toBe('# Kerberos RBCD\n\nContent here.');
    expect(result.warnings).toEqual([]);
  });

  it('should parse frontmatter with inline arrays', () => {
    const content = [
      '---',
      'related_items: [STORY-267, EPIC-010]',
      'tags: [security, rbcd]',
      '---',
      '# Title',
    ].join('\n');

    const result = extractFrontmatter(content);

    expect(result.frontmatter?.related_items).toEqual(['STORY-267', 'EPIC-010']);
    expect(result.frontmatter?.tags).toEqual(['security', 'rbcd']);
  });

  it('should handle empty arrays', () => {
    const content = ['---', 'related_items: []', 'tags: []', '---', '# Title'].join('\n');

    const result = extractFrontmatter(content);

    expect(result.frontmatter?.related_items).toEqual([]);
    expect(result.frontmatter?.tags).toEqual([]);
  });

  it('should handle partial frontmatter (only some fields)', () => {
    const content = ['---', 'diataxis: tutorial', '---', '# My Tutorial'].join('\n');

    const result = extractFrontmatter(content);

    expect(result.frontmatter?.diataxis).toBe('tutorial');
    expect(result.frontmatter?.related_items).toEqual([]);
    expect(result.frontmatter?.status).toBeUndefined();
    expect(result.frontmatter?.author).toBeUndefined();
    expect(result.frontmatter?.tags).toEqual([]);
  });

  it('should throw on invalid YAML syntax', () => {
    const content = ['---', 'diataxis reference', '---', '# Title'].join('\n');

    expect(() => extractFrontmatter(content)).toThrow('Invalid YAML');
  });

  it('should throw on missing closing delimiter', () => {
    const content = ['---', 'diataxis: reference', '# Title'].join('\n');

    expect(() => extractFrontmatter(content)).toThrow('no closing "---" delimiter');
  });

  it('should throw on invalid diataxis value', () => {
    const content = ['---', 'diataxis: api-docs', '---', '# Title'].join('\n');

    expect(() => extractFrontmatter(content)).toThrow('Invalid frontmatter values');
  });

  it('should throw on invalid item ID pattern', () => {
    const content = ['---', 'related_items: [invalid-id]', '---', '# Title'].join('\n');

    expect(() => extractFrontmatter(content)).toThrow('Invalid frontmatter values');
  });

  it('should throw on invalid status value', () => {
    const content = ['---', 'status: published', '---', '# Title'].join('\n');

    expect(() => extractFrontmatter(content)).toThrow('Invalid frontmatter values');
  });

  it('should warn on unknown fields but still parse known ones', () => {
    const content = [
      '---',
      'diataxis: reference',
      'custom_field: some_value',
      'another_unknown: 42',
      '---',
      '# Title',
    ].join('\n');

    const result = extractFrontmatter(content);

    expect(result.frontmatter?.diataxis).toBe('reference');
    expect(result.warnings).toHaveLength(2);
    expect(result.warnings[0].field).toBe('custom_field');
    expect(result.warnings[1].field).toBe('another_unknown');
  });

  it('should handle all valid diataxis types', () => {
    for (const type of [
      'tutorial',
      'how-to',
      'reference',
      'explanation',
      'architecture',
      'research',
    ]) {
      const content = [`---`, `diataxis: ${type}`, `---`, `# Title`].join('\n');
      const result = extractFrontmatter(content);
      expect(result.frontmatter?.diataxis).toBe(type);
    }
  });

  it('should handle all valid item ID prefixes', () => {
    const prefixes = [
      'STORY',
      'TASK',
      'BUG',
      'EPIC',
      'SPIKE',
      'FEATURE',
      'DOC',
      'REQUIREMENT',
      'TEST',
    ];
    for (const prefix of prefixes) {
      const content = [`---`, `related_items: [${prefix}-001]`, `---`, `# Title`].join('\n');
      const result = extractFrontmatter(content);
      expect(result.frontmatter?.related_items).toEqual([`${prefix}-001`]);
    }
  });

  it('should handle quoted values', () => {
    const content = [
      '---',
      'author: "the@devsteps.dev"',
      "diataxis: 'reference'",
      '---',
      '# Title',
    ].join('\n');

    const result = extractFrontmatter(content);

    expect(result.frontmatter?.author).toBe('the@devsteps.dev');
    expect(result.frontmatter?.diataxis).toBe('reference');
  });

  it('should skip comments in frontmatter', () => {
    const content = ['---', '# This is a comment', 'diataxis: reference', '---', '# Title'].join(
      '\n'
    );

    const result = extractFrontmatter(content);
    expect(result.frontmatter?.diataxis).toBe('reference');
  });
});

describe('DocFrontmatterSchema', () => {
  it('should accept empty object', () => {
    const result = DocFrontmatterSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should reject unknown diataxis type', () => {
    const result = DocFrontmatterSchema.safeParse({ diataxis: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid item ID in related_items', () => {
    const result = DocFrontmatterSchema.safeParse({ related_items: ['not-valid'] });
    expect(result.success).toBe(false);
  });
});

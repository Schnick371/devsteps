/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Unit tests for rollupHandler — CCMS BOM rollup assembler.
 *
 * @see TASK-437
 */

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initializeRefsStyleIndex } from './index-refs.js';
import { rollupHandler } from './rollup.js';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const EMPTY_LINKS = {
  implements: [],
  'implemented-by': [],
  'tested-by': [],
  tests: [],
  blocks: [],
  'blocked-by': [],
  'relates-to': [],
  'depends-on': [],
  'required-by': [],
  supersedes: [],
  'superseded-by': [],
  'canonical-for': [],
  'derived-from': [],
  'documented-by': [],
  documents: [],
};

interface CreateDocOptions {
  id: string;
  title?: string;
  description?: string;
  tags?: string[];
}

function createDocItem(devstepsDir: string, opts: CreateDocOptions): void {
  const {
    id,
    title = `Doc ${id}`,
    description = `# ${title}\n\nContent for ${id}.`,
    tags = [],
  } = opts;

  const docsDir = join(devstepsDir, 'items', 'docs');
  mkdirSync(docsDir, { recursive: true });

  const metadata = {
    id,
    type: 'doc',
    category: 'general',
    title,
    status: 'draft',
    eisenhower: 'not-urgent-not-important',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    linked_items: EMPTY_LINKS,
    tags,
    affected_paths: [],
    commits: [],
    metadata: {},
  };

  writeFileSync(join(docsDir, `${id}.json`), JSON.stringify(metadata, null, 2));
  writeFileSync(join(docsDir, `${id}.md`), description);

  // Update index/by-type/docs.json (CategoryIndex format: { category, items, updated })
  const indexDir = join(devstepsDir, 'index', 'by-type');
  mkdirSync(indexDir, { recursive: true });
  const indexPath = join(indexDir, 'docs.json');
  let categoryIndex: { category: string; items: string[]; updated: string } = {
    category: 'doc',
    items: [],
    updated: new Date().toISOString(),
  };
  if (existsSync(indexPath)) {
    categoryIndex = JSON.parse(readFileSync(indexPath, 'utf-8')) as typeof categoryIndex;
  }
  if (!categoryIndex.items.includes(id)) {
    categoryIndex.items.push(id);
    categoryIndex.updated = new Date().toISOString();
    writeFileSync(indexPath, JSON.stringify(categoryIndex, null, 2));
  }
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

let devstepsDir: string;
let outputDir: string;

beforeEach(() => {
  devstepsDir = mkdtempSync(join(tmpdir(), 'devsteps-rollup-test-'));
  outputDir = mkdtempSync(join(tmpdir(), 'devsteps-rollup-out-'));
  initializeRefsStyleIndex(devstepsDir);
});

afterEach(() => {
  rmSync(devstepsDir, { recursive: true, force: true });
  rmSync(outputDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('rollupHandler', () => {
  describe('Markdown format (default)', () => {
    it('assembles a single DOC item into a Markdown file', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-001',
        title: 'Introduction',
        description: '# Introduction\n\nHello world.',
      });

      const outputPath = join(outputDir, 'out.md');
      const result = await rollupHandler(devstepsDir, { output: outputPath });

      expect(result.item_count).toBe(1);
      expect(result.format).toBe('markdown');
      expect(result.output).toBe(outputPath);
      const content = readFileSync(outputPath, 'utf-8');
      expect(content).toContain('# Introduction');
      expect(content).toContain('Hello world.');
    });

    it('concatenates multiple DOC items with --- separators', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-001',
        title: 'Chapter 1',
        description: '# Chapter 1\n\nFirst chapter.',
      });
      createDocItem(devstepsDir, {
        id: 'DOC-002',
        title: 'Chapter 2',
        description: '# Chapter 2\n\nSecond chapter.',
      });

      const outputPath = join(outputDir, 'out.md');
      const result = await rollupHandler(devstepsDir, { output: outputPath });

      expect(result.item_count).toBe(2);
      const content = readFileSync(outputPath, 'utf-8');
      expect(content).toContain('# Chapter 1');
      expect(content).toContain('# Chapter 2');
      expect(content).toContain('---');
    });

    it('produces an empty file when no DOC items exist', async () => {
      const outputPath = join(outputDir, 'out.md');
      const result = await rollupHandler(devstepsDir, { output: outputPath });

      expect(result.item_count).toBe(0);
      const content = readFileSync(outputPath, 'utf-8');
      expect(content).toBe('');
    });

    it('uses default output path devsteps-rollup.md in cwd', async () => {
      createDocItem(devstepsDir, { id: 'DOC-001', title: 'Test' });

      const result = await rollupHandler(devstepsDir, {});

      expect(result.output).toMatch(/devsteps-rollup\.md$/);
    });
  });

  describe('HTML format', () => {
    it('produces a valid HTML document', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-001',
        title: 'My Guide',
        description: '# My Guide\n\nSome **bold** text.',
      });

      const outputPath = join(outputDir, 'out.html');
      const result = await rollupHandler(devstepsDir, { output: outputPath, format: 'html' });

      expect(result.format).toBe('html');
      expect(result.output).toBe(outputPath);
      const content = readFileSync(outputPath, 'utf-8');
      expect(content).toContain('<!DOCTYPE html>');
      expect(content).toContain('<h1>My Guide</h1>');
      expect(content).toContain('<strong>bold</strong>');
    });

    it('wraps multiple fragments with <hr> separators', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-001',
        title: 'Section A',
        description: '# Section A\n\nText A.',
      });
      createDocItem(devstepsDir, {
        id: 'DOC-002',
        title: 'Section B',
        description: '# Section B\n\nText B.',
      });

      const outputPath = join(outputDir, 'out.html');
      const result = await rollupHandler(devstepsDir, { output: outputPath, format: 'html' });

      expect(result.item_count).toBe(2);
      const content = readFileSync(outputPath, 'utf-8');
      expect(content).toContain('<hr>');
      expect(content).toContain('<h1>Section A</h1>');
      expect(content).toContain('<h1>Section B</h1>');
    });

    it('uses document title from first fragment', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-001',
        title: 'First Doc',
        description: '# First Doc\n\nContent.',
      });

      const outputPath = join(outputDir, 'out.html');
      await rollupHandler(devstepsDir, { output: outputPath, format: 'html' });

      const content = readFileSync(outputPath, 'utf-8');
      expect(content).toContain('<title>First Doc</title>');
    });

    it('uses default output path devsteps-rollup.html for html format', async () => {
      createDocItem(devstepsDir, { id: 'DOC-001', title: 'X' });

      const result = await rollupHandler(devstepsDir, { format: 'html' });

      expect(result.output).toMatch(/devsteps-rollup\.html$/);
    });
  });

  describe('JSON format', () => {
    it('produces structured JSON with fragments array', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-001',
        title: 'API Reference',
        description: '# API Reference\n\nDetails here.',
      });

      const outputPath = join(outputDir, 'out.json');
      const result = await rollupHandler(devstepsDir, { output: outputPath, format: 'json' });

      expect(result.format).toBe('json');
      const parsed = JSON.parse(readFileSync(outputPath, 'utf-8')) as {
        fragments: { id: string; title: string; content: string }[];
      };
      expect(parsed.fragments).toHaveLength(1);
      expect(parsed.fragments[0].id).toBe('DOC-001');
      expect(parsed.fragments[0].title).toBe('API Reference');
      expect(parsed.fragments[0].content).toContain('# API Reference');
    });

    it('includes all fragments in order', async () => {
      createDocItem(devstepsDir, { id: 'DOC-001', title: 'Alpha', description: '# Alpha\n\nA.' });
      createDocItem(devstepsDir, { id: 'DOC-002', title: 'Beta', description: '# Beta\n\nB.' });

      const outputPath = join(outputDir, 'out.json');
      const result = await rollupHandler(devstepsDir, {
        output: outputPath,
        format: 'json',
        item_ids: ['DOC-001', 'DOC-002'],
      });

      expect(result.item_count).toBe(2);
      const parsed = JSON.parse(readFileSync(outputPath, 'utf-8')) as {
        fragments: { id: string }[];
      };
      expect(parsed.fragments.map((f) => f.id)).toEqual(['DOC-001', 'DOC-002']);
    });

    it('uses default output path devsteps-rollup.json for json format', async () => {
      createDocItem(devstepsDir, { id: 'DOC-001', title: 'X' });

      const result = await rollupHandler(devstepsDir, { format: 'json' });

      expect(result.output).toMatch(/devsteps-rollup\.json$/);
    });
  });

  describe('heading_offset_mode', () => {
    it('mode=none: leaves headings unchanged', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-001',
        description: '# Title\n\n## Subtitle\n\nContent.',
      });
      createDocItem(devstepsDir, {
        id: 'DOC-002',
        description: '# Title Two\n\n## Subtitle Two\n\nMore.',
      });

      const outputPath = join(outputDir, 'out.md');
      await rollupHandler(devstepsDir, {
        output: outputPath,
        heading_offset_mode: 'none',
        item_ids: ['DOC-001', 'DOC-002'],
      });

      const content = readFileSync(outputPath, 'utf-8');
      expect(content).toContain('# Title\n');
      expect(content).toContain('# Title Two\n');
    });

    it('mode=auto: first item offset=0, second item offset=1 (H1→H2)', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-001',
        description: '# Part One\n\nFirst.',
      });
      createDocItem(devstepsDir, {
        id: 'DOC-002',
        description: '# Part Two\n\nSecond.',
      });

      const outputPath = join(outputDir, 'out.md');
      await rollupHandler(devstepsDir, {
        output: outputPath,
        heading_offset_mode: 'auto',
        item_ids: ['DOC-001', 'DOC-002'],
      });

      const content = readFileSync(outputPath, 'utf-8');
      // First item at depth 0 — no shift
      expect(content).toContain('# Part One');
      // Second item at depth 1 — H1 shifted to H2
      expect(content).toContain('## Part Two');
    });

    it('mode=manual: applies per-item offsets from item_offsets map', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-001',
        description: '# Section\n\n## Sub\n\nText.',
      });

      const outputPath = join(outputDir, 'out.md');
      await rollupHandler(devstepsDir, {
        output: outputPath,
        heading_offset_mode: 'manual',
        item_ids: ['DOC-001'],
        item_offsets: { 'DOC-001': 2 },
      });

      const content = readFileSync(outputPath, 'utf-8');
      // H1 + offset 2 = H3
      expect(content).toContain('### Section');
      // H2 + offset 2 = H4
      expect(content).toContain('#### Sub');
    });

    it('mode=manual: item not in item_offsets receives offset 0 (unchanged)', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-001',
        description: '# My Title\n\nContent.',
      });

      const outputPath = join(outputDir, 'out.md');
      await rollupHandler(devstepsDir, {
        output: outputPath,
        heading_offset_mode: 'manual',
        item_ids: ['DOC-001'],
        item_offsets: {},
      });

      const content = readFileSync(outputPath, 'utf-8');
      expect(content).toContain('# My Title');
    });
  });

  describe('item_ids explicit ordering', () => {
    it('respects provided item order (reverse BOM)', async () => {
      createDocItem(devstepsDir, { id: 'DOC-001', title: 'Alpha', description: '# Alpha\n\nA.' });
      createDocItem(devstepsDir, { id: 'DOC-002', title: 'Beta', description: '# Beta\n\nB.' });
      createDocItem(devstepsDir, { id: 'DOC-003', title: 'Gamma', description: '# Gamma\n\nG.' });

      const outputPath = join(outputDir, 'out.md');
      await rollupHandler(devstepsDir, {
        output: outputPath,
        item_ids: ['DOC-003', 'DOC-001', 'DOC-002'],
      });

      const content = readFileSync(outputPath, 'utf-8');
      const gammaPos = content.indexOf('# Gamma');
      const alphaPos = content.indexOf('# Alpha');
      const betaPos = content.indexOf('# Beta');
      expect(gammaPos).toBeLessThan(alphaPos);
      expect(alphaPos).toBeLessThan(betaPos);
    });

    it('skips non-existent IDs gracefully by throwing', async () => {
      createDocItem(devstepsDir, { id: 'DOC-001', title: 'Real', description: '# Real\n\nOK.' });

      const outputPath = join(outputDir, 'out.md');
      await expect(
        rollupHandler(devstepsDir, {
          output: outputPath,
          item_ids: ['DOC-001', 'DOC-999'],
        })
      ).rejects.toThrow();
    });
  });

  describe('include_tags filter', () => {
    it('only includes items that carry ALL required tags (AND semantics)', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-001',
        title: 'Public API',
        description: '# Public API\n\nContent.',
        tags: ['public', 'api'],
      });
      createDocItem(devstepsDir, {
        id: 'DOC-002',
        title: 'Internal Notes',
        description: '# Internal Notes\n\nContent.',
        tags: ['internal'],
      });
      createDocItem(devstepsDir, {
        id: 'DOC-003',
        title: 'Public Blog',
        description: '# Public Blog\n\nContent.',
        tags: ['public'],
      });

      const outputPath = join(outputDir, 'out.md');
      const result = await rollupHandler(devstepsDir, {
        output: outputPath,
        include_tags: ['public', 'api'],
      });

      // Only DOC-001 has BOTH 'public' AND 'api'
      expect(result.item_count).toBe(1);
      const content = readFileSync(outputPath, 'utf-8');
      expect(content).toContain('# Public API');
      expect(content).not.toContain('# Internal Notes');
      expect(content).not.toContain('# Public Blog');
    });

    it('returns zero items when no item matches all include_tags', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-001',
        description: '# Doc\n\nContent.',
        tags: ['alpha'],
      });

      const outputPath = join(outputDir, 'out.md');
      const result = await rollupHandler(devstepsDir, {
        output: outputPath,
        include_tags: ['alpha', 'beta'],
      });

      expect(result.item_count).toBe(0);
    });
  });

  describe('exclude_tags filter', () => {
    it('excludes items that carry ANY excluded tag', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-001',
        title: 'Public',
        description: '# Public\n\nOK.',
        tags: ['public'],
      });
      createDocItem(devstepsDir, {
        id: 'DOC-002',
        title: 'Draft',
        description: '# Draft\n\nWIP.',
        tags: ['draft', 'wip'],
      });
      createDocItem(devstepsDir, {
        id: 'DOC-003',
        title: 'Archived',
        description: '# Archived\n\nOld.',
        tags: ['archived'],
      });

      const outputPath = join(outputDir, 'out.md');
      const result = await rollupHandler(devstepsDir, {
        output: outputPath,
        exclude_tags: ['draft', 'archived'],
      });

      expect(result.item_count).toBe(1);
      const content = readFileSync(outputPath, 'utf-8');
      expect(content).toContain('# Public');
      expect(content).not.toContain('# Draft');
      expect(content).not.toContain('# Archived');
    });

    it('exclude_tags does not affect subsequent items depth counter (auto mode)', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-001',
        title: 'Skip Me',
        description: '# Skip Me\n\nFiltered.',
        tags: ['exclude'],
      });
      createDocItem(devstepsDir, {
        id: 'DOC-002',
        title: 'Keep A',
        description: '# Keep A\n\nFirst kept.',
      });
      createDocItem(devstepsDir, {
        id: 'DOC-003',
        title: 'Keep B',
        description: '# Keep B\n\nSecond kept.',
      });

      const outputPath = join(outputDir, 'out.md');
      const result = await rollupHandler(devstepsDir, {
        output: outputPath,
        item_ids: ['DOC-001', 'DOC-002', 'DOC-003'],
        exclude_tags: ['exclude'],
        heading_offset_mode: 'auto',
      });

      expect(result.item_count).toBe(2);
      const content = readFileSync(outputPath, 'utf-8');
      // DOC-002 is outputDepth=0 (first kept) → no shift → # Keep A
      expect(content).toContain('# Keep A');
      // DOC-003 is outputDepth=1 → H1 → H2
      expect(content).toContain('## Keep B');
    });

    it('combining include_tags + exclude_tags: include wins, then exclude trims', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-001',
        title: 'Public Draft',
        description: '# Public Draft\n\nNot ready.',
        tags: ['public', 'draft'],
      });
      createDocItem(devstepsDir, {
        id: 'DOC-002',
        title: 'Public Released',
        description: '# Public Released\n\nReady.',
        tags: ['public'],
      });
      createDocItem(devstepsDir, {
        id: 'DOC-003',
        title: 'Internal',
        description: '# Internal\n\nHidden.',
        tags: ['internal'],
      });

      const outputPath = join(outputDir, 'out.md');
      const result = await rollupHandler(devstepsDir, {
        output: outputPath,
        include_tags: ['public'],
        exclude_tags: ['draft'],
      });

      // include_tags: DOC-001 and DOC-002 pass; DOC-003 filtered out by listItems
      // then exclude_tags: DOC-001 is excluded (has 'draft')
      expect(result.item_count).toBe(1);
      const content = readFileSync(outputPath, 'utf-8');
      expect(content).not.toContain('# Public Draft');
      expect(content).toContain('# Public Released');
      expect(content).not.toContain('# Internal');
    });
  });

  describe('YAML frontmatter stripping', () => {
    it('strips YAML frontmatter from item description before rendering', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-001',
        title: 'Frontmatter Test',
        description:
          '---\ndiataxis: how-to\nstatus: draft\n---\n\n# Frontmatter Test\n\nBody text.',
      });

      const outputPath = join(outputDir, 'out.md');
      await rollupHandler(devstepsDir, { output: outputPath });

      const content = readFileSync(outputPath, 'utf-8');
      expect(content).not.toContain('diataxis');
      expect(content).toContain('# Frontmatter Test');
      expect(content).toContain('Body text.');
    });
  });

  describe('transclusion (enable_transclusion=true)', () => {
    it('resolves {{ref:ITEM-ID}} markers in item description', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-010',
        title: 'Shared Snippet',
        description: '# Shared Snippet\n\nThis is the shared content.',
      });
      createDocItem(devstepsDir, {
        id: 'DOC-011',
        title: 'Main Doc',
        description: '# Main Doc\n\nBefore.\n\n{{ref:DOC-010}}\n\nAfter.',
      });

      const outputPath = join(outputDir, 'out.md');
      const result = await rollupHandler(devstepsDir, {
        output: outputPath,
        item_ids: ['DOC-011'],
        enable_transclusion: true,
      });

      expect(result.item_count).toBe(1);
      const content = readFileSync(outputPath, 'utf-8');
      expect(content).toContain('This is the shared content.');
      expect(content).not.toContain('{{ref:DOC-010}}');
    });

    it('leaves {{ref:ITEM-ID}} unchanged when enable_transclusion=false (default)', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-010',
        title: 'Snippet',
        description: '# Snippet\n\nShared.',
      });
      createDocItem(devstepsDir, {
        id: 'DOC-011',
        title: 'Main',
        description: '# Main\n\n{{ref:DOC-010}}',
      });

      const outputPath = join(outputDir, 'out.md');
      await rollupHandler(devstepsDir, {
        output: outputPath,
        item_ids: ['DOC-011'],
      });

      const content = readFileSync(outputPath, 'utf-8');
      expect(content).toContain('{{ref:DOC-010}}');
    });

    it('handles circular transclusion with cycle comment', async () => {
      // DOC-020 references DOC-021 which references DOC-020
      createDocItem(devstepsDir, {
        id: 'DOC-020',
        title: 'Alpha',
        description: '# Alpha\n\n{{ref:DOC-021}}',
      });
      createDocItem(devstepsDir, {
        id: 'DOC-021',
        title: 'Beta',
        description: '# Beta\n\n{{ref:DOC-020}}',
      });

      const outputPath = join(outputDir, 'out.md');
      // Must not throw or hang
      const result = await rollupHandler(devstepsDir, {
        output: outputPath,
        item_ids: ['DOC-020'],
        enable_transclusion: true,
      });

      expect(result.item_count).toBe(1);
      const content = readFileSync(outputPath, 'utf-8');
      expect(content).toContain('<!-- transclusion cycle: DOC-020 -->');
    });

    it('leaves unknown ref markers in place when referenced item does not exist', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-030',
        title: 'Doc with missing ref',
        description: '# Doc\n\n{{ref:DOC-999}}',
      });

      const outputPath = join(outputDir, 'out.md');
      await rollupHandler(devstepsDir, {
        output: outputPath,
        item_ids: ['DOC-030'],
        enable_transclusion: true,
      });

      const content = readFileSync(outputPath, 'utf-8');
      expect(content).toContain('{{ref:DOC-999}}');
    });

    it('resolves nested transclusion (A→B→C)', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-040',
        title: 'Leaf',
        description: 'Leaf content.',
      });
      createDocItem(devstepsDir, {
        id: 'DOC-041',
        title: 'Middle',
        description: 'Middle: {{ref:DOC-040}}',
      });
      createDocItem(devstepsDir, {
        id: 'DOC-042',
        title: 'Top',
        description: '# Top\n\nTop: {{ref:DOC-041}}',
      });

      const outputPath = join(outputDir, 'out.md');
      await rollupHandler(devstepsDir, {
        output: outputPath,
        item_ids: ['DOC-042'],
        enable_transclusion: true,
      });

      const content = readFileSync(outputPath, 'utf-8');
      expect(content).toContain('Leaf content.');
      expect(content).not.toContain('{{ref:');
    });
  });

  describe('title extraction', () => {
    it('extracts title from first H1 in content when available', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-001',
        title: 'Metadata Title',
        description: '# Content Title\n\nBody.',
      });

      const outputPath = join(outputDir, 'out.json');
      await rollupHandler(devstepsDir, { output: outputPath, format: 'json' });

      const parsed = JSON.parse(readFileSync(outputPath, 'utf-8')) as {
        fragments: { id: string; title: string }[];
      };
      // H1 heading takes precedence over metadata.title
      expect(parsed.fragments[0].title).toBe('Content Title');
    });

    it('falls back to metadata.title when no H1 heading exists', async () => {
      createDocItem(devstepsDir, {
        id: 'DOC-001',
        title: 'Fallback Title',
        description: 'Content without a heading.',
      });

      const outputPath = join(outputDir, 'out.json');
      await rollupHandler(devstepsDir, { output: outputPath, format: 'json' });

      const parsed = JSON.parse(readFileSync(outputPath, 'utf-8')) as {
        fragments: { id: string; title: string }[];
      };
      expect(parsed.fragments[0].title).toBe('Fallback Title');
    });
  });
});

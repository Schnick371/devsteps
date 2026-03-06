/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Tests for context generation — quick/standard levels, context_meta, generateProjectMd
 *
 * @see STORY-121 TASK-273, TASK-276
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  buildContextMeta,
  formatContextAsText,
  generateProjectMd,
  getQuickContext,
  getStandardContext,
} from './context.js';

// ─── Test fixtures ────────────────────────────────────────────────────────────

function makeIndex(items: Array<{ id: string; type: string; title: string; status: string; updated: string }>) {
  return JSON.stringify({
    version: '2.0.0',
    items,
  });
}

function makeItem(id: string, type: string, status: string) {
  return { id, type, title: `${type} ${id}`, status, updated: new Date().toISOString() };
}

let tmpDir: string;
let projectDir: string;
let devstepsDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(path.join(tmpdir(), 'devsteps-ctx-test-'));
  projectDir = tmpDir;
  devstepsDir = path.join(tmpDir, '.devsteps');
  mkdirSync(devstepsDir, { recursive: true });

  // Minimal index
  writeFileSync(
    path.join(devstepsDir, 'index.json'),
    makeIndex([
      makeItem('STORY-001', 'story', 'in-progress'),
      makeItem('TASK-001', 'task', 'planned'),
      makeItem('TASK-002', 'task', 'done'),
      makeItem('BUG-001', 'bug', 'blocked'),
    ])
  );
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

// ─── getQuickContext ──────────────────────────────────────────────────────────

describe('getQuickContext', () => {
  it('returns success with correct context_level', async () => {
    const ctx = await getQuickContext(projectDir, devstepsDir);
    expect(ctx.context_level).toBe('quick');
  });

  it('includes active_items counts', async () => {
    const ctx = await getQuickContext(projectDir, devstepsDir);
    expect(ctx.dynamic_context.active_items.total).toBe(4);
    expect(ctx.dynamic_context.active_items.by_type.story).toBe(1);
    expect(ctx.dynamic_context.active_items.by_status.done).toBe(1);
  });

  it('includes context_meta', async () => {
    const ctx = await getQuickContext(projectDir, devstepsDir);
    expect(ctx.context_meta).toBeDefined();
    expect(ctx.context_meta!.level).toBe('quick');
    expect(typeof ctx.context_meta!.generated_at).toBe('string');
    expect(typeof ctx.context_meta!.project_md_age_hours).toBe('number');
    expect(typeof ctx.context_meta!.is_stale).toBe('boolean');
    expect(typeof ctx.context_meta!.cache_hit).toBe('boolean');
  });

  it('context_meta.is_stale true when PROJECT.md missing', async () => {
    const ctx = await getQuickContext(projectDir, devstepsDir);
    // PROJECT.md not written in beforeEach — should be stale (Infinity age)
    expect(ctx.context_meta!.is_stale).toBe(true);
    expect(ctx.context_meta!.project_md_age_hours).toBe(Number.POSITIVE_INFINITY);
  });

  it('context_meta.is_stale false when PROJECT.md is fresh', async () => {
    writeFileSync(path.join(devstepsDir, 'PROJECT.md'), '# Test', 'utf-8');
    const ctx = await getQuickContext(projectDir, devstepsDir);
    expect(ctx.context_meta!.is_stale).toBe(false);
    expect(ctx.context_meta!.project_md_age_hours).toBeLessThan(1);
  });

  it('includes suggestions when PROJECT.md missing', async () => {
    const ctx = await getQuickContext(projectDir, devstepsDir);
    expect(ctx.suggestions).toBeDefined();
    expect(ctx.suggestions!.some((s) => s.includes('devsteps context generate'))).toBe(true);
  });

  it('includes suggestions for blocked items', async () => {
    const ctx = await getQuickContext(projectDir, devstepsDir);
    expect(ctx.suggestions!.some((s) => s.includes('blocked'))).toBe(true);
  });

  it('tokens_used is positive', async () => {
    const ctx = await getQuickContext(projectDir, devstepsDir);
    expect(ctx.tokens_used).toBeGreaterThan(0);
  });
});

// ─── getStandardContext ───────────────────────────────────────────────────────

describe('getStandardContext', () => {
  it('returns context_level standard', async () => {
    const ctx = await getStandardContext(projectDir, devstepsDir);
    expect(ctx.context_level).toBe('standard');
  });

  it('includes context_meta with level standard', async () => {
    const ctx = await getStandardContext(projectDir, devstepsDir);
    expect(ctx.context_meta).toBeDefined();
    expect(ctx.context_meta!.level).toBe('standard');
  });

  it('standard context includes open_items_count in dynamic_context', async () => {
    const ctx = await getStandardContext(projectDir, devstepsDir);
    // 4 items total, 3 non-done (in-progress, planned, blocked)
    const dc = ctx.dynamic_context as { open_items_count?: number };
    expect(dc.open_items_count).toBeDefined();
    expect(dc.open_items_count).toBeGreaterThanOrEqual(3);
  });

  it('standard context includes in_progress array', async () => {
    const ctx = await getStandardContext(projectDir, devstepsDir);
    const dc = ctx.dynamic_context as { in_progress?: Array<{ id: string }> };
    expect(dc.in_progress).toBeDefined();
    expect(dc.in_progress!.some((i) => i.id === 'STORY-001')).toBe(true);
  });

  it('standard context includes blocking_items array', async () => {
    const ctx = await getStandardContext(projectDir, devstepsDir);
    const dc = ctx.dynamic_context as { blocking_items?: Array<{ id: string }> };
    expect(dc.blocking_items).toBeDefined();
    expect(dc.blocking_items!.some((i) => i.id === 'BUG-001')).toBe(true);
  });

  it('tokens_used is positive and larger than quick', async () => {
    const quick = await getQuickContext(projectDir, devstepsDir);
    const standard = await getStandardContext(projectDir, devstepsDir);
    expect(standard.tokens_used).toBeGreaterThan(0);
    // Standard should be at least as many tokens as quick
    expect(standard.tokens_used).toBeGreaterThanOrEqual(quick.tokens_used);
  });
});

// ─── buildContextMeta ────────────────────────────────────────────────────────

describe('buildContextMeta', () => {
  it('returns is_stale true when PROJECT.md missing', async () => {
    const meta = await buildContextMeta(devstepsDir, 'quick', false);
    expect(meta.is_stale).toBe(true);
  });

  it('returns is_stale false when PROJECT.md fresh', async () => {
    writeFileSync(path.join(devstepsDir, 'PROJECT.md'), '# test', 'utf-8');
    const meta = await buildContextMeta(devstepsDir, 'quick', false);
    expect(meta.is_stale).toBe(false);
  });

  it('returns correct level', async () => {
    const meta = await buildContextMeta(devstepsDir, 'standard', true);
    expect(meta.level).toBe('standard');
    expect(meta.cache_hit).toBe(true);
  });

  it('generated_at is valid ISO date', async () => {
    const meta = await buildContextMeta(devstepsDir, 'quick', false);
    expect(new Date(meta.generated_at).getTime()).not.toBeNaN();
  });
});

// ─── formatContextAsText ─────────────────────────────────────────────────────

describe('formatContextAsText', () => {
  it('produces non-empty markdown string', async () => {
    const ctx = await getQuickContext(projectDir, devstepsDir);
    const text = formatContextAsText(ctx);
    expect(typeof text).toBe('string');
    expect(text.length).toBeGreaterThan(50);
  });

  it('contains project status section', async () => {
    const ctx = await getQuickContext(projectDir, devstepsDir);
    const text = formatContextAsText(ctx);
    expect(text).toContain('## Project Status');
    expect(text).toContain('Total items: 4');
  });

  it('contains DevSteps Conventions section', async () => {
    const ctx = await getQuickContext(projectDir, devstepsDir);
    const text = formatContextAsText(ctx);
    expect(text).toContain('## DevSteps Conventions');
    expect(text).toContain('.devsteps/');
  });

  it('includes stale warning when is_stale', async () => {
    // PROJECT.md missing => is_stale
    const ctx = await getQuickContext(projectDir, devstepsDir);
    const text = formatContextAsText(ctx);
    expect(text).toContain('stale');
    expect(text).toContain('devsteps context generate');
  });

  it('no stale warning when PROJECT.md fresh', async () => {
    writeFileSync(path.join(devstepsDir, 'PROJECT.md'), '# test', 'utf-8');
    const ctx = await getQuickContext(projectDir, devstepsDir);
    const text = formatContextAsText(ctx);
    expect(text).not.toContain('stale');
  });
});

// ─── generateProjectMd ───────────────────────────────────────────────────────

describe('generateProjectMd', () => {
  beforeEach(() => {
    // Write a minimal config.json
    writeFileSync(
      path.join(devstepsDir, 'config.json'),
      JSON.stringify({
        project_name: 'test-project',
        settings: { methodology: 'scrum' },
        created: new Date().toISOString(),
      }),
      'utf-8'
    );
  });

  it('produces markdown starting with project name', async () => {
    const md = await generateProjectMd(projectDir, devstepsDir);
    expect(md).toMatch(/^# test-project/);
  });

  it('contains Project Type section', async () => {
    const md = await generateProjectMd(projectDir, devstepsDir);
    expect(md).toContain('## Project Type');
    expect(md).toContain('Scrum');
  });

  it('contains Status section with item counts', async () => {
    const md = await generateProjectMd(projectDir, devstepsDir);
    expect(md).toContain('## Status');
    expect(md).toContain('Total items: 4');
  });

  it('contains Conventions section', async () => {
    const md = await generateProjectMd(projectDir, devstepsDir);
    expect(md).toContain('## Conventions');
    expect(md).toContain('.devsteps/');
  });

  it('ends with generation timestamp', async () => {
    const md = await generateProjectMd(projectDir, devstepsDir);
    expect(md).toContain('_Generated by');
    expect(md).toContain('devsteps context generate');
  });

  it('reads description from README.md when no config description', async () => {
    writeFileSync(path.join(projectDir, 'README.md'), '# Test\n\nThis is the first paragraph.', 'utf-8');
    const md = await generateProjectMd(projectDir, devstepsDir);
    expect(md).toContain('This is the first paragraph.');
  });

  it('includes package structure when packages/ dir exists', async () => {
    const pkgDir = path.join(projectDir, 'packages', 'mypkg');
    mkdirSync(pkgDir, { recursive: true });
    writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify({ name: '@test/mypkg', description: 'My test package' }),
      'utf-8'
    );
    const md = await generateProjectMd(projectDir, devstepsDir);
    expect(md).toContain('## Package Structure');
    expect(md).toContain('@test/mypkg');
    expect(md).toContain('My test package');
  });

  it('works when config.json is missing (graceful fallback)', async () => {
    rmSync(path.join(devstepsDir, 'config.json'));
    const md = await generateProjectMd(projectDir, devstepsDir);
    // Should not throw — uses directory name as project name
    expect(md).toBeDefined();
    expect(md.startsWith('#')).toBe(true);
  });
});

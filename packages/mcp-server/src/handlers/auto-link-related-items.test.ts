/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Tests for related_items auto-link logic (STORY-292)
 * Tests the shared-level primitives used by devsteps_docs_bom_commit
 * and devsteps_docs_import via extractFrontmatter + getItem + linkItem.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  addItem,
  extractFrontmatter,
  getItem,
  initializeRefsStyleIndex,
  linkItem,
} from '@schnick371/devsteps-shared';

let devstepsDir: string;
let tempRoot: string;

beforeEach(() => {
  tempRoot = mkdtempSync(join(tmpdir(), 'devsteps-auto-link-test-'));
  devstepsDir = join(tempRoot, '.devsteps');
  mkdirSync(devstepsDir, { recursive: true });
  initializeRefsStyleIndex(devstepsDir);
  writeFileSync(
    join(devstepsDir, 'config.json'),
    JSON.stringify({ version: '1.0.0', settings: { methodology: 'hybrid' } })
  );
  writeFileSync(
    join(devstepsDir, 'docs-map.json'),
    JSON.stringify({ version: '1.0.0', nodes: [] })
  );
});

afterEach(() => {
  rmSync(tempRoot, { recursive: true, force: true });
});

describe('auto-link related_items via extractFrontmatter + linkItem (STORY-292)', () => {
  it('creates implements link when related_item exists', async () => {
    const storyResult = await addItem(devstepsDir, { type: 'story', title: 'Target story' });
    const storyId = storyResult.itemId;

    const docResult = await addItem(devstepsDir, { type: 'doc', title: 'reference: my-guide' });
    const docId = docResult.itemId;

    const mdContent = `---\nrelated_items: [${storyId}]\n---\n# My Guide\n\nContent here.`;
    const { frontmatter } = extractFrontmatter(mdContent);
    expect(frontmatter?.related_items).toContain(storyId);

    const warnings: string[] = [];
    for (const relId of frontmatter?.related_items ?? []) {
      try {
        await getItem(devstepsDir, relId);
      } catch {
        warnings.push(`related_items entry '${relId}' not found — link skipped`);
        continue;
      }
      await linkItem(devstepsDir, { sourceId: docId, relationType: 'documents', targetId: relId });
    }

    expect(warnings).toHaveLength(0);
    const { metadata } = await getItem(devstepsDir, docId);
    expect(metadata.linked_items.documents).toContain(storyId);
  });

  it('warns and continues when related_item does not exist (STORY-NONEXISTENT)', async () => {
    const docResult = await addItem(devstepsDir, { type: 'doc', title: 'reference: my-guide' });
    const docId = docResult.itemId;

    const mdContent = `---\nrelated_items: [STORY-999]\n---\n# My Guide\n\nContent.`;
    const { frontmatter } = extractFrontmatter(mdContent);

    const warnings: string[] = [];
    for (const relId of frontmatter?.related_items ?? []) {
      try {
        await getItem(devstepsDir, relId);
      } catch {
        warnings.push(`related_items entry '${relId}' not found — link skipped`);
        continue;
      }
      await linkItem(devstepsDir, { sourceId: docId, relationType: 'documents', targetId: relId });
    }

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/STORY-999.*not found/);

    const { metadata } = await getItem(devstepsDir, docId);
    expect(metadata.id).toBe(docId);
    expect(metadata.linked_items.documents).toHaveLength(0);
  });

  it('linkItem is idempotent — duplicate calls do not throw', async () => {
    const storyResult = await addItem(devstepsDir, { type: 'story', title: 'Target story' });
    const storyId = storyResult.itemId;
    const docResult = await addItem(devstepsDir, { type: 'doc', title: 'reference: my-guide' });
    const docId = docResult.itemId;

    await linkItem(devstepsDir, { sourceId: docId, relationType: 'documents', targetId: storyId });
    await expect(
      linkItem(devstepsDir, { sourceId: docId, relationType: 'documents', targetId: storyId })
    ).resolves.toBeDefined();

    const { metadata } = await getItem(devstepsDir, docId);
    const links = metadata.linked_items.documents as string[];
    expect(links.filter((id) => id === storyId)).toHaveLength(1);
  });

  it('extractFrontmatter returns null when no frontmatter present', () => {
    const content = '# Just a title\n\nNo frontmatter here.';
    const { frontmatter } = extractFrontmatter(content);
    expect(frontmatter).toBeNull();
    expect(frontmatter?.related_items ?? []).toHaveLength(0);
  });
});

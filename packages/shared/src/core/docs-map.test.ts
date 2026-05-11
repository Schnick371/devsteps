/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Unit tests for docs-map module — ADR-007 JSON adjacency list format.
 *
 * @see STORY-233
 */

import { existsSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { DocsMapDocument, DocsMapNode, DocsMapPositionsIndex } from '../types/docs-map.js';
import { appendDocsMapNode, readDocsMap, rebuildDocsMapShadow, writeDocsMap } from './docs-map.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeNode(partial: Partial<DocsMapNode> & { id: string }): DocsMapNode {
  return {
    parent_id: null,
    order: 10,
    title: `Title for ${partial.id}`,
    devsteps_items: [],
    ...partial,
  };
}

let devstepsDir: string;

beforeEach(() => {
  devstepsDir = mkdtempSync(join(tmpdir(), 'devsteps-docs-map-test-'));
});

afterEach(() => {
  rmSync(devstepsDir, { recursive: true, force: true });
});

// ─── readDocsMap ──────────────────────────────────────────────────────────────

describe('readDocsMap', () => {
  it('returns empty document when file does not exist', () => {
    const doc = readDocsMap(devstepsDir);
    expect(doc.version).toBe('1.0');
    expect(doc.nodes).toEqual([]);
  });

  it('returns empty document on malformed JSON', () => {
    writeFileSync(join(devstepsDir, 'docs-map.json'), 'not valid json', 'utf-8');
    const doc = readDocsMap(devstepsDir);
    expect(doc.nodes).toEqual([]);
  });

  it('reads a valid docs-map.json', () => {
    const fixture: DocsMapDocument = {
      version: '1.0',
      nodes: [makeNode({ id: 'ARCH-001', parent_id: null, order: 10 })],
    };
    writeFileSync(join(devstepsDir, 'docs-map.json'), JSON.stringify(fixture), 'utf-8');
    const doc = readDocsMap(devstepsDir);
    expect(doc.nodes).toHaveLength(1);
    expect(doc.nodes[0].id).toBe('ARCH-001');
  });
});

// ─── writeDocsMap ─────────────────────────────────────────────────────────────

describe('writeDocsMap', () => {
  it('writes docs-map.json and creates positions shadow', () => {
    const doc: DocsMapDocument = {
      version: '1.0',
      nodes: [makeNode({ id: 'ARCH-001', parent_id: null, order: 10 })],
    };
    writeDocsMap(devstepsDir, doc);

    expect(existsSync(join(devstepsDir, 'docs-map.json'))).toBe(true);
    expect(existsSync(join(devstepsDir, 'index', 'docs-map-positions.json'))).toBe(true);

    const written = JSON.parse(readFileSync(join(devstepsDir, 'docs-map.json'), 'utf-8'));
    expect(written.nodes[0].id).toBe('ARCH-001');
    expect(written.nodes[0].parent_id).toBeNull();
    expect(written.nodes[0].order).toBe(10);
  });

  it('produces correct dot-notation positions in shadow', () => {
    const doc: DocsMapDocument = {
      version: '1.0',
      nodes: [
        makeNode({ id: 'ARCH-001', parent_id: null, order: 10 }),
        makeNode({ id: 'ARCH-002', parent_id: null, order: 20 }),
        makeNode({ id: 'ARCH-001-P1', parent_id: 'ARCH-001', order: 10 }),
        makeNode({ id: 'ARCH-001-P2', parent_id: 'ARCH-001', order: 20 }),
      ],
    };
    writeDocsMap(devstepsDir, doc);

    const shadow: DocsMapPositionsIndex = JSON.parse(
      readFileSync(join(devstepsDir, 'index', 'docs-map-positions.json'), 'utf-8')
    );

    const byId = Object.fromEntries(shadow.entries.map((e) => [e.id, e]));
    expect(byId['ARCH-001'].position).toBe('1');
    expect(byId['ARCH-001'].depth).toBe(0);
    expect(byId['ARCH-001'].parent_arch_id).toBeNull();
    expect(byId['ARCH-002'].position).toBe('2');
    expect(byId['ARCH-001-P1'].position).toBe('1.1');
    expect(byId['ARCH-001-P1'].depth).toBe(1);
    expect(byId['ARCH-001-P1'].parent_arch_id).toBe('ARCH-001');
    expect(byId['ARCH-001-P2'].position).toBe('1.2');
  });

  it('sorts siblings by order field', () => {
    const doc: DocsMapDocument = {
      version: '1.0',
      nodes: [
        makeNode({ id: 'ARCH-002', parent_id: null, order: 20 }),
        makeNode({ id: 'ARCH-001', parent_id: null, order: 10 }),
      ],
    };
    writeDocsMap(devstepsDir, doc);

    const shadow: DocsMapPositionsIndex = JSON.parse(
      readFileSync(join(devstepsDir, 'index', 'docs-map-positions.json'), 'utf-8')
    );

    expect(shadow.entries[0].id).toBe('ARCH-001');
    expect(shadow.entries[0].position).toBe('1');
    expect(shadow.entries[1].id).toBe('ARCH-002');
    expect(shadow.entries[1].position).toBe('2');
  });

  it('does not write children field (format is flat adjacency list)', () => {
    const doc: DocsMapDocument = {
      version: '1.0',
      nodes: [makeNode({ id: 'ARCH-001', parent_id: null, order: 10 })],
    };
    writeDocsMap(devstepsDir, doc);

    const written = JSON.parse(readFileSync(join(devstepsDir, 'docs-map.json'), 'utf-8'));
    expect('children' in written.nodes[0]).toBe(false);
  });
});

// ─── appendDocsMapNode ────────────────────────────────────────────────────────

describe('appendDocsMapNode', () => {
  it('appends a root node when parentId is null', () => {
    const result = appendDocsMapNode(devstepsDir, null, makeNode({ id: 'ARCH-001' }));
    expect(result).toBe(true);

    const doc = readDocsMap(devstepsDir);
    expect(doc.nodes).toHaveLength(1);
    expect(doc.nodes[0].id).toBe('ARCH-001');
    expect(doc.nodes[0].parent_id).toBeNull();
  });

  it('appends a child node under an existing parent', () => {
    appendDocsMapNode(devstepsDir, null, makeNode({ id: 'ARCH-001' }));
    const result = appendDocsMapNode(
      devstepsDir,
      'ARCH-001',
      makeNode({ id: 'ARCH-001-P1', parent_id: 'ARCH-001', order: 10 })
    );
    expect(result).toBe(true);

    const doc = readDocsMap(devstepsDir);
    expect(doc.nodes).toHaveLength(2);
    const child = doc.nodes.find((n) => n.id === 'ARCH-001-P1');
    expect(child?.parent_id).toBe('ARCH-001');
  });

  it('returns false when parentId does not exist', () => {
    const result = appendDocsMapNode(devstepsDir, 'ARCH-NONEXISTENT', makeNode({ id: 'ARCH-002' }));
    expect(result).toBe(false);
  });

  it('overrides node parent_id with the parentId parameter', () => {
    appendDocsMapNode(devstepsDir, null, makeNode({ id: 'ARCH-001' }));
    // Pass parent_id: null in node but override via parentId parameter
    appendDocsMapNode(
      devstepsDir,
      'ARCH-001',
      makeNode({ id: 'ARCH-001-P1', parent_id: null }) // should be overridden
    );
    const doc = readDocsMap(devstepsDir);
    const child = doc.nodes.find((n) => n.id === 'ARCH-001-P1');
    expect(child?.parent_id).toBe('ARCH-001');
  });
  it('builds a 3-level hierarchy: L0 root → two L1 children → one L2 grandchild', () => {
    // L0 root
    const root = appendDocsMapNode(
      devstepsDir,
      null,
      makeNode({ id: 'ARCH-001', parent_id: null, order: 10 })
    );
    expect(root).toBe(true);

    // L1 children
    const l1a = appendDocsMapNode(
      devstepsDir,
      'ARCH-001',
      makeNode({ id: 'ARCH-010', parent_id: 'ARCH-001', order: 10 })
    );
    const l1b = appendDocsMapNode(
      devstepsDir,
      'ARCH-001',
      makeNode({ id: 'ARCH-020', parent_id: 'ARCH-001', order: 20 })
    );
    expect(l1a).toBe(true);
    expect(l1b).toBe(true);

    // L2 grandchild under ARCH-010
    const l2 = appendDocsMapNode(
      devstepsDir,
      'ARCH-010',
      makeNode({ id: 'ARCH-011', parent_id: 'ARCH-010', order: 10 })
    );
    expect(l2).toBe(true);

    const doc = readDocsMap(devstepsDir);
    expect(doc.nodes).toHaveLength(4);

    const byId = Object.fromEntries(doc.nodes.map((n) => [n.id, n]));
    expect(byId['ARCH-001'].parent_id).toBeNull();
    expect(byId['ARCH-010'].parent_id).toBe('ARCH-001');
    expect(byId['ARCH-020'].parent_id).toBe('ARCH-001');
    expect(byId['ARCH-011'].parent_id).toBe('ARCH-010');
  });
});

// ─── rebuildDocsMapShadow ─────────────────────────────────────────────────────

describe('rebuildDocsMapShadow', () => {
  it('rebuilds shadow without rewriting primary file', () => {
    const doc: DocsMapDocument = {
      version: '1.0',
      nodes: [makeNode({ id: 'ARCH-001', parent_id: null, order: 10 })],
    };
    writeDocsMap(devstepsDir, doc);

    // Remove shadow manually
    unlinkSync(join(devstepsDir, 'index', 'docs-map-positions.json'));
    expect(existsSync(join(devstepsDir, 'index', 'docs-map-positions.json'))).toBe(false);

    rebuildDocsMapShadow(devstepsDir);

    expect(existsSync(join(devstepsDir, 'index', 'docs-map-positions.json'))).toBe(true);
    const shadow: DocsMapPositionsIndex = JSON.parse(
      readFileSync(join(devstepsDir, 'index', 'docs-map-positions.json'), 'utf-8')
    );
    expect(shadow.entries).toHaveLength(1);
    expect(shadow.entries[0].id).toBe('ARCH-001');
  });
});

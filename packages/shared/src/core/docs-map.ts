/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Core docs-map module — read/write/append/rebuild-shadow API for docs-map.json.
 *
 * Design decisions: SPIKE-036, ADR-007
 * - ADR-S2-10: docs-map.json lives at .devsteps/docs-map.json
 * - ADR-S2-11: Atomic dual-write (JSON primary + JSON shadow) via .tmp → rename
 * - ADR-007: JSON adjacency list format (parent_id + order replace children[])
 * - ADR-S2-06/07: position and level are derived at runtime, never stored
 */

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  DocsMapDocument,
  DocsMapNode,
  DocsMapPositionEntry,
  DocsMapPositionsIndex,
} from '../types/docs-map.js';
import { getCurrentTimestamp } from '../utils/index.js';

const DOCS_MAP_PATH = 'docs-map.json';
const POSITIONS_INDEX_DIR = 'index';
const POSITIONS_INDEX_FILE = 'docs-map-positions.json';
const SCHEMA_VERSION = '1.0';

/**
 * Resolve the docs-map.json path within a devstepsDir.
 */
function docsMapPath(devstepsDir: string): string {
  return join(devstepsDir, DOCS_MAP_PATH);
}

/**
 * Resolve the docs-map-positions.json shadow path.
 */
function positionsIndexPath(devstepsDir: string): string {
  return join(devstepsDir, POSITIONS_INDEX_DIR, POSITIONS_INDEX_FILE);
}

/**
 * Read docs-map.json from .devsteps/docs-map.json.
 * Returns an empty document if the file does not exist yet.
 */
export function readDocsMap(devstepsDir: string): DocsMapDocument {
  const filePath = docsMapPath(devstepsDir);
  if (!existsSync(filePath)) {
    return { version: SCHEMA_VERSION, nodes: [] };
  }
  const raw = readFileSync(filePath, 'utf-8');
  let parsed: DocsMapDocument | null = null;
  try {
    parsed = JSON.parse(raw) as DocsMapDocument;
  } catch {
    return { version: SCHEMA_VERSION, nodes: [] };
  }
  if (!parsed || typeof parsed !== 'object') {
    return { version: SCHEMA_VERSION, nodes: [] };
  }
  return {
    version: parsed.version ?? SCHEMA_VERSION,
    nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
  };
}

/**
 * Atomic dual-write: persist docs-map.json + rebuild JSON shadow.
 * Uses .tmp → rename to prevent partial writes (ADR-S2-11).
 */
export function writeDocsMap(devstepsDir: string, document: DocsMapDocument): void {
  const filePath = docsMapPath(devstepsDir);
  const tmpPath = `${filePath}.tmp`;

  // Ensure .devsteps/ directory exists
  mkdirSync(devstepsDir, { recursive: true });

  writeFileSync(tmpPath, JSON.stringify(document, null, 2), 'utf-8');
  renameSync(tmpPath, filePath);

  // Dual-write JSON shadow
  _writePositionsShadow(devstepsDir, document);
}

/**
 * Append a new node to the adjacency list.
 * If parentId is not null, validates that the parent exists before appending.
 * The node must already have parent_id set (should match parentId parameter).
 * Performs atomic dual-write after mutation.
 *
 * @returns true if the node was appended, false if parentId was not found.
 */
export function appendDocsMapNode(
  devstepsDir: string,
  parentId: string | null,
  node: DocsMapNode
): boolean {
  const document = readDocsMap(devstepsDir);

  if (parentId !== null) {
    const parent = _findNode(document.nodes, parentId);
    if (!parent) return false;
  }

  document.nodes.push({ ...node, parent_id: parentId });
  writeDocsMap(devstepsDir, document);
  return true;
}

/**
 * Rebuild the JSON shadow from the current docs-map.json without rewriting the primary file.
 * Use this for index recovery or after external edits to docs-map.json.
 */
export function rebuildDocsMapShadow(devstepsDir: string): void {
  const document = readDocsMap(devstepsDir);
  _writePositionsShadow(devstepsDir, document);
}

// ─── Private helpers ──────────────────────────────────────────────────────────

/**
 * Write the flat JSON shadow to .devsteps/index/docs-map-positions.json.
 * Uses .tmp → rename for atomicity.
 */
function _writePositionsShadow(devstepsDir: string, document: DocsMapDocument): void {
  const entries = _flattenNodes(document.nodes);
  const index: DocsMapPositionsIndex = {
    updated: getCurrentTimestamp(),
    entries,
  };

  const indexDir = join(devstepsDir, POSITIONS_INDEX_DIR);
  mkdirSync(indexDir, { recursive: true });

  const filePath = positionsIndexPath(devstepsDir);
  const tmpPath = `${filePath}.tmp`;

  writeFileSync(tmpPath, JSON.stringify(index, null, 2), 'utf-8');
  renameSync(tmpPath, filePath);
}

/**
 * Flatten the adjacency list into DocsMapPositionEntry[] with derived position + depth.
 * Position is dot-notation (e.g. "1.2.3") computed by traversing the parent_id chain.
 * Nodes are sorted by `order` within each sibling group.
 */
function _flattenNodes(nodes: DocsMapNode[]): DocsMapPositionEntry[] {
  const result: DocsMapPositionEntry[] = [];

  function processChildren(parentId: string | null, parentPosition: string, depth: number): void {
    const siblings = nodes
      .filter((n) => n.parent_id === parentId)
      .sort((a, b) => a.order - b.order);

    for (let i = 0; i < siblings.length; i++) {
      const node = siblings[i];
      const position = parentPosition ? `${parentPosition}.${i + 1}` : `${i + 1}`;

      result.push({
        id: node.id,
        doc_id: node.doc_id,
        parent_arch_id: node.parent_id,
        title: node.title,
        devsteps_items: node.devsteps_items,
        position,
        depth,
      });

      processChildren(node.id, position, depth + 1);
    }
  }

  processChildren(null, '', 0);
  return result;
}

/**
 * Find a node by ARCH-NNN id in the flat adjacency list.
 */
function _findNode(nodes: DocsMapNode[], id: string): DocsMapNode | null {
  return nodes.find((n) => n.id === id) ?? null;
}

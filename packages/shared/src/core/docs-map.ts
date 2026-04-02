/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Core docs-map module — read/write/append/rebuild-shadow API for docs-map.yaml.
 *
 * Design decisions: SPIKE-036
 * - ADR-S2-10: docs-map.yaml lives at .devsteps/docs-map.yaml
 * - ADR-S2-11: Atomic dual-write (YAML + JSON shadow) via .tmp → rename
 * - ADR-S2-13: `yaml` npm package for human-editable YAML
 * - ADR-S2-06/07: position and level are derived at runtime, never stored
 */

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';
import type {
  DocsMapDocument,
  DocsMapNode,
  DocsMapPositionEntry,
  DocsMapPositionsIndex,
} from '../types/docs-map.js';
import { getCurrentTimestamp } from '../utils/index.js';

const DOCS_MAP_PATH = 'docs-map.yaml';
const POSITIONS_INDEX_DIR = 'index';
const POSITIONS_INDEX_FILE = 'docs-map-positions.json';
const SCHEMA_VERSION = '1.0';

/**
 * Resolve the docs-map.yaml path within a devstepsDir.
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
 * Read docs-map.yaml from .devsteps/docs-map.yaml.
 * Returns an empty document if the file does not exist yet.
 */
export function readDocsMap(devstepsDir: string): DocsMapDocument {
  const filePath = docsMapPath(devstepsDir);
  if (!existsSync(filePath)) {
    return { version: SCHEMA_VERSION, nodes: [] };
  }
  const raw = readFileSync(filePath, 'utf-8');
  const parsed = parse(raw) as DocsMapDocument | null;
  if (!parsed || typeof parsed !== 'object') {
    return { version: SCHEMA_VERSION, nodes: [] };
  }
  return {
    version: parsed.version ?? SCHEMA_VERSION,
    nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
  };
}

/**
 * Atomic dual-write: persist docs-map.yaml + rebuild JSON shadow.
 * Uses .tmp → rename to prevent partial writes (ADR-S2-11).
 */
export function writeDocsMap(devstepsDir: string, document: DocsMapDocument): void {
  const filePath = docsMapPath(devstepsDir);
  const tmpPath = `${filePath}.tmp`;

  // Ensure .devsteps/ directory exists
  mkdirSync(devstepsDir, { recursive: true });

  const yamlContent = stringify(document, {
    indent: 2,
    lineWidth: 120,
    defaultStringType: 'QUOTE_DOUBLE',
  });

  writeFileSync(tmpPath, yamlContent, 'utf-8');
  renameSync(tmpPath, filePath);

  // Dual-write JSON shadow
  _writePositionsShadow(devstepsDir, document);
}

/**
 * Append a new node under a parent identified by ARCH-NNN id.
 * If parentId is null, appends to the root `nodes` array.
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

  if (parentId === null) {
    document.nodes.push(node);
    writeDocsMap(devstepsDir, document);
    return true;
  }

  const parent = _findNode(document.nodes, parentId);
  if (!parent) return false;

  parent.children.push(node);
  writeDocsMap(devstepsDir, document);
  return true;
}

/**
 * Rebuild the JSON shadow from the current docs-map.yaml without rewriting YAML.
 * Use this for index recovery or after external edits to docs-map.yaml.
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
  const entries = _flattenNodes(document.nodes, '');
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
 * Flatten the tree into DocsMapPositionEntry[] with derived position + depth.
 * Position is dot-notation (e.g. "1.2.3") computed from sibling index.
 */
function _flattenNodes(
  nodes: DocsMapNode[],
  parentPosition: string,
  depth = 0
): DocsMapPositionEntry[] {
  const result: DocsMapPositionEntry[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const position = parentPosition ? `${parentPosition}.${i + 1}` : `${i + 1}`;

    result.push({
      id: node.id,
      doc_id: node.doc_id,
      title: node.title,
      devsteps_items: node.devsteps_items,
      position,
      depth,
    });

    if (node.children.length > 0) {
      result.push(..._flattenNodes(node.children, position, depth + 1));
    }
  }

  return result;
}

/**
 * Depth-first search for a node by ARCH-NNN id.
 */
function _findNode(nodes: DocsMapNode[], id: string): DocsMapNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children.length > 0) {
      const found = _findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

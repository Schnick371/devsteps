/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * TypeScript types for docs-map.json — the BOM manifest for
 * Tiefenstrukturiertes Dokument (TSD) architecture.
 *
 * Schema decisions: SPIKE-036 ADR-S2-06 (position removed — derive at runtime),
 * ADR-S2-07 (level removed — derive from tree depth), ADR-S2-08 (devsteps_items
 * promoted to string[]), ADR-S2-10 (.devsteps/ placement), ADR-S2-12 (ARCH-NNN
 * is manifest-only key, never a DevSteps ItemType),
 * ADR-007 (JSON adjacency list — parent_id + order replace children[]).
 */

/**
 * A single node in the BOM manifest adjacency list.
 *
 * - `id`        Stable ARCH-NNN identifier. Never registered in generateItemId().
 * - `doc_id`    DOC-NNN item that contains this section (optional for roots that
 *               span multiple files or future composite docs).
 * - `parent_id` ARCH-NNN of the parent node, or null for root nodes.
 *               Enables adjacency-list format and safe reorganisation.
 * - `order`     Sort order within siblings (gap numbering: 10, 20, 30).
 *               Insert a new node at 15 without renaming existing nodes.
 * - `title`     Section heading text (mirrors H1–H4 in the TSD file).
 * - `description` Optional human note for editorial context.
 * - `devsteps_items` DevSteps work-item IDs traceable to this section (any type).
 * - `tsd_heading_depth_max` Hard ceiling for heading rendering in this subtree.
 *   Overrides the global slider if lower. Default: no override.
 * - `default_depth` Default Depth View zoom level (1–4) shown when the user
 *   opens this node's doc in VS Code preview. Presentation hint only.
 */
export interface DocsMapNode {
  /** Stable BOM position code, e.g. "ARCH-001". Never a DevSteps work-item ID. */
  id: string;
  /** Optional DOC-NNN work-item that owns this section. */
  doc_id?: string;
  /** Parent node ID, or null for root-level nodes. */
  parent_id: string | null;
  /** Sort order within siblings. Gap numbering (10, 20, 30) is recommended. */
  order: number;
  /** Section heading text. */
  title: string;
  /** Optional human note for editorial context. */
  description?: string;
  /** DevSteps work-item IDs documented by or traceable to this section. */
  devsteps_items: string[];
  /**
   * Maximum heading depth rendered in this subtree (1 = H1 only, 4 = H1–H4).
   * Overrides slider ceiling when set. Absent = no override.
   */
  tsd_heading_depth_max?: number;
  /**
   * Default zoom level when the VS Code Depth View opens this doc.
   * Presentation hint — not stored in work-item metadata.
   */
  default_depth?: 1 | 2 | 3 | 4;
}

/**
 * Top-level docs-map.json document structure.
 * The `nodes` array is a flat adjacency list of all BOM entries.
 * Tree structure is derived via parent_id + order at runtime.
 */
export interface DocsMapDocument {
  /** Schema version for future migration guards. */
  version: string;
  /** Flat adjacency list of all BOM nodes (not a nested tree). */
  nodes: DocsMapNode[];
}

/**
 * Flat position shadow entry written to .devsteps/index/docs-map-positions.json.
 * Enables O(1) cross-reference queries without full JSON parse on every request.
 */
export interface DocsMapPositionEntry {
  /** ARCH-NNN BOM position code. */
  id: string;
  /** DOC-NNN work-item that owns this section. */
  doc_id?: string;
  /** Parent node ID — direct copy of DocsMapNode.parent_id. */
  parent_arch_id: string | null;
  /** Section heading text. */
  title: string;
  /** DevSteps work-item IDs for this section. */
  devsteps_items: string[];
  /**
   * Dot-notation structural position, e.g. "1.2.3".
   * Derived from adjacency-list traversal — NOT stored in docs-map.json.
   */
  position: string;
  /** Zero-based depth in the tree (root = 0). Derived from parent_id chain. */
  depth: number;
}

/**
 * Contents of .devsteps/index/docs-map-positions.json.
 */
export interface DocsMapPositionsIndex {
  /** ISO 8601 timestamp of last write. */
  updated: string;
  /** Flat array of all BOM entries with derived position + depth. */
  entries: DocsMapPositionEntry[];
}

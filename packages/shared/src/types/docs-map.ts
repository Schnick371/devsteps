/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * TypeScript types for docs-map.yaml — the BOM manifest for
 * Tiefenstrukturiertes Dokument (TSD) architecture.
 *
 * Schema decisions: SPIKE-036 ADR-S2-06 (position removed — derive at runtime),
 * ADR-S2-07 (level removed — derive from tree depth), ADR-S2-08 (devsteps_items
 * promoted to string[]), ADR-S2-10 (.devsteps/ placement), ADR-S2-12 (ARCH-NNN
 * is manifest-only key, never a DevSteps ItemType).
 */

/**
 * A single node in the BOM manifest tree.
 *
 * - `id`        Stable ARCH-NNN identifier. Never registered in generateItemId().
 * - `doc_id`    DOC-NNN item that contains this section (optional for roots that
 *               span multiple files or future composite docs).
 * - `title`     Section heading text (mirrors H1–H4 in the TSD file).
 * - `devsteps_items` DevSteps work-item IDs traceable to this section (any type).
 * - `children`  Nested subsections. Depth in this tree drives the TSD level number.
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
  /** Section heading text. */
  title: string;
  /** DevSteps work-item IDs documented by or traceable to this section. */
  devsteps_items: string[];
  /** Nested subsections. */
  children: DocsMapNode[];
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
 * Top-level docs-map.yaml document structure.
 * The `nodes` array is the ordered list of root BOM entries.
 */
export interface DocsMapDocument {
  /** Schema version for future migration guards. */
  version: string;
  /** BOM manifest nodes (root level — children are nested). */
  nodes: DocsMapNode[];
}

/**
 * Flat position shadow entry written to .devsteps/index/docs-map-positions.json.
 * Enables O(1) cross-reference queries without full YAML parse on every request.
 */
export interface DocsMapPositionEntry {
  /** ARCH-NNN BOM position code. */
  id: string;
  /** DOC-NNN work-item that owns this section. */
  doc_id?: string;
  /** Section heading text. */
  title: string;
  /** DevSteps work-item IDs for this section. */
  devsteps_items: string[];
  /**
   * Dot-notation structural position, e.g. "1.2.3".
   * Derived from tree traversal — NOT stored in docs-map.yaml.
   */
  position: string;
  /** Zero-based depth in the YAML tree (root = 0). */
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

# ADR-007 — docs-map Format: JSON Adjacency List

**Status:** Accepted  
**Date:** 2026-04-03  
**Supersedes:** None  
**Relates to:** STORY-221, TASK-377, TASK-378, STORY-222, STORY-223

---

## Context

STORY-221 implemented the `docs-map` module using **YAML nested tree** format (`docs-map.yaml`, `children: DocsMapNode[]`). In parallel, the `compose4tc` project independently evaluated the same TSD/BOM-manifest concept and reached different architectural conclusions, documented as its own ADR-007.

This document synthesises both lines of research to produce a definitive format decision for devsteps.

---

## Problem Statement

The current `docs-map.yaml` implementation has three correctness issues:

1. **Format mismatch**: Every other file in `.devsteps/` (index, cbp, items) uses JSON. `docs-map.yaml` is the sole YAML outlier — adding a parser dependency without justification.
2. **Structure deficiency**: Nested `children: DocsMapNode[]` requires recursive function traversal; every restructuring operation risks parent-ID cascades; it is incompatible with lazy VS Code TreeView loading.
3. **Missing ordering field**: No `order` field means insertion order is ambiguous and reordering is expensive.

Additionally, `analyst-archaeology` identified a **spec-implementation conflict** in TASK-377: the task spec describes `parent_arch_id: string | null` in the shadow format, but STORY-221 implemented `position: string` (dot-notation). The migration resolves this.

---

## Research Evidence (18 sources, Ring 1 DEEP profile)

### R1 — JSON vs YAML for machine-readable manifests

| Signal | Source | Date |
|--------|--------|------|
| JSON parses 5–10× faster than YAML | multi-source | established |
| YAML 1.3 spec last updated | yaml.io/spec/1.3.0 | **2022-02-06** (frozen) |
| W3C YAML-LD 1.0 progresses away from plain manifests | w3.org/TR/yaml-ld-10 | 2026-03-05 |
| `biome.json`, `tsconfig.json`, `package.json`, `launch.json`, `tasks.json` — VS Code ecosystem uniform | biomejs.dev, code.visualstudio.com | live |
| "Package manifests and lock files are all JSON" | dev.to | 2026-03-20 |

**Conclusion**: For machine-indexed structured manifests, JSON is the unambiguous standard. YAML is appropriate only for human-authored CI/CD pipelines (GitHub Actions `.yml`).

### R2 — Nested tree vs Adjacency list for VS Code TreeView

VS Code open bug **#235890** (filed 2024-12-12, **still open as of 2026-04-03**, assigned `@joaomoreno`):

> *"TreeView has some serious performance problems at high nesting levels. Performance is exaggerated by StickyScroll."*

| Storage Approach | VS Code TreeWidget risk |
|-----------------|------------------------|
| Nested JSON tree → `getChildren` recurses into `children[]` | **HIGH** — loads full tree depth at parse time |
| Adjacency list → `getChildren(parent)` filters `nodes.filter(n => n.parent_id === parent.id)` | **NONE** — only visible nodes loaded on expansion |

The VS Code `TreeDataProvider` API is lazy-by-design. Adjacency list storage is the correct backing data model.

### R3 — `devsteps_items: string[]` vs `devsteps_item: string`

The `compose4tc` schema defined `devsteps_item: string` (singular, 1:1 mapping). This is incorrect because:

- One documentation node can be produced by **multiple work items** (e.g., an architecture section governed by both a STORY and a SPIKE)
- DevSteps already models all item relationships as plural arrays throughout: `linked_items.implements: string[]`, `item_ids: string[]`

W3C JSON-LD Best Practices (2026-03-13) and Liquid Technologies JSON Best Practices (2025-06) both state: *"use plural nouns for array-valued properties."*

**Our `devsteps_items: string[]` is correct. The compose4tc singular field should not be adopted.**

---

## Decision

**Adopt the JSON adjacency list format** with a merged schema that takes the best elements from both lines of research.

### What we adopt from compose4tc

- `parent_id: string | null` — enables adjacency list, reorganization without ID cascades
- `order: number` — gap numbering (10, 20, 30) for insertion without renaming
- `description?: string` — optional human note
- JSON format (`docs-map.json` instead of `docs-map.yaml`)
- `docs-map.schema.json` for JSON Schema validation and VS Code IntelliSense

### What we keep from devsteps

- `devsteps_items: string[]` (plural array, N:M relationship — NOT compose4tc's singular string)
- `doc_id?: string` (optional — root cluster nodes span multiple files)
- `tsd_heading_depth_max?: number` (depth hint for TSD section generation)
- `default_depth?: 1 | 2 | 3 | 4` (depth hint for TSD generation)

### What we remove

- `children: DocsMapNode[]` — replaced by `parent_id`
- `yaml` npm dependency from `packages/shared/package.json`

---

## Final Schema

### TypeScript Interface

```typescript
// packages/shared/src/types/docs-map.ts

export interface DocsMapNode {
  id: string;                      // Pattern: ARCH-NNN enforced via JSON Schema
  doc_id?: string;                 // Optional — root cluster nodes may span files
  parent_id: string | null;        // Adjacency list — null for root nodes
  order: number;                   // Gap numbering: 10, 20, 30 (insert at 15 without rename)
  title: string;
  description?: string;            // Optional human note for context
  devsteps_items: string[];        // N:M — can be governed by multiple work items
  tsd_heading_depth_max?: number;  // Max heading depth for TSD section generation
  default_depth?: 1 | 2 | 3 | 4;  // Default rendering depth
}

export interface DocsMapDocument {
  version: string;
  nodes: DocsMapNode[]; // FLAT adjacency list — NOT nested tree
}
```

### JSON Schema (`docs-map.schema.json`)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://devsteps/schemas/docs-map.schema.json",
  "title": "DocsMap",
  "description": "BOM manifest for documentation structure",
  "type": "object",
  "required": ["version", "nodes"],
  "additionalProperties": false,
  "properties": {
    "version": { "type": "string" },
    "nodes": {
      "type": "array",
      "items": { "$ref": "#/$defs/DocsMapNode" }
    }
  },
  "$defs": {
    "DocsMapNode": {
      "type": "object",
      "required": ["id", "parent_id", "order", "title", "devsteps_items"],
      "additionalProperties": false,
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^ARCH-[A-Z0-9]+(-[A-Z0-9]+)*$",
          "description": "Unique architecture node ID (e.g. ARCH-001, ARCH-001-P1)"
        },
        "doc_id": {
          "type": "string",
          "pattern": "^DOC-[0-9]+$",
          "description": "Optional reference to the DOC item that owns this section"
        },
        "parent_id": {
          "oneOf": [
            { "type": "string", "pattern": "^ARCH-[A-Z0-9]+(-[A-Z0-9]+)*$" },
            { "type": "null" }
          ],
          "description": "Parent node ID, or null for root nodes"
        },
        "order": {
          "type": "number",
          "minimum": 0,
          "description": "Sort order (gap numbering: 10, 20, 30 — insert at 15 without rename)"
        },
        "title": { "type": "string" },
        "description": {
          "type": "string",
          "description": "Optional human note"
        },
        "devsteps_items": {
          "type": "array",
          "items": {
            "type": "string",
            "pattern": "^(STORY|TASK|BUG|EPIC|SPIKE|FEATURE|DOC|REQUIREMENT)-[0-9]+$"
          },
          "default": [],
          "description": "DevSteps work items that produced or govern this node (N:M)"
        },
        "tsd_heading_depth_max": {
          "type": "number",
          "minimum": 1,
          "maximum": 6
        },
        "default_depth": {
          "type": "number",
          "enum": [1, 2, 3, 4]
        }
      }
    }
  }
}
```

### Example `docs-map.json`

```json
{
  "$schema": ".devsteps/docs-map.schema.json",
  "version": "1.0",
  "nodes": [
    {
      "id": "ARCH-001",
      "parent_id": null,
      "order": 10,
      "title": "Architecture Overview",
      "description": "Root cluster for all architecture documentation",
      "devsteps_items": ["EPIC-001"],
      "default_depth": 2
    },
    {
      "id": "ARCH-001-P1",
      "parent_id": "ARCH-001",
      "order": 10,
      "title": "Platform Architecture",
      "devsteps_items": ["STORY-361", "SPIKE-037"]
    },
    {
      "id": "ARCH-001-P2",
      "parent_id": "ARCH-001",
      "order": 20,
      "title": "Layered Architecture",
      "devsteps_items": ["STORY-362"]
    }
  ]
}
```

---

## Migration Scope

**Impact area:** `packages/shared` only. Zero changes in `packages/extension`, `packages/cli`, `packages/mcp-server`.

| File | Change |
|------|--------|
| `packages/shared/src/types/docs-map.ts` | Remove `children`, add `parent_id`, `order`, `description?` |
| `packages/shared/src/core/docs-map.ts` | Replace YAML parse/stringify with `JSON.parse`/`JSON.stringify`; rewrite `_flattenNodes` (recursion → flat sort); rewrite `_findNode` (DFS → `Array.find`); rename constant `DOCS_MAP_PATH`; remove `yaml` import |
| `packages/shared/package.json` | Remove `"yaml": "^2.7.0"` dependency |
| `.devsteps/docs-map.schema.json` | **New file** — JSON Schema for validation |
| STORY-222 description | Fix `DocsMapRoot` → `DocsMapDocument`; remove "reads docs-map.yaml" |
| STORY-223 description | Remove "reads docs-map.yaml" language |
| TASK-377 description | Reconcile `parent_arch_id` (spec) vs `position` (impl) — migration makes `parent_id` the source of truth |

**Estimated code change: ~89 lines of logic in 2 files.**

**Production data migration cost: ZERO** — `.devsteps/docs-map.yaml` does not exist in any production installation.

---

## TASK-377 Spec-Implementation Conflict Resolution

Original TASK-377 specified shadow format with `parent_arch_id: string | null`. STORY-221 implemented `position: string` (dot-notation like `"1.2.3"`).

After migration to adjacency list:
- `DocsMapNode.parent_id` becomes the canonical relationship field
- The positions shadow (`docs-map-positions.json`) can include either `position` (generated from order-based traversal) or `parent_arch_id` (direct copy of `parent_id`)
- Recommend: keep `position` for human readability + add `parent_arch_id` as alias — both derivable from flat list

This resolves the conflict by making both representations available.

---

## Alternatives Considered

| Alternative | Verdict | Reason |
|------------|---------|--------|
| YAML nested tree (status quo) | ❌ Rejected | YAML 1.3 frozen; only non-JSON manifest in `.devsteps/`; TreeWidget nesting bug risk; recursive `_flattenNodes` harder to maintain |
| JSONC (JSON with comments) | ❌ Rejected | Requires `jsonc-parser` shim; no native `JSON.parse` support; `description` field serves the same purpose as comments |
| TOML | ❌ Rejected | No VS Code extension precedent; additional parser dependency |
| Nested JSON tree (keep structure, just change format) | ❌ Rejected | Does not fix recursive traversal or TreeWidget nesting risk |
| Protocol Buffer / binary formats | ❌ Out of scope | Not human-editable; docs-map must be version-controlled and diff-readable |

---

## Consequences

**Positive:**
- Consistent format with all other `.devsteps/` files
- Eliminates `yaml` npm dependency from `packages/shared`
- VS Code IntelliSense via `$schema` pointer
- TreeView rendering safe from nesting-freeze bug
- Simpler reordering (change `order` value, no tree restructuring)
- `appendDocsMapNode` becomes a flat array push (no DFS recursion needed)

**Negative:**
- `DocsMapDocument.nodes` is now a flat array — reading the tree structure requires building it from `parent_id` links (one-time O(n) traversal)
- STORY-221 implementation is superseded — rework required before TASK-377 and TASK-378 can be implemented correctly

**Neutral:**
- `DocsMapPositionsIndex` shadow format change: `position` string remains valid (derivable from flat sort); `parent_arch_id` can be added as alias

---

## References

- compose4tc ADR-007 (independent parallel research, 2026-04)
- analyst-research report: `tmp/analyst-research-docs-map-format-session1.md`
- analyst-archaeology mandate: SPIKE-039-session2 (confidence 0.97)
- VS Code TreeWidget bug: github.com/microsoft/vscode/issues/235890
- JSON Best Practices (Liquid Technologies, 2025-06)
- W3C JSON-LD Best Practices (2026-03-13)

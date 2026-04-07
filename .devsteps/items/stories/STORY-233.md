## Goal

Implement ADR-007: migrate docs-map.yaml (YAML nested tree) to docs-map.json (JSON adjacency list) before TASK-377 and TASK-378.

## Why Now

- YAML 1.3 frozen since 2022; JSON is the uniform VS Code ecosystem standard; every other .devsteps/ file uses JSON
- VS Code TreeWidget open bug #235890: nested trees freeze at deep hierarchy; adjacency list + lazy getChildren() is safe by design
- .devsteps/docs-map.yaml does not exist in production — zero content migration cost

## Schema Changes (DocsMapNode)

REMOVE: children: DocsMapNode[]
ADD: parent_id: string | null
ADD: order: number (gap numbering 10/20/30)
ADD: description?: string
KEEP: devsteps_items: string[], doc_id?, tsd_heading_depth_max?, default_depth?

DocsMapDocument.nodes becomes a FLAT adjacency list (not nested tree).

## Files

- packages/shared/src/types/docs-map.ts — update interfaces
- packages/shared/src/core/docs-map.ts — JSON.parse/stringify; rewrite _flattenNodes (flat sort) and _findNode (Array.find); rename DOCS_MAP_PATH constant; remove yaml import
- packages/shared/package.json — remove yaml dependency

## Acceptance Criteria

- docs-map.json format (not .yaml)
- DocsMapNode has parent_id, order, description?; no children
- All 4 exports (readDocsMap, writeDocsMap, appendDocsMapNode, rebuildDocsMapShadow) work with flat list
- yaml import and yaml dep removed
- Unit tests added (zero coverage currently)
- npm run build && npm test passes

## Must Complete Before

TASK-377 (positions shadow revision), TASK-378 (DocIndex.ts)

## References

docs/architecture/adr-007-docs-map-format.md## Completion (2026-04-03)

Implemented and merged via commit c67d163 (story/STORY-233 → main).

Changes delivered:
- packages/shared/src/types/docs-map.ts: DocsMapNode now has parent_id + order + description? (no children)
- packages/shared/src/core/docs-map.ts: JSON.parse/stringify; flat adjacency-list traversal; yaml import removed
- packages/shared/package.json: yaml dep removed
- packages/shared/src/core/docs-map.test.ts: 12 unit tests (all passing)
- .devsteps/docs-map.schema.json: JSON Schema for validation + VS Code IntelliSense
- docs/architecture/adr-007-docs-map-format.md: 18-source research ADR

Build: npm run build ✅ | Tests: 456/456 passed ✅
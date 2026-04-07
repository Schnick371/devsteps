Phase A+ foundation module. Add yaml npm package to packages/shared/package.json. Create packages/shared/src/types/docs-map.ts with DocsMapNode, DocsMapDocument, DocsMapRoot TypeScript types using the FINAL schema: { id: ARCH-NNN, doc_id, title, devsteps_items: string[], children: DocsMapNode[], tsd_heading_depth_max?: number, default_depth?: number }. Create packages/shared/src/core/docs-map.ts with: readDocsMap(devstepsDir), writeDocsMap(devstepsDir, tree) (atomic tmp→rename, dual-writes JSON shadow), appendDocsMapNode(devstepsDir, parentId, node), rebuildDocsMapShadow(devstepsDir). The JSON shadow path: .devsteps/index/docs-map-positions.json (flat array for O(1) cross-ref queries). Export from packages/shared/src/index.ts. Phase A+ (unblocks all downstream implementation).

## Completion (Phase A+ BOM Foundation)

Implemented full docs-map.ts module with yaml ^2.7.0 dependency:

**Types** (`packages/shared/src/types/docs-map.ts`):
- `DocsMapNode`: id (ARCH-NNN), doc_id?, title, devsteps_items[], children, tsd_heading_depth_max?, default_depth?
- `DocsMapDocument`: version, nodes[]
- `DocsMapPositionEntry`: flat entry with derived position (dot-notation) and depth
- `DocsMapPositionsIndex`: updated timestamp + entries[]

**API** (`packages/shared/src/core/docs-map.ts`):
- `readDocsMap(devstepsDir)` — reads docs-map.yaml; returns empty doc if absent
- `writeDocsMap(devstepsDir, doc)` — atomic dual-write YAML + JSON shadow (.tmp → rename)
- `appendDocsMapNode(devstepsDir, parentId|null, node)` — DFS insert + dual-write
- `rebuildDocsMapShadow(devstepsDir)` — rebuild positions index from YAML

ADR-S2-06/07: position+level removed (derived at runtime). ADR-S2-11: atomic writes.
All 444 tests passing. Smoke tested all 4 API functions. pnpm-lock.yaml removed from tracking + added to .gitignore.
Add the doc ItemType to DevSteps with bidirectional work-item linking.

## Scope
- Add 'doc' to ItemType Zod enum in packages/shared/src/schemas/index.ts
- Add 'canonical-for', 'derived-from', 'documented-by', 'documents' to FLEXIBLE_RELATIONSHIPS (supersedes/superseded-by already exist)
- Update INVERSE_RELATIONS in link.ts
- Update LinkedItems Zod object + defaults
- Update all 27 coordinated locations across shared/mcp-server/extension
- Add Documentation root group to VS Code TreeView
- Directory: .devsteps/items/docs/ | Index: by-type/docs.json
- DOC items are orthogonal to Epic hierarchy (top-level, like Epic)

## Hard Stops (must ALL be done atomically)
- HS-1: ID regex in schemas/index.ts + index-refs.schema.ts must accept DOC-\\d{3,}
- HS-3: INVERSE_RELATIONS Record<RelationType, RelationType> compile-fails if incomplete
- HS-4: LinkedItems Zod must list all 4 new relation keys

See SPIKE-036 for full 27-location ripple map.

---
## Addition (Round 1 Insight Harvest)

Added: `detail_level` frontmatter field as part of Phase 1 scope.

A new optional field `detail_level: 1 | 2 | 3 | "full"` in DOC item frontmatter specifies the default depth at which the Depth View should open this document. Example: a reference document optimized for scanning would set `detail_level: 1` (headings only). A runbook would set `detail_level: "full"`. This is a presentation layer hint, NOT a Diataxis classification (ADR-006 retirement reason).

Schema proposal: `detail_level?: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal("full")]).optional()` — stored as a root ItemMetadata field alongside `bom_position`.

---
## Completion (Sprint 2026-04-02)

All 27 coordinated locations updated across shared/mcp-server/extension. Hard stops HS-1 (ID regex), HS-3 (INVERSE_RELATIONS), HS-4 (LinkedItems Zod) all satisfied. 444 tests passing. Merged branch story/STORY-219 → main. NOTE: detail_level field NOT added per sprint binding decision (moved to docs-map.yaml Phase A schema as default_depth).
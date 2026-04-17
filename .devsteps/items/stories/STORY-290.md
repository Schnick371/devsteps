## Context
The CCMS Phase 2 (BOM Rollup / Skeleton) needs a first-class "component" or "Baugruppe" field
to group doc fragments by product component (e.g., "Bremssystem_Vorn", "Hydraulik").

This enables queries like: `listItems({type:'doc', component:'Bremssystem', diataxis_type:'how-to'})`

## Schema changes
- Add `component?: string` to `ItemMetadata` Zod schema (optional, nullable)
- Add `component?: string` to `DocsMapNode` TypeScript interface
- Normalize to lowercase-kebab at write time (in `add.ts` and `update.ts`)

## Index
- Add `by-component/` subdirectory index (consistent with `by-type/*.json` pattern)
- Per-component file: `.devsteps/index/by-component/<component-slug>.json` → `{ item_ids: string[] }`
- Extend `rebuildIndex()` in `index-rebuild.ts` to populate `by-component/` (MANDATORY — A1 constraint)
- No migration scripts needed (ItemMetadata cast is non-strict)

## MCP/CLI exposure
- `mcp_devsteps_list` accepts `filter.component: string`
- `devsteps list --component hydraulik` CLI filter

## Acceptance Criteria
- [ ] `ItemMetadata` schema includes `component?: string` (optional, Zod `.optional()`)
- [ ] `rebuildIndex()` populates `by-component/` subdirectory
- [ ] `mcp_devsteps_list` and `mcp_devsteps_add` support `component` field
- [ ] lowercase-kebab normalization enforced at write time
- [ ] `devsteps list --component <slug>` works
- [ ] Unit tests: add item with component, list by component, rebuildIndex

## Depends on
Best run AFTER STORY-284 (same schema extension pattern). Can technically run in parallel.
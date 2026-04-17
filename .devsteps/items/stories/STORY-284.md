Add `diataxis_type?: DiataxisType` as a first-class optional field to ItemMetadata Zod
schema. Create `index/by-diataxis.json` index file (CategoryIndex pattern, same as
by-status.json and by-type.json). Wire into the index rebuild and addItem/updateItem paths.

## Problem
DiataxisType is computed in 3 places (heuristicClassify, tags, YAML frontmatter) but
stored as a first-class typed field in NONE of them. This blocks all Knowledge-OS
structured retrieval features.

## Acceptance Criteria
- ItemMetadata.diataxis_type?: DiataxisType added to Zod schema (additive, backward-compat)
- DiataxisType exported from packages/shared/src/schemas/index.ts
- index/by-diataxis.json created by initializeRefsStyleIndex() (mirrors by-status.json pattern)
- index-refs-core: loadIndexByDiataxis(devstepsDir, type) → string[] added
- add.ts: if type=doc and description provided, run heuristicClassify() and set diataxis_type
- update.ts: same on description update
- rebuildIndex: populates by-diataxis.json from existing items
- listItems: accepts optional diataxis_type filter parameter

## Files
- packages/shared/src/schemas/index.ts
- packages/shared/src/core/index-refs-core.ts
- packages/shared/src/core/add.ts
- packages/shared/src/core/update.ts
- packages/shared/src/core/list.ts
- packages/shared/src/core/index-rebuild.ts

## Estimated effort: 2-3 days
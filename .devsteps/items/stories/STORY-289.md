When a Reference atom (DOC item with diataxis_type='reference') is updated, the
system should identify all items that transclude it (via {{ref:ITEM-ID}}) and mark
them as potentially stale.

## Propagation Rule
- update.ts: if type=doc and description changed (hash δ)
- Find all DOC items whose description contains {{ref:THIS-ID}}
- Add tag 'doc-transclusion-stale' to those consumers OR emit MCP notification
- Tool: devsteps_find_transclusion_consumers(item_id) → [{id, title}]

## Why Not a Full Scan
A reverse transclusion index (built at addItem time) is needed for O(1) lookup.
Without it, full scan over ~1000 items is acceptable initial implementation.

## Acceptance Criteria
- update.ts: post-write staleness check for doc items
- New function: findTransclusionConsumers(devstepsDir, itemId) → string[]
- Simple grep-style scan (regex {{ref:ITEM-ID}} in description files)
- Unit tests for propagation logic

## Estimated effort: 1-2 days## Dual-index change propagation

Two membership paths must both be tracked:

Path 1 (transclusion): {{ref:DOC-X}} in description → already in scope via grep scan
Path 2 (BOM manifest): DOC-X appears in rollup item_ids list in docs-map.json

BOM membership index design (constraints-validated):
- Use per-rollup files: `.devsteps/index/rollup-membership/<rollup-id>.json`
- Each rollup writes only its own membership file → no concurrent-write TOCTOU race
- Reverse lookup: scan `index/rollup-membership/` directory for files containing DOC-X
- Trigger: `generate_rollup_manifest` writes membership file; `update` on DOC-X reads all membership files to determine staleness

AC: given DOC-X is updated, the system returns a list of rollup-manifest IDs that include DOC-X (directly or via transclusion).
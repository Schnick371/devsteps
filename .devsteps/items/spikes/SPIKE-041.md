Research the full implications of storing DOC items in `.devsteps/items/docs/` with complete index coverage (by-type, by-status, full-text search). Key questions: (1) What metadata schema should DOC items carry to support section navigation, path references, and anchor lookups? (2) Can the DevSteps item API replace or simplify the separate docs-map.yaml + docs-map-positions.json architecture? (3) Does having DOC items in the index enable CodeLensProvider (STORY-229) and HoverProvider (STORY-230) to query items directly instead of a separate DocIndex.ts? (4) Can the index serve as the unified backbone for research file preservation (preserving tmp/ analyst reports as permanent DOC items)? (5) How does granularity work — one DOC item per file vs one DOC item per section?

## Gate Result (Ring 5)
**Verdict:** PASS — Confidence: 0.92

Research complete. Brief: `tmp/SPIKE-041-DOCIndex-Research-Brief.md`

**Key findings:**
- 7 defects in existing `doc` ItemType infrastructure (DEFECT-3 critical crash path: `INDEX_FILENAMES.TYPE` missing `doc: 'docs.json'`)
- Granularity decision: file-level DOC items + `metadata.arch_node_id` bridge
- `keywords?: string[]` is critical for search quality; `line_number` explicitly rejected
- TASK-378 simplified: `loadItemsByType('doc').filter(affected_paths)` — TASK-377 dependency removed
- `complete-cleanup.sh` risk: 28+ tmp files at risk
- 7 work items created from this research
## Research Question

Should DevSteps gain a native `doc` ItemType with bidirectional documentation↔work-item linking, a VS Code "Depth View" (previously called "Lupe") for progressive heading-level disclosure, and a BOM-style Doc Map for hierarchical document navigation?

## Verdict: YES — 3-phase implementation

Full research brief: `tmp/SPIKE-034-DOC-ItemType-Research-Brief.md`

## Architecture Summary (3 phases)

**Phase 1 — DOC item type (MVP):**
- Add `doc` to ItemType Zod enum
- Add `canonical-for`, `derived-from`, `documented-by`, `documents` to FLEXIBLE_RELATIONSHIPS
- 27 coordinated source changes across 3 packages
- DOC items are top-level (orthogonal to Epic hierarchy), ID prefix: DOC-NNN

**Phase 2 — Depth View (VS Code "Lupe"):**
- `TextDocumentContentProvider` with scheme `devsteps-lens:`
- `filterMarkdownByDepth(markdown, maxDepth)` pure function
- Level 1 = H1+body. Level N = H1..HN+body. Progressive Disclosure UX pattern.
- Named "Depth View" in VS Code UI, "Doc-Lens" / `devsteps.lens.*` in CLI/MCP

**Phase 3 — Doc Map / BOM positions:**
- `bom_position?: string` root field on ItemMetadata (regex `^\\d+(\\.\\d+)*$`)
- `docs/manifest.yaml` — SSOT hierarchy tree (DITA Maps–inspired)
- Enables "chapter relocation" when code is refactored

## Key Standards References
- **DITA Maps:** permanent @id (DOC-NNN) + mutable map position (bom_position) — the applicable model
- **Progressive Disclosure** (Shneiderman): canonical UX name for Depth View
- S1000D / IEC 61355: too heavyweight; principles extracted, toolchain rejected

## Hard Stops Before Phase 1
1. **HS-1:** ID regex in schemas/index.ts + index-refs.schema.ts must accept DOC prefix (2 files, atomic)
2. **HS-2:** cbp-mandate.ts:72 + analysis.ts:94 regex blocks DOC prefix (SILENT blocker — separate BUG item)
3. **HS-3:** INVERSE_RELATIONS in link.ts must include all new relation pairs (TypeScript compile-fail guard)
4. **HS-4:** LinkedItems Zod objects must list all 4 new relation keys

## Confirmed Design Decisions
- `supersedes`/`superseded-by` already exist — only `canonical-for`+`derived-from` are new
- No TreeView slider API in VS Code — use depth-aware TreeDataProvider.getChildren()
- ADR-002 (config-only approach) is SUPERSEDED — Zod enum must change in source
- ADR-006 (zoom levels = Diataxis types) is RETIRED — use `detail_level` field instead
- Naming: "Depth View" (VS Code UI), "Doc-Lens" (CLI/MCP), "Lupe" acceptable as team shorthand

## Session 2 Findings (TSD + BOM Manifest)

Full Session 2 research brief: `tmp/SPIKE-036-TSD-BOM-Research-Brief.md` (gate PASS, confidence 0.97)

**Key Session 2 revisions to Session 1:**
- VS Code approach revised: `contributes.markdown.previewScripts` (NOT TextDocumentContentProvider)
- `mcp_devsteps_doc_embed` eliminated: extend `mcp_devsteps_get` with `output_format` param instead
- Naming: `default_depth` confirmed (not `detail_level`); manifest filename: `docs-map.yaml`

**New items created (BUG-073, TASK-375–377, STORY-221–228, SPIKE-038):**
- BUG-073: safeJsonStringify security fix (urgent-important, Phase B pre-req)
- STORY-221: docs-map.ts module + yaml dep (Phase A+ foundation)
- STORY-222–223: mcp_devsteps_docs_map_write + doc_depth_query tools
- STORY-224: output_format on mcp_devsteps_get
- STORY-225–227: FSW cache, embedPlugin, depthSlider (Phase C)
- TASK-376: breadcrumb injection (correctness, not UX)
- STORY-228: canonical-for RelationType (may overlap STORY-219)
- SPIKE-038: VS Code previewScript message routing research (Phase C gate)
- STORY-221 supersedes SPIKE-037
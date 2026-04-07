## Research Mandate

Deep architectural research spike for a production-quality Documentation BOM (Bill of Materials) system using DIATAXIS framework.

## Fixed Architectural Constraints
1. DIATAXIS (Tutorial / How-to / Reference / Explanation) as content classification layer
2. BOM = master structure file composing a large documentation corpus from many small documents, L0 (system overview) → Ln (function-level), each node carries Diataxis type as attribute
3. Host system is JSON-native

## Research Scope
- PHASE 1: BOM node JSON schema design (identity, diataxis, file refs, lifecycle, versioning, relationships, cross-refs, AI metadata)
- PHASE 2: JSON vs YAML vs alternatives (TOML, JSON5, JSON-LD) for BOM master structure
- PHASE 3: Node lifecycle and versioning (state machine, dependency propagation, BOM versioning strategy)
- PHASE 4: AI agent integration (context payloads per task type, write protocol, prompt invariants, conflict resolution)
- PHASE 5: Failure modes and production hardening (top 5 risks, dangerous minor details, validation suite design)## Gate Result — PASS (0.91)

Ring 5 gate-reviewer passed all PASS conditions. Brief: `docs/research/SPIKE-045/SPIKE-045-DocBOM-Architecture-Brief.md`

**5 Critical Missing Fields Identified:**
1. `file_path` — THE dangerous implementation detail; two-hop navigation lookup baked in forever
2. `status: BomNodeStatus` — lifecycle management entirely absent today
3. `doc_subtype` → REQUIRED (not optional) — classification rot prevention
4. `created_at` / `updated_at` — per-node timestamps for staleness detection
5. `edges?: BomEdge[]` — graph-over-tree cross-reference representation

**Hard Calls Made:**
- JSON ADOPT (confidence 0.92) — reversal condition: 70%+ human-authored volume
- Level cap: L0–L3 (4 levels) — AI context + human behavior driven
- Single file correct to ~2000 nodes
- `doc_subtype` REQUIRED → not optional

**16-rule validation suite designed.** 13 `docs` work items created as next actions.

**Gate minor fixes applied:** Rule 16 added (`no-approved-under-stale-parent`), depth cap aligned to ERROR, .tmp cleanup 60s threshold, post-migration classification scan TASK added.
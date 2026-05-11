# Diataxis BOM/Handbook Capabilities — close gaps surfaced by external sprint post-mortem

## Problem

An external Diataxis documentation sprint in a DevSteps-managed project produced 12 flat DOC items totalling approximately 1100 lines of content. The intended output was a single assembled, hierarchical handbook with H2-level sub-chapters per Diataxis quadrant (Tutorial, How-to, Reference, Explanation). Instead the sprint produced a flat doc-set: twelve independent H1 fragments with no parent–child relationships, no BOM hierarchy, and no assembled output file.

A post-mortem review of the sprint identified five root causes and seven MCP tooling gaps that collectively made the correct outcome impossible without significant improvisation.

## Root Causes (A–E — verbatim from post-mortem)

**(A)** Pre-sprint clarification missed handbook-vs-doc-set intent. coord-sprint asked "what documentation do you need?" but never asked the key structural question: "Single assembled handbook (one output file) or independent doc-set (N separate files)?" Without that question being mandatory, the planner defaulted to doc-set.

**(B)** The planner chose 1-DOC=1-H1 (flat list) instead of 1-DOC=1-H2-under-quadrant-root (hierarchical). In the flat model each DOC item is a standalone document. In the handbook model each DOC item is a sub-chapter beneath a quadrant root (Tutorial/, How-to/, Reference/, Explanation/), which itself sits under a handbook root (ARCH-NNN). The distinction was never surfaced to the planner.

**(C)** No L0/L1/L2 BOM tree was built before authoring began. `bom_commit` received a flat list of files with `parent_id: null` for every node (hardcoded in `devsteps_docs_bom_commit.ts` lines 163 and 198). Without a pre-declared outline, the BOM was structurally equivalent to a flat file directory — no quadrant roots, no chapters, no sub-chapters.

**(D)** `docs_assemble` was never called. The sprint ended at `bom_commit`. The tool to render the assembled handbook from the BOM tree does not exist in the codebase (confirmed: zero references to `assemble` anywhere in `packages/`). There was nothing to call.

**(E)** The gate-reviewer checked per-DOC word count (≥100 words) but never checked: Is there an assembled handbook file? Are sub-chapters present and correctly nested? Is the total scope handbook-sized (e.g. ≥5000 assembled words)? The per-DOC checks all PASSed against stub descriptions, producing a false PASS at gate.

## MCP Tool Gaps (1–7)

**(1) `docs_assemble` is missing entirely.** Confirmed: zero references to `assemble` anywhere in `packages/`. The tool that traverses the BOM tree depth-first, normalizes heading levels (offset = bom_level − 1, hard-cap H6), and writes the assembled markdown to an output path does not exist. Without it, the BOM is a metadata structure with no renderable output.

**(2) `docs_bom_commit` accepts only flat file lists.** The `parent_id` field is hardcoded to `null` at lines 163 and 198 of `packages/mcp-server/src/handlers/devsteps_docs_bom_commit.ts`. There is no way to express a L0 handbook root, L1 quadrant nodes, or L2 chapter nodes. Any commit produces a flat tree regardless of intent.

**(3) No `docs_bom_outline` / `docs_handbook_plan` tool exists.** There is no tool that accepts a target outline (root node + quadrant roots + chapter slots + sub-chapter slots) and pre-creates a BOM skeleton with placeholder slots that authors then fill via subsequent `bom_commit` calls scoped to a slot. Without this, the outline is implicit in the planner's head, never enforced, and lost if the planner changes.

**(4) No `docs_bom_validate_completeness` tool exists.** There is no tool that checks: does the root have ≥N children? Are all sub-chapter slots filled? Is heading depth consistent and ≤6? Are there orphan DOC items not attached to any BOM node? This validation is currently impossible to automate.

**(5) No `docs_metrics` tool exists.** There is no tool that returns assembled word count, chapter count, max heading depth, empty slot count, or per-quadrant word distribution. The gate-reviewer cannot enforce threshold-based criteria without these numbers.

**(6) `docs_classify` is per-file, not per-set.** The classifier operates on individual files and returns a Diataxis type for each. It has no concept of "Is this DOC set as a whole a coherent handbook covering all four quadrants at sufficient depth?" — a set-level coherence check that would have caught the flat-list outcome.

**(7) No `docs_bom_add_node(parent_id, title, level, doc_id?)` tool exists.** Incremental tree-building during authoring is not supported. exec-doc workers have no mechanism to add a sub-chapter to a specific quadrant root without re-committing the entire BOM from scratch.

## Content-Persistence Bug

The `docs_import + bom_commit` pipeline left DOC item `description` fields as one-line stubs (e.g. `"Imported from {path}."`). Full markdown content remained only in staging files. When the gate-reviewer executed its word-count check (≥100 words per DOC), it checked the description field — which contained a stub — and produced a false PASS. DevSteps was not the authoritative source of truth for content; the staging directory was.

## Agent and Prompt Gaps

coord-sprint and exec-doc must distinguish "handbook" vs "doc-set" intent at sprint start. The `output_mode` parameter (`handbook | doc-set`) must be established in the CSPG pre-planning gate and carried through the entire dispatch chain: coord-sprint → exec-planner → exec-doc → gate-reviewer. exec-doc and exec-planner must honour this in their chapter_plan structure (1 ARCH root + N quadrant roots + chapters when handbook; flat list when doc-set).

The `devsteps-40-sprint` prompt and `sdevsteps-diataxis-sprint` skill must be updated to document the handbook workflow including the new tools (`assemble`, `bom_outline`, `bom_validate_completeness`, `docs_metrics`) and the `output_mode` parameter.

The gate-reviewer needs handbook-level criteria: when `output_mode=handbook`, PASS requires that an assembled output file exists at the expected path, that sub-chapter coverage per quadrant meets a threshold, that the total assembled word count meets a handbook-scope threshold (e.g. ≥5000 words), that all BOM slots are filled, and that no heading-depth overflow is present.

## Relationship to EPIC-043

EPIC-043 ("Docs Pipeline — BOM, Assembly & 7-Schritt-Workflow") tracks the original 7-step workflow infrastructure (STORY-253, TASK-506). This EPIC is narrowly focused on the *gaps* confirmed by the post-mortem: new tools that do not exist in `packages/`, a confirmed bug in `bom_commit`, agent/prompt updates, and gate-reviewer criteria. Stories under this EPIC relate-to the relevant items under EPIC-043 where appropriate.

## Acceptance Criteria for EPIC Closure

1. All child stories are in `done` status.
2. A successful end-to-end test sprint produces one assembled handbook from a hierarchical BOM (L0 root + L1 quadrant roots + L2 chapters).
3. The gate-reviewer issues a correct PASS when handbook criteria are met and a correct FAIL when the assembled file is absent or sub-chapter coverage is below threshold.
4. DOC item `description` fields contain full markdown content (not stubs) after `bom_commit`.
5. `docs_bom_validate_completeness` and `docs_metrics` return consistent, actionable output against the assembled handbook.

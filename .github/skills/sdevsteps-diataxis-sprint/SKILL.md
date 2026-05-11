---
name: sdevsteps-diataxis-sprint
description: "Diataxis documentation pipeline — 7-step BOM/assembly workflow for Tutorial/How-to/Reference/Explanation doc items. USE FOR: documentation sprints, doc-gap analysis, BOM tree assembly, Diataxis quadrant authoring, doc pipeline execution. Trigger signals: 'diataxis', 'BOM', 'documentation sprint', 'doc pipeline', 'doc gap', 'assemble docs', 'doc items', EPIC-043."
user-invocable: false
---

# Diataxis Documentation Sprint — Dispatch Protocol

**When to activate:** Sprint scope contains doc-gap items, Diataxis authoring tasks, BOM assembly, or explicit `doc` type items covering Tutorial / How-to / Reference / Explanation quadrants.

---

## Agent Dispatch Chain

| Ring | Agent | Mode | Returns |
|------|-------|------|---------|
| Ring 1 | `devsteps-R1-analyst-diataxis` | Parallel with other analysts | `write_analysis_report` — `chapter_plan` YAML; read via `read_analysis_envelope(report_path)` |
| Ring 4 | `devsteps-R4-exec-doc-diataxis` | Sequential Conductor (after exec-planner) | `write_mandate_result` — doc counts, BOM path, assembly status |

**exec-doc-diataxis internally dispatches (ONE parallel batch):**
- `devsteps-R4-worker-diataxis-author` × 4 (one per Diataxis quadrant — Tutorial, How-to, Reference, Explanation)
- `devsteps-R4-worker-devsteps` (links DOC-items to parent Epic)

**After all authors complete (sequential):**
- `devsteps-R4-worker-diataxis-bom` (builds BOM tree, calls `devsteps_docs_assemble`, commits output)

---

## Triage Override Rules

When the work-type is **documentation sprint**, apply these dispatch overrides:

1. **Ring 1 — add** `analyst-diataxis` parallel with `analyst-context` + `analyst-internal`
2. **Ring 4 — replace** `exec-doc` with `exec-doc-diataxis`
3. **Session Classification** — surface "Documentation Sprint" label for clarity

For mixed sprints (code + docs), run standard code path AND diataxis doc path per item — no merging.

---

## 7-Step Diataxis Workflow

1. **doc-gap scan** — `analyst-diataxis` scans exports, existing DOC-items, README, classifies by quadrant, produces `chapter_plan`
2. **planning** — `exec-planner` reads `chapter_plan` + risk MandateResult, produces ordered authoring steps
3. **author dispatch** — `exec-doc-diataxis` emits 4× `worker-diataxis-author` in ONE parallel batch
4. **link** — `worker-devsteps` links all DOC-items to parent Epic via `documents` relation
5. **BOM tree** — `worker-diataxis-bom` creates ARCH-NNN item with ordered L0–L3 structure
6. **assembly** — `worker-diataxis-bom` calls `devsteps_docs_assemble` (fallback: manual concat)
7. **gate** — `gate-reviewer` validates coverage (≥1 item per quadrant), heading normalization, assembled output

---

## Diataxis Quadrant Rules (for worker-diataxis-author)

| Quadrant | Purpose | Writer imperative |
|----------|---------|-------------------|
| Tutorial | Learning by doing | Lead the reader through a working example |
| How-to | Task-oriented steps | State the goal; number every step |
| Reference | Exhaustive machinery | Describe fact; avoid narrative |
| Explanation | Why / concepts | Discuss; no steps, no commands |

**DOC-item authoring invariants:**
- H1 only (`# Title`) in `description` field — assembler shifts headings via `offset = bom_level − 1`
- ≥100 words per item
- One BOM-Level per DOC-item; H2–H5 sub-headings are prose content, NOT separate items
- `diataxis` frontmatter tag REQUIRED in description YAML block

---

## BOM Heading Normalization

```
assembled_level = author_level + (bom_level − 1)
hard_cap: H6
```

Example: author writes H2 → bom_level=2 → assembled = H2 + 1 = H3.

---

## MCP Tool Availability Check

Before dispatch, `worker-diataxis-bom` MUST check:
- `devsteps_docs_bom_commit` — available? → use for BOM tree commit
- `devsteps_docs_assemble` — available? → use for assembly; fallback = manual concat with heading shift

If tools unavailable: manual concat, commit assembled markdown to `docs/generated/`.

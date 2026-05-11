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

## Handbook Structure Design — Pre-Sprint TOC Guidelines

> Apply these guidelines BEFORE authoring begins. A correct BOM skeleton prevents the flat-list anti-pattern confirmed in EPIC-046 post-mortem (Root Cause C).

### Design Principle: Organize by Functional Area — Not Diataxis Type at L1

**WRONG (flat Diataxis list at L1):**
```
L1: Tutorial
L1: How-to
L1: Reference
L1: Explanation
L1: Architecture
L1: Research
```

**CORRECT (functional areas at L1 — Diataxis as sub-chapters within each area):**
```
L1: Introduction & Overview
L1: Fundamentals
L1: <Feature Area A>  (e.g., Copilot Integration)
  L2: Overview (→ Explanation quadrant)
  L2: How-to guides (→ How-to quadrant)
  L2: Reference (→ Reference quadrant)
  L2: Architecture decisions (→ Architecture extended type, only if relevant)
L1: <Feature Area B>  (e.g., CLI)
  ...
```

Extended types (**Architecture**, **Research**) are sub-chapters within the functional area where they are thematically relevant — NEVER at L1 unless the handbook is exclusively architectural.

### ARCH-NNN Naming Convention

- L0 root: always **ARCH-001**
- L1 areas: **ARCH-0x0** (hundreds step — ARCH-010, ARCH-020, …, ARCH-070)
- L2 chapters: **ARCH-0xN** (ARCH-011, ARCH-012, …)
- L3 sections: **ARCH-0xNa** (letter suffix — ARCH-011a, ARCH-011b, …)
- L4 subsections: **ARCH-0xNa1** (digit suffix — ARCH-011a1, ARCH-011a2, …)
- L5 sub-topics: **ARCH-0xNa1i** (roman numeral — extremely rare; only for deep parameter sub-topics)

### BOM Level → Assembled Heading

| BOM level | Role | Assembled heading |
|---|---|---|
| L0 | Handbook root | H1 |
| L1 | Functional area / major part | H2 |
| L2 | Chapter within area | H3 |
| L3 | Section / specific topic | H4 |
| L4 | Deep reference sub-section | H5 |
| L5 | Very specific sub-topic | H6 (hard cap) |

**Authoring invariant:** Every DOC item ALWAYS begins with `# Title` (H1). The assembler applies `offset = bom_level − 1` at export time.

### Pre-Sprint BOM Skeleton (Step 0)

1. Determine `output_mode`: **handbook** (one assembled file) or **doc-set** (independent fragments)
2. For `handbook`: draft the ARCH-NNN tree on paper / in chat BEFORE calling any `mcp_devsteps_add`
3. Confirm tree structure with the user (show L0–L2 at minimum)
4. Call `mcp_devsteps_add(type=doc)` for each ARCH-NNN node — L0 first, then L1, then L2
5. Only after skeleton is committed → start authoring (Step 3 below)

**Minimum handbook skeleton:**
- 1× L0 root node  
- ≥2 L1 area nodes  
- ≥1 L2 chapter per L1 area  

Without this skeleton, `bom_commit` produces a flat tree regardless of intent.

### DevSteps-Own Handbook Blueprint

For documentation of the DevSteps system itself, use **STORY-297** as the authoritative TOC reference:
- L1 areas: Introduction · Fundamentals · AI/Copilot · VS Code Extension · MCP Tools · CLI · Documentation System
- All 33 existing DOC-items mapped to ARCH-NNN slots — no orphans permitted
- Deep Reference items (L3/L4) required for: tool parameters, schemas, agent dispatch rules, Diataxis quadrant signal tables

---

## 7-Step Diataxis Workflow

> **Step 0 applies to handbook mode only** (one assembled output file). Skip Step 0 for doc-set mode (independent fragments).

**Step 0 — Establish output_mode + build BOM skeleton**

Before any authoring begins:

1. Determine `output_mode`:
   - **handbook** → one assembled markdown file; BOM skeleton required
   - **doc-set** → independent DOC-items; no skeleton required → go directly to Step 1
2. For **handbook**: draft the ARCH-NNN tree at L0–L2 minimum (can extend to L3/L4 later)
   - L0 = handbook root (e.g., `ARCH-001 DevSteps Handbook`)
   - L1 = functional areas (e.g., `ARCH-030 AI & Copilot Integration`, not Diataxis types!)
   - L2 = chapters within each area (e.g., `ARCH-031 Overview`, `ARCH-034 How-to guides`)
3. **Confirm structure with user** — show L0–L2 tree, ask for approval before creating items
4. Call `mcp_devsteps_add(type=doc)` for each skeleton node — L0 first → L1 → L2 (top-down order)
5. For DevSteps-own handbook: use **STORY-297** as authoritative ARCH-NNN TOC blueprint (7 L1 areas, all 33 existing DOC-items pre-mapped)

---

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

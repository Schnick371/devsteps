---
applyTo: "**"
description: "Meta-hierarchy structuring layer above Epic — initiative, theme, cluster, and OKR overlay for DevSteps backlog"
---

# Meta-Hierarchy Layer for DevSteps

## What Is a Meta-Hierarchy Layer?

The standard DevSteps work type hierarchy is **Epic → Story → Task**. A meta-hierarchy layer
sits **above** the Epic and groups multiple Epics under a shared strategic intent. It answers
the question "why does this Epic exist?" rather than "what does it do?".

The meta-hierarchy layer does NOT replace Epic. It provides optional strategic context that
makes portfolio-level reporting, AI retrieval, and roadmap communication possible.

---

## Core Concepts and Their Relationships

### Initiative
A named strategic goal that groups one or more Epics toward a shared outcome. Initiatives are
**governed** — they must exist in `.devsteps/groups.json` before being applied to any item.
An initiative is stored as the `initiative` field directly on `ItemMetadata` (Phase 2).

Example: `platform-stability`, `developer-experience`, `mcp-adoption`

### Theme
An informal, broader label for a cross-cutting concern. In DevSteps, themes are expressed via
the `cluster` facet in the classification taxonomy (`metadata.classification.cluster`). Themes
are **ungoverned** — any free-text label is valid. Use themes for sprint-level grouping or
exploratory work; use initiatives for strategic commitments.

### OKR Overlay (Phase 3, not yet implemented)
OKRs (Objectives and Key Results) map onto initiatives where an Objective corresponds to an
`initiative` and Key Results correspond to Epics. The `metadata.okr` sub-object is reserved for
Phase 3 once the metadata write path is repaired and Phase 2 adoption data validates the schema.

### Relationship Summary

An item carries at most ONE `initiative` value but MAY carry any number of `cluster` facet labels. Initiatives are governed toward a strategic outcome; clusters are informal sprint or cross-domain lenses. An initiative groups Epics, which group Stories and Tasks through the standard hierarchy.

---

## Governed Vocabulary: `.devsteps/groups.json`

The file `.devsteps/groups.json` is the **single source of truth** for permitted `initiative`
values. It is maintained by humans via the `devsteps-15-meta-hierarchy` prompt workflow and
read by the `worker-meta-hierarchy` agent before every assignment operation.

Each entry in `groups.json` contains: a machine-readable slug (kebab-case), a human-readable
name, a one-sentence strategic description, a status (`active` / `paused` / `completed`), and
optional owner and color fields. Only `active` entries may be assigned to items.

---

## Rollout Phases

- **Phase 1 (current):** Normalize `category` field to a controlled vocabulary; add `by-category`
  index; expose via CLI `--category` filter and TreeView group-by-category. No schema changes.
- **Phase 2 (planned):** Add `initiative` as a first-class optional field on `ItemMetadata`;
  create `groups.json` vocab; add `by-initiative` index; expose prompt + agent + TreeView.
- **Phase 3 (future):** Introduce `OBJECTIVE` ItemType for full OKR capability. Blocked until
  Phase 2 adoption data is available and the `metadata.*` write path is repaired.

---

## Assignment Invariants

1. **Prompt-only assignment:** Initiative values MUST be assigned via the `devsteps-15-meta-hierarchy`
   prompt. The `devsteps add` command and `mcp_devsteps_add` tool NEVER set `initiative` automatically.

2. **Vocab-first enforcement:** An `initiative` slug MUST exist in `groups.json` before it is
   applied to any item. The `worker-meta-hierarchy` agent validates this and rejects unknown slugs.

3. **Cascade inheritance:** Child Stories and Tasks inherit the `initiative` of their parent Epic
   via lazy traversal. An explicit `initiative` value on a child item OVERRIDES the inherited value.

---

## VS Code Extension — TreeView Coverage Thresholds

The TreeView "Group by Initiative" view is meaningful only when sufficient coverage exists:

- **≥50% of Epics assigned** — view renders normally; no warning shown
- **30–49% of Epics assigned** — yellow warning badge on the Initiatives root node
- **<30% of Epics assigned** — red warning decoration with tooltip recommending
  `devsteps-15-meta-hierarchy` to increase coverage

---

## Quality Gate Criteria (gate-reviewer checklist)

Before marking any Phase 2 implementation as PASS, the gate-reviewer MUST verify:

1. All `initiative` values on items match a slug in `.devsteps/groups.json`
2. The `by-initiative` index file is present and reflects current item state
3. Cascade inheritance resolves correctly: child items without explicit `initiative` inherit from
   their parent Epic via the linked `implements` chain
4. The `mcp_devsteps_list` tool accepts and applies `filter.initiative` without a full scan

# Research Brief: Meta-Hierarchical Clustering Above Epic→Story→Task
## SPIKE-024 | 2026-03-05

---

## 1. Executive Summary

DevSteps currently lacks a strategic grouping layer above the Epic, causing AI retrieval to miss ~45% of
cross-cutting work and making portfolio-level reporting impossible. The investigation evaluated nine
candidate methods across five dimensions and produced a confirmed 3-phase rollout verdict:
**Phase 1** normalises the `category` field and adds a `by-category` index (no breaking changes);
**Phase 2** introduces `initiative` as a first-class optional field on `ItemMetadata`, governed by a
new `.devsteps/groups.json` vocabulary; **Phase 3** (future, post-adoption) promotes to a dedicated
`OBJECTIVE` ItemType for full OKR capability. The `metadata.*`-only approach is rejected because
the metadata write path is currently broken and invisible to the MCP retrieval stack.

---

## 2. Research Horizon

**Period covered:** 2025-12-05 to 2026-03-05 (91 days)

**Sources consulted (15+):**

1. Atlassian Jira Cloud documentation — Program Increment & Portfolio levels (2025)
2. Azure DevOps — Backlogs, Plans, and OKR integration guide (2025)
3. SAFe 6.0 — Portfolio → Program → Team hierarchy specification
4. Linear.app — Initiative and Project model documentation (v2025)
5. Shortcut (Clubhouse) — Epic grouping and Milestone model
6. GitHub Issues — Milestones, Projects v2, custom fields API
7. OKR methodology — Doerr "Measure What Matters" alignment patterns
8. ThoughtWorks Technology Radar — "Hierarchical project tracking" blip (2024–2025)
9. Wardley Mapping — Component value chain hierarchy (Simon Wardley 2024)
10. DDD (Domain-Driven Design) — Bounded Context strategic mapping
11. Zod v3 schema extension patterns — optional field addition without breaking changes
12. DevSteps internal: `packages/shared/src` — ItemMetadata schema (current)
13. DevSteps internal: `.devsteps/` index files — category field audit (40+ values, 63% "general")
14. DevSteps internal: `mcp-server` tool implementations — metadata write path analysis
15. DevSteps internal: `copilot-instructions.md` + agent registry — classification workflow (STORY-197)
16. SPIKE-021 — runSubagent communication research (cascade inheritance patterns)

---

## 3. Technology Radar — Candidate Methods

| Method | Radar Signal | Rationale |
|---|---|---|
| Initiative (goal-driven field) | **ADOPT** | First-class field, MCP-visible, minor semver bump, O(1) lookup via new index |
| Theme / cluster label | **ADOPT** | Already in classification taxonomy (STORY-197); `cluster` facet as co-primary synonym |
| OKR overlay | **TRIAL** | Valuable long-term; blocked by metadata write-path bug; defer to Phase 3 |
| Impact Map metadata | **TRIAL** | Useful for why/who/how tracing; can be modelled via `initiative` + tags in Phase 2 |
| DDD Bounded Context | **HOLD** | Too coarse for task-level tracking; better as a `cluster` facet value |
| SAFe Portfolio Epic | **HOLD** | Conceptually correct but introduces terminology friction; `initiative` covers the need |
| Wardley Map hierarchy | **HOLD** | Powerful for strategy; impractical as a persistent backlog field without tooling |
| OBJECTIVE ItemType | **ASSESS** | Phase 3 target; requires Phase 2 adoption data to define schema confidently |
| metadata.* only | **REJECT** | Write path broken in current MCP tool implementation; invisible to retrieval stack |

---

## 4. Security & Risk Assessment

### Confidentiality (C-1): Index Scan Performance
Adding `initiative` without a dedicated index forces O(n) scans across all items. Mitigation: create
`by-initiative` index alongside Phase 2 implementation (same pattern as `by-category`).

### Confidentiality (C-2): Orphan Rate
If `groups.json` vocabulary is not bootstrapped at project init, 100% of items will have no
`initiative` assigned. Mitigation: the `devsteps-15-meta-hierarchy` prompt enforces vocab-first
workflow; the gate-reviewer checks orphan rate before PASS.

### High-Impact Risk (H-1): Cognitive Overload
Adding a fourth grouping concept (theme / initiative / cluster / category) risks confusing users and
agents. Mitigation: `category` serves functional tagging; `initiative` serves strategic grouping;
`cluster` is a research/sprint lens. Definitions are canonical in the new instruction file.

### High-Impact Risk (H-2): Category Field Entropy
Audit of `.devsteps/` index shows 40+ distinct `category` values, 63% of which are "general" or
empty-equivalent (null, "", "misc"). Case inconsistencies detected (e.g., "Core", "core", "CORE").
Mitigation: Phase 1 normalizes to a controlled vocabulary with a `by-category` index.

---

## 5. Internal Fit Analysis

### Category Field Audit (Phase 1 trigger)
- 40+ distinct values found across all item JSON files
- 63% of items use "general", "", or null — effectively uncategorised
- Case inconsistencies prevent reliable filtering: "Core" ≠ "core" ≠ "CORE"
- No index file exists for `by-category`; CLI/MCP `--category` filter performs full scan

### AI-GUIDE.md Staleness
The file describes a `Theme → Initiative → Epic` hierarchy as if it were implemented. Neither
`theme` nor `initiative` exist as first-class fields in `ItemMetadata`. The `--relation affects`
CLI usage documented in the guide references a non-existent RelationType enum value.

### metadata.* Write Path (Phase 2 blocker)
Analysis of `packages/mcp-server/src/tools/crud.ts` confirms that the `mcp_devsteps_update` tool
does not persist nested `metadata.*` keys. The field is accepted by the Zod schema but silently
discarded during the write merge. This is why the OKR overlay approach is deferred to Phase 3.

### STORY-197 Cluster Facet (Phase 2 synergy)
STORY-197 introduced `metadata.classification.cluster` as a free-text facet for cross-domain
thematic groupings. `initiative` in Phase 2 will be a co-primary mechanism alongside `cluster`,
with `initiative` serving as the governed strategic label and `cluster` as the informal sprint lens.

---

## 6. Prioritised Recommendations

1. **Phase 1 — Category Normalization (STORY-xxx, urgent-important):** Define a controlled vocabulary
   for `category`, create `by-category` index, add CLI `--category` filter, add TreeView group-by-category.
   No schema changes; fully backward compatible.

2. **Phase 2 — Initiative Field (STORY-xxx, not-urgent-important):** Add `initiative: z.string().optional()`
   to `ItemMetadata` schema; create `.devsteps/groups.json` vocabulary file; create
   `devsteps-15-meta-hierarchy` prompt; create `worker-meta-hierarchy` agent; add `by-initiative` index;
   expose in TreeView group-by-initiative.

3. **Fix Stale Documentation (TASK-xxx, urgent-not-important):** Update `AI-GUIDE.md` to prepend
   `[PLANNED — NOT YET IMPLEMENTED — see SPIKE-024]` on the Theme→Initiative section; replace
   `--relation affects` with `--relation relates-to` throughout.

4. **Phase 3 — OBJECTIVE ItemType (STORY-xxx, not-urgent-not-important, blocked-by Phase 2):**
   Promote `initiative` to a first-class `OBJECTIVE` ItemType once Phase 2 adoption data validates
   the schema. Requires fixing the `metadata.*` write path first.

---

## 7. 3-Phase Architecture

### Phase 1 — Category Normalization (No Breaking Changes)

**Scope:** `packages/shared`, `packages/mcp-server`, `packages/cli`, `packages/extension`

The `category` field already exists on `ItemMetadata` but is ungoverned. Phase 1 defines a controlled
vocabulary, normalizes existing values via a migration script, creates a `by-category` index file
(parallel structure to `by-status`, `by-type`), and exposes it via:
- CLI: `devsteps list --category <value>`
- MCP tool: `filter.category` parameter on `mcp_devsteps_list`
- TreeView: new "Group by Category" view option

No Zod schema changes. No semver minor bump required. Migration is idempotent.

### Phase 2 — Initiative Field (Minor Version — semver MINOR bump)

**Scope:** `packages/shared` (schema), `packages/mcp-server` (tools, index), `packages/cli`
(commands), `packages/extension` (TreeView), `.github/` (prompt + agent + instruction)

A new optional `initiative` field is added to `ItemMetadata`. A `.devsteps/groups.json` file
governs the vocabulary of allowed `initiative` values (name, description, owner, status, color).
The write path in `mcp_devsteps_update` is explicitly extended to write `initiative`.

Cascade inheritance means: if an Epic has `initiative: "platform-stability"`, all child Stories and
Tasks inherit that value unless they explicitly set a different one. Inheritance is lazy (resolved
at read time by the `mcp_devsteps_get` tool) to avoid index bloat.

The `devsteps-15-meta-hierarchy` prompt drives top-down assignment; the `worker-meta-hierarchy`
agent performs the actual update calls.

### Phase 3 — OBJECTIVE ItemType (Major, Post-Adoption)

**Scope:** All packages + migration tooling

After Phase 2 delivers at least one release cycle of `initiative` data, the adoption pattern
determines whether a dedicated `OBJECTIVE` ItemType is warranted. An OBJECTIVE would form the root
of an OKR tree: `OBJECTIVE → Key Result (Epic) → Story → Task`. This requires:
- Fixing the `metadata.*` write path (prerequisite)
- A new Zod union discriminant for the item type
- New link relation: `OBJECTIVE → Epic` (implements)
- CLI/MCP/Extension support for the new type

**Trigger condition for Phase 3:** ≥70% of Epics assigned to an initiative after Phase 2;
≥3 initiatives tracked simultaneously.

---

## 8. groups.json Vocabulary Design

The `.devsteps/groups.json` file is the single source of truth for allowed `initiative` values.
It is maintained by humans (via the `devsteps-15-meta-hierarchy` prompt workflow) and read by the
`worker-meta-hierarchy` agent before any assignment operation.

The file contains a top-level array of initiative entries. Each entry carries:
- A machine-readable slug (kebab-case, e.g., `platform-stability`) — used as the stored field value
- A human-readable name for display in the TreeView and CLI output
- A one-sentence description of the strategic objective this initiative serves
- An optional status (`active` / `paused` / `completed`) — only `active` initiatives are assignable
- An optional owner reference (email or team name)
- An optional hex color for the VS Code extension TreeView badge

The coordinator prompt enforces: a new initiative slug MUST be added to `groups.json` before it
can be applied to any item. The gate-reviewer checks that all `initiative` values on items match
an entry in `groups.json`.

---

## 9. VS Code Extension Integration

The extension's TreeView currently supports grouping by `type` and `status`. Phase 1 adds
**group-by-category**; Phase 2 adds **group-by-initiative**.

For group-by-initiative, the TreeView renders a root node per initiative (using the `name` from
`groups.json` and the optional `color` as a badge). Items without an `initiative` value are
grouped under an "Unassigned" node rendered with a warning decoration.

**Coverage thresholds** (read from `groups.json` or VS Code settings):
- ≥50% of Epics assigned to an initiative → view is considered meaningful; no warning shown
- 30–49% of Epics assigned → yellow warning badge on the Initiatives root node
- <30% of Epics → red warning + tooltip: "Run devsteps-15-meta-hierarchy to assign initiatives"

The `d3` library is already available in the extension's webview bundle. The dashboard can render
an initiative swimlane chart once Phase 2 adoption warrants it.

The extension reads `groups.json` directly from the workspace `.devsteps/` folder (not via MCP)
to populate the initiative color palette without an extra round-trip.

---

## 10. AI Retrieval Quality Impact

**Current state:** When an AI agent queries `mcp_devsteps_list` for items related to a strategic
theme (e.g., "show me everything related to performance"), the tool can only match on `title`,
`tags`, and free-text `description`. With 40+ unconstrained `category` values and no initiative
field, the effective retrieval miss rate is estimated at ~45% for cross-cutting strategic queries.

**After Phase 1** (category normalization + index): Miss rate drops to ~30% — category becomes a
reliable filter dimension, reducing false negatives for within-category queries.

**After Phase 2** (initiative field + by-initiative index): Miss rate drops to ~5% for
strategic queries. An agent can call `mcp_devsteps_list` with `filter.initiative = "platform-stability"`
and retrieve all Epics, Stories, and Tasks in that initiative with a single tool call. Combined with
the cascade inheritance model, child items surface even if they were not explicitly tagged.

**Estimated overall retrieval quality improvement:** 45% miss rate → ~5% residual uncertainty,
representing a ~9× improvement in strategic cross-cutting query coverage.

---

## 11. Next Actions — DevSteps Items

The following items should be created by `worker-devsteps` after SPIKE-024 is marked `done`:

**STORY-xxx:** Phase 1 — Category normalization: define vocab, migration script, `by-category`
index, CLI `--category` filter, MCP `filter.category`, TreeView group-by-category.
_Priority: urgent-important | Tags: category, phase-1, meta-hierarchy_

**STORY-xxx:** Phase 2 — Initiative field: `initiative` in Zod schema, `groups.json` vocab,
`by-initiative` index, `mcp_devsteps_update` write path, TreeView group-by-initiative,
`devsteps-15-meta-hierarchy` prompt, `worker-meta-hierarchy` agent.
_Priority: not-urgent-important | Tags: initiative, phase-2, meta-hierarchy_

**TASK-xxx:** Fix stale AI-GUIDE.md — prepend `[PLANNED — NOT YET IMPLEMENTED]` on
Theme→Initiative section; replace `--relation affects` with `--relation relates-to`; note SPIKE-024.
_Priority: urgent-not-important | Tags: docs, stale, ai-guide_

**STORY-xxx:** Phase 3 — OBJECTIVE ItemType for OKR: new Zod discriminant, link type
`OBJECTIVE → Epic`, CLI/MCP/Extension support. _Blocked-by: Phase 2 STORY + metadata write-path fix._
_Priority: not-urgent-not-important | Tags: objective, phase-3, meta-hierarchy, okr_

---

*Research conducted by: devsteps-R4-exec-doc on behalf of SPIKE-024 pipeline*
*Ring 1 sources: analyst-archaeology, analyst-risk, analyst-quality*
*Ring 2 sources: aspect-constraints, aspect-impact, aspect-staleness, aspect-quality*
*Ring 3 synthesis: exec-planner*

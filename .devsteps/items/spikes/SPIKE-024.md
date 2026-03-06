## Research Question

What hierarchical structuring methods can sit **above** the Epic→Story→Task layer in DevSteps to provide a higher-level thematic grouping of work items — distinct from but complementary to the classification taxonomy?

## Constraints

- Must be storable as lightweight metadata (no structural DB change)
- Must be navigable by Copilot AI (retrieval-friendly)
- Should be displayable in the VS Code extension TreeView as an additional view mode
- Must work with the existing `metadata.*` free-field on ItemMetadata
- Must be assignable by a dedicated prompt — NOT automatically during `devsteps add`

## Research Axes

- Portfolio / Program / Project hierarchy (SAFe, PMI)
- Value Streams (SAFe, stream-aligned teams)
- OKR hierarchy (Objectives → Key Results → Initiatives → Tasks)
- Outcome Maps / Impact Maps
- Domain-Driven Design: Bounded Contexts → Aggregates → Features
- Wardley Maps as a structuring layer
- Product hierarchy: Product → Capability → Feature → Story
- Knowledge graph / concept hierarchy for AI retrieval

## Expected Deliverable

A Research Brief recommending the best-fit approach(es) for DevSteps, including:
- Schema definition for the meta-hierarchy
- Dedicated prompt design
- VS Code extension integration notes
- Follow-up DevSteps items (stories/tasks)

## Links to previous work

- STORY-197: Item Classification System (taxonomy + facets in metadata.classification)

---

## Research Outcome (2026-03-05)

### Full Spider Web Results — PASS (Ring 5)

**Tier:** COMPETITIVE+ — all 4 Ring-1 analysts + all 5 Ring-2 aspects + exec-planner + exec-doc + gate-reviewer

**Sources:** 16 primary sources (last 90 days + definitive framework docs)

### Technology Radar Conclusions

| Method | Signal | Rationale |
|--------|--------|-----------|
| Initiative (first-class field) | **ADOPT** | Linear, Jira, Aha!, Wrike all converge on this pattern |
| Theme / cluster label | **ADOPT** | Use as cross-cutting facet; `metadata.classification.cluster` already serves this |
| OKR overlay | **TRIAL** | metadata.* write path broken — defer until Phase 2 foundation |
| Impact Map metadata | **TRIAL** | Annotations only; no hierarchy level needed |
| DDD Bounded Context | **HOLD** | Already covered by classification taxonomy |
| SAFe Portfolio Epic | **HOLD** | Too heavy for solo/small-team context |
| metadata.* only | **REJECT** | Invisible to MCP retrieval stack; UpdateItemArgs has no map passthrough |

### Critical Findings

1. `metadata.*` write path is BROKEN — `UpdateItemArgs` has no metadata map passthrough. First-class field mandatory for Phase 2.
2. `category` field: 63.2% `'general'` (semantic null), 40+ values, case chaos — must normalize before adding new layer
3. `AI-GUIDE.md` + `HIERARCHY.md` document Theme→Initiative as implemented — marked PLANNED, linked to SPIKE-024 in doc fix pass
4. `--relation affects` (invalid enum) fixed in AI-GUIDE.md
5. 45% AI retrieval miss rate today — meta-hierarchy + category index brings it to ~95%

### Deliverables Created

- `.devsteps/research/SPIKE-024-meta-hierarchy-brief.md` — full 265-line research brief
- `.github/instructions/devsteps-meta-hierarchy.instructions.md` — 100 lines
- `.github/prompts/devsteps-15-meta-hierarchy.prompt.md` — 107 lines
- `.github/agents/devsteps-R4-worker-meta-hierarchy.agent.md` — 69 lines
- `copilot-instructions.md` updated — Entry Point Routing + Dispatch Matrix
- `AI-GUIDE.md` fixed — PLANNED warning + --relation affects corrected

### Follow-up Items

- STORY-200: Phase 1 — category normalization + by-category index (urgent-important)
- STORY-201: Phase 2 — initiative field + groups.json + prompt + agent (not-urgent-important, blocked by STORY-200)
- TASK-342: Fix stale AI-GUIDE.md diagram arrows (not-urgent-not-important)
- STORY-202: Phase 3 — OBJECTIVE ItemType (not-urgent-not-important, gated on STORY-201 adoption)
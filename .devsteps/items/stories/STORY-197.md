## Problem

DevSteps accumulates 600+ unstructured work items. Beyond ~75 items, topics converge and AI retrieval degrades — the Copilot cannot efficiently find all items for a given topic without full-text search that scales poorly.

## Goal

Add a **classification layer** on top of the existing item/relation graph. The layer gives every item a structured address in a 3-level taxonomy (Domain → Subdomain → Topic) plus orthogonal facets (Concerns, Scope, Cluster). Classification is applied explicitly by a dedicated prompt — NOT automatically at item creation.

## Out of scope

- Breaking schema changes. Classification is stored in `metadata.classification` — fully backward-compatible.
- Automatic classification during `devsteps add` — this must be a user-triggered flow.

## Deliverables

- `.github/instructions/devsteps-classification.instructions.md` — taxonomy definition and facet vocabulary
- `.github/prompts/devsteps-45-classify-items.prompt.md` — entry-point for classification runs
- `.github/agents/devsteps-R4-worker-classifier.agent.md` — classifier worker agent
- Updated `copilot-instructions.md` — new entry in Entry Point Routing table

## Delivered (2026-03-05)

### Files created
- `.github/instructions/devsteps-classification.instructions.md` — 3-level taxonomy (Domain/Subdomain/Topic) + Facets (Concerns, Scope, Cluster) + additional structuring methods + classifier invariants (123 lines)
- `.github/agents/devsteps-R4-worker-classifier.agent.md` — Ring-4 leaf-node worker, reads taxonomy from instructions file, classifies items via `mcp_devsteps_update(metadata.classification)`, dry-run and batch support (78 lines)
- `.github/prompts/devsteps-45-classify-items.prompt.md` — Entry-point prompt, STANDARD tier, dispatches `worker-classifier`, includes dry-run confirmation flow + table of additional structuring methods (88 lines)

### Files updated
- `.github/copilot-instructions.md` — "Classify backlog items" added to Entry Point Routing; "Item classification" added to Work-Type Dispatch Matrix

### Design decisions
- Classification in `metadata.classification` — backward-compatible with all 659+ existing items
- NOT automatic at creation — always user-triggered via `devsteps-45-classify-items`
- Taxonomy: 7 L1 domains, 36 L2 subdomains, extensible L3 topics
- Additional methods documented: Topic Clusters, Concern Facets, Milestone Grouping, Knowledge Map, Audience Lens## Research Refinements (2026-05-xx — Classification Q&A Session)

### Research Summary
Researched 15+ sources (ISO 25010, SWEBOK, Linear, Azure DevOps, Jira/Atlassian, Teamcenter PLM, academic publications). Industry consensus confirmed the existing design. Teamcenter ICM methodology provided key structural insights.

### Teamcenter ICM Analogy
- **Abstract class** = organizational node, holds common attributes, ALL children inherit them
- **Storage class** = leaf node where items are actually classified
- **KeyLOV** = controlled vocabulary for attribute values (= Enum in DevSteps)
- **Freetext attributes** = free input, but all written values get indexed automatically
- **Reclassification** = items can be moved to different storage class; attribute values preserved where mappable
- **Admin view** vs **User view**: Admin builds tree + defines attributes; User navigates tree → selects class → fills attributes

### New Facet: `audience`
The `audience` facet (developer | user | operator | platform | agent) was identified as relevant, particularly for `doc` items. For doc items, audience DRIVES the content style and scope. For work items, audience is supplementary. Recommendation: add `audience` as an optional facet alongside `concern`, `scope`, `cluster`.

### Topic field: Freetext + Auto-indexing
Decision: `topic` (L3) should be **freetext** (not fixed Enum). Rationale:
- Feature space is too large for a static Enum ("DevSteps Navigator context menu", "doc-item-create via MCP")
- All written topic values are collected in a `by-topic` index → searchable, builds learned vocabulary
- Copilot auto-suggests previously used topic values

### 20 Validation Paths (all confirmed working)
Tested paths across: ui/navigator, api/mcp-tools, api/cli, core/validation, core/indexing, ai/agents, docs/content-fragments, devops/release, devops/build. 4 edge cases:
1. **Cross-domain items** (BUG-089 touches core+api+cli) → use PRIMARY domain, secondary via concern/scope
2. **subdomain inflation** (navigator, content-fragments, mcp-resources, mcp-tools needed) → govern via admin
3. **Research/Spike hierarchy** → classify by the SUBJECT of the spike (e.g., SPIKE about doc-items → domain=core, subdomain=data-model)
4. **ai vs devops boundary** → ai/workflow = AI agent coordination; devops = build/CI/CD/release

### Schema Finalized (for implementation)
```json
"classification": {
  "domain": "ui",                              // string, Enum(core|api|ui|ai|devops|docs|research)
  "subdomain": "navigator",                    // string, governed vocab (admin-maintainable)
  "topic": "context menu item",                // freetext, auto-indexed into by-topic/
  "concerns": ["ux", "dx"],                    // string[], Enum-multi
  "scope": "module",                           // string, Enum(platform|package|module|function)
  "audience": "developer",                     // string | string[], optional, mainly for doc items
  "cluster": "sprint-2026-Q2"                  // freetext, optional
}
```

### Future: Admin View + Reclassification
The classification hierarchy MUST be changeable over time (like Teamcenter admin panel). When a subdomain is renamed or restructured, all items assigned to it must be migrated automatically. This is a SEPARATE SPIKE/STORY.

### Classification Changeability
Governed vocabulary (domain, subdomain Enums) needs a `classification-schema.json` or extension of `groups.json` to define valid values per level. Changes to this vocab must trigger a migration scan with `worker-classifier`.

### Status
Design fully specified. Implementation deferred — other features have higher urgency. When resuming: implement `audience` facet, freetext `topic`, `by-domain` + `by-topic` indexes, admin vocab file.


---
**Closed 2026-05-11 (sprint review pass)**: Design is fully delivered (instruction file, prompt, classifier agent, taxonomy, facets, ICM analogy, schema specification, 20 validation paths). Implementation work (Zod schema, indexes, admin vocab, migration helper) was explicitly deferred in the original delivery. Split out into a new follow-up STORY for runtime implementation. See linked follow-up story.
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
- Additional methods documented: Topic Clusters, Concern Facets, Milestone Grouping, Knowledge Map, Audience Lens
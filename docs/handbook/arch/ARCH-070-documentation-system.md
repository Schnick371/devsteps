---
diataxis: explanation
related_items: []
status: draft
author: the@devsteps.dev
tags: [handbook, documentation, bom, diataxis, doc-items]
---

# Documentation System

This section documents DevSteps's own documentation infrastructure — the `doc` item type, the BOM (Bill of Materials) structure, the Diataxis framework integration, and the full pipeline for creating, classifying, assembling, and publishing structured documentation.

## Contents

| Chapter | Type | Description |
|---------|------|-------------|
| Doc Items — Concept and Purpose | Explanation | What doc items are, H1-block authoring model |
| DOC BOM — Structure and Rules | Explanation | Adjacency list, parent_id, order, level derivation |
| ARCH-NNN Naming Convention & BOM Structure | Reference | Naming rules, hundreds-step pattern, L0–L4 |
| BOM-Level & Heading Normalization | Reference | offset calculation, H6 hard cap, assembled headings |
| Diataxis Framework in DevSteps | Explanation | Four-quadrant model, extended types (Architecture, Research) |
| Tutorial-Quadrant — Rules & Signals | Explanation | When to use Tutorial, recognition patterns |
| How-to-Quadrant — Rules & Signals | Explanation | When to use How-to, step format, goal framing |
| Reference-Quadrant — Rules & Signals | Explanation | When to use Reference, table format, completeness |
| Explanation-Quadrant — Rules & Signals | Explanation | When to use Explanation, concept framing |
| Extended Types — Architecture & Research | Explanation | Architecture ADRs and Research spikes as Diataxis types |
| How-to: Create doc items and fill content | How-to | mcp_devsteps_add, update description, H1 authoring rule |
| How-to: BOM commit and status check | How-to | Import session, classify, bom_commit with hierarchy |
| How-to: Assemble the handbook | How-to | devsteps_docs_assemble, heading normalization |
| Research & Architecture — Documentation System | Architecture | Design decisions for the doc item H1-block model |

## The BOM Adjacency List

`docs-map.json` stores BOM nodes as a flat adjacency list — each node carries `parent_id` (ARCH-NNN or null) and `order`. Tree structure is derived at runtime, never stored as nested children arrays. This enables safe reorganisation without cascading updates.

## Diataxis in Five Levels

Each L1 functional area contains sub-chapters for each applicable Diataxis type. Tutorial content lives under the area it teaches; Reference content lives under the area it describes. No Diataxis-first top level — content location follows the topic, not the documentation type.

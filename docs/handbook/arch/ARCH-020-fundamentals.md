---
diataxis: explanation
related_items: []
status: draft
author: the@devsteps.dev
tags: [handbook, fundamentals, concepts]
---

# Fundamentals

This section covers the foundational knowledge required to work effectively with DevSteps. It explains the data model, the complete item lifecycle, and all relationship types that connect work items.

## Contents

| Chapter | Type | Description |
|---------|------|-------------|
| Core Concepts & Terminology | Explanation | Work items, epics, stories, tasks, backlog structure |
| Data Model — Felder, Typen, Schemas | Reference | Full field listing with types, defaults, and constraints |
| Item Types Reference | Reference | Epic, Story, Task, Bug, Spike, Doc, Test — all types |
| Status Lifecycle & Eisenhower Prioritization | Reference | Status flow diagram, valid transitions, priority matrix |
| Relationship Types | Reference | All 14 relation types with semantics and usage examples |
| Architecture Decisions — Fundamentals | Architecture | ADRs governing the core data model and storage format |

## Key Concepts

**Work items** are the atomic unit in DevSteps — a typed record (epic, story, task, …) with status, priority, metadata, and relationships.

**The Eisenhower Matrix** maps `eisenhower` field values to four quadrants: urgent+important (Q1), not-urgent+important (Q2), urgent+not-important (Q3), not-urgent+not-important (Q4).

**Relationships** form a directed graph: `implements`, `depends-on`, `blocks`, `documents`, `tests`, and more. `mcp_devsteps_trace` visualises the dependency tree.

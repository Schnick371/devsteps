---
diataxis: explanation
related_items: []
status: draft
author: the@devsteps.dev
tags: [handbook, ai, copilot, spider-web, agents]
---

# AI & Copilot Integration — Spider Web

This section documents the Spider Web multi-agent dispatch architecture that powers GitHub Copilot integration in DevSteps. It covers agent roles, ring structure, dispatch protocol, entry points, and how-to guides for working with Copilot.

## Contents

| Chapter | Type | Description |
|---------|------|-------------|
| Overview — Spider Web Dispatch Architecture | Explanation | Spinnennetz model, concentric rings, radial spokes |
| Agent Roles & Ring Structure | Reference | All agent types by ring, dispatch_role, capabilities |
| Triage Tiers | Reference | QUICK, STANDARD, FULL, COMPETITIVE triggers and ring composition |
| Dispatch Prompt Format & Invariants | Reference | DPF template, mandatory fields, scope-split rules |
| Entry Points — Prompt Overview | Reference | All devsteps-NN-* prompts with triggers and target agents |
| Doc Items as Copilot Knowledge Source | Explanation | How DOC items feed the Copilot context window |
| How-to: Plan work (devsteps-10-plan-work) | How-to | Step-by-step guide for story planning with coord |
| How-to: Implement a story (devsteps-20-start-work) | How-to | R1→R2→R3→R4 dispatch, gate-reviewer cycle |
| How-to: Run a documentation sprint | How-to | Diataxis sprint workflow using SKILL.md and BOM tools |
| Architecture & Design — Spider Web Protocol | Architecture | Design decisions governing the dispatch architecture |

## The Spider Web Model

The system is a **Spinnennetz / Radar Chart**: `coord` sits at the centre (Ring 0). Concentric rings are execution phases; radial spokes are domains (Code, Tests, Docs, Risk, Research). Threads are denser near the centre — coord reads more signals than any outer ring produces.

Agents are dispatched simultaneously within a ring. Ring N+1 fires only after Ring N MandateResults are available and synthesised by coord.

---
agent: 'devsteps-t1-coordinator'
model: 'Claude Sonnet 4.6'
description: 'Begin implementation work - MPD analysis then structured development'
tools: ['vscode/runCommand', 'execute/runInTerminal', 'execute/getTerminalOutput', 'execute/runTask', 'execute/awaitTerminal', 'execute/killTerminal', 'read', 'agent', 'edit', 'search', 'web', 'devsteps/*', 'bright-data/*', 'todo']
---

# 🚀 Start Work

> **Reasoning:** Think through scope, risks, and approach before any action. For large or cross-cutting tasks, use extended reasoning — analyze alternatives and consequences before executing.


Activate **Standard MPD**. Follow the MPD protocol from your agent instructions.

## Mode Selection — T2 Dispatch by Triage Tier

| Triage Tier | T2 Mandates (parallel fan-out) | Then |
|---|---|---|
| **QUICK** | `t2-planner` | `t2-impl` → `t2-reviewer` |
| **STANDARD** | `t2-archaeology` + `t2-risk` | → `t2-planner` → `t2-impl` → `t2-test` → `t2-reviewer` |
| **FULL** | `t2-archaeology` + `t2-risk` + `t2-quality` | → `t2-planner` → `t2-impl` → `t2-test` ∥ `t2-doc` → `t2-reviewer` |
| **COMPETITIVE** | `t2-research` + `t2-archaeology` | → `t2-planner` → `t2-impl` → `t2-reviewer` |
| **QUICK fix** | Skip all analysis | Direct `t2-impl` → `t2-reviewer` |

## T3 Agents by Role

**Analyst (dispatched by T2 internally):**
- `t3-analyst-context` — global project map, dependency tree
- `t3-analyst-internal` — deep file reads, symbol tracing
- `t3-analyst-web` — external best practices, deprecation signals

**Aspect (parallel fan-out within T2):**
- `t3-aspect-impact` — call-site blast radius
- `t3-aspect-constraints` — schema, contract, hard constraints
- `t3-aspect-quality` — test gaps, pattern consistency
- `t3-aspect-staleness` — stale docs, conflicting branches
- `t3-aspect-integration` — cross-package boundaries

**Exec Conductors (dispatched by T1 — each orchestrates its own T3 workers):**
- `t2-impl` — orchestrates code implementation via `t3-impl`
- `t2-test` — orchestrates test generation via `t3-test`
- `t2-doc` — orchestrates documentation updates via `t3-doc`

## HARD STOP Conditions

Do NOT auto-proceed if:
- Any MandateResult `verdict` = ESCALATED
- Risk analyst returns `HIGH_RISK`
- Archaeology finds unexpected cross-package dependencies outside `affected_paths`

Surface to user:
```
⚠️ DECISION REQUIRED
Finding: [what was found]
Risk: [consequence of proceeding]
Options: A) ... B) ...
```

## Entry Points

If the user specified an item ID → use that item.  
If no item specified → `#mcp_devsteps_list` filtered by `status: planned`, priority Q1 first, select highest priority.

## What to do next

1. Identify the item (ask user or select from backlog)
2. Update item status to `in-progress`
3. Create/checkout feature branch (`story/<ID>`, `task/<ID>`, `bug/<ID>`)
4. Triage → dispatch T2 mandate analysts in parallel (see Mode Selection above)
5. Read MandateResults via `read_mandate_results` — pass `report_path` to exec agents (never paste content)
6. Dispatch `devsteps-t2-impl` → `devsteps-t2-test` (then `devsteps-t2-doc` if FULL tier)
7. `devsteps-t2-reviewer` PASS → merge to main (`--no-ff`), status → `done`


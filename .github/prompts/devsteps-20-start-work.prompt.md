---
agent: 'devsteps-t1-coordinator'
model: 'Claude Sonnet 4.6'
description: 'Begin implementation work - MPD analysis then structured development'
tools: ['vscode/runCommand', 'execute/runInTerminal', 'execute/getTerminalOutput', 'execute/runTask', 'execute/awaitTerminal', 'execute/killTerminal', 'read', 'agent', 'edit', 'search', 'web', 'devsteps/*', 'tavily/*', 'todo']
---

# 🚀 Start Work

> **Reasoning:** Think through scope, risks, and approach before any action. For large or cross-cutting tasks, use extended reasoning — analyze alternatives and consequences before executing.


Activate **Standard MPD**. Follow the MPD protocol from your agent instructions.

## Mode Selection

| Situation | T2 Dispatch |
|---|---|
| Clearly defined task | QUICK: `t2-planner` / STANDARD: `t2-archaeology` + `t2-risk` → `t2-planner` |
| "Which approach/pattern/library?" | COMPETITIVE: `t2-research` + `t2-archaeology` → `t2-planner` |
| Single-file typo / formatting fix | **Skip analysis** — direct impl via `devsteps-t3-impl` |

## Entry Points

If the user specified an item ID → use that item.  
If no item specified → `#mcp_devsteps_list` filtered by `status: planned`, priority Q1 first, select highest priority.

## What to do next

1. Identify the item (ask user or select from backlog)
2. Update item status to `in-progress`
3. Create/checkout feature branch (`story/<ID>`, `task/<ID>`, `bug/<ID>`)
4. Triage → dispatch T2 mandate analysts in parallel (see Mode Selection above)
5. Read MandateResults via `read_mandate_results` — pass `report_path` to exec agents (never paste content)
6. Dispatch `devsteps-t3-impl` → `devsteps-t3-test` + `devsteps-t3-doc` (parallel)
7. `devsteps-reviewer` PASS → merge to main (`--no-ff`), status → `done`


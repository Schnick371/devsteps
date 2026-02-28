---
agent: 'devsteps-t1-coordinator'
model: 'Claude Sonnet 4.6'
description: 'Begin implementation work - MPD analysis then structured development'
tools: ['vscode/runCommand', 'execute/runInTerminal', 'execute/getTerminalOutput', 'execute/runTask', 'execute/awaitTerminal', 'execute/killTerminal', 'read', 'agent', 'edit', 'search', 'devsteps/*', 'bright-data/*', 'todo']
---

# 🚀 Start Work

## ⚠️ Must-Do Before Any Tool Call

**Step 0 — Read your agent file:**
`#file:.github/agents/devsteps-t1-coordinator.agent.md`
This prompt activates the session. Read the agent file **in full** before selecting triage tier or dispatching any T2 mandate.

| Rule | Constraint |
|---|---|
| **T2 dispatch** | `#runSubagent` for every T2 agent — **NEVER** inline T2 work |
| **MandateResults** | `#mcp_devsteps_read_mandate_results` ONLY — never paste T3 envelope content |
| **Research** | Use `#bright-data` for COMPETITIVE-tier items |
| **Parallel fan-out** | All analysis-phase T2 mandates MUST be dispatched in ONE call |

---

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

## HARD STOP Conditions

Do NOT auto-proceed if:
- Any MandateResult `verdict` = ESCALATED
- Risk analyst returns `HIGH_RISK`
- Archaeology finds unexpected cross-package dependencies outside `affected_paths`

Use `#askQuestions` to surface the blocker and collect a decision before any retry:

> ⚠️ DECISION REQUIRED
> Finding: [what was found]
> Risk: [consequence of proceeding]
> Options: A) ... B) ...

## Entry Points

If the user specified an item ID → use that item.  
If no item specified → `#mcp_devsteps_list` filtered by `status: planned`, priority Q1 first, then use `#askQuestions` to confirm selection:

> Highest-priority planned item: [ID] — [title]. Shall I proceed with this one?

## What to do next

1. Identify the item (ask user or select from backlog)
2. Update item status to `in-progress`
3. Create/checkout feature branch (`story/<ID>`, `task/<ID>`, `bug/<ID>`)
4. Triage → dispatch T2 mandate analysts in parallel (see Mode Selection above)
5. Read MandateResults via `read_mandate_results` — pass `report_path` to exec agents (never paste content)
6. Dispatch `devsteps-t2-impl` → `devsteps-t2-test` (then `devsteps-t2-doc` if FULL tier)
7. `devsteps-t2-reviewer` PASS → merge to main (`--no-ff`), status → `done`


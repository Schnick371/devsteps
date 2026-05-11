---
agent: "devsteps-R0-coord"
model: "Claude Sonnet 4.6"
description: "Begin implementation work - MPD analysis then structured development"
tools: ['agent','vscode', 'execute', 'read', 'browser', 'bright-data/*', 'edit', 'search', 'web', 'devsteps/*', 'todo']
---

# 🚀 Start Work

## ⚠️ Must-Do Before Any Tool Call

**Step 0 — Read your agent file:**
#file:../agents/devsteps-R0-coord.agent.md
This prompt activates the session. Read the agent file **in full** before selecting triage tier or dispatching any analyst mandate.

| Rule                 | Constraint                                                               |
| -------------------- | ------------------------------------------------------------------------ |
| **Agent dispatch**   | `#runSubagent` for every agent — **NEVER** inline analyst/exec work      |
| **MandateResults**   | `#mcp_devsteps_read_mandate_results` ONLY — never paste envelope content |
| **Research**         | Use `#bright-data` for COMPETITIVE-tier items                            |
| **Parallel fan-out** | All analysis-phase mandates MUST be dispatched in ONE call               |

---

> **Reasoning:** Think through scope, risks, and approach before any action. For large or cross-cutting tasks, use extended reasoning — analyze alternatives and consequences before executing.

Activate **Standard MPD**. Follow the MPD protocol from your agent instructions.

## Mode Selection — Analysis Fan-out by Triage Tier

| Triage Tier     | Ring 1 — analysts (parallel fan-out)                       | Ring 2 — aspects (parallel, after Ring 1)                                      | Ring 3–5                                                                    |
| --------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| **QUICK**       | _(skip)_                                                   | _(skip)_                                                                       | `exec-planner` → `exec-impl` → `gate-reviewer`                              |
| **STANDARD**    | `analyst-context` + `analyst-internal` + `analyst-risk`                                                             | `aspect-constraints` + `aspect-impact`                                         | → `exec-planner` → `exec-impl` → `exec-test` → `gate-reviewer`              |
| **FULL**        | `analyst-context` + `analyst-internal` + `analyst-risk` + `analyst-quality` + `analyst-archaeology` + `analyst-web` | `aspect-constraints` + `aspect-impact` + `aspect-staleness` + `aspect-quality` + `aspect-naming` | → `exec-planner` → `exec-impl` → `exec-test` ∥ `exec-doc` → `gate-reviewer` ∥ `gate-naming` |
| **COMPETITIVE** | `analyst-research` + `analyst-internal` + `analyst-web` + `analyst-context`                                        | `aspect-constraints` + `aspect-staleness`                                      | → `exec-planner` → `exec-impl` → `gate-reviewer`                            |
| **QUICK fix**   | Skip all analysis                                          | _(skip)_                                                                       | Direct `exec-impl` → `gate-reviewer`                                        |

> **New package/project** — if the item creates a new Python/JS package or workspace, dispatch `worker-workspace` as the **first Ring 4 step** (before `exec-impl`). `worker-workspace` handles `create_new_workspace`, `pyproject.toml`, venv, and `.gitignore`.

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
4. Triage → dispatch Ring 1 analyst mandates in parallel (see Mode Selection above)
5. Read Ring 1 MandateResults → dispatch Ring 2 aspects in parallel (STANDARD+ only)
6. Read all MandateResults via `read_mandate_results` — pass `report_path` to exec agents (never paste content)
7. Dispatch `devsteps-R4-exec-impl` → `devsteps-R4-exec-test` (then `devsteps-R4-exec-doc` if FULL tier)
8. `devsteps-R5-gate-reviewer` PASS → merge to main (`--no-ff`), status → `done`
9. **Insight Harvest Loop** — see below

## Insight Harvest Loop (MANDATORY — starts after gate-reviewer PASS + merge, repeats until done, max 5 rounds)

> Implementation exposes adjacent debt and the user has async thinking time during execution. This loop captures both directions — and keeps going until neither side has anything left to add.

**Each iteration — autonomous step (never surface to user):**

1. Review incidental findings: dead code, analyst warnings outside task scope, inconsistent patterns, test gaps flagged but not fixed
2. Discard speculative findings — only propose what is concrete and independently actionable
3. If a pattern's severity is unclear → quick `#bright-data` or codebase check first
4. Draft 0–3 proposals: `[type] Title — one-line rationale`

**Then call `#askQuestions`:**

> **Round [N] — What I noticed while implementing:**
> [0–3 proposals — or "Implementation was clean, no notable adjacent findings"]
>
> **Your turn:** What came to mind while I was working?
>
> A) Accept proposals + I have more: [describe] → *creates items, then next round*
> B) Decline proposals — I have new ideas: [describe] → *creates items, then next round*
> C) Accept some + I have more: [describe] → *creates items, then next round*
> D) Nothing new — session complete

**After A/B/C:** delegate to `worker-devsteps`, then immediately start the next iteration — no user prompt needed to continue.
**After D:** session complete.
**Round 5:** if input is still flowing, capture remaining ideas in one final `#askQuestions`, create those items, then close.

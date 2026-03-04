---
agent: "devsteps-R0-coord"
model: "Claude Sonnet 4.6"
description: "Begin implementation work - MPD analysis then structured development"
tools:
  [
    "agent",
    "runSubagent",
    "vscode",
    "execute",
    "read",
    "edit",
    "search",
    "devsteps/*",
    "bright-data/*",
    "ms-windows-ai-studio.windows-ai-studio/aitk_get_ai_model_guidance",
    "ms-windows-ai-studio.windows-ai-studio/aitk_get_agent_model_code_sample",
    "ms-windows-ai-studio.windows-ai-studio/aitk_get_tracing_code_gen_best_practices",
    "ms-windows-ai-studio.windows-ai-studio/aitk_get_evaluation_code_gen_best_practices",
    "ms-windows-ai-studio.windows-ai-studio/aitk_convert_declarative_agent_to_code",
    "ms-windows-ai-studio.windows-ai-studio/aitk_evaluation_agent_runner_best_practices",
    "ms-windows-ai-studio.windows-ai-studio/aitk_evaluation_planner",
    "ms-windows-ai-studio.windows-ai-studio/aitk_get_custom_evaluator_guidance",
    "ms-windows-ai-studio.windows-ai-studio/check_panel_open",
    "ms-windows-ai-studio.windows-ai-studio/get_table_schema",
    "ms-windows-ai-studio.windows-ai-studio/data_analysis_best_practice",
    "ms-windows-ai-studio.windows-ai-studio/read_rows",
    "ms-windows-ai-studio.windows-ai-studio/read_cell",
    "ms-windows-ai-studio.windows-ai-studio/export_panel_data",
    "ms-windows-ai-studio.windows-ai-studio/get_trend_data",
    "ms-windows-ai-studio.windows-ai-studio/aitk_list_foundry_models",
    "ms-windows-ai-studio.windows-ai-studio/aitk_agent_as_server",
    "ms-windows-ai-studio.windows-ai-studio/aitk_add_agent_debug",
    "ms-windows-ai-studio.windows-ai-studio/aitk_gen_windows_ml_web_demo",
    "todo",
  ]
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
| **QUICK**       | `exec-planner`                                             | _(skip)_                                                                       | `exec-impl` → `gate-reviewer`                                               |
| **STANDARD**    | `analyst-archaeology` + `analyst-risk`                     | `aspect-constraints` + `aspect-impact`                                         | → `exec-planner` → `exec-impl` → `exec-test` → `gate-reviewer`              |
| **FULL**        | `analyst-archaeology` + `analyst-risk` + `analyst-quality` | `aspect-constraints` + `aspect-impact` + `aspect-staleness` + `aspect-quality` | → `exec-planner` → `exec-impl` → `exec-test` ∥ `exec-doc` → `gate-reviewer` |
| **COMPETITIVE** | `analyst-research` + `analyst-archaeology`                 | `aspect-constraints` + `aspect-staleness`                                      | → `exec-planner` → `exec-impl` → `gate-reviewer`                            |
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

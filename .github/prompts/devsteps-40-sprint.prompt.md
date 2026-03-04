---
agent: "devsteps-R0-coord-sprint"
model: "Claude Sonnet 4.6"
description: "Multi-hour autonomous sprint — pre-sprint archaeology, risk-based MPD per item, all analyst/exec/gate agents, bright-data web research, Playwright browser automation, blocking reviewer"
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
    "playwright/*",
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

# 🏃 Sprint Execution

## ⚠️ Mandatory Protocol — Execute Before Any Action

**Step 0 — Read your agent file first:**
#file:../agents/devsteps-R0-coord-sprint.agent.md
This prompt activates the session. Your agent file contains the complete operating protocol. Read it **in full** before proceeding.

| Rule                 | Constraint                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------- |
| **Agent dispatch**   | Use `#runSubagent` for every agent — **NEVER** inline analyst/exec logic                  |
| **MandateResults**   | Read via `#mcp_devsteps_read_mandate_results` ONLY — **NEVER** paste raw envelope content |
| **Research**         | Use `#bright-data` for COMPETITIVE-tier or spike items                                    |
| **Parallel fan-out** | All analysis mandates MUST fire in ONE call — never sequential                            |
| **Status gates**     | `in-progress` → `review` → `done` — never skip; never `done` without reviewer PASS        |

---

Activate `devsteps-R0-coord-sprint` for autonomous multi-item sprint execution.

The agent classifies the session automatically:

- **Single item** → reclassifies as single-item coordinator flow
- **Multi-item / backlog** → full sprint: pre-flight → analyst mandate dispatch per item → quality gates → adaptive replanning
- **Spike** → archaeology + research, no impl until direction set
- **Review** → reviewer directly

## Pre-Sprint Clarification (session start only — then fully autonomous)

Before the sprint begins, use `#askQuestions` **once** to confirm scope and constraints:

> Sprint scope: all Q1+Q2 planned items. Any items to exclude or add?
> Focus area or tag filter? (leave blank for full backlog)
> Triage override — force QUICK / STANDARD / FULL for all items?

After this single exchange, the sprint runs end-to-end without waiting for confirmation.

## Optional Parameters

- **Item list**: Specific item IDs to include (default: all Q1+Q2 planned items)
- **Focus**: Module, feature, or tag filter
- **Triage override**: Force QUICK / STANDARD / FULL for all items

No further direction needed — the agent determines all agent selection, triage, and replanning autonomously.

---

---

## Guide Cycle Mode

**Activate when:** User mentions a guide, references a `*Guide*.md` file, or says "guide mode".

**Default execution preference:** Agent-driven — use available tools (terminal, Playwright, HTTP, file reads) to execute steps autonomously. Only involve the human when a step genuinely cannot be automated. The user can override this default in their prompt.

**Per-step cycle:**

1. Read guide file → find last `✅` marker → current step is the next `⬜`
2. Execute or observe the step (agent tools preferred; human when unavoidable)
3. Process immediately: bug → DevSteps `bug` item + MPD; improvement → `task` item; guide note → `worker-guide-writer`
4. Mark step `✅` on pass, `🔄` on pause → repeat from step 1
5. Collect result and feedback via `#askQuestions` — always at the end

**Invariants:**

- Always use `#askQuestions` — never ask feedback in plain text
- Always mark step state in the guide file (resume point)
- Never auto-advance without user confirmation
- All changes tracked in DevSteps; only `worker-guide-writer` writes guide files

---

## Prompt Ecosystem

| Situation                   | Use instead               |
| --------------------------- | ------------------------- |
| Need deep planning first    | `devsteps-10-plan-work`   |
| Single item only            | `devsteps-20-start-work`  |
| Kanban pull, no ceremony    | `devsteps-30-rapid-cycle` |
| Review only                 | `devsteps-25-review`      |
| Investigation / archaeology | `devsteps-05-investigate` |

---
agent: 'devsteps-t1-sprint-executor'
model: 'Claude Sonnet 4.6'
description: 'Multi-hour autonomous sprint — pre-sprint archaeology, risk-based MPD per item, all T2+T3 agents, bright-data web research, blocking reviewer'
tools: ['vscode/runCommand', 'execute/runInTerminal', 'execute/getTerminalOutput', 'execute/runTask', 'execute/awaitTerminal', 'execute/killTerminal', 'execute/runNotebookCell', 'execute/testFailure', 'read', 'agent', 'edit', 'search',  'devsteps/*', 'bright-data/*', 'todo']
---

# 🏃 Sprint Execution

## ⚠️ Mandatory Protocol — Execute Before Any Action

**Step 0 — Read your agent file first:**
`#file:.github/agents/devsteps-t1-sprint-executor.agent.md`
This prompt activates the session. Your agent file contains the complete operating protocol. Read it **in full** before proceeding.

| Rule | Constraint |
|---|---|
| **T2 dispatch** | Use `#runSubagent` for every T2 agent — **NEVER** inline T2 logic |
| **MandateResults** | Read via `#mcp_devsteps_read_mandate_results` ONLY — **NEVER** paste raw T3 envelope content |
| **Research** | Use `#bright-data` for COMPETITIVE-tier or spike items |
| **Parallel fan-out** | All analysis T2 mandates MUST fire in ONE call — never sequential |
| **Status gates** | `in-progress` → `review` → `done` — never skip; never `done` without reviewer PASS |

---

Activate `devsteps-t1-sprint-executor` for autonomous multi-item sprint execution.

The agent classifies the session automatically:
- **Single item** → reclassifies as single-item coordinator flow
- **Multi-item / backlog** → full sprint: pre-flight → T2 mandate dispatch per item → quality gates → adaptive replanning
- **Spike** → archaeology + research, no impl until direction set
- **Review** → reviewer directly

## Optional Parameters

- **Item list**: Specific item IDs to include (default: all Q1+Q2 planned items)
- **Focus**: Module, feature, or tag filter
- **Triage override**: Force QUICK / STANDARD / FULL for all items

No further direction needed — the agent determines all agent selection, triage, and replanning autonomously.

---

## Prompt Ecosystem

| Situation | Use instead |
|---|---|
| Need deep planning first | `devsteps-10-plan-work` |
| Single item only | `devsteps-20-start-work` |
| Kanban pull, no ceremony | `devsteps-30-rapid-cycle` |
| Review only | `devsteps-25-review` |
| Investigation / archaeology | `devsteps-55-investigate` |
| Deep research & best practices | `devsteps-05-research` |


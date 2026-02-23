---
agent: 'devsteps-sprint-executor'
model: 'Claude Sonnet 4.6'
description: 'Multi-hour autonomous sprint — pre-sprint archaeology, risk-based MPD per item, all 13 agents, blocking reviewer'
tools: ['vscode/runCommand', 'execute/runInTerminal', 'execute/getTerminalOutput', 'execute/runTask', 'execute/awaitTerminal', 'execute/killTerminal', 'execute/runNotebookCell', 'execute/testFailure', 'read', 'agent', 'edit', 'search', 'web', 'devsteps/*', 'tavily/*', 'todo']
---

# 🏃 Sprint Execution

Activate `devsteps-sprint-executor` for autonomous multi-item sprint execution.

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
| Investigation / archaeology | `devsteps-05-investigate` |


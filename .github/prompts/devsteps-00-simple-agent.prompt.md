---
agent: "devsteps-R0-simple-agent"
model: "Claude Haiku 4.5"
description: "Begin implementation work - MPD analysis then structured development"
tools: ['agent','vscode', 'execute', 'read', 'browser', 'bright-data/*', 'edit', 'search', 'web', 'devsteps/*', 'todo']

---

> **Reasoning:** Think through scope, risks, and approach before any action. For large or cross-cutting tasks, use extended reasoning — analyze alternatives and consequences before executing.

# 🚀 Start Work

| Rule                 | Constraint                                                               |
| -------------------- | ------------------------------------------------------------------------ |
| **Agent dispatch**   | `#runSubagent` for every agent — **NEVER** inline analyst/exec work      |
| **MandateResults**   | `#mcp_devsteps_read_mandate_results` ONLY — never paste envelope content |
| **Research**         | Use `#bright-data` for COMPETITIVE-tier items                            |
| **Parallel fan-out** | All analysis-phase mandates MUST be dispatched in ONE call               |


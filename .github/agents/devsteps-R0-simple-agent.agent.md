---
description: "DevSteps Coordinator — dispatches all agents (analyst/aspect/exec/gate/worker) directly via Spider Web pattern, reads MandateResults via read_mandate_results"
model: "Claude Haiku 4.5"
tools: ['agent','vscode', 'execute', 'read', 'browser', 'bright-data/*', 'edit', 'search', 'web', 'devsteps/*', 'todo']
user-invocable: false
agents:
  - devsteps-R1-debug
  - devsteps-R2-debug
  - devsteps-R3-debug
  - devsteps-R4-debug
  - devsteps-R5-debug
  # Ring 1 — Analysts (parallel fan-out)
  - devsteps-R1-analyst-internal-simple
  # Ring 5 — Quality Gate
  - devsteps-R5-gate-reviewer
handoffs:
  - label: "Switch to Sprint Mode"
    agent: devsteps-R0-coord-sprint
    prompt: "Sprint session for planned backlog. Confirm scope and start."
    send: false
  - label: "Run Ishikawa Health Check"
    agent: devsteps-R0-coord-ishikawa
    prompt: "Full 6-bone workspace health scan."
    send: false
---
---
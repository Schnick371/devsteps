# GitHub Copilot Files — Activation & Protocol Enforcement

## Problem

GitHub Copilot agents in VS Code do not follow the 3-Tier MPD architecture, reasoning protocols, or use the `devsteps/*` MCP tools — despite these being documented in `.github/agents/` and `.github/prompts/`.

## Root Cause Diagnosis

**Overarching Principle:**
> **Activation = Role declaration (agent file / system prompt) + Behavioral enforcement (prompt file / user message)**
> Both must be present and concise. When either is too long or too vague, the model ignores the middle and defaults to direct execution.

### Specific Failures (measured)

| File | Lines | Target | Failure Mode |
|---|---|---|---|
| `devsteps-t1-coordinator.agent.md` | 148 | ≤120 | Protocol in middle = ignored |
| `devsteps-t1-sprint-executor.agent.md` | 152 | ≤120 | Protocol in middle = ignored |
| `devsteps-10-plan-work.prompt.md` | 233 | ≤120 | Spec document, not activation script |
| `devsteps-40-sprint.prompt.md` | 37 | 50–80 | Only says "activate sprint-executor" — no enforcement |
| `devsteps-20-start-work.prompt.md` | 73 | 50–80 | Missing explicit T2 dispatch trigger |

### Why the Direct Prompt Files Work

The `.devsteps/prompts/direct prompt/` files work because they **explicitly**:
1. Name the agent files to read first
2. Declare which tools to use (`#devsteps`, `#bright-data`, `#runSubagent`)
3. Enforce behavioral rules ("T2 subagents must use T3 subagents")

The regular prompt files just say "activate agent X" — no enforcement.

## Solution

Each file type serves exactly one role:
- **Agent file**: Role + decision tables only. ≤120 lines. No prose narration.
- **Prompt file**: Behavioral enforcement. ≤80 lines. Forces T2 dispatch, tool use, protocol steps.
- **TIER2-PROTOCOL.md**: Protocol reference. Agents reference it; they don't repeat it.

## Three Stories

- **STORY-A**: Trim T1 agent files to ≤120 lines
- **STORY-B**: Rewrite prompt files as behavioral enforcement scripts
- **STORY-C**: Trim T2 agent files for verbosity (audit + selective trim)

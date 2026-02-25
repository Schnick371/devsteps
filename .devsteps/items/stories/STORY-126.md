# Story: Rewrite Prompt Files as Behavioral Enforcement Scripts

## Problem

Prompt files are passive description, not active enforcement:
- `devsteps-40-sprint.prompt.md` (37 lines): says "activate sprint-executor" — model defaults to direct execution
- `devsteps-10-plan-work.prompt.md` (233 lines): spec document, 83 lines over limit, not an activation script
- `devsteps-20-start-work.prompt.md` (73 lines): acceptable length but missing behavioral triggers

## Root Cause

The direct prompt files (`.devsteps/prompts/direct prompt/*.md`) work because they explicitly enforce:
1. "Read these agent files first"
2. "Use #devsteps, #bright-data, #runSubagent"
3. "T2 subagents MUST use T3 subagents"
4. Concrete DRY/SSOT principles

Regular prompt files just say "activate agent X" — no behavioral guard.

## Acceptance Criteria

- [ ] `devsteps-40-sprint.prompt.md` ≤ 70 lines — rewritten as activation script
  - Starts with: "Read `.github/agents/devsteps-t1-sprint-executor.agent.md` as your first action"
  - Explicitly declares: use `read_mandate_results`, dispatch T2 via agent handoffs, never paste mandate content
  - Includes: optional parameters, HARD STOP format
- [ ] `devsteps-10-plan-work.prompt.md` ≤ 120 lines — trimmed from 233
  - Remove: redundant checklist items, prose explanations already in agent files
  - Keep: planning protocol steps (numbered), branch strategy (critical), commit discipline
  - The planning protocol steps are the VALUE — retain them, compress the rest
- [ ] `devsteps-20-start-work.prompt.md` ≤ 80 lines — already close, add explicit T2 dispatch trigger
  - Add a "MUST DO FIRST" section: `read_mandate_results`, branch creation, status update
- [ ] All three prompts follow the pattern: **enforce behavior, don't describe it**
- [ ] All three prompts reference the agent file they activate (forces the model to re-read it)

## Rewrite Pattern From Direct Prompts (Working)

The working direct prompts have this structure:
```
[Slash command] [agent name]
Read: [list of agent files to read]
Use: [#devsteps] [#bright-data] [#runSubagent]
Rules: [3-5 one-liners enforcing critical behaviors]
Task: [actual task content]
```

This pattern should be formalized into the regular prompt files.

## Line Budget Per File

| File | Current | Target |
|---|---|---|
| `devsteps-40-sprint.prompt.md` | 37 | 50–70 (add enforcement) |
| `devsteps-20-start-work.prompt.md` | 73 | 70–80 (add MUST-DO) |
| `devsteps-10-plan-work.prompt.md` | 233 | ≤120 (trim 50%) |


## Research Backing (Added after web research + subagent analysis)

**OpenAI Practical Guide to Building Agents (2025):**
> *"The role declaration goes in the agent file; the task enforcement stays in the user message."*

This confirms the two-file architecture: agent files define *who* the agent is; prompt files enforce *how* it behaves right now. Currently the prompt files only do the first — they activate the agent without enforcing any behavior.

**Why the direct prompts (`.devsteps/prompts/direct prompt/`) work and regular prompts don't:**

Direct prompts explicitly enforce all three layers:
1. **Read-first gate**: "Start by reading these agent files" — forces the model to load its full protocol before acting
2. **Tool mandate**: "Use #devsteps, #bright-data, #runSubagent" — names the tools explicitly, triggering VS Code's tool picker
3. **Hierarchy enforcement**: "T2 subagents MUST use T3 subagents" — without this, T2 agents execute directly

The regular prompt files have none of these. They say "activate sprint executor" — the model skips straight to action.

**Required additions to each prompt (research-confirmed pattern):**

`devsteps-40-sprint.prompt.md` additions:
- "Before any action: read `.github/agents/devsteps-t1-sprint-executor.agent.md`"
- "Use `#runSubagent` for all T2 dispatch — never execute T2 work inline"
- "Use `#mcp_devsteps_read_mandate_results` after each T2 wave — never read raw T3 files"
- "Use `#bright-data` for any research mandate (T2-research, T2-archaeology web questions)"

`devsteps-20-start-work.prompt.md` additions:
- "MUST DO FIRST: `devsteps/get` the item, create branch, set status `in-progress`"
- "Use `#runSubagent` for all T2 agents — never dispatch T2 inline"

## Updated Line Budget

| File | Current | Target | Net change |
|---|---|---|---|
| `devsteps-40-sprint.prompt.md` | 37 | 55–70 | Add 18–33 lines of enforcement |
| `devsteps-20-start-work.prompt.md` | 73 | 70–80 | Small additions only |
| `devsteps-10-plan-work.prompt.md` | 233 | ≤120 | Cut 113 lines (50%) |

For `devsteps-10-plan-work.prompt.md`: the planning protocol steps are the value-add. Remove the "why" explanations (those are the project's internal documentation), keep the numbered steps, the checklist, and the hierarchy rules.

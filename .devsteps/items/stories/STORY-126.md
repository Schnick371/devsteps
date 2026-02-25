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

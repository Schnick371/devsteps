# Task: Reduce Sprint + Start-Work Prompts to Pure User Triggers

## Problem
`devsteps-40-sprint.prompt.md` contains 150+ lines of execution logic (phase definitions, loop control, triage tables, fallback rules). This belongs in the agent file, not the prompt.

**A prompt should answer: "What does the user want?"  
An agent should answer: "How do we do it?"**

## Changes Required

### `devsteps-40-sprint.prompt.md`
**Before:** 150+ lines with phase logic, loop definitions, triage tables  
**After:** ~20 lines, pure user trigger:

```markdown
---
mode: agent
agent: devsteps-sprint-executor
---

# Sprint Execution

Trigger the DevSteps sprint execution for the current project.

## Parameters (all optional)
- **Item list**: Specific item IDs to include (default: all Q1+Q2 planned items)
- **Focus area**: Specific module, feature, or tag to filter
- **Triage override**: Force QUICK/STANDARD/FULL for all items

## What happens next
The sprint-executor agent autonomously:
1. Analyzes all items via Tier-2 Deep Analysts
2. Determines execution order and triage level per item
3. Executes each item with quality gates
4. Reports outcomes in `.devsteps/` and CHANGELOG
```

### `devsteps-20-start-work.prompt.md`
Same pattern — reduce to: "Start work on item X" trigger.  
All triage logic, mandate dispatch, loop control → REMOVED from prompt, lives in coordinator agent.

## Acceptance Criteria
- [ ] `devsteps-40-sprint.prompt.md` ≤ 30 lines after refactor
- [ ] `devsteps-20-start-work.prompt.md` ≤ 30 lines after refactor
- [ ] NO execution logic (phase definitions, loop bounds) in prompt files
- [ ] Both prompts reference the target agent file by name
- [ ] Prompts only describe user-visible parameters and expected effects
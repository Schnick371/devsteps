# Update Workflow Prompts for Branch Separation

## User Story
As a **DevSteps developer**, I need **clear branch rules in workflow prompts** so that I **never accidentally commit work items to feature branches**.

## Problem
Current prompts don't enforce branch discipline:
- Planning can happen in any branch
- No verification that work items are in main
- Implementation commits can go to wrong branch
- Confusion about where items vs code belong

## Solution
Update 3 prompt files with explicit branch checks and workflows.

## Acceptance Criteria
- [ ] devsteps-plan-work.prompt.md: Step 0 checks main branch
- [ ] devsteps-plan-work.prompt.md: Step 7 commits items to main
- [ ] devsteps-start-work.prompt.md: Step 0 verifies items in main
- [ ] devsteps-start-work.prompt.md: Step 0 creates feature branch
- [ ] devsteps-workflow.prompt.md: Branch verification before commits
- [ ] All prompts document branch strategy clearly
- [ ] Error guidance when on wrong branch

## Tasks
- TASK-157: Update devsteps-plan-work.prompt.md
- TASK-158: Update devsteps-start-work.prompt.md
- TASK-159: Update devsteps-workflow.prompt.md

## Testing
- [ ] Run planning workflow → items committed to main
- [ ] Run start-work workflow → feature branch created
- [ ] Implement code → commits go to feature branch
- [ ] No accidental commits to main during work
- [ ] Clear errors if on wrong branch

## Success Metrics
- Zero work items committed to feature branches
- Clear branch awareness in all workflow steps
- Reduced user confusion
- Consistent team workflow

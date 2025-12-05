# Workflow Branch Strategy: Separate Work Items from Code

## Vision
Enforce clear separation: Work items (project metadata) live in `main`, feature code lives in feature branches until merge.

## Business Value
- **Consistency:** Work items always in main → single source of truth
- **Traceability:** Clear history separation (planning vs implementation)
- **Quality:** No accidental work item commits in feature branches
- **Simplicity:** Clear rules for when to use which branch

## Problem Statement
Current workflow allows work items to land in feature branches, causing:
- Lost work items when branches are abandoned
- Inconsistent item status across branches
- Confusion about which branch contains latest items
- Manual sync required between branches

## Solution
Three-prompt workflow with strict branch enforcement:

1. **devsteps-plan-work.prompt.md:** Planning in `main` only
   - Create work items
   - Link relationships
   - Commit to main
   - NO feature branches yet

2. **devsteps-start-work.prompt.md:** Implementation in feature branches
   - Verify items in main
   - Create/checkout feature branch
   - Implement code
   - Commit to feature branch

3. **devsteps-workflow.prompt.md:** Maintain branch discipline
   - Check branch before commits
   - Important checkpoints only
   - Stay in feature branch
   - NO main branch commits during work

## Scope
- Update 3 prompt files with branch checks
- Add pre-step verifications
- Document branch strategy
- Clarify commit workflows

## Out of Scope
- Automated branch switching
- Git hooks for enforcement
- VS Code extension integration
- Merge workflow automation (future)

## Acceptance Criteria
- [ ] devsteps-plan-work: Enforces main branch for planning
- [ ] devsteps-start-work: Verifies items in main, uses feature branch
- [ ] devsteps-workflow: Maintains feature branch discipline
- [ ] Clear error messages when on wrong branch
- [ ] Documentation updated in all prompts

## Success Metrics
- No work items accidentally committed to feature branches
- Clear branch awareness in all prompts
- Reduced confusion about where items/code belong
- Consistent workflow across team

## Related Work
- SPIKE-003: Git branching strategy research (completed)
- TASK-041: Epic branch management (related pattern)
- STORY-036: Workflow understanding gaps (addresses similar issues)

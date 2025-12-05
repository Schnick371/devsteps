# Update Workflow Prompts with Review/Testing Phase

## Objective
Add explicit testing/review phase between implementation and completion in workflow prompts.

## Changes Required

### devsteps-start-work.prompt.md

**Current Step 6 (Complete):**
```markdown
### 6. Complete

**Quality Gates:**
- Tests pass, build OK, no problems
- Patterns followed, docs updated
- Description updated, paths complete
- Links set, decisions captured

**Commit Workflow:**
- Mark item done via devsteps
- Commit to feature branch with conventional format
```

**New Structure:**
```markdown
### 6. Testing/Review

**Mark Status:**
- Update status to 'review' before testing

**Quality Gates:**
- Run tests: unit, integration, E2E (when applicable)
- Manual testing: verify functionality works
- Build verification: no errors, no warnings
- Code review: patterns followed, docs updated
- Regression check: existing features still work

**If Tests Fail:**
- Return to Step 5 (Implementation)
- Fix issues, repeat testing

### 7. Complete

**Mark Done:**
- All quality gates passed
- Update status to 'done' via devsteps

**Commit Workflow:**
- Commit to feature branch with conventional format
- Push for testing
- Squash merge happens later (manual/PR)
```

### devsteps-workflow.prompt.md

Add section on status progression:

```markdown
## Status Lifecycle

### Standard Progression
draft → planned → in-progress → review → done

### Status Meanings
- **draft**: Created, ready for planning
- **planned**: Scoped, ready to start
- **in-progress**: Active development
- **review**: Testing/validation phase
- **done**: All quality gates passed
- **blocked**: Cannot proceed
- **cancelled**: No longer needed

### Quality Gates (Review Phase)
Before marking 'done':
- ✅ Tests pass (unit, integration, E2E)
- ✅ Build succeeds (no errors)
- ✅ Manual testing complete
- ✅ Documentation updated
- ✅ No regressions
```

## Success Criteria
- Workflow prompts enforce review phase
- Status progression clearly documented
- Quality gates explicit
- Testing requirements before "done"

# Update Status Workflow to Include Review/Testing Phase

## Problem
Current workflow skips validation between implementation and completion:
- Status progression: `draft → in-progress → done` ❌
- Missing: Testing/review phase before marking done
- Risk: Bugs slip through, quality gates bypassed
- Impact: Items marked "done" without verification

## Industry Best Practice (2025 Agile)
**Standard Progression:** `draft → planned → in-progress → review → done`

**Review/Testing Phase Includes:**
- Build verification (no errors)
- Test execution (unit, integration, E2E)
- Manual testing (if applicable)
- Code review (if applicable)
- Documentation updates verified
- Quality gates passed

## Proposed Solution

### Status Progression
```
draft        # Created, not yet started
planned      # Ready to start, dependencies clear
in-progress  # Active development
review       # Implementation complete, testing/validation in progress
done         # All quality gates passed, verified working
blocked      # Cannot proceed (dependency/issue)
cancelled    # No longer needed
obsolete     # Superseded by another item
```

### Workflow Changes

**Current (WRONG):**
```
Step 5: Implementation
Step 6: Complete
  - Mark done
  - Commit
```

**Proposed (CORRECT):**
```
Step 5: Implementation
  - Write code
  - Write/update tests
  - Build and fix errors
  
Step 6: Testing/Review
  - Mark item as 'review' status
  - Run tests (unit, integration, E2E)
  - Manual testing if applicable
  - Verify no regressions
  - Check documentation updated
  
Step 7: Complete
  - Mark done (only after validation passes)
  - Commit with conventional format
  - Move to next item
```

## Changes Required

### 1. Workflow Prompts
**Files:**
- `.github/prompts/devsteps-start-work.prompt.md`
- `.github/prompts/devsteps-workflow.prompt.md`

**Changes:**
- Add Step 6: Testing/Review phase
- Emphasize `review` status usage
- Document quality gates (tests, build, manual validation)
- Update completion criteria

### 2. CLI Hints
**File:** `packages/cli/src/commands/index.ts`

**Current Hints:**
```
💡 Git: git commit -am "feat: completed TASK-XXX"
💡 All implementations of BUG-XXX are complete! Consider closing it.
```

**Proposed Hints:**
```
💡 Next: Test your changes, then: devsteps update TASK-XXX --status review
💡 After testing passes: devsteps update TASK-XXX --status done
💡 Git: git commit -am "feat: completed TASK-XXX"
```

### 3. MCP Tool Descriptions
**File:** `packages/mcp-server/src/tools/`

**Update tool descriptions to mention:**
- Status progression with review phase
- Testing requirements before done
- Quality gates

### 4. Agent Instructions
**File:** `.github/instructions/devsteps.instructions.md`

**Add Section:**
```markdown
## Status Tracking

**Before marking any work item completed:**
- ✅ Mark as 'review' status
- ✅ Run tests (when applicable)
- ✅ Verify build passes
- ✅ Manual testing complete
- ✅ Documentation updated
- ✅ THEN mark as 'done'
```

### 5. Documentation
**File:** `.devsteps/WORKFLOW.md` (create if needed)

Document complete status lifecycle with examples.

## Success Criteria
- ✅ Prompts enforce review/testing phase
- ✅ CLI hints guide status progression
- ✅ MCP tools mention testing requirement
- ✅ Agent instructions updated
- ✅ Status progression documented
- ✅ Quality gates clearly defined

## Benefits
- **Quality Assurance**: Testing happens before "done"
- **Traceability**: Clear when item is being validated
- **Accountability**: Explicit validation step
- **Process Improvement**: Matches industry standards
- **Risk Reduction**: Bugs caught before merge

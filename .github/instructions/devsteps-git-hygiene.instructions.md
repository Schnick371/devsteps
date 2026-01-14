---
applyTo: "**"
description: "Git branch management and merge discipline for DevSteps workflow"
---

# Git Branch Management & Merge Discipline

## Core Principle
**Feature branches are ephemeral** - they exist only during active development and are deleted immediately after merge.

## Branch Lifecycle

**Creation:**
- Created when work begins on work item
- Named by type and ID: `story/<ID>`, `epic/<ID>`, `bug/<ID>`, `task/<ID>`
- Checked for existence before creating new

**Active Development:**
- All implementation commits go to feature branch
- Work item status updates (`in-progress`, `review`) committed to feature branch
- `.devsteps/` changes remain on feature branch during work

**Completion & Integration:**
- Quality gates pass → mark work item `done`
- Final commit to feature branch
- **MANDATORY:** Merge to main immediately
- **MANDATORY:** Delete branch after successful merge

**Merge Protocol:**
- Use `--no-ff` flag to preserve feature branch context in history
- Ensure commit message includes `Implements: <ID>` footer
- Verify `.devsteps/` status synced to main
- Push merged main before deleting branch

## Prohibited Patterns

**Never:**
- Leave feature branches unmerged after completion
- Keep feature branches "just in case"
- Create archive branches without exceptional justification
- Delay merge waiting for "later"
- Batch multiple work items in single branch

## Branch Age Monitoring

**Red Flag Thresholds:**
- Feature branch older than 1 day without merge → investigate immediately
- Feature branch with `done` status but not merged → workflow failure
- Multiple unmerged branches → process breakdown

**Weekly Review:**
- List all feature branches with last commit date
- Identify stale branches (>1 day old)
- Merge or delete immediately

## Exceptional Cases

**Archive Naming (Rare):**
- `archive/merged/<name>` - Historical reference needed despite merge
- `archive/abandoned/<name>` - Work cancelled before completion
- `archive/superseded/<name>` - Replaced by different approach

**Criteria for Archiving:**
- Complex implementation requiring future reference
- Learning material for similar future work
- Audit trail for cancelled initiatives

**Default:** Delete branch after merge. Archive only with clear justification.

## Enforcement

**Pre-Commit Validation:**
- Check for unmerged feature branches
- Warn if branch age exceeds threshold
- Require justification for archive naming

**Git Aliases (Recommended):**
```gitconfig
[alias]
    # Merge and delete in one operation
    merge-done = "!f() { git merge --no-ff $1 && git branch -d $1; }; f"
    
    # List stale branches
    stale = "for-each-ref --sort=-committerdate refs/heads/ --no-merged main --format='%(refname:short) %(committerdate:relative)'"
```

## Why This Matters

**Benefits:**
- Clean repository (minimal branch clutter)
- Clear history (merged work visible)
- Fast workflow (no accumulation)
- Early detection of workflow failures

**Consequences of Ignoring:**
- Lost work (orphaned branches)
- Merge conflicts (divergent history)
- Confusion (which branch is current?)
- Process breakdown (unmerged branches accumulate)

## Integration with DevSteps

**Workflow Alignment:**
- Work items planned in `main`
- Implementation in feature branch
- Merge completes work item lifecycle
- Immediate deletion maintains hygiene

**Status Synchronization:**
- `.devsteps/` changes committed to feature branch during work
- Merged to main when work complete
- Single source of truth (main) after merge

---

**See:** devsteps-start-work.prompt.md, devsteps-workflow.prompt.md

---
applyTo: "**"
description: "Git branch management and merge discipline for DevSteps workflow"
---

# Git Branch Management & Merge Discipline

## Core Principle
**Feature branches are ephemeral** - they exist only during active development and are archived locally after merge.

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
- **MANDATORY:** Cleanup after successful merge

**Merge Protocol:**
- Use `--no-ff` flag to preserve feature branch context in history
- Ensure commit message includes `Implements: <ID>` footer
- Verify `.devsteps/` status synced to main
- Push merged main before cleanup

**Branch Cleanup After Merge:**
- **Remote**: Delete immediately (keeps remote repository clean)
- **Local**: Rename to `archive/merged/<name>` (preserves local history for reference)
- **Benefit**: Clean remote + local forensics available

**Archive Naming Patterns:**
- `archive/merged/<name>` - Successfully completed and merged (default for all completed work)
- `archive/abandoned/<name>` - Work cancelled before completion
- `archive/superseded/<name>` - Replaced by different approach

## Prohibited Patterns

**Never:**
- Leave feature branches unmerged after completion
- Keep active feature branches "just in case"
- Leave remote branches after merge (delete remote immediately)
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
- Merge immediately or archive as abandoned

## Enforcement

**Pre-Commit Validation:**
- Check for unmerged feature branches
- Warn if branch age exceeds threshold
- Detect remote branches that should be deleted

**Git Aliases (Recommended):**
```gitconfig
[alias]
    # Merge, archive locally, delete remote
    merge-done = "!f() { \
        git merge --no-ff $1 && \
        git branch -m $1 archive/merged/$1 && \
        git push origin --delete $1; \
    }; f"
    
    # List stale branches
    stale = "for-each-ref --sort=-committerdate refs/heads/ --no-merged main --format='%(refname:short) %(committerdate:relative)'"
    
    # List archived branches
    archived = "branch --list 'archive/*'"
```

## Why This Matters

**Benefits:**
- Clean remote repository (no stale branches visible to team)
- Local history preserved (implementation review, learning)
- Clear naming convention (no ambiguity)
- Fast workflow (automatic cleanup process)
- Early detection of workflow failures

**Consequences of Ignoring:**
- Remote clutter (confusing team members)
- Lost implementation context (no local reference)
- Merge conflicts (divergent history)
- Process breakdown (unmerged branches accumulate)

## Integration with DevSteps

**Workflow Alignment:**
- Work items planned in `main`
- Implementation in feature branch
- Merge completes work item lifecycle
- Immediate cleanup (remote delete + local archive) maintains hygiene

**Status Synchronization:**
- `.devsteps/` changes committed to feature branch during work
- Merged to main when work complete
- Single source of truth (main) after merge
- Local archive preserves implementation forensics

---

**See:** devsteps-start-work.prompt.md, devsteps-workflow.prompt.md

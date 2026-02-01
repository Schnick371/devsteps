---
applyTo: "**"
description: "Git branch management and merge discipline for DevSteps workflow"
---

# Git Branch Management & Merge Discipline

## Core Principles

**Feature branches are ephemeral** - exist only during active development.

**Trunk-Based Development:** Only Story/Task/Bug/Spike get branches. Epic/Requirement exist in DevSteps only.

## Branch Lifecycle

**Creation:**
- Named by type and ID: `<type>/<ID>-<slug>`
- Short-lived (merge within days, not weeks)
- Check existence before creating new

**Active Development:**
- All code commits to feature branch
- `.devsteps/` status updates in feature branch (tracks work-in-progress)
- Planning in main branch

**Completion:**
- Quality gates pass → mark `done`
- Merge to main with `--no-ff` flag
- Commit message includes `Implements: <ID>` footer
- **MANDATORY: Rename branch to `archive/<branch-name>` immediately after merge**
- Push merged main

## Merge Strategy

**Always use merge (`--no-ff`):**
- Preserves feature branch context in history
- Required for DevSteps traceability
- Enables rollback if needed

**Never rebase:**
- After pushing to remote (rewrites public history)
- Main/master/production branches
- Shared branches (causes divergence)

**Use rebase only for:**
- Local cleanup before PR
- Updating feature branch with latest main
- Strictly local, never-pushed branches

## Pre-Merge Validation

- Quality gates pass (tests, build, linting, type checks)
- DevSteps status is `done`
- No merge conflicts with main
- Branch name matches DevSteps ID pattern
- Commit message has `Implements: <ID>` footer

## Branch-Status Consistency Checks

**Detect unmerged branches with completed work:**
- Check feature branches for items marked `done` in `.devsteps/`
- Verify corresponding branch merged to main (not just status update)
- Alert when branch exists but item shows `done` (incomplete workflow)

## Conflict Resolution

- Merge main into feature branch locally
- Test thoroughly after resolution
- Document complex resolutions in commit
- Re-run full test suite
- Never auto-accept without understanding changes

## Branch Retention After Merge

**MANDATORY Post-Merge:**
- Rename branch to `archive/<branch-name>` immediately
- Keep archived branch locally for verification period
- Prevents active branch clutter while maintaining history

**Deletion Timeline:**
- Delete archived branches after verification complete
- Manual decision based on parent Epic/Story status
- Typical retention period varies by project needs

**Sync Strategy:**
- Periodically merge main into archived branches
- Prevents divergence during retention period
- Enables clean comparison with current state

## Worktree Guidelines

Worktrees enable parallel work without checkout overhead.

**Use for:**
- Hotfixes during feature development
- Testing on one branch while coding another
- AI agents on parallel tasks

**DevSteps Integration:**
- Avoid simultaneous DevSteps operations (index conflicts)
- Merge sequentially, not parallel
- Delete when work item reaches `done`

## Integration with DevSteps

- **Planning** in `main` (creation, linking, initial status)
- **Status updates** in feature branch (in-progress, review, done)
- Implementation in feature branch (code + status changes)
- Merge brings `.devsteps/` status to main
- Archive rename maintains hygiene
- Single source of truth (main) after merge

---

**See:** devsteps-start-work.prompt.md, devsteps-workflow.prompt.md

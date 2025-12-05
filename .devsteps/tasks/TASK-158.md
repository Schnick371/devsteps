# Update devsteps-start-work.prompt.md

## Objective
Verify work items in `main`, switch to `main`, create/checkout feature branch for implementation.

## Current Problem
- Step 0 creates branch but doesn't verify work items in main first
- No explicit switch to main before branching
- Commits go to feature branch (correct) but no verification workflow

## Required Changes

### 1. Update Step 0: Prepare → Branch Strategy
```markdown
## Step 0: Branch Strategy (MANDATORY)

**BEFORE selecting work item:**

### Phase 1: Verify Work Items in Main
\`\`\`bash
git checkout main
git pull origin main  # Sync latest work items
\`\`\`

**Verify work item exists:**
\`\`\`
#mcp_devsteps_search <work-item-id>
\`\`\`
- ❌ Work item not found? → Run devsteps-plan-work.prompt.md first
- ✅ Work item found? → Proceed to Phase 2

### Phase 2: Create/Checkout Feature Branch

**Branch naming:**
- Story/Epic: `story/<ID>` or `epic/<ID>`
- Bug: `bug/<ID>`
- Task (standalone): `task/<ID>`
- Task (part of story): Use parent story branch

**Check existing branches:**
\`\`\`bash
git branch --list 'story/*' 'bug/*' 'epic/*' 'task/*'
\`\`\`

**Create new or checkout existing:**
\`\`\`bash
# New branch
git checkout -b story/STORY-XXX

# Existing branch
git checkout story/STORY-XXX
\`\`\`

### Phase 3: Verify Clean State
\`\`\`bash
git status
\`\`\`
- ❌ Uncommitted changes? → Commit or stash first
- ✅ Clean working tree? → Proceed to Step 1

**CRITICAL:**
- Work items MUST be in `main` (from devsteps-plan-work.prompt.md)
- Feature branch is for CODE ONLY
- All commits during implementation go to feature branch
```

### 2. Update Step 6: Complete
```markdown
## Step 6: Complete

**Mark work item done:**
\`\`\`
#mcp_devsteps_update <ID> --status done
\`\`\`

**Commit to FEATURE BRANCH:**
\`\`\`bash
git add .
git commit -m "feat(<ID>): <Brief description>

<Implementation details>

Implements: <ID>"
\`\`\`

**CRITICAL:**
- ✅ Commit to feature branch (story/*, bug/*, etc.)
- ❌ DO NOT merge to main yet
- ❌ DO NOT commit work item status changes (already in main)

**Status Update:**
- Work item status change stored in `.devsteps/` 
- Will be synced to main later (manual or via separate workflow)

**Next Steps:**
1. Push feature branch: `git push origin <branch-name>`
2. Test/validate implementation
3. When ready: Squash merge to main (manual or via PR)
4. Update work item in main after merge
```

### 3. Add Mission Clarification
```markdown
## Mission

**Start implementation** - review planned work, select highest priority, begin structured development.

**Branch Strategy:**
- Work items: Already in `main` (from devsteps-plan-work.prompt.md)
- Implementation: Feature branch (this prompt creates/uses it)
- Commits: Feature branch ONLY during work
- Merge: Squash to main when complete (separate step)

**Critical Rule:** Work items and code live in different branches until final merge.
```

## Success Criteria
- [ ] Step 0 verifies work items in main
- [ ] Step 0 switches to main before branching
- [ ] Step 0 creates/checks out feature branch
- [ ] Step 6 commits to feature branch only
- [ ] Clear separation: items (main) vs code (feature)
- [ ] Mission statement updated

## Affected Files
- `.github/prompts/devsteps-start-work.prompt.md`

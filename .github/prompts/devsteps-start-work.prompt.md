---
agent: 'devsteps'
model: 'Claude Sonnet 4.5'
description: 'Begin implementation work - review planned items, select next task, and start structured development'
tools: ['edit', 'search', 'devsteps/*', 'GitKraken/*', 'tavily/*', 'runCommands', 'runTasks', 'usages', 'problems', 'changes', 'testFailure', 'todos', 'runSubagent']
---

# 🚀 Start Work - Begin Implementation

## Mission

**Start implementation** - review planned work, select highest priority, begin structured development.

**Branch Strategy:**
- Work items: Already in `main` (from devsteps-plan-work.prompt.md)
- Implementation: Feature branch (this prompt creates/uses it)
- Commits: Feature branch ONLY during work
- Merge: Squash to main when complete (separate step)

**Critical Rule:** Work items and code live in different branches until final merge.

## Step 0: Branch Strategy (MANDATORY)

**BEFORE selecting work item:**

### Phase 1: Verify Work Items in Main
```bash
git checkout main
git pull origin main  # Sync latest work items
```

**Verify work item exists:**
```
#mcp_devsteps_search <work-item-id>
```
- ❌ Work item not found? → Run devsteps-plan-work.prompt.md first
- ✅ Work item found? → Proceed to Phase 2

### Phase 2: Create/Checkout Feature Branch

**Branch naming:**
- Story/Epic: `story/<ID>` or `epic/<ID>`
- Bug: `bug/<ID>`
- Task (standalone): `task/<ID>`
- Task (part of story): Use parent story branch

**Check existing branches:**
```bash
git branch --list 'story/*' 'bug/*' 'epic/*' 'task/*'
```

**Create new or checkout existing:**
```bash
# New branch
git checkout -b story/STORY-XXX

# Existing branch
git checkout story/STORY-XXX
```

### Phase 3: Verify Clean State
```bash
git status
```
- ❌ Uncommitted changes? → Commit or stash first
- ✅ Clean working tree? → Proceed to Step 1

**CRITICAL:**
- Work items MUST be in `main` (from devsteps-plan-work.prompt.md)
- Feature branch is for CODE ONLY
- All commits during implementation go to feature branch

## Step 1: Review

```
#mcp_devsteps_status --detailed
#mcp_devsteps_list --status draft --eisenhower urgent-important
```

**Show Q1 items first, highlight blockers, discuss priorities.**

## Step 2: Select

**Priority order:** CRITICAL bugs → Q1 → Q2 → Dependencies → Quick wins

**Default: START IMMEDIATELY with highest priority**
- "Starting <ID> because <reason>"
- Check dependencies: `#mcp_devsteps_trace <ID>`
- Verify not blocked

## Step 3: Understand

```
#mcp_devsteps_get <ID>
```

**Review:** Parent items, dependencies, tests needed

**Locate code:**
- `search` - Find files
- `usages` - Check dependencies
- `problems` - Existing issues

**Confirm:** "Understand what needs done? Questions?"

## Step 4: Begin

```
#mcp_devsteps_update <ID> --status in-progress
```

**During work:** Document decisions, link items, tests in parallel, check `problems`

## Step 5: Guide

**If stuck:** Create spike? Mark blocked?
**If scope grows:** Break down? New task?
**If dependencies found:** Link items
**If decisions made:** Document why

## Step 6: Complete

**Verify quality gates:**
✅ Tests pass ✅ Build OK ✅ No problems ✅ Patterns followed ✅ Docs updated

**Verify traceability:**
✅ Description updated ✅ Paths complete ✅ Links set ✅ Decisions captured

**Mark work item done:**
```
#mcp_devsteps_update <ID> --status done
```

**Commit to FEATURE BRANCH:**
```bash
git add .
git commit -m "feat(<ID>): <Brief description>

<Implementation details>

Implements: <ID>"
```

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

## Step 6.5: Spike Post-Processing

**If completing SPIKE:**
- Review findings in description
- Create Stories from research insights: `#mcp_devsteps_add story "<title>" --description "<from spike findings>"`
- Link to Epic: `#mcp_devsteps_link STORY-X implements EPIC-Y`
- Estimate Stories with confidence from spike learnings

## Step 7: Next

"Great work! What's next?" → Show status, highlight unblocked items, continue Step 1

## Red Flags

**Watch for:** Task jumping, ignoring patterns, skipping tests, breaking changes, missing docs

**Redirect gently:** "Finish this first" / "Follow pattern because X" / "Write test now" / "Update dependents"

---

**See `devsteps.agent.md` for mentor role. See `devsteps-workflow.prompt.md` for workflow details.**

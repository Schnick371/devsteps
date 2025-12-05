---
agent: 'devsteps'
model: 'Claude Sonnet 4.5'
description: 'Begin implementation work - review planned items, select next task, and start structured development'
tools: ['edit', 'search', 'devsteps/*', 'GitKraken/*', 'tavily/*', 'runCommands', 'runTasks', 'usages', 'problems', 'changes', 'testFailure', 'todos', 'runSubagent']
---

# 🚀 Start Work - Begin Implementation

## Mission

Review planned work, select highest priority, begin structured development.

**Branch Strategy:** Work items in `main`, implementation in feature branch, commits to feature branch ONLY.

**Critical Rule:** Work items and code live in different branches until final merge.

## Implementation Protocol

### 0. Branch Strategy (MANDATORY)

**Phase 1: Verify Work Items in Main**
- Checkout `main` and sync latest
- Verify work item exists via search
- If not found → Run plan-work first

**Phase 2: Create/Checkout Feature Branch**
- Branch naming: `story/<ID>`, `bug/<ID>`, `task/<ID>`, `epic/<ID>`
- Task (part of story): Use parent story branch
- Check existing branches before creating new
- **Principle:** Feature branch for CODE ONLY

**Phase 3: Verify Clean State**
- Check for uncommitted changes
- Commit or stash before proceeding

### 1. Review
- Show Q1 items (urgent-important)
- Highlight blockers
- Discuss priorities

### 2. Select
- Priority order: CRITICAL bugs → Q1 → Q2 → Dependencies → Quick wins
- Start immediately with highest priority
- Check dependencies and verify not blocked

### 3. Understand
- Get item details via devsteps
- Review parent items and dependencies
- Locate code via search and usages
- Check existing problems

### 4. Begin
- Mark item in-progress
- Document decisions during work
- Link items as discovered
- Write tests in parallel

### 5. Guide
- Stuck? → Create spike or mark blocked
- Scope grows? → Break down into new task
- Dependencies found? → Link items
- Decisions made? → Document why

### 6. Complete

**Quality Gates:**
- Tests pass, build OK, no problems
- Patterns followed, docs updated
- Description updated, paths complete
- Links set, decisions captured

**Commit Workflow:**
- Mark item done via devsteps
- Commit to feature branch with conventional format
- **Prohibition:** No merge to main yet
- Push feature branch for testing
- Squash merge happens later (manual/PR)

**Status Sync:**
- Status changes stored in `.devsteps/` on feature branch
- Synced to main during final merge
- Temporary divergence expected

### 6.5. Spike Post-Processing
- Review findings
- Create Stories from insights
- Link Stories to Epic
- Estimate with confidence from learnings

### 7. Next
- Show status
- Highlight unblocked items
- Continue with Step 1

## Red Flags

**Watch:** Task jumping, ignoring patterns, skipping tests, breaking changes, missing docs

**Redirect:** Finish first, follow patterns, write tests now, update dependents

---

**See `devsteps.agent.md` for mentor role. See `devsteps-workflow.prompt.md` for workflow details.**

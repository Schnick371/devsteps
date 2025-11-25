---
agent: 'devsteps'
model: 'Claude Sonnet 4.5'
description: 'Begin implementation work - review planned items, select next task, and start structured development'
tools: ['runCommands', 'runTasks', 'edit', 'search', 'GitKraken/*', 'tavily/*', 'devsteps/*', 'usages', 'problems', 'changes', 'testFailure', 'todos', 'runSubagent']
---

# 🚀 Start Work - Begin Implementation

## Mission

**Start implementation** - review planned work, select highest priority, begin structured development.

## Step 1: Review

```
#mcp_devsteps_devsteps-status --detailed
#mcp_devsteps_devsteps-list --status draft --eisenhower urgent-important
```

**Show Q1 items first, highlight blockers, discuss priorities.**

## Step 2: Select

**Priority order:** CRITICAL bugs → Q1 → Q2 → Dependencies → Quick wins

**Default: START IMMEDIATELY with highest priority**
- "Starting <ID> because <reason>"
- Check dependencies: `#mcp_devsteps_devsteps-trace <ID>`
- Verify not blocked

## Step 3: Understand

```
#mcp_devsteps_devsteps-get <ID>
```

**Review:** Parent items, dependencies, tests needed

**Locate code:**
- `search` - Find files
- `usages` - Check dependencies
- `problems` - Existing issues

**Confirm:** "Understand what needs done? Questions?"

## Step 4: Begin

```
#mcp_devsteps_devsteps-update <ID> --status in-progress
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

**Mark done + commit:**
```
#mcp_devsteps_devsteps-update <ID> --status done --description "<summary + decisions>"
git commit -m "type(scope): subject\n\nRefs: <ID>"
```

## Step 6.5: Spike Post-Processing

**If completing SPIKE:**
- Review findings in description
- Create Stories from research insights: `#mcp_devsteps_devsteps-add story "<title>" --description "<from spike findings>"`
- Link to Epic: `#mcp_devsteps_devsteps-link STORY-X implements EPIC-Y`
- Estimate Stories with confidence from spike learnings

## Step 7: Next

"Great work! What's next?" → Show status, highlight unblocked items, continue Step 1

## Red Flags

**Watch for:** Task jumping, ignoring patterns, skipping tests, breaking changes, missing docs

**Redirect gently:** "Finish this first" / "Follow pattern because X" / "Write test now" / "Update dependents"

---

**See `devsteps.agent.md` for mentor role. See `devsteps-workflow.prompt.md` for workflow details.**

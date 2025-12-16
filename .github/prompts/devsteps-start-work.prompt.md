---
agent: 'devsteps-coordinator'
model: 'Claude Sonnet 4.5'
description: 'Begin implementation work - review planned items, select next task, and start structured development'
tools: ['vscode/getProjectSetupInfo', 'vscode/newWorkspace', 'vscode/runCommand', 'vscode/vscodeAPI', 'vscode/extensions', 'execute/testFailure', 'execute/getTerminalOutput', 'execute/runTask', 'execute/getTaskOutput', 'execute/runInTerminal', 'execute/runTests', 'read/problems', 'read/readFile', 'edit/createDirectory', 'edit/createFile', 'edit/editFiles', 'search', 'web/fetch', 'copilot-container-tools/*', 'tavily/*', 'upstash/context7/*', 'agent', 'devsteps/*', 'todo']
---

# 🚀 Start Work - Begin Implementation

## Mission

Review planned work, select highest priority, begin structured development.

**Branch Strategy:** Work items in `main`, implementation in feature branch, commits to feature branch ONLY.

**Critical Rule:** Work items and code live in different branches until final merge.

## Implementation Protocol

### 1. Branch Strategy (MANDATORY)

**Phase 1: Verify DevSteps Work Items in Main**
**Phase 2: Create/Checkout Feature Branch**
- Branch naming: `story/<ID>`, `epic/<ID>`
- Check existing branches before creating new
- **Principle:** Feature branch for CODE ONLY

**Phase 3: Verify Clean State**
- Commit or stash before proceeding

### 2. Review
- Show Q1 items (urgent-important)
- Highlight blockers
- Discuss priorities

### 3. Select
- Priority order: CRITICAL bugs → Q1 → Quick wins → Q2 → Dependencies → Q3 → Q4
- Start immediately with highest priority
- Check dependencies and verify not blocked

### 4. Understand
- Get item details via devsteps
- Review parent items and dependencies
- Locate code via search and usages
- Check existing problems

### 5. Begin
- Mark item in-progress
- Document decisions during work
- Link items as discovered
- Write tests in parallel

### 6. Guide
- Stuck? → Create spike or mark blocked
- Scope grows? → Break down into new task
- Dependencies found? → Link items
- Decisions made? → Document why

### 7. Testing/Review
**DevSteps Status:** `in-progress` → `review`  
**Quality Gates:** Tests pass, build succeeds, manual testing, docs updated, no regressions *(see devsteps-workflow.prompt.md)*  
**If Fail:** Return to Step 6

### 8. Complete
**DevSteps Status:** `review` → `done` (all gates passed)  
**SCM Commit:** Feature branch, conventional format, footer `Implements: ID`  
**Prohibition:** No merge to main yet

**Status Sync:** `.devsteps/` on feature branch → synced during final merge

**Branch Tagging:** Mark completion status: `archive/merged/` (done), `archive/abandoned/` (cancelled), `archive/superseded/` (obsolete). Keep branch for implementation history.

### 8.5. Spike Post-Processing
- Review findings
- Create Stories from insights
- Link Stories to Epic
- Estimate with confidence from learnings

### 9. Next
- Show status
- Highlight unblocked items
- Continue with Step 1

## Red Flags

**Watch:** Task jumping, ignoring patterns, skipping tests, breaking changes, missing docs

**Redirect:** Finish first, follow patterns, write tests now, update dependents

---

**See `devsteps.agent.md` for mentor role. See `devsteps-workflow.prompt.md` for workflow details.**

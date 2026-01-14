---
agent: 'devsteps'
model: 'Claude Sonnet 4.5'
description: 'Begin implementation work - review planned items, select next task, and start structured development'
tools: ['vscode/getProjectSetupInfo', 'vscode/newWorkspace', 'vscode/runCommand', 'vscode/vscodeAPI', 'vscode/extensions', 'execute/testFailure', 'execute/getTerminalOutput', 'execute/runTask', 'execute/getTaskOutput', 'execute/runInTerminal', 'execute/runTests', 'read/problems', 'read/readFile', 'edit/createDirectory', 'edit/createFile', 'edit/editFiles', 'search', 'web/fetch', 'devsteps/*', 'copilot-container-tools/*', 'playwright/*', 'tavily/*', 'upstash/context7/*', 'agent', 'todo']
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
- Priority order: CRITICAL bugs → Q1 → Q2 → Dependencies → Quick wins
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

### 8. Complete & Integrate
**DevSteps Status:** `review` → `done` (all gates passed)  
**SCM Commit:** Feature branch, conventional format, footer `Implements: ID`  
**Integration:** Merge to main, sync devsteps status, cleanup branch

**Merge Protocol:**
- Verify all quality gates passed
- Merge feature branch to main (--no-ff for traceability)
- Push merged main
- Delete feature branch locally and remotely

**Status Sync:** `.devsteps/` committed to main during merge

**Branch Lifecycle:** Feature branches are temporary - merge when done, delete immediately. Archive naming (`archive/merged/`, `archive/abandoned/`, `archive/superseded/`) only for exceptional cases requiring historical reference.

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

**Watch:** Task jumping, ignoring patterns, skipping tests, breaking changes, missing docs, unmerged branches

**Redirect:** Finish first, follow patterns, write tests now, update dependents, merge immediately

**Unmerged Branch Alert:** Feature branches older than 1 day without merge indicate workflow failure. Investigate and resolve immediately.

---

**See `devsteps.agent.md` for mentor role. See `devsteps-workflow.prompt.md` for workflow details.**

---
agent: 'devsteps'
model: 'Claude Sonnet 4.5'
description: 'Begin implementation work - review planned items, select next task, and start structured development'
tools: ['vscode/extensions', 'vscode/getProjectSetupInfo', 'vscode/newWorkspace', 'vscode/runCommand', 'vscode/vscodeAPI', 'execute/getTerminalOutput', 'execute/runTask', 'execute/runTests', 'execute/testFailure', 'execute/runInTerminal', 'read/terminalSelection', 'read/terminalLastCommand', 'read/getTaskOutput', 'read/problems', 'read/readFile', 'agent', 'edit/createDirectory', 'edit/createFile', 'edit/editFiles', 'search', 'web/fetch', 'devsteps/*', 'playwright/*', 'tavily/*', 'todo', 'prisma.prisma/prisma-migrate-status', 'prisma.prisma/prisma-migrate-dev', 'prisma.prisma/prisma-migrate-reset', 'prisma.prisma/prisma-studio', 'prisma.prisma/prisma-platform-login', 'prisma.prisma/prisma-postgres-create-database']
---

# 🚀 Start Work - Begin Implementation

## Mission

Review planned work, select highest priority, begin structured development.

**Branch Strategy:** Work item **planning** in `main`, **status updates + code** in feature branch.

**Critical Rule:** Planning (main) → Implementation + Status (feature) → Merge (both to main).

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
- Mark item in-progress (`#mcp_devsteps_update <ID> --status in-progress` in feature branch)
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
**Integration:** Merge to main, sync devsteps status, retain branch 8+ weeks

**Commit Discipline (CRITICAL):**
- **Batch related changes:** Collect all changes for one logical unit before committing
- **Wait for user approval:** Present changes, get confirmation BEFORE commit
- **No premature commits:** Don't commit after every small edit
- **Example:** If updating multiple instruction files for same topic → stage all, commit once
- **If already committed prematurely:** Use `git reset HEAD~1` to undo, batch properly

**Merge Protocol:**
- Verify all quality gates passed
- Merge feature branch to main (--no-ff for traceability)
- Push merged main
- **Branch Retention:** Keep branch locally 8+ weeks (see devsteps-git-hygiene.instructions.md)
- **Sync Retained Branch:** After merge, immediately sync retained branch with main to prevent divergence
  - Checkout retained branch, merge main with --no-ff, return to main
  - Rationale: Subsequent main commits (docs, other merges) cause retained branches to diverge
  - Prevents stale branches, maintains traceability during verification period

**Status Sync:** `.devsteps/` status changes merge from feature branch to main (status progression captured in git history)

**Branch Lifecycle:** Feature branches retained locally for 8+ weeks. Delete only after Epic/Story marked `verified`/`closed`. Archive tags (`archive/<branch-name>`) only for unmerged experimental work.

**Why Status in Feature Branch:** Git history shows exact moment item progressed (in-progress → review → done), providing audit trail and branch-status alignment.

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

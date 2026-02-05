---
agent: 'devsteps'
model: 'Claude Sonnet 4.5'
description: 'Begin implementation work - review planned items, select next task, and start structured development'
tools: ['vscode/runCommand', 'execute/getTerminalOutput', 'execute/awaitTerminal', 'execute/killTerminal', 'execute/runTask', 'execute/runNotebookCell', 'execute/testFailure', 'execute/runInTerminal', 'read', 'agent', 'playwright/*', 'tavily/*', 'upstash/context7/*', 'edit', 'search', 'web', 'devsteps/*', 'todo']
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

**The Review Phase Gateway:**

**Purpose:** Provide testing/refinement window before permanence.

**Copilot Behavior in Review:**
- Present implementation for user inspection
- Wait for explicit user confirmation before advancing
- Accept feedback and make refinements while staying in `review`
- Only mark `done` after user approves or quality gates pass
- NEVER auto-commit at this stage

**When to Commit:**
- User explicitly approves
- All quality gates confirmed passed
- Review validation complete

**Quality Gates Checklist System:**

**Core Principle:** Quality gates ensure work items meet standards before advancing. Checklists embedded in work item descriptions provide transparent validation criteria.

**Checklist Management:**
- Located in work item description (markdown format: `- [ ]` / `- [x]`)
- Updated via `#mcp_devsteps_update` or `#manage_todo_list`
- Visible in DevSteps trace and status views

**Quality Criteria Vary by Type:**
- **Story**: Acceptance criteria met, tested, no regressions, documentation updated
- **Task**: Implementation complete, tests pass, type checks clean, linting pass
- **Bug**: Root cause identified, fix validated, regression tests added, no side effects
- **Spike**: Research objective achieved, findings documented, Stories created

**Pre-Merge Validation (All Types):**
- Feature branch merged to main
- Build and tests pass on main branch
- Documentation reflects changes
- No uncommitted changes

**Copilot Agent Responsibilities:**
- Generate appropriate checklist when creating work items
- Customize checklist based on work scope
- Verify completion before marking `done`
- Warn if advancing with incomplete checklist

**Why Checklists Matter:**
- Transparent validation criteria
- Prevents premature "done" status
- Provides audit trail
- Aligns Copilot behavior with quality standards

**Bug Status Lifecycle:**

**Core Principle:** Bug items describe PROBLEMS, never solutions. The fix implementation belongs to Tasks that implement the Bug.

**Bug Lifecycle:**
- **draft**: Initial report with reproduction steps
- **planned**: Prioritized, root cause analyzed
- **blocked**: Actively blocking a Story
- **done**: Fix merged, technically complete
- **verified**: Production-tested, no regressions (manual)

**Task Lifecycle (Bug Fix):**
- **draft** → **planned** → **in-progress** → **review** → **done** → (verified)

**Epic/Story Final Status:**
- **done**: All child items completed and merged
- **verified**: Manually confirmed by developer after production validation
- **closed**: Final archival status (8+ weeks, all verified)

**Status Progression:**
1. Code merged → `done` (automatic)
2. Production tested → `verified` (manual, 1-8 weeks)
3. Long-term validation → `closed` (manual, 8+ weeks)

**Developer Decision Points:**
- `done`: AI can set automatically after merge
- `verified`: Developer sets manually after production testing
- `closed`: Developer sets manually for final Epic/Story closure

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
- **Branch Retention:** Keep branch locally 8+ weeks (see devsteps-commit-format.instructions.md)
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

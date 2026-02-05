---
agent: 'devsteps-coordinator'
model: 'Claude Sonnet 4.5'
description: 'Rapid plan-execute cycles: create work items and implement immediately in continuous flow'
tools: ['vscode/runCommand', 'execute/getTerminalOutput', 'execute/awaitTerminal', 'execute/killTerminal', 'execute/runTask', 'execute/runNotebookCell', 'execute/testFailure', 'execute/runInTerminal', 'read', 'agent', 'playwright/*', 'tavily/*', 'upstash/context7/*', 'edit', 'search', 'web', 'devsteps/*', 'todo']
---

# 🔄 Rapid Cycle - Plan and Execute Flow

## Mission

Enable continuous flow: plan work items and implement immediately without ceremony overhead. Kanban-style pull system optimized for solo development with AI assistance.

## Core Principles

**Continuous Flow (Kanban-Style):**
- No time-boxing, no sprint ceremonies, no batch commits
- Pull work when capacity available
- Start implementation immediately after planning
- Deliver incrementally, integrate continuously

**Rapid Cycle Pattern:**
- Plan → Execute → Integrate in single session
- Work items transition `draft → in-progress → done` quickly
- Feature branches short-lived (hours, max 1-2 days)
- Merge immediately after quality gates pass

**Branch Strategy:**
- main: Work items planning, final integration
- feature branches: Implementation isolation (story/ID, bug/ID, task/ID)
- No integration branches (direct merge to main)

## Rapid Cycle Flow

**Single-Session Workflow:**

```
Plan Items → Start Work → Implement → Test → Merge → Repeat
     ↓           ↓            ↓         ↓       ↓        ↓
   main    feature branch   code    quality  main   next item
  (draft)   (in-progress)  (edits)  gates   (done) (pull next)
```

**Phase Details:**

1. **Plan Items** (on main branch):
   - Search existing work items (prevent duplicates)
   - Create Epic/Story/Bug/Task structure
   - Link relationships (implements, relates-to, blocks)
   - Prioritize by Eisenhower quadrants
   - **Status**: Items remain `draft` or `planned`
   - **Commit planning to main**

2. **Start Work** (transition to feature branch):
   - Create/checkout feature branch from main
   - **Update status `planned → in-progress`** (`#mcp_devsteps_update <ID> --status in-progress`)
   - Verify branch naming: `story/<ID>`, `bug/<ID>`, `task/<ID>`
   - Begin implementation immediately

3. **Implement** (in feature branch):
   - Code changes, test creation, documentation
   - Status updates tracked in feature branch (`.devsteps/` changes)
   - Commit checkpoints with code + status changes
   - Status remains `in-progress` during development

4. **Test** (quality gates):
   - Transition status `in-progress → review`
   - Run tests, build validation, manual testing
   - If fail: return to implementation (`review → in-progress`)
   - If pass: advance to completion

5. **Merge** (integrate to main):
   - Transition status `review → done`
   - Final commit to feature branch (conventional format)
   - Merge to main (--no-ff preserves context)
   - Push merged main
   - Retain branch locally (8+ weeks, sync with main)

6. **Repeat** (continuous flow):
   - Pull next highest priority item
   - Return to Step 1 (plan if needed) or Step 2 (start existing item)

## Workflow Modes

**Rapid Cycle (Default):**
- Plan items → implement immediately
- Short-lived feature branches (hours to 1-2 days)
- Individual feature merges to main
- Continuous integration, no batching

**Separate Planning (Alternative):**
- Use devsteps-10-plan-work for batch planning session
- Then devsteps-20-start-work for sequential execution
- Work items already exist, pull from backlog
- Traditional Kanban board workflow

## Rapid Cycle Protocol

### Phase 1: Planning (on main branch)

**Search Before Create:**
- `#mcp_devsteps_search` for existing Epics/Stories
- Check for duplicate work items
- Reuse existing items when scope aligns

**Create Work Structure:**
- Epic → Story → Task hierarchy
- Bug → Task (fix implementation)
- Spike → Story (research findings to implementation)

**Link Relationships:**
- `implements` for parent-child hierarchy
- `relates-to` for horizontal connections
- `blocks` for dependencies
- `tested-by` for validation chains

**Prioritize:**
- Q1 (urgent-important): Critical bugs, blockers
- Q2 (not-urgent-important): Strategic features, architecture
- Q3 (urgent-not-important): Quick wins, polish
- Q4 (not-urgent-not-important): Backlog

**Items Status:** Remain `draft` or `planned` on main

### Phase 2: Start Work (transition to feature branch)

**Auto-Status Transition:**
- **CRITICAL**: Automatically set status `draft/planned → in-progress`
- User should NOT manually update status before starting
- Prompt should handle transition silently

**Branch Creation:**
- Verify current branch is main
- Check if feature branch already exists
- Create: `git checkout -b <type>/<ID>-<slug>`
- Types: story, bug, task, epic, spike

**Verify Clean State:**
- No uncommitted changes on main
- .devsteps/ items committed
- Ready for implementation

### Phase 3: Implementation (feature branch)

**Development:**
- Code changes in feature branch ONLY
- Write tests in parallel (not later)
- Document decisions as you go
- Commit logical checkpoints

**Status Tracking:**
- Status remains `in-progress` during coding
- Update item description if scope clarifies
- Link newly discovered dependencies

**Test Continuously:**
- Run tests during development
- Fix issues immediately
- Build validation before review

### Phase 4: Quality Gates (review phase)

**Transition to Review:**
- Update status `in-progress → review`
- Signal testing phase begins

**Validation Checklist:**
- ✅ All tests pass
- ✅ Build succeeds (lint, type-check)
- ✅ Manual testing complete
- ✅ No regressions introduced
- ✅ Documentation updated
- ✅ Code follows project patterns

**If Validation Fails:**
- Return status to `in-progress`
- Fix issues
- Re-run quality gates

**If Validation Passes:**
- Proceed to completion

### Phase 5: Completion (merge to main)

**Final Status Update:**
- Update status `review → done`
- Mark completion timestamp

**Commit Protocol:**
- Final commit to feature branch
- Conventional format: `type(ID): subject`
- Footer: `Implements: <ID>`
- Examples:
  - `feat(STORY-042): Add presentation navigation UI`
  - `fix(BUG-033): Position Topics toolbar at bottom`
  - `refactor(TASK-128): Extract editor hooks to shared package`

**Merge to Main:**
- `git checkout main`
- `git merge --no-ff <feature-branch>` (preserves context)
- `git push origin main`

**Branch Retention:**
- Keep branch locally (8+ weeks minimum)
- Sync retained branch with main: `git checkout <feature-branch> && git merge --no-ff main && git checkout main`
- Prevents divergence during verification period
- Delete only after Epic/Story marked `verified`/`closed`

**DevSteps Sync:**
- `.devsteps/` status updates committed to main via merge
- Single source of truth restored

### Phase 6: Next Item (continuous flow)

**Pull Next Work:**
- Check Q1 priorities (urgent-important)
- Look for unblocked items
- Consider quick wins (Q3) if context switching

**Decision Point:**
- Need planning? → Return to Phase 1
- Item exists? → Jump to Phase 2
- Nothing ready? → Planning session needed

## Integration with Other Prompts

**This prompt enables rapid cycles, others provide details:**

- **devsteps-10-plan-work.prompt.md**: Batch planning session (create multiple items)
- **devsteps-20-start-work.prompt.md**: Sequential execution (pull from backlog)
- **devsteps-30-rapid-cycle.prompt.md** (THIS): Plan+execute in one session
- **devsteps-tool-usage.instructions.md**: DevSteps CLI/MCP tool usage, file protection

**When to Use:**
- **Rapid Cycle**: Small scope, immediate implementation needed
- **Separate Planning**: Large Epic, multiple Stories, team coordination
- **Start Work**: Backlog exists, pull next priority item

## Status Synchronization

**Automatic Transitions:**
- `draft/planned → in-progress`: When starting work (Phase 2)
- `in-progress → review`: When quality gates begin (Phase 4)
- `review → done`: When all validation passes (Phase 5)
- `review → in-progress`: When validation fails (return to Phase 3)

**Manual Transitions:**
- `done → verified`: Developer confirms production validation (1-8 weeks)
- `verified → closed`: Final Epic/Story closure (8+ weeks)
- `any → blocked`: Dependency prevents progress
- `any → cancelled`: Work no longer needed
- `any → obsolete`: Superseded by different approach

**Branch-Status Alignment:**
- Main branch: draft/planned items (pre-work)
- Feature branch: in-progress/review items (active work)
- Main branch: done items (post-merge)
- Retained branches: done items during verification period

## Quality Gates

**Pre-Review Checklist:**
- Code compiles without errors
- Linter passes (no warnings)
- Type checking passes (TypeScript)
- Unit tests pass
- Integration tests pass (if applicable)

**Review Phase Validation:**
- Manual testing complete
- No regressions in existing features
- Documentation reflects changes
- Code follows project patterns
- Commit message follows conventional format

**Pre-Merge Requirements:**
- All quality gates passed
- Status updated to `done`
- Feature branch contains final commit
- Main branch up-to-date (pull before merge)
- Conventional commit message prepared

## Anti-Patterns

**Avoid:**
- Creating work items without searching first (duplicates)
- Starting work on main branch (breaks isolation)
- Skipping status updates (loses traceability)
- Committing after every edit (noise in history)
- Merging before quality gates pass (technical debt)
- Deleting branches immediately (loses verification period)
- Batch committing unrelated changes (mixed concerns)

## Red Flags

**Watch for:**
- Feature branches older than 2 days (scope too large?)
- Items stuck in `in-progress` for weeks (blocked? rescope?)
- Skipping test creation (shortcuts accumulate)
- Merge conflicts on main (parallel work? coordination needed?)
- Unmerged `done` items (workflow violation!)

**Corrective Actions:**
- Long branches → Break into smaller Tasks
- Stuck items → Mark `blocked`, create dependency items
- No tests → Pause, write tests now
- Merge conflicts → Coordinate with team, rebase if needed
- Done but not merged → Merge immediately, investigate delay

## Success Metrics

**Flow Efficiency:**
- Time from `draft → done` (cycle time)
- Items completed per day/week (throughput)
- Ratio of planned vs actual scope (estimation accuracy)

**Quality Indicators:**
- Tests passing on first review attempt
- Regressions introduced (should be zero)
- Time spent in `review → in-progress` loops (minimize)

**Process Health:**
- Feature branch age (hours preferred, 1-2 days max)
- Status transition accuracy (automated > manual)
- DevSteps item hierarchy completeness (all linked)

---

**Related:** devsteps-10-plan-work (batch planning), devsteps-20-start-work (backlog execution), devsteps-tool-usage.instructions.md (tool usage)

**Remember: Rapid cycles minimize WIP, maximize flow, deliver continuously.**

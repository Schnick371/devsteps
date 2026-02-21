---
agent: 'devsteps-coordinator'
model: 'Claude Sonnet 4.6'
description: 'Begin implementation work - review planned items, select next task, and start structured development'
tools: [vscode/runCommand, execute/getTerminalOutput, execute/awaitTerminal, execute/killTerminal, execute/runTask, execute/runNotebookCell, execute/testFailure, execute/runInTerminal, read/terminalSelection, read/terminalLastCommand, read/getTaskOutput, read/getNotebookSummary, read/problems, read/readFile, read/readNotebookCellOutput, agent/runSubagent, playwright/browser_click, playwright/browser_close, playwright/browser_console_messages, playwright/browser_drag, playwright/browser_evaluate, playwright/browser_file_upload, playwright/browser_fill_form, playwright/browser_handle_dialog, playwright/browser_hover, playwright/browser_install, playwright/browser_navigate, playwright/browser_navigate_back, playwright/browser_network_requests, playwright/browser_press_key, playwright/browser_resize, playwright/browser_run_code, playwright/browser_select_option, playwright/browser_snapshot, playwright/browser_tabs, playwright/browser_take_screenshot, playwright/browser_type, playwright/browser_wait_for, edit/createDirectory, edit/createFile, edit/createJupyterNotebook, edit/editFiles, edit/editNotebook, search/changes, search/codebase, search/fileSearch, search/listDirectory, search/searchResults, search/textSearch, search/usages, search/searchSubagent, web/fetch, devsteps/add, devsteps/archive, devsteps/context, devsteps/export, devsteps/get, devsteps/health, devsteps/init, devsteps/link, devsteps/list, devsteps/metrics, devsteps/purge, devsteps/search, devsteps/status, devsteps/trace, devsteps/update, 'remarc-insight-mcp/*', todo]
---

# 🚀 Start Work - Begin Implementation

## Mission

Review planned work, select highest priority, begin structured development.

**Branch Strategy:** Work item **planning** in `main`, **status updates + code** in feature branch.

**Critical Rule:** Planning (main) → Implementation + Status (feature) → Merge (both to main).

## Implementation Protocol

### 1. Branch Strategy (MANDATORY)

**Phase 1: Verify DevSteps Work Items in Main**
- Work items should exist from planning session (devsteps-10-plan-work)
- If items created in main during current session, **capture planning commit hash**

**Phase 2: Create/Checkout Feature Branch**
- Branch naming: `story/<ID>`, `bug/<ID>`, `task/<ID>`, `epic/<ID>`, `spike/<ID>`
- Check existing branches before creating new: `git branch --list`
- Create: `git checkout -b <type>/<ID>-<slug>`
- **Principle:** Feature branch for CODE ONLY

**Phase 2.5: Cherry-Pick Planning Commit (If Applicable)**
- **When:** Planning occurred in main during this session
- **Action:** `git cherry-pick <commit-hash>` to sync `.devsteps/` to feature branch
- **Verify:** `#mcp_devsteps_get <ID>` confirms item visible
- **Why:** DevSteps MCP tools read from current branch's `.devsteps/` directory
- **Skip:** If items already exist from prior planning session (no new planning commit)

**Phase 3: Verify Clean State**
- No uncommitted changes
- DevSteps items visible via MCP tools
- Ready for implementation

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

### 4.5. Systematic Scope Analysis (MANDATORY for Cross-Cutting Concerns)

**Principle:** When task affects patterns used across multiple components, analyze functionally not lexically.

**Functional Definition:**
- Identify WHAT the code accomplishes from user perspective
- Avoid keyword searches alone - understand behavior and purpose
- Recognize patterns by their role in system architecture

**Complete Discovery:**
- Use functional reasoning to find ALL affected code paths
- Combine search techniques: semantic search, usage analysis, architectural knowledge
- Validate completeness by checking related areas (UI, persistence, state management)

**Implementation Comparison:**
- Read actual implementation for EACH affected component
- Document current approaches systematically
- Identify variations in patterns, libraries, techniques, or timing

**Truth Source Validation:**
- Consult `.devsteps/context/` for documented architectural decisions
- Review work item descriptions for established patterns
- Seek user clarification when documented truth conflicts with observed code

**Best Practice Definition:**
- Synthesize from: documented patterns, comparative analysis, technical requirements
- Articulate rationale (WHY this approach serves project goals)
- Confirm with user before deviating from established patterns

**Systematic Application:**
- Create exhaustive checklist of components requiring updates
- Process EACH component: verify current state, apply unified pattern, validate integration
- Include ALL discovered components - no exceptions based on convenience

**Validation:**
- Verify structural consistency across ALL final implementations
- Confirm completeness (no overlooked components)
- Test interactions between updated components

**Critical Warning Signs:**
- Partial application: Found multiple instances, updated subset
- Test-only validation: Unit tests pass without user-facing verification
- Version inconsistency: Same library at different versions across components
- Assumption-based equivalence: "Probably the same" without code inspection

**Apply this protocol for:**
- Multi-component refactoring
- Pattern unification across codebase
- Library version alignment
- UI/UX consistency initiatives

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

**Additional Quality Gates for Cross-Cutting Changes:**

**When Systematic Scope Analysis was performed (Step 4.5):**
- [ ] ALL identified components updated (no stragglers)
- [ ] Implementation comparison table shows consistency
- [ ] User-facing behavior tested in EACH affected component
- [ ] No version drift (same library versions across all uses)
- [ ] Documentation updated with new unified pattern

**For UI/UX Consistency Work:**
- [ ] Visual inspection in browser for EACH editor/component
- [ ] Side-by-side comparison with reference implementation
- [ ] Same user interactions produce same visual feedback
- [ ] Status indicators visible and consistent everywhere
- [ ] Error states handled identically

**For Refactoring/Pattern Unification:**
- [ ] BEFORE state documented (comparison table created)
- [ ] AFTER state verified (all use same approach)
- [ ] No functional regressions (existing features still work)
- [ ] Tests updated to reflect new patterns
- [ ] Truth source (`.devsteps/context/`) updated if pattern changed

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

**If Review Fails:** Return to Step 6

**Systematic Analysis Failure Recovery:**

**If user reports inconsistencies AFTER marking `done`:**
1. ❌ DO NOT immediately fix reported issue
2. ✅ RETURN to Step 4.5 (Systematic Scope Analysis)
3. ✅ Re-run FULL analysis:
   - Find ALL affected components again
   - Compare implementations (create comparison table)
   - Identify what was MISSED in first pass
4. ✅ Create Bug items for EACH missed component
5. ✅ Link bugs to original Story with `blocked-by`
6. ✅ Update Story status to `blocked`
7. ✅ Fix bugs systematically (Step 4.5 protocol)
8. ✅ Document lessons learned in `.devsteps/context/`

**Why this matters:**
- Premature "done" → User finds issues → Credibility loss
- Partial fixes → More inconsistency → Harder to maintain
- Skipping analysis → Missing components → Regression risk

**Prevention better than cure:**
- Spend time in Step 4.5 upfront
- Create comparison tables as artifacts
- Get user confirmation on scope BEFORE coding

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

## Systematic Analysis Red Flags (Learn from STORY-134 Failure)

**🚨 CRITICAL FAILURE PATTERNS:**

**1. Lexical Search Instead of Semantic Analysis**
- ❌ Inadequate: String pattern matching identifies subset of affected code
- ✅ Effective: Functional role analysis discovers all instances regardless of naming

**Pattern:** Components implementing same behavioral role may use different implementation approaches or library choices, making keyword searches incomplete.

**2. Test Coverage ≠ User Experience Validation**
- ❌ Insufficient: Automated test suite passes
- ✅ Complete: Automated tests pass AND user-facing behavior manually validated across all affected surfaces

**Pattern:** Unit/integration tests verify isolated contract compliance but miss cross-component consistency issues visible to end users.

**3. Partial Scope Execution**
- ❌ Incomplete: Update identified subset, assume others unaffected
- ✅ Thorough: Systematic discovery and update of ALL instances

**Pattern:** Initial analysis identifies obvious candidates; thorough analysis often reveals additional affected components through dependency chains or parallel implementations.

**4. Task Scope Literalism**
- ❌ Narrow: Limit changes to explicitly mentioned files/components
- ✅ Comprehensive: Follow dependency graphs to discover implicit scope

**Pattern:** Task descriptions focus on primary targets; implementation reveals child components, utilities, or related surfaces requiring synchronized updates.

**5. Premature Completion Declaration**
- ❌ Hasty: Technical implementation complete → immediately finalize
- ✅ Rigorous: Implementation complete → user validation → confirmed quality → then finalize

**Pattern:** Technical completion (builds, tests pass) precedes user-facing validation; quality gates enforce separation between technical and experiential readiness.

**🎯 MANDATORY CHECKPOINTS:**

Before finalizing cross-cutting work:
- [ ] Systematic discovery completed (all affected components identified)
- [ ] Verified EACH component updated (not just "most")
- [ ] Tested user-facing behavior in EACH component
- [ ] User confirmed consistency in browser (not just unit tests)
- [ ] Truth source (`.devsteps/context/`) updated if pattern changed

**If you can't check ALL boxes → Stay in `review` status.**

---

**See `devsteps.agent.md` for mentor role. See `devsteps-workflow.prompt.md` for workflow details.**

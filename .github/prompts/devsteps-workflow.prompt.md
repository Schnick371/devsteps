---
agent: 'devsteps'
model: 'Claude Sonnet 4.5'
description: 'Structured development workflow - preserve decisions and maintain context continuity'
tools: ['vscode/getProjectSetupInfo', 'vscode/newWorkspace', 'vscode/runCommand', 'vscode/vscodeAPI', 'vscode/extensions', 'execute/testFailure', 'execute/getTerminalOutput', 'execute/runTask', 'execute/getTaskOutput', 'execute/runInTerminal', 'execute/runTests', 'read/problems', 'read/readFile', 'edit/createDirectory', 'edit/createFile', 'edit/editFiles', 'search', 'web/fetch', 'devsteps/*', 'copilot-container-tools/*', 'playwright/*', 'tavily/*', 'upstash/context7/*', 'agent', 'todo']
---

# 🧭 Structured Development Workflow

## Mission

Maintain structured workflow - preserve decisions, traceability, prevent context chaos.

## Branch Awareness (CRITICAL)

**Before ANY git operation:** Verify current branch

**Expected branches:**
- ✅ Feature branches: `story/<ID>`, `bug/<ID>`, `task/<ID>`, `epic/<ID>`
- ❌ WRONG: `main` during implementation

**If on main:** STOP, checkout correct feature branch via start-work protocol

**Principle:** Feature code in feature branches, main for work items and final merges

## Before Starting

**Understand:**
- Why? (business value)
- What? (components, dependencies, impact)
- How? (architecture fit, patterns, decisions)

**Check:**
- Previous decisions and contradictions
- Existing patterns
- Dependencies (before/after)

## During Implementation

**Branch Discipline:**
- Stay in feature branch for all edits/tests/builds
- Commit important checkpoints only (not every edit)
- Push to remote regularly
- **Prohibitions:** No switch to main, no work item commits, no merge until complete

**Pause/Switch Protocol:**
- Pause: Commit checkpoint, push branch
- Switch items: Commit current work, use start-work for new item, new feature branch

**Documentation:**
- Document decisions + reasoning
- Record trade-offs and alternatives
- Note affected areas

**Traceability:**
- Requirement → Feature → Implementation → Test
- Explicit dependencies

**Validation:**
- Tests in parallel (not later)
- Build continuously
- Patterns consistent
- No breaking changes

## Status Lifecycle

**Progression:** `draft → planned → in-progress → review → done`

**Meanings:**
- **draft/planned**: Created, ready to start
- **in-progress**: Active development
- **review**: Testing/validation
- **done**: All gates passed
- **blocked/cancelled/obsolete**: Stopped work

**Quality Gates (Review → Done):**
- ✅ Tests pass + Build succeeds
- ✅ Manual testing + Docs updated
- ✅ No regressions + Patterns followed

## Before Committing

**When to Commit:**
- ✅ Milestone reached, logical checkpoint, before task switch
- ❌ NOT every edit, NOT WIP experiments

**Pre-Commit Checklist:**
- Verify feature branch (not main)
- Check for errors via problems tool
- Review changes (focused, minimal, no debug code)
- Use conventional commit format
- **Principle:** All commits to feature branch during work

## Completion Workflow

**Testing Phase (Status: review):**
- Mark DevSteps work item as `review` status
- Run all applicable tests
- Perform manual testing
- Verify build succeeds
- Check for regressions
- Review code quality

**If Tests Fail:**
- Return to DevSteps work item status implementation
- Fix issues
- Repeat testing

**When All Tests Pass (Status: done):**
- Mark item as `done` status
- Final commit to feature branch
- Merge to main (--no-ff preserves feature context)
- Push merged main
- Delete feature branch (local + remote)

**Status Sync:**
- `.devsteps/` committed to main during merge
- No temporary divergence - immediate integration
- Feature branches ephemeral by design

**Merge Discipline:**
- Feature branches live only during active development
- Merge immediately after quality gates pass
- Delete branch after successful merge
- Stale branches indicate process failure

**Context Preservation:**
- Why/What/How for future switches
- Impact analysis
- Architectural continuity

## Core Principles

Every change traceable. No decision forgotten. No relationship lost.

---

**See `devsteps.agent.md` for mentor role. See `devsteps.instructions.md` for full methodology.**
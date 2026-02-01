---
applyTo: ".devsteps/**/*.md"
description: "Advanced DevSteps workflows: Spike transitions, Bug lifecycle, Quality Gates checklists"
---

# Advanced DevSteps Workflows

## Spike→Story/Task Transition Workflow

**Core Principle:** Spikes are exploration vehicles - they generate knowledge that must be captured and converted into actionable work items.

**Spike Completion:**
- Document actionable insights, decision points, and recommendations
- Include what worked, what didn't, and why
- Findings enable creating Stories or Tasks

**Converting Findings:**
- Create Stories for validated approaches (link to same Epic as Spike)
- Create Tasks under Stories for simple implementations
- Use `relates-to` to connect Stories back to originating Spike
- Search before creating to avoid duplicates

**Knowledge Transfer Pattern:**
- Spike: "What we learned"
- Story: "What we'll build"
- Task: "How we'll implement"

**Why This Matters:**
- Maintains Epic→Story→Task chains for summaries and metrics
- Prevents research waste through traceability
- Enables lessons learned generation

## Bug Status Lifecycle with Review Cycle

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

**The Review Phase Gateway:**

Purpose: Provide testing/refinement window before permanence.

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

**Why This Matters:**
- Prevents premature commits and rework
- User maintains control over permanence
- Different urgency levels (sprint vs hotfix) require different review depths

## Quality Gates Checklist System

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
- Feature branch deleted

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

---

**See also:** devsteps.instructions.md, devsteps-git-hygiene.instructions.md

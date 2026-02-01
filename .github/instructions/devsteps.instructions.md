---
applyTo: ".devsteps/**/*.md"
description: "DevSteps workflow and work item tracking"
---

# DevSteps Workflow Standards

## DevSteps File Protection

**NEVER edit `.devsteps/` files directly:**
- ❌ Manual JSON/MD edits in `.devsteps/` directory
- ✅ Use devsteps CLI: `devsteps add`, `devsteps update`, `devsteps link`
- ✅ Use MCP tools: `#mcp_devsteps_add`, `#mcp_devsteps_update`

**Why:** Ensures index consistency, maintains traceability, prevents corruption.

## Status Tracking

**Planning (in main branch):**
- Create items with status `draft` or `planned`
- Link relationships, define hierarchy

**Implementation (in feature branch):**
```
#mcp_devsteps_update <ID> --status in-progress  # Start work
#mcp_devsteps_update <ID> --status review       # Testing
#mcp_devsteps_update <ID> --status done         # Complete
```

**NEVER skip status updates** - Tracking mandatory for traceability.
**Status lives with code:** Feature branch status reflects work state.

## Item Hierarchy

**Scrum:** Epic → Story → Task | Epic → Spike → Task | Story → Bug → Task (fix)
**Waterfall:** Requirement → Feature → Task | Requirement → Spike → Task | Feature → Bug → Task (fix)

**Strategic vs Implementation:**
- **Epic/Requirement:** Planning containers (DevSteps only, no branches)
- **Story/Feature/Spike:** Implementation units (create branches)
- **Task:** Execution details (create branches when standalone)
- **Bug:** Problem description (blocks parent, fix via Task branch)

**Relations:** "relates-to" allowed between ANY items
**Spike completion:** Create Stories from findings, link to same Epic/Requirement

## Git Workflow

**Branches:** Only implementation items use `<type>/<ID>-<slug>` (Story, Task, Bug, Spike)
**No Epic/Requirement Branches:** Strategic items tracked in DevSteps, not version control
**Commits:** Conventional format `type(ID): subject` with footer `Implements: ID`
**Merge:** Immediate merge after completion, no-fast-forward to preserve history
**Reference:** devsteps-git-hygiene.instructions.md

## Validation Checklist

**Before committing:**
1. Check for errors - No compilation/lint issues
2. Run relevant tests - All passing
3. Build passes successfully
4. Review diff - Changes minimal and focused
5. Commit message follows format

## Prohibited Practices

**Never:**
- Edit `.devsteps/` files manually (use CLI/MCP only)

---

**Workflow:** See `devsteps-start-work.prompt.md` for implementation steps.

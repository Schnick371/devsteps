---
applyTo: "**"
description: "DevSteps workflow and work item tracking"
---

# DevSteps Workflow Standards

## DevSteps File Protection

**NEVER edit `.devsteps/` files directly:**
- ❌ Manual JSON/MD edits in `.devsteps/` directory
- ✅ Use devsteps CLI: `devsteps add`, `devsteps update`, `devsteps link`
- ✅ Use MCP tools: `#mcp_devsteps_devsteps-add`, `#mcp_devsteps_devsteps-update`

**Why:** Ensures index consistency, maintains traceability, prevents corruption.

## Status Tracking

**Before starting work:**
```
#mcp_devsteps_devsteps-update <ID> --status in-progress
```

**After validation/testing:**
```
#mcp_devsteps_devsteps-update <ID> --status done
```

**NEVER skip status updates** - Tracking mandatory for traceability.

## Item Hierarchy

**Scrum:** Epic → Story|Spike → Task (Bug/Test implement Epic or relate to Story/Spike)
**Waterfall:** Requirement → Feature|Spike → Task (Bug/Test implement Requirement or relate to Feature/Spike)
**Relations:** "relates-to" allowed between ANY items
**Spike completion:** Create Stories from findings, link to same Epic

## Git Workflow

**Epic branches:** Manual creation as `epic/<ID>-<slug>` when Epic starts
**Commits:** Conventional format `type(ID): subject` with footer `Implements: ID`
**Merge:** PR required for Epic branch to main after all children done
**Reference:** git-workflow.instructions.md

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
- Skip status updates (in-progress/done tracking)
- Proceed with failing tests or errors
- Batch multiple work items in one commit
- Create backup files: `.old`, `.bak`, `_neu` (use git!)

---

**Workflow:** See `devsteps-start-work.prompt.md` for implementation steps.

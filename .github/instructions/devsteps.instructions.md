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

**Before starting work:**
```
#mcp_devsteps_update <ID> --status in-progress
```

**After validation/testing:**
```
#mcp_devsteps_update <ID> --status done
```

**NEVER skip status updates** - Tracking mandatory for traceability.

## Item Hierarchy

**Scrum:** Epic → Story → Bug (optional) → Task | Epic → Spike → Task
**Waterfall:** Requirement → Feature → Bug (optional) → Task | Requirement → Spike → Task
**Bug blocking:** Bug blocks Story/Feature (parent only), uses relates-to for Epic/Requirement context
**Relations:** "relates-to" allowed between ANY items
**Spike completion:** Create Stories from findings, link to same Epic

## Git Workflow

**Epic branches:** Manual creation as `epic/<ID>-<slug>` when Epic starts
**Commits:** Conventional format `type(ID): subject` with footer `Implements: ID`
**Merge:** No-fast-forward merge to preserve history, archive branch after merge
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

---

**Workflow:** See `devsteps-start-work.prompt.md` for implementation steps.

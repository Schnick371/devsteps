---
applyTo: "**"
description: "DevCrumbs workflow and work item tracking"
---

# DevCrumbs Workflow Standards

## DevCrumbs File Protection

**NEVER edit `.devcrumbs/` files directly:**
- ❌ Manual JSON/MD edits in `.devcrumbs/` directory
- ✅ Use devcrumbs CLI: `devcrumbs add`, `devcrumbs update`, `devcrumbs link`
- ✅ Use MCP tools: `#mcp_devcrumbs_devcrumbs-add`, `#mcp_devcrumbs_devcrumbs-update`

**Why:** Ensures index consistency, maintains traceability, prevents corruption.

## Status Tracking

**Before starting work:**
```
#mcp_devcrumbs_devcrumbs-update <ID> --status in-progress
```

**After validation/testing:**
```
#mcp_devcrumbs_devcrumbs-update <ID> --status done
```

**NEVER skip status updates** - Tracking mandatory for traceability.

## Validation Checklist

**Before committing:**
1. Check for errors - No compilation/lint issues
2. Run relevant tests - All passing
3. Build passes successfully
4. Review diff - Changes minimal and focused

## Prohibited Practices

**Never:**
- Edit `.devcrumbs/` files manually (use CLI/MCP only)
- Skip status updates (in-progress/done tracking)
- Proceed with failing tests or errors
- Batch multiple work items in one commit
- Create backup files: `.old`, `.bak`, `_neu` (use git!)

---

**Workflow:** See `devcrumbs-start-work.prompt.md` for implementation steps.

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

## Git Workflow

**Epic-Based Branching:**
- Each Epic gets dedicated branch: `epic/<ID>-<slug>`
- Example: `epic/EPIC-005-workflow-governance`
- All child items commit to Epic branch
- Merge to main when Epic complete

**Branch Creation:**
```bash
# When starting Epic
git checkout -b epic/EPIC-001-platform-launch
git push -u origin epic/EPIC-001-platform-launch
```

**See:** `.github/instructions/git-workflow.instructions.md` for full workflow documentation.

## Commit Standards

**Format:** Conventional Commits with work item references

**Structure:**
```
<type>(<id>): <subject>

<body (optional)>

<footer>
```

**Types:** feat, fix, refactor, perf, docs, style, test, chore

**Example:**
```
feat(TASK-037): Add TreeView state persistence

Implemented StateManager using VS Code Memento API.
All view state now persists across sessions.

Implements: TASK-037
Relates: EPIC-003
```

**After marking work item done:**
- **MANDATORY:** Commit immediately
- Use format above with work item ID
- Reference implementing/fixing/relating IDs in footer
- Keep subject under 50 characters
- Use imperative mood ("Add" not "Added")

## Validation Checklist

**Before committing:**
1. Check for errors - No compilation/lint issues
2. Run relevant tests - All passing
3. Build passes successfully
4. Review diff - Changes minimal and focused
5. Commit message follows format

## Prohibited Practices

**Never:**
- Edit `.devcrumbs/` files manually (use CLI/MCP only)
- Skip status updates (in-progress/done tracking)
- Proceed with failing tests or errors
- Batch multiple work items in one commit
- Create backup files: `.old`, `.bak`, `_neu` (use git!)

---

**Workflow:** See `devcrumbs-start-work.prompt.md` for implementation steps.

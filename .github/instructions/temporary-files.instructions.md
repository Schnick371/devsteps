---
applyTo: "**"
description: "Temporary file management and output location standards"
---

# Temporary File Management Standards

## Core Principle
**NEVER create temporary files in project root.** Use designated output directories.

## Output Location Rules

### Test Results
- **Location**: `Tests/TestResults.xml`
- **Pattern**: `Tests/*.xml`, `Tests/*.trx`
- **Tool**: RunAllTests.ps1 configured to write here
- **Git**: Ignored via .gitignore

### AI-Generated Reports
- **Location**: `.devsteps/reports/` (if needed for reference)
- **Alternative**: Report inline in chat, no file creation
- **Pattern**: `*-COMPLETION-REPORT.md`, `TEST-REPORT-*.md`
- **Git**: Ignored via .gitignore patterns

### Work Item Documentation
- **Location**: `.devsteps/items/{type}/{ID}.md` (managed by DevSteps MCP)
- **Never manually create**: EPIC-*.md, STORY-*.md, BUG-*.md, TASK-*.md in root
- **Tool**: Use `#mcp_devsteps_add` and `#mcp_devsteps_update` only

### Log Files
- **Location**: `Logs/` (existing standard)
- **Subfolder structure**: `Logs/Tasks/`, `Logs/Install/`
- **PowerShell**: Managed via Remarc.Common logging functions

### Build Artifacts
- **Node.js**: `packages/*/dist/`, `packages/*/build/`
- **PowerShell**: No build artifacts (scripts are source)
- **Git**: All ignored via node_modules/, dist/, build/ patterns

### Configuration Backups
- **Location**: `Transfer/` (ignored by git)
- **Alternative**: Company-specific Transfer folders
- **Never**: Direct commits of backup ZIPs

## Prohibited Practices

**NEVER:**
- Create `*.md` summary files in project root
- Write test results to root directory
- Create `*-REPORT-*.md` files outside `.devsteps/`
- Commit backup files, test outputs, or temporary reports
- Use root for any transient/generated content

## Sub-Worker Instructions

When delegating to sub-workers (devsteps-documenter, devsteps-tester, etc.):

**Report inline in chat** - No file creation for summaries
**Use existing tools** - DevSteps MCP for work items, RunAllTests.ps1 for tests
**Check output paths** - Verify scripts write to correct directories
**Never assume root** - Always specify full path for outputs

## Git Integration

The `.gitignore` includes comprehensive patterns to exclude temporary reports, test outputs, and DevSteps work item files from version control.

## Enforcement

**Pre-commit validation:**
- Check for temporary files in root directory
- Verify test outputs are in designated directories
- Confirm no work item markdown files exist in root

**Cleanup:**
- Use cleanup scripts when violations occur
- Move misplaced files to correct directories
- Remove temporary artifacts before committing

---

**Rule**: If you create a file, ask "Does this belong in root?" Answer is usually "No."

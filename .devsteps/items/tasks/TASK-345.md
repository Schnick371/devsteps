## Problem
37 of 38 agent files contain stale/deprecated tool names in their `tools[]` frontmatter arrays:
- `execute` → `runCommands` (renamed in VS Code Copilot agent API)
- `read` → `readFile` (renamed)
- Other deprecated names as identified in research

## Scope
All `.github/agents/*.agent.md` files — 37/38 files require updates.

## Fix
Batch update tool name references in all agent frontmatter files:
1. `execute` → `runCommands` 
2. `read` → `readFile`
3. Any other deprecated names surfaced by audit

## Audit Command
```bash
grep -rh "tools:" .github/agents/ | sort | uniq -c | sort -rn
```

## Acceptance Criteria
- No agent file contains `execute` in `tools[]` (use `runCommands`)
- No agent file contains bare `read` in `tools[]` (use `readFile`)  
- All tool names validated against current VS Code Copilot Agent API
- Build/lint or CI frontmatter validation confirms no deprecated names

## Notes
This is a batch sweep — do all files in a single operation to avoid partial state. After update, verify agents still invoke correctly in VS Code.Implemented: execute→runCommands, read→readFile, search→fileSearch in 36 files. Gate-PASS. Merged 2026-03-06.
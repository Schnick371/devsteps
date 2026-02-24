## What to Change

Agent and instruction files reference MCP tool names in various forms. After renaming tool names, these references must be updated.

## Affected Files

Search all `.github/**/*.md` and `packages/**/.github/**/*.md` for patterns like:
- `devsteps/add`, `devsteps/list`, etc. → update to match new names
- `#devsteps/search` → update if these map directly to tool names
- Any hardcoded tool name strings used in examples or instructions

## Approach

1. `grep -r "devsteps/\b\(init\|add\|get\|list\|update\|link\|unlink\|trace\|search\|status\|export\|archive\|purge\|context\|health\|metrics\)" .github/`
2. For each match, evaluate whether it's a tool name reference that needs the `devsteps_` prefix
3. Update accordingly

## Note

The agent file syntax `devsteps/search` uses path notation, not underscore. After rename the tool names become `devsteps_search` (with underscore). The path convention in agent files is separate and may or may not need updating depending on which MCP invocation style is used.

Verify against instruction in `.github/instructions/devsteps-devsteps-usage.instructions.md`.
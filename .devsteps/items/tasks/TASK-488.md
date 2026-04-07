## Gap

The extension TreeView `FilterState` (packages/extension/src/treeView/types.ts) has `priorities: string[]` 
but no direct `eisenhower` quadrant filter. The CLI supports `--priority urgent-important` and the 
MCP `list` tool accepts eisenhower quadrant values directly.

## Changes Needed
1. `treeView/types.ts` — add `eisenhower?: string[]` to FilterState
2. `commands/filters.ts` — add eisenhower QuickPick options (Q1/Q2/Q3/Q4 with labels)
3. `devstepsTreeDataProvider.ts` — apply eisenhower filter in the filter pipeline
4. Update filter command to save/restore eisenhower filter state

## Affected Paths
- packages/extension/src/treeView/types.ts
- packages/extension/src/commands/filters.ts
- packages/extension/src/treeView/devstepsTreeDataProvider.ts
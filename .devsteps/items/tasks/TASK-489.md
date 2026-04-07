## Gap

The CLI `devsteps list --assignee <email>` and MCP `mcp_devsteps_list` tool both support assignee-based 
filtering. The extension TreeView FilterState has no assignee filter.

## Changes Needed
1. `treeView/types.ts` — add `assignees?: string[]` to FilterState
2. `commands/filters.ts` — add assignee QuickInput (freetext or pick from known assignees)
3. `devstepsTreeDataProvider.ts` — apply assignee filter in the filter pipeline
4. `treeView/types.ts` WorkItem interface — ensure `assignee?: string` field is present

## Affected Paths
- packages/extension/src/treeView/types.ts
- packages/extension/src/commands/filters.ts
- packages/extension/src/treeView/devstepsTreeDataProvider.ts
# MCP Bulk Operations Parity with CLI

## Problem

The CLI has `bulk update`, `bulk tag-add`, and `bulk tag-remove` commands that allow modifying multiple items in a single operation. The MCP server lacks ALL of these, meaning AI agents (which primarily interact through MCP) cannot perform bulk updates without calling `update` in a loop — inefficient and verbose.

## Parity Gap

| Operation | CLI | MCP |
|---|---|---|
| Bulk status/assignee update | `devsteps bulk update <ids...> --status` | ❌ Missing |
| Bulk add tags | `devsteps bulk tag-add <ids...> -t <tags...>` | ❌ Missing |
| Bulk remove tags | `devsteps bulk tag-remove <ids...> -t <tags...>` | ❌ Missing |

## Shared Core Analysis

`packages/shared/src/core/bulk-update.ts` already contains:
- `bulkUpdateItems()` — status/assignee/category update for multiple IDs
- `bulkTagAdd()` — add tags to multiple items
- `bulkTagRemove()` — remove tags from multiple items

These functions exist and are used by the CLI. MCP only needs handler + tool definitions that call them.

## Implementation

### New handler: `packages/mcp-server/src/handlers/bulk.ts`

Three thin wrappers (or one handler with `action` dispatch):
- `bulkUpdateHandler(args: { ids, status?, assignee?, category? })`
- `bulkTagAddHandler(args: { ids, tags })`  
- `bulkTagRemoveHandler(args: { ids, tags })`

### New tool definitions in `packages/mcp-server/src/tools/index.ts`

Three tool definitions:
- `bulk_update`: `{ ids: string[], status?, assignee?, category? }`
- `bulk_tag_add`: `{ ids: string[], tags: string[] }`
- `bulk_tag_remove`: `{ ids: string[], tags: string[] }`

### Registration in `packages/mcp-server/src/index.ts`

Add case handlers for `bulk_update`, `bulk_tag_add`, `bulk_tag_remove`.

## Acceptance Criteria

- [ ] `mcp_devsteps_bulk_update` tool available with ids[], status?, assignee? params
- [ ] `mcp_devsteps_bulk_tag_add` tool available with ids[], tags[] params  
- [ ] `mcp_devsteps_bulk_tag_remove` tool available with ids[], tags[] params
- [ ] All three delegate to existing shared/core bulk functions
- [ ] Error handling: partial failures reported per-item, not wholesale failure
- [ ] Returns count of successfully updated items + list of failed IDs (if any)
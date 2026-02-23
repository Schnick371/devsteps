# Add `archived` filter to MCP list tool

## Context

STORY-112 (MCP CLI parity): CLI `devsteps list --archived` shows archived items from `.devsteps/archive/`. The MCP `list` tool has no equivalent parameter. AI agents cannot inspect archived items via MCP — they must drop to file system access.

## Parity Gap

| Feature | CLI | MCP |
|---|---|---|
| List archived items | `devsteps list --archived` | ❌ Missing |

## Implementation

### `packages/shared/src/core/list.ts`

Add `archived?: boolean` to `ListItemsArgs`. When `true`, read from `.devsteps/archive/` subdirectories instead of the main item directories.

### `packages/mcp-server/src/tools/index.ts`

Add `archived: { type: 'boolean', description: '...' }` property to `listTool.inputSchema`.

### `packages/mcp-server/src/handlers/list.ts`

Pass `archived` arg through to `listItems()`.

## Acceptance Criteria

- [ ] `mcp_devsteps_list` with `archived: true` returns archived items
- [ ] No regression in default behavior (archived: false default)
- [ ] Shared `listItems()` handles archive directory traversal
# Add MCP unlink tool and handler

## Context

STORY-039: Once `unlinkItem()` exists in shared/core (TASK-248), this task wires it into the MCP server as `mcp_devsteps_unlink`.

## Dependency

Requires TASK-248 (`unlinkItem()` in shared/core) to be completed first.

## Implementation

### New handler: `packages/mcp-server/src/handlers/unlink.ts`

Thin wrapper matching the pattern of all other handlers (e.g., `link.ts`, `archive.ts`):

```typescript
import { unlinkItem } from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

export default async function unlinkHandler(args: {
  source_id: string;
  relation_type: RelationType;
  target_id: string;
}) {
  const devstepsDir = join(getWorkspacePath(), '.devsteps');
  return await unlinkItem(devstepsDir, {
    sourceId: args.source_id,
    relationType: args.relation_type,
    targetId: args.target_id,
  });
}
```

### New tool definition in `packages/mcp-server/src/tools/index.ts`

```typescript
export const unlinkTool: Tool = {
  name: 'unlink',
  description: 'Remove a relationship between two items. Also removes the inverse relation bidirectionally.',
  inputSchema: {
    type: 'object',
    properties: {
      source_id: { type: 'string', description: 'Source item ID' },
      relation_type: {
        type: 'string',
        enum: [...all relation types...],
        description: 'Type of relationship to remove',
      },
      target_id: { type: 'string', description: 'Target item ID' },
    },
    required: ['source_id', 'relation_type', 'target_id'],
  },
};
```

### Register in `packages/mcp-server/src/index.ts`

- Import `unlinkTool` and add to `tools` array
- Import `unlinkHandler` and add `case 'unlink':` in the switch

### Update MCP server version indicator / tool count in README if present

## Acceptance Criteria

- [ ] `mcp_devsteps_unlink` tool is available in MCP server
- [ ] Calling it removes the relation from both source and target JSON
- [ ] Returns success/error result consistent with other tools
- [ ] Tool is registered in the tools list
- [ ] Integration: E2E test: link → unlink → verify item JSON cleaned
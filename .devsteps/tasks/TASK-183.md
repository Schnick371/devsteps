## Task Description

Replace status comparisons across shared core and MCP handlers with type-safe STATUS constants.

## Current Violations

**Shared Core:**
- `packages/shared/src/core/update.ts`: `args.status === 'done'`, `relationshipType === 'implemented-by'`
- `packages/shared/src/core/list.ts`: `i.status === args.status`

**MCP Server:**
- `packages/mcp-server/src/handlers/update.ts`: `args.status === 'done'`, `args.status === 'in-progress'`
- `packages/mcp-server/src/handlers/status.ts`: `item.status === 'in-progress'`

**Extension MCP:**
- `packages/extension/src/mcp-server/handlers/update.ts`: Same as MCP server
- `packages/extension/src/mcp-server/handlers/status.ts`: Same as MCP server

## Target Pattern

```typescript
import { STATUS, RELATIONSHIP_TYPE } from '@schnick371/devsteps-shared';

// Status checks
if (args.status === STATUS.DONE) { ... }
if (args.status === STATUS.IN_PROGRESS) { ... }
if (item.status === STATUS.IN_PROGRESS) { ... }

// Relationship checks
if (relationshipType === RELATIONSHIP_TYPE.IMPLEMENTED_BY) { ... }
```

## Implementation Strategy

1. **Shared Core Files:**
   - Add import: `import { STATUS, RELATIONSHIP_TYPE } from '../constants/index.js';`
   - Replace all status/relationship string literals

2. **MCP Server Handlers:**
   - Add import: `import { STATUS } from '@schnick371/devsteps-shared';`
   - Replace status comparisons

3. **Extension MCP Handlers:**
   - Same pattern as MCP server

## Testing

1. Build all packages
2. Test status update command (draft → in-progress → done)
3. Test list filtering by status
4. Verify MCP server health endpoint shows in-progress items
5. Check extension TreeView status badges

## Acceptance Criteria

- Zero status string literals in affected files
- All comparisons use STATUS.* constants
- Relationship comparisons use RELATIONSHIP_TYPE.*
- Build passes for all packages
- Status updates still work correctly
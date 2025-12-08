## Task

Replace manual bidirectionalMap in CLI, MCP Server, and Extension with shared `getBidirectionalRelation()`.

## Files to Update

### 1. CLI: `packages/cli/src/commands/index.ts`

**Remove:**
```typescript
const bidirectionalMap: Record<string, string> = {
  implements: 'implemented-by',
  'implemented-by': 'implements',
  // ...
};
```

**Replace with:**
```typescript
import { getBidirectionalRelation } from '@schnick371/devsteps-shared';

// In linkCommand():
const reverseType = getBidirectionalRelation(relationType);
```

### 2. MCP Server: `packages/mcp-server/src/handlers/link.ts`

**Same pattern** - remove bidirectionalMap, import getBidirectionalRelation

### 3. Extension: `packages/extension/src/mcp-server/handlers/link.ts`

**Same pattern** - remove bidirectionalMap, import getBidirectionalRelation

## Benefits

- ✅ Single source of truth (shared package)
- ✅ No manual mapping maintenance
- ✅ Automatic updates when relationships change
- ✅ Type-safe (TypeScript enforces valid types)

## Dependencies

- Depends on: TASK-175 (RELATIONSHIP_CONFIG created)

## Testing

```bash
# Build all packages
npm run build

# Test CLI linking
devsteps link TASK-001 implements STORY-001
# Verify reverse link created: STORY-001 implemented-by TASK-001

# Test MCP
# Verify devsteps-link creates bidirectional links
```

## Acceptance Criteria

- bidirectionalMap removed from all 3 locations
- getBidirectionalRelation() imported from shared
- All linking functionality preserved
- Bidirectional links work correctly
- All packages build successfully
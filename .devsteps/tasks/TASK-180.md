## Problem

Still have redundant relationship type definitions:

**Locations:**
1. `packages/shared/src/schemas/index.ts`:
   - `RelationType` z.enum (lines 77-88) - hardcoded array
   - `LinkedItems` object keys (lines 92-123) - hardcoded

2. `packages/mcp-server/src/tools/index.ts` - enum array (lines 243-255)
3. `packages/extension/src/mcp-server/tools/index.ts` - enum array (same)

**Root Cause:** These are NOT derived from RELATIONSHIP_CONFIG

## Solution

### 1. Generate RelationType from RELATIONSHIP_CONFIG

```typescript
// packages/shared/src/schemas/index.ts
import { RELATIONSHIP_CONFIG } from './relationships.js';

// Derive relationship types from config
const relationshipTypes = Object.keys(RELATIONSHIP_CONFIG) as [RelationType, ...RelationType[]];
export const RelationType = z.enum(relationshipTypes);
export type RelationType = z.infer<typeof RelationType>;
```

### 2. Generate LinkedItems dynamically

```typescript
// Create Zod shape dynamically
const linkedItemsShape = Object.fromEntries(
  Object.keys(RELATIONSHIP_CONFIG).map(type => [type, z.array(z.string())])
);
const linkedItemsDefaults = Object.fromEntries(
  Object.keys(RELATIONSHIP_CONFIG).map(type => [type, []])
);

export const LinkedItems = z.object(linkedItemsShape as any).default(linkedItemsDefaults);
```

### 3. Export array for MCP tools

```typescript
// packages/shared/src/schemas/relationships.ts
export function getRelationshipTypes(): RelationType[] {
  return Object.keys(RELATIONSHIP_CONFIG) as RelationType[];
}
```

### 4. Update MCP tool schemas

```typescript
// packages/mcp-server/src/tools/index.ts
import { getRelationshipTypes } from '@schnick371/devsteps-shared';

relation_type: {
  type: 'string',
  enum: getRelationshipTypes(),
  description: 'Type of relationship',
}
```

## Benefits

- ✅ Single source of truth (RELATIONSHIP_CONFIG)
- ✅ Add new relationship → auto-updates everywhere
- ✅ Impossible to have mismatched enums
- ✅ TypeScript validates consistency

## Testing

1. Build all packages
2. Verify MCP schema still valid
3. Test link command with all relationship types
4. Verify Zod validation works

## Dependencies

- Depends on: TASK-175 (RELATIONSHIP_CONFIG exists)
## Problem Statement

Relationship types and their categorization (hierarchy vs flexible) are defined redundantly across multiple packages:

**Duplication Found:**
1. `packages/shared/src/schemas/relationships.ts` - HIERARCHY_RELATIONSHIPS, FLEXIBLE_RELATIONSHIPS
2. `packages/shared/src/schemas/index.ts` - RelationType enum (all types)
3. `packages/cli/src/commands/index.ts` - bidirectionalMap (manual mapping)
4. `packages/mcp-server/src/handlers/link.ts` - bidirectionalMap (manual mapping)
5. `packages/extension/src/mcp-server/handlers/link.ts` - bidirectionalMap (duplicate!)
6. `packages/extension/src/mcp-server/tools/index.ts` - RelationType enum (duplicate!)

**Inconsistency Risk:**
- Changes require updates in 6+ places
- Easy to miss updates (e.g., adding new relationship type)
- Bidirectional mappings manually maintained

## Solution

Centralize ALL relationship logic in `packages/shared`:

### 1. Single Source of Truth
```typescript
// packages/shared/src/schemas/relationships.ts
export const RELATIONSHIP_CONFIG = {
  'implements': { 
    reverse: 'implemented-by', 
    category: 'hierarchy' 
  },
  'tested-by': { 
    reverse: 'tests', 
    category: 'hierarchy'  // Changed from flexible!
  },
  'depends-on': { 
    reverse: 'required-by', 
    category: 'flexible' 
  },
  // ... all relationship types
} as const;

export function getBidirectionalRelation(type: RelationType): RelationType {
  return RELATIONSHIP_CONFIG[type].reverse;
}

export function isHierarchyRelation(type: string): boolean {
  return RELATIONSHIP_CONFIG[type]?.category === 'hierarchy';
}
```

### 2. TreeView Enhancement
Extend `hideRelatesTo` to **hide ALL flexible relationships**:

**Current:** Only `relates-to` hidden
**Proposed:** Hide all FLEXIBLE_RELATIONSHIPS (`relates-to`, `depends-on`, `supersedes`)

**UI:** Rename toggle to "Show Flexible Relations" (default: hidden)

### 3. tested-by/tests Hierarchy
Move `tested-by` and `tests` from FLEXIBLE to HIERARCHY:
- Test → Story (Scrum)
- Test → Feature (Waterfall)
- Validates parent-child relationship

## Benefits

✅ Single source of truth (DRY principle)
✅ Type-safe bidirectional mappings
✅ Easier to add new relationship types
✅ Reduced maintenance burden
✅ Cleaner TreeView (hide noise by default)
✅ Proper test hierarchy validation

## Acceptance Criteria

- All relationship types defined in shared package
- Bidirectional mapping generated automatically
- CLI, MCP Server, Extension import from shared
- TreeView toggle renamed to "Show Flexible Relations"
- tested-by/tests moved to HIERARCHY_RELATIONSHIPS
- All existing functionality preserved
- No breaking changes for users
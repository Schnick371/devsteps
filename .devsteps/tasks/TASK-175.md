## Task

Create comprehensive relationship configuration in shared package with bidirectional mappings and categorization.

## Implementation

**File:** `packages/shared/src/schemas/relationships.ts`

```typescript
/**
 * Comprehensive relationship configuration
 * Single source of truth for all relationship types
 */
export const RELATIONSHIP_CONFIG = {
  // Hierarchy relationships (strict validation)
  'implements': { reverse: 'implemented-by', category: 'hierarchy' as const },
  'implemented-by': { reverse: 'implements', category: 'hierarchy' as const },
  'blocks': { reverse: 'blocked-by', category: 'hierarchy' as const },
  'blocked-by': { reverse: 'blocks', category: 'hierarchy' as const },
  'tested-by': { reverse: 'tests', category: 'hierarchy' as const },
  'tests': { reverse: 'tested-by', category: 'hierarchy' as const },
  
  // Flexible relationships (no validation)
  'relates-to': { reverse: 'relates-to', category: 'flexible' as const },
  'depends-on': { reverse: 'required-by', category: 'flexible' as const },
  'required-by': { reverse: 'depends-on', category: 'flexible' as const },
  'supersedes': { reverse: 'superseded-by', category: 'flexible' as const },
  'superseded-by': { reverse: 'supersedes', category: 'flexible' as const },
} as const;

export type RelationType = keyof typeof RELATIONSHIP_CONFIG;
export type RelationCategory = 'hierarchy' | 'flexible';

/**
 * Get bidirectional/reverse relation for a given relation type
 */
export function getBidirectionalRelation(type: RelationType): RelationType {
  return RELATIONSHIP_CONFIG[type].reverse;
}

/**
 * Check if relation requires hierarchy validation
 */
export function isHierarchyRelation(type: string): boolean {
  return (RELATIONSHIP_CONFIG as any)[type]?.category === 'hierarchy';
}

/**
 * Check if relation is flexible (no validation)
 */
export function isFlexibleRelation(type: string): boolean {
  return (RELATIONSHIP_CONFIG as any)[type]?.category === 'flexible';
}

/**
 * Get all hierarchy relationship types
 */
export function getHierarchyRelationships(): RelationType[] {
  return Object.entries(RELATIONSHIP_CONFIG)
    .filter(([_, config]) => config.category === 'hierarchy')
    .map(([type]) => type as RelationType);
}

/**
 * Get all flexible relationship types
 */
export function getFlexibleRelationships(): RelationType[] {
  return Object.entries(RELATIONSHIP_CONFIG)
    .filter(([_, config]) => config.category === 'flexible')
    .map(([type]) => type as RelationType);
}
```

## Rationale

**tested-by/tests moved to HIERARCHY:**
- Test items validate Stories/Features (parent-child relationship)
- Should enforce methodology-specific rules
- Similar to implements/implemented-by pattern

**relates-to is symmetric:**
- Both directions point to same relation type
- No "reverse" needed (bidirectional but identical)

## Deprecation

Remove old constants (after migration):
- `HIERARCHY_RELATIONSHIPS` array
- `FLEXIBLE_RELATIONSHIPS` array
- Individual helper functions (replaced by RELATIONSHIP_CONFIG)

## Exports

Update `packages/shared/src/schemas/index.ts`:
```typescript
export { 
  RELATIONSHIP_CONFIG,
  getBidirectionalRelation,
  isHierarchyRelation,
  isFlexibleRelation,
  getHierarchyRelationships,
  getFlexibleRelationships,
  type RelationType,
  type RelationCategory
} from './relationships.js';
```

## Testing

```typescript
// Test bidirectional mappings
console.log(getBidirectionalRelation('implements')); // 'implemented-by'
console.log(getBidirectionalRelation('depends-on')); // 'required-by'
console.log(getBidirectionalRelation('relates-to')); // 'relates-to'

// Test categorization
console.log(isHierarchyRelation('implements')); // true
console.log(isHierarchyRelation('tested-by')); // true (NEW!)
console.log(isFlexibleRelation('relates-to')); // true
```

## Acceptance Criteria

- All relationship types in RELATIONSHIP_CONFIG
- Bidirectional mappings for all types
- Category (hierarchy/flexible) for each type
- Helper functions for common operations
- Type-safe exports
- Builds successfully
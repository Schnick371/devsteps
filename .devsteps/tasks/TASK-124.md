## Objective

Move `blocks/blocked-by` from FLEXIBLE_RELATIONSHIPS to HIERARCHY_RELATIONSHIPS.

## Changes

**File: packages/shared/src/schemas/relationships.ts**

```typescript
/**
 * Hierarchy relationships enforce parent-child rules
 * - implements/implemented-by: Standard hierarchy (Epic→Story→Task, etc.)
 * - blocks/blocked-by: Jira-style hierarchy for Bug (Bug blocks Epic/Story)
 *   Note: Other types (Story→Story, Task→Task) use blocks flexibly via bypass
 */
export const HIERARCHY_RELATIONSHIPS = [
  'implements',
  'implemented-by',
  'blocks',         // NEW: Jira hierarchy for Bug
  'blocked-by'      // NEW: Reverse relation
] as const;
```

**Remove from FLEXIBLE_RELATIONSHIPS:**
```typescript
export const FLEXIBLE_RELATIONSHIPS = [
  'relates-to',
  // REMOVE: 'blocks', 'blocked-by',
  'depends-on',
  'required-by',
  'tested-by',
  'tests',
  'supersedes',
  'superseded-by',
] as const;
```

**Update JSDoc for FLEXIBLE:**
```typescript
/**
 * Flexible relationships allow connections between any item types
 * Note: blocks/blocked-by moved to HIERARCHY for Bug validation (Jira 2025)
 * - relates-to: Generic association
 * - depends-on/required-by: Technical dependencies
 * - tested-by/tests: Testing relationships
 * - supersedes/superseded-by: Version/replacement tracking
 */
```

## Validation

- Run `npm run build`
- Verify `HierarchyRelation` includes 'blocks' and 'blocked-by'
- Verify `FlexibleRelation` excludes them
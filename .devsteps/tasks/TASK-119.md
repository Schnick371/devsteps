## Objective

Remove `affects/affected-by` from FLEXIBLE_RELATIONSHIPS array and update TypeScript types.

## Changes

**File: packages/shared/src/schemas/relationships.ts**

```typescript
export const FLEXIBLE_RELATIONSHIPS = [
  'relates-to',
  // REMOVE: 'affects', 'affected-by',
  'blocks',
  'blocked-by',
  'depends-on',
  'required-by',
  'tested-by',
  'tests',
  'supersedes',
  'superseded-by',
] as const;
```

**Update JSDoc comment:**
```typescript
/**
 * Flexible relationships allow connections between any item types
 * - relates-to: Generic association
 * - blocks/blocked-by: Blocking dependencies (will move to hierarchy)
 * - depends-on/required-by: Technical dependencies
 * - tested-by/tests: Testing relationships
 * - supersedes/superseded-by: Version/replacement tracking
 */
```

## Validation

- Run `npm run build`
- Verify TypeScript compilation succeeds
- Check `FlexibleRelation` type no longer includes 'affects'
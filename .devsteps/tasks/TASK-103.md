# Add "affects/affected-by" Relationship Type

## Task
Update shared package to support new "affects" relationship type for Bug impact traceability.

## Changes Required

### 1. Update relationships.ts
```typescript
export const FLEXIBLE_RELATIONSHIPS = [
  'relates-to',
  'affects',        // NEW: Bug affects Epic/Requirement
  'affected-by',    // NEW: Reverse relation
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

### 2. Update Documentation Comments
```typescript
/**
 * Flexible relationships allow connections between any item types
 * - relates-to: Generic association
 * - affects/affected-by: Impact relationships (Bug affects Epic/Requirement)
 * - blocks/blocked-by: Blocking dependencies
 * ...
 */
```

## Testing
- Run existing validation tests - should pass (flexible = no validation)
- TypeScript compilation successful
- No breaking changes (additive only)

## Acceptance Criteria
- [ ] "affects/affected-by" added to FLEXIBLE_RELATIONSHIPS
- [ ] TypeScript types updated automatically
- [ ] Documentation comments reflect new type
- [ ] npm run build passes
- [ ] npm test passes
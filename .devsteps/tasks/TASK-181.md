## Task Description

Create centralized constants module in shared package with type-safe definitions for all enum-like values.

## Implementation

**File:** `packages/shared/src/constants/index.ts`

```typescript
/**
 * Centralized constants for type-safe comparisons.
 * Use these instead of string literals to get autocomplete + compile-time safety.
 * 
 * @example
 * // ❌ BAD
 * if (item.type === 'task') { ... }
 * 
 * // ✅ GOOD
 * if (item.type === ITEM_TYPE.TASK) { ... }
 */

export const ITEM_TYPE = {
  EPIC: 'epic',
  STORY: 'story',
  TASK: 'task',
  REQUIREMENT: 'requirement',
  FEATURE: 'feature',
  BUG: 'bug',
  SPIKE: 'spike',
  TEST: 'test',
} as const;

export const STATUS = {
  DRAFT: 'draft',
  PLANNED: 'planned',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  DONE: 'done',
  BLOCKED: 'blocked',
  CANCELLED: 'cancelled',
  OBSOLETE: 'obsolete',
} as const;

export const RELATIONSHIP_TYPE = {
  IMPLEMENTS: 'implements',
  IMPLEMENTED_BY: 'implemented-by',
  BLOCKS: 'blocks',
  BLOCKED_BY: 'blocked-by',
  TESTED_BY: 'tested-by',
  TESTS: 'tests',
  RELATES_TO: 'relates-to',
  DEPENDS_ON: 'depends-on',
  REQUIRED_BY: 'required-by',
  SUPERSEDES: 'supersedes',
  SUPERSEDED_BY: 'superseded-by',
} as const;

export const METHODOLOGY = {
  SCRUM: 'scrum',
  WATERFALL: 'waterfall',
  HYBRID: 'hybrid',
} as const;

export const HIERARCHY_TYPE = {
  SCRUM: 'scrum',
  WATERFALL: 'waterfall',
  BOTH: 'both',
} as const;

// Type helpers (optional - for advanced usage)
export type ItemTypeValue = typeof ITEM_TYPE[keyof typeof ITEM_TYPE];
export type StatusValue = typeof STATUS[keyof typeof STATUS];
export type RelationshipTypeValue = typeof RELATIONSHIP_TYPE[keyof typeof RELATIONSHIP_TYPE];
export type MethodologyValue = typeof METHODOLOGY[keyof typeof METHODOLOGY];
```

## Export from Shared Index

**File:** `packages/shared/src/index.ts`

```typescript
// Add to exports
export * from './constants/index.js';
export { ITEM_TYPE, STATUS, RELATIONSHIP_TYPE, METHODOLOGY, HIERARCHY_TYPE } from './constants/index.js';
```

## Testing

1. Build shared package: `npm run build --workspace=packages/shared`
2. Verify constants exported: Check dist/constants/index.js
3. Test import in other packages: `import { ITEM_TYPE } from '@schnick371/devsteps-shared'`

## Acceptance Criteria

- Constants module created with all enum values
- Exported from shared package index
- TypeScript `as const` assertion for literal types
- No breaking changes to existing type unions
- Build passes successfully
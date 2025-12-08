## Problem Statement

Codebase contains **74+ violations** of TypeScript best practices by using string literals in comparisons instead of type-safe constants:

**Examples Found:**
```typescript
// ❌ BAD: Magic strings scattered everywhere
if (sourceType === 'task') { ... }
if (targetType === 'story' || targetType === 'spike') { ... }
if (args.status === 'done') { ... }
if (relationType === 'blocks') { ... }
if (methodology === 'scrum') { ... }
```

**Affected Areas:**
- `validation.ts`: 40+ string literal comparisons for ItemType
- `update.ts`, `list.ts`: Status comparisons ('done', 'in-progress')
- Multiple handlers: RelationType comparisons ('blocks', 'implemented-by')
- Dashboard/TreeView: Methodology comparisons ('scrum', 'waterfall')
- CLI commands: Status filtering with magic strings

**Why This Is Bad (2024/2025 Best Practices):**
1. **No autocomplete** - developers must remember exact strings
2. **Typo-prone** - `'task'` vs `'tasks'` silently fails at runtime
3. **Refactoring nightmare** - changing type names requires global search/replace
4. **No compile-time safety** - TypeScript can't catch mistakes
5. **Inconsistent with modern TS** - violates const assertion patterns

## Research: Modern TypeScript Best Practices

**Sources:**
- TypeScript Docs 2024: "Use const assertions and type guards"
- Medium (bluepnume): "Nine terrible ways to use TypeScript enums"
- dev.to: "TypeScript Best Practices 2025"

**Recommended Pattern:**
```typescript
// ✅ GOOD: Type-safe constants
const ITEM_TYPES = {
  TASK: 'task',
  STORY: 'story',
  EPIC: 'epic',
  // ...
} as const;

type ItemTypeValue = typeof ITEM_TYPES[keyof typeof ITEM_TYPES];

// Usage with autocomplete + compile-time checks
if (sourceType === ITEM_TYPES.TASK) { ... }
```

**Alternative Pattern (For Related Types):**
```typescript
// Namespaced constants
export const ItemType = {
  TASK: 'task',
  STORY: 'story',
} as const;

export const Status = {
  DONE: 'done',
  IN_PROGRESS: 'in-progress',
} as const;

export const RelationType = {
  BLOCKS: 'blocks',
  IMPLEMENTS: 'implements',
} as const;
```

## Solution Strategy

### Phase 1: Create Centralized Constants (Shared Package)
```typescript
// packages/shared/src/constants/index.ts

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
```

### Phase 2: Refactor Core Logic (High Priority)
1. **validation.ts** (40+ violations) - Most critical
2. **update.ts** - Status comparisons
3. **list.ts** - Status filtering
4. **link handlers** - RelationType checks

### Phase 3: Refactor CLI & Extension
5. **CLI commands** - Status/type filtering
6. **TreeView components** - Methodology checks
7. **Dashboard** - Status displays

### Phase 4: Deprecate Raw Strings
Add eslint rule to prevent new string literal comparisons.

## Benefits

✅ **Autocomplete** - IDE suggests valid values  
✅ **Type Safety** - Compile-time error on typos  
✅ **Refactoring** - Change once, update everywhere  
✅ **Documentation** - Constants serve as API docs  
✅ **Performance** - No runtime overhead (inlined)  
✅ **Best Practices** - Aligns with TS 2024/2025 standards  

## Acceptance Criteria

- Centralized constants module in shared package
- All 74+ string literal comparisons replaced
- Existing type unions remain unchanged (e.g., `ItemType = 'task' | 'story'`)
- Zero breaking changes - values stay same ('task' === ITEM_TYPE.TASK)
- Build passes with no type errors
- Documentation updated with usage examples

## Rollout Strategy

**Non-Breaking Migration:**
1. Add constants module (exports only)
2. Replace string literals incrementally (one file at a time)
3. Keep existing type definitions (`type ItemType = 'task' | ...`)
4. Values remain identical (`'task'` === `ITEM_TYPE.TASK` true)

**Future Enhancement (Optional):**
Consider stricter branded types after migration complete.
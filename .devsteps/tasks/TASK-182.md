## Task Description

Replace 40+ string literal comparisons in validation.ts with type-safe constants.

## Current State (Anti-Pattern)

```typescript
if (sourceType === 'task') { ... }
if (targetType === 'story' || targetType === 'spike' || targetType === 'bug') { ... }
if (relationType === 'blocks') { ... }
if (methodology === 'scrum') { ... }
```

**Issues:**
- 40+ magic strings in single file
- No autocomplete
- Typo-prone
- Hard to refactor

## Target State (Best Practice)

```typescript
import { ITEM_TYPE, RELATIONSHIP_TYPE, METHODOLOGY } from '../constants/index.js';

if (sourceType === ITEM_TYPE.TASK) { ... }
if (targetType === ITEM_TYPE.STORY || targetType === ITEM_TYPE.SPIKE || targetType === ITEM_TYPE.BUG) { ... }
if (relationType === RELATIONSHIP_TYPE.BLOCKS) { ... }
if (methodology === METHODOLOGY.SCRUM) { ... }
```

## Implementation Steps

1. **Add import:**
   ```typescript
   import { ITEM_TYPE, RELATIONSHIP_TYPE, METHODOLOGY } from '../constants/index.js';
   ```

2. **Replace ItemType comparisons (30+ occurrences):**
   - `sourceType === 'task'` → `sourceType === ITEM_TYPE.TASK`
   - `targetType === 'story'` → `targetType === ITEM_TYPE.STORY`
   - `sourceType === 'epic'` → `sourceType === ITEM_TYPE.EPIC`
   - etc. for all 8 item types

3. **Replace RelationType comparisons (3 occurrences):**
   - `relationType === 'blocks'` → `relationType === RELATIONSHIP_TYPE.BLOCKS`
   - `relationType === 'implemented-by'` → `relationType === RELATIONSHIP_TYPE.IMPLEMENTED_BY`
   - `relationType === 'blocked-by'` → `relationType === RELATIONSHIP_TYPE.BLOCKED_BY`

4. **Replace Methodology comparisons (3 occurrences):**
   - `methodology === 'scrum'` → `methodology === METHODOLOGY.SCRUM`
   - `methodology === 'waterfall'` → `methodology === METHODOLOGY.WATERFALL`
   - `methodology === 'hybrid'` → `methodology === METHODOLOGY.HYBRID`

## Files Affected

- `packages/shared/src/core/validation.ts` (single file, focused change)

## Testing

1. Build shared package
2. Verify no type errors
3. Run existing tests (validation logic unchanged)
4. Manual test: Create items with various types and validate relationships

## Acceptance Criteria

- Zero string literal comparisons in validation.ts
- All comparisons use constants from `../constants/index.js`
- Build passes without errors
- Existing validation tests still pass
- No behavior changes (values identical)
## Objective

Remove `affects/affected-by` from FLEXIBLE_RELATIONSHIPS array and update TypeScript types.

## Implementation Complete ✅

**Changes Made:**

**File: packages/shared/src/schemas/relationships.ts**
- Removed `'affects'` and `'affected-by'` from FLEXIBLE_RELATIONSHIPS array
- Updated JSDoc comment to remove affects/affected-by reference
- Added note: "blocks/blocked-by: Blocking dependencies (will move to hierarchy)"

**Validation Results:**
- ✅ TypeScript compilation successful (`npm run build`)
- ✅ No errors in shared package
- ✅ Generated types in `dist/schemas/relationships.d.ts` correct
- ✅ `FlexibleRelation` type excludes 'affects' and 'affected-by'
- ✅ `FLEXIBLE_RELATIONSHIPS` array now: `["relates-to", "blocks", "blocked-by", "depends-on", "required-by", "tested-by", "tests", "supersedes", "superseded-by"]`

**Impact:**
- Breaking change - consumers must be updated (TASK-120, TASK-121, TASK-122, TASK-123)
- TASK-120 now unblocked (depends-on this task)
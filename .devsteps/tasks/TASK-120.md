## Objective

Remove `affects/affected-by` from RELATION_TYPES array and LinkedItems schema.

## Implementation Complete ✅

**Changes Made:**

**File: packages/shared/src/schemas/index.ts**
- Removed `'affects'` and `'affected-by'` from RelationType enum (lines ~78-79)
- Removed from LinkedItems Zod schema object (lines ~98-99)
- Removed from default LinkedItems values (lines ~112-113)

**File: packages/shared/src/core/add.ts**
- Removed `affects: []` and `'affected-by': []` from linked_items initialization (lines ~100-101)

**Validation Results:**
- ✅ TypeScript compilation successful
- ✅ No errors in shared package
- ✅ `RelationType` enum excludes 'affects' and 'affected-by'
- ✅ `LinkedItems` type no longer has affects properties
- ✅ All packages build successfully

**Impact:**
- Breaking change - CLI, MCP, Extension must be updated
- TASK-121, TASK-122, TASK-123 now unblocked (depends-on this task)
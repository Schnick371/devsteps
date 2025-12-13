## Objective

Move `blocks/blocked-by` from FLEXIBLE_RELATIONSHIPS to HIERARCHY_RELATIONSHIPS array.

## Implementation Complete ✅

**Changes Made:**

**File: packages/shared/src/schemas/relationships.ts**

1. **Added blocks/blocked-by to HIERARCHY_RELATIONSHIPS**:
   ```typescript
   export const HIERARCHY_RELATIONSHIPS = [
     'implements',
     'implemented-by',
     'blocks',        // NEW
     'blocked-by',    // NEW
   ] as const;
   ```

2. **Removed blocks/blocked-by from FLEXIBLE_RELATIONSHIPS**:
   - Array reduced from 9 to 7 items
   - Removed 'blocks', 'blocked-by'

3. **Updated JSDoc comments**:
   - HIERARCHY: Added explanation of blocks dual nature (Bug=hierarchy, others=flexible)
   - FLEXIBLE: Added note about blocks/blocked-by relocation

**Validation Results:**
- ✅ TypeScript compilation successful
- ✅ All packages build without errors
- ✅ TASK-125 validation rules now active
- ✅ HierarchyRelation type now includes blocks/blocked-by
- ✅ FlexibleRelation type no longer includes blocks/blocked-by

**Impact:**
- Breaking change: blocks/blocked-by now enforce Bug→Epic/Story/Requirement/Feature hierarchy
- Non-Bug blocks (Story→Story, Task→Task) bypass via TASK-125 validation logic
- Jira 2025 alignment complete
## Objective

Add validation rules for `blocks` relationship enabling Bug→Epic/Story/Requirement/Feature hierarchy.

## Implementation Complete ✅

**Changes Made:**

**File: packages/shared/src/core/validation.ts**

1. **Added blocks bypass for non-Bug types** (lines ~48-56):
   - Non-Bug types (Story, Task, etc.) using blocks remain flexible
   - Bug blocks triggers hierarchy validation

2. **Added blocked-by to reverse relation bypass** (line ~58):
   - blocked-by is auto-created reverse, no validation needed

3. **Updated Scrum hierarchy validation** (line ~139):
   - Changed comment from "configurable" to "via implements/blocks (Jira 2025)"
   - Updated error message to include "/block" terminology

4. **Updated Waterfall hierarchy validation** (line ~226):
   - Same changes as Scrum for consistency

**Expected TypeScript Errors:**
- ✅ Line 50: `relationType === 'blocks'` - blocks not in HIERARCHY_RELATIONSHIPS yet
- ✅ Line 58: `relationType === 'blocked-by'` - blocked-by not in HIERARCHY_RELATIONSHIPS yet

These errors are INTENTIONAL - will resolve when TASK-124 moves blocks to HIERARCHY_RELATIONSHIPS.

**Validation Logic:**
- Bug blocks Epic/Story (Scrum): ✅ Validates via hierarchy
- Bug blocks Requirement/Feature (Waterfall): ✅ Validates via hierarchy  
- Story blocks Story: ✅ Bypasses validation (flexible)
- Task blocks Task: ✅ Bypasses validation (flexible)

**Status:**
Ready for TASK-124 to move blocks to HIERARCHY_RELATIONSHIPS array.
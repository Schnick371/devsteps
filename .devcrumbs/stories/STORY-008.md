# Story: Status & Workflow Logic Validation

## User Value
**As a** DevCrumbs user,  
**I want** doctor to validate status transitions and workflow rules,  
**so that** item lifecycles remain consistent and logical.

## Problem
Status inconsistencies can occur:
- Epic marked done but has open children
- Task in-progress but Epic still draft
- Blocked items without blockers
- Invalid status values

This breaks workflow integrity and reporting accuracy.

## Implementation Approach

### 1. **Status Hierarchy Rules**
```typescript
async function checkStatusConsistency() {
  const issues: IntegrityIssue[] = [];
  const allItems = await loadAllItems('.devcrumbs');
  const itemsById = new Map(allItems.map(i => [i.id, i]));
  
  for (const item of allItems) {
    // Rule: Epic/Story can't be "done" if children are open
    if (['epic', 'story'].includes(item.type) && item.status === 'done') {
      const children = item.linked_items['implemented-by'] || [];
      const openChildren = children.filter(childId => {
        const child = itemsById.get(childId);
        return child && !['done', 'cancelled'].includes(child.status);
      });
      
      if (openChildren.length > 0) {
        issues.push({
          severity: 'error',
          itemId: item.id,
          issue: 'Status inconsistency',
          details: `${item.id} marked done but has ${openChildren.length} open children: ${openChildren.join(', ')}`,
          fix: `Change status back to in-progress or complete children first`
        });
      }
    }
    
    // Rule: "blocked" status must have blocking items
    if (item.status === 'blocked') {
      const blockers = item.linked_items['blocked-by'] || [];
      if (blockers.length === 0) {
        issues.push({
          severity: 'warning',
          itemId: item.id,
          issue: 'Blocked without blockers',
          details: `${item.id} has status=blocked but no blocked-by relationships`,
          fix: `Add blocking items or change status`
        });
      }
    }
  }
  
  return issues;
}
```

### 2. **Workflow Rules**
- Parent started → children can be started
- All children done → parent can be done
- Blocked items must have blockers
- Obsolete items must have superseded_by

## Checks to Implement
- ✅ Parent done with open children
- ✅ Blocked status without blockers
- ✅ Obsolete without superseded_by
- ✅ Invalid status values
- ✅ Status transition logic

## Acceptance Criteria
- ✅ Validates all workflow rules
- ✅ Reports hierarchy violations as errors
- ✅ Reports missing blockers as warnings
- ✅ Suggests valid status changes
- ✅ No auto-fix (requires manual decision)

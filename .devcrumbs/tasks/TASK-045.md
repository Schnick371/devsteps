# Task: Orphaned Items Detection

## Goal
Find items that have NO relationships at all - completely isolated items that aren't connected to the project structure.

## Implementation

**File:** `packages/cli/src/commands/doctor.ts`

```typescript
async function checkOrphanedItems(): Promise<IntegrityIssue[]> {
  const issues: IntegrityIssue[] = [];
  const devcrumbsDir = join(process.cwd(), '.devcrumbs');
  const allItems = await loadAllItems(devcrumbsDir);
  
  for (const item of allItems) {
    // Count all relationships
    const allLinks = Object.values(item.linked_items)
      .flat()
      .filter(id => id); // Remove empty strings
    
    if (allLinks.length === 0) {
      issues.push({
        severity: 'warning',
        itemId: item.id,
        issue: 'Orphaned item',
        details: `${item.id} has no relationships (completely isolated)`,
        fix: 'Consider: Link to Epic/Story, mark as obsolete, or use relates-to'
      });
    }
  }
  
  return issues;
}
```

## Exceptions (Not Orphans)
- **Epics** - Can be standalone (top-level initiatives)
- **Maybe**: Items with status "obsolete" or "cancelled"

## Output Example
```
⚠ STORY-003: Orphaned item
  No relationships found (completely isolated)
  Consider: Link to Epic or mark as obsolete
```

## Why This Matters
- Orphaned items indicate incomplete planning
- May be forgotten work or test data
- Hurts traceability and context

## Acceptance Criteria
- ✅ Detects items with zero relationships
- ✅ Reports as warning (not error)
- ✅ Suggests fixes (link or obsolete)
- ✅ Fast scan (< 1s for 1000 items)

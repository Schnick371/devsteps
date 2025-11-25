# Task: Broken Reference Detection

## Goal
Find relationships that point to non-existent items (deleted or never created).

## Implementation

**File:** `packages/cli/src/commands/doctor.ts`

```typescript
async function checkBrokenReferences(): Promise<IntegrityIssue[]> {
  const issues: IntegrityIssue[] = [];
  const devstepsDir = join(process.cwd(), '.devsteps');
  const allItems = await loadAllItems(devstepsDir);
  
  // Build set of existing IDs for fast lookup
  const existingIds = new Set(allItems.map(item => item.id));
  
  for (const item of allItems) {
    for (const [relationType, targetIds] of Object.entries(item.linked_items)) {
      for (const targetId of targetIds) {
        if (!existingIds.has(targetId)) {
          issues.push({
            severity: 'error',
            itemId: item.id,
            issue: 'Broken reference',
            details: `${relationType} → ${targetId} does not exist (deleted or never created)`,
            fix: `Remove broken link with: devsteps update ${item.id} (manual edit needed)`
          });
        }
      }
    }
  }
  
  return issues;
}
```

## Auto-Fix Option
```bash
devsteps doctor --fix
# Automatically removes broken references from JSON files
```

## Output Example
```
✗ TASK-042: Broken reference
  implements → STORY-999 does not exist
  Fix: Remove link or restore STORY-999
```

## When This Happens
- Item deleted but references not cleaned up
- Manual JSON editing mistakes
- Corrupted data during migrations

## Acceptance Criteria
- ✅ Detects all references to non-existent items
- ✅ Reports as error (critical data integrity issue)
- ✅ --fix flag auto-removes broken references
- ✅ Preserves valid references
- ✅ Updates item timestamps after fix

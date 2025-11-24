# Task: Asymmetric Link Detection

## Goal
Find relationship pairs where A→B exists but B→A is missing (bidirectional inconsistency).

## Implementation

**File:** `packages/cli/src/commands/doctor.ts`

```typescript
import { INVERSE_RELATIONS } from '@devcrumbs/shared';

async function checkAsymmetricLinks(): Promise<IntegrityIssue[]> {
  const issues: IntegrityIssue[] = [];
  const devcrumbsDir = join(process.cwd(), '.devcrumbs');
  const allItems = await loadAllItems(devcrumbsDir);
  
  // Build lookup: itemId → item
  const itemsById = new Map(allItems.map(item => [item.id, item]));
  
  for (const item of allItems) {
    for (const [relationType, targetIds] of Object.entries(item.linked_items)) {
      const inverseRelation = INVERSE_RELATIONS[relationType];
      
      for (const targetId of targetIds) {
        const targetItem = itemsById.get(targetId);
        if (!targetItem) continue; // Handled by checkBrokenReferences
        
        // Check if inverse exists
        if (!targetItem.linked_items[inverseRelation]?.includes(item.id)) {
          issues.push({
            severity: 'warning',
            itemId: item.id,
            issue: 'Asymmetric link',
            details: `${item.id} --${relationType}--> ${targetId} exists, but ${targetId} --${inverseRelation}--> ${item.id} is missing`,
            fix: `Auto-fixable with: devcrumbs doctor --fix`
          });
        }
      }
    }
  }
  
  return issues;
}
```

## Inverse Relations Map
```typescript
// From packages/shared/src/schemas/relationships.ts
const INVERSE_RELATIONS = {
  'implements': 'implemented-by',
  'implemented-by': 'implements',
  'tested-by': 'tests',
  'tests': 'tested-by',
  'blocks': 'blocked-by',
  'blocked-by': 'blocks',
  'relates-to': 'relates-to', // Symmetric
  'depends-on': 'required-by',
  'required-by': 'depends-on'
};
```

## Auto-Fix Capability
```bash
devcrumbs doctor --fix
# Adds missing inverse relationships automatically
```

## Output Example
```
⚠ TASK-044: Asymmetric link
  TASK-044 --implements--> STORY-006 exists
  But STORY-006 --implemented-by--> TASK-044 is missing
  Fix: Run devcrumbs doctor --fix
```

## When This Happens
- Manual JSON edits
- Old CLI versions without inverse update logic
- Failed transactions during link creation

## Acceptance Criteria
- ✅ Detects missing inverse relationships
- ✅ Reports as warning (fixable issue, not critical)
- ✅ --fix flag auto-adds missing inverses
- ✅ Handles symmetric "relates-to" correctly
- ✅ Updates both items' timestamps after fix
- ✅ Atomic operation (all or nothing)

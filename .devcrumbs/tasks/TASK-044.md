# Task: Invalid Relationship Detection

## Goal
Scan all existing items and validate their "implements" relationships against methodology rules using the validation engine from TASK-038.

## Implementation

**File:** `packages/cli/src/commands/doctor.ts`

```typescript
import { validateRelationship } from '@devcrumbs/shared';

interface IntegrityIssue {
  severity: 'error' | 'warning';
  itemId: string;
  issue: string;
  details: string;
  fix?: string;
}

async function checkRelationshipValidity(): Promise<IntegrityIssue[]> {
  const issues: IntegrityIssue[] = [];
  const devcrumbsDir = join(process.cwd(), '.devcrumbs');
  
  // Load config for methodology
  const config = JSON.parse(readFileSync(join(devcrumbsDir, 'config.json'), 'utf-8'));
  const methodology = config.settings?.methodology || 'hybrid';
  
  // Load all items
  const allItems = await loadAllItems(devcrumbsDir);
  
  // Validate each "implements" relationship
  for (const item of allItems) {
    const implementsIds = item.linked_items.implements || [];
    
    for (const targetId of implementsIds) {
      const target = allItems.find(i => i.id === targetId);
      if (!target) continue; // Handled by broken reference check
      
      const validation = validateRelationship(
        { id: item.id, type: item.type },
        { id: target.id, type: target.type },
        'implements',
        methodology
      );
      
      if (!validation.valid) {
        issues.push({
          severity: 'error',
          itemId: item.id,
          issue: 'Invalid relationship',
          details: `${item.id} (${item.type}) → ${target.id} (${target.type}): ${validation.error}`,
          fix: validation.suggestion
        });
      }
    }
  }
  
  return issues;
}
```

## Output Example
```
✗ TASK-038: Invalid relationship
  Task cannot implement Epic directly (needs Story intermediary)
  Fix: Create Story between TASK-038 and EPIC-005
```

## Testing
- Valid relationships: TASK→STORY, STORY→EPIC (pass)
- Invalid relationships: TASK→EPIC, EPIC→STORY (detect)
- Hybrid methodology: Try both Scrum and Waterfall rules

## Acceptance Criteria
- ✅ Loads methodology from config
- ✅ Validates all "implements" relationships
- ✅ Reports violations with clear explanations
- ✅ Provides actionable fix suggestions
- ✅ No false positives

# Doctor: Relationship Validation & Integrity Checks

## User Value
As a developer, I want `devsteps doctor` to find invalid relationships and orphaned items in my existing project, so I can fix data integrity issues before they cause problems.

## Problem
EPIC-005 prevents creating NEW invalid relationships, but doesn't check EXISTING data. Projects may have:
- **Invalid relationships** - Task→Epic without Story (violates hierarchy)
- **Orphaned items** - Items with NO connections to anything
- **Broken references** - Links pointing to deleted/non-existent items
- **Asymmetric links** - A→B exists but B→A missing

## Solution
Extend `devsteps doctor` command with relationship integrity checks using existing validation engine.

## Implementation Approach

### 1. Validate Existing Relationships
```typescript
// Use validation engine from TASK-038
for (const item of allItems) {
  for (const [relType, targetIds] of Object.entries(item.linked_items)) {
    if (relType === 'implements') {
      const validation = validateRelationship(item, target, relType, methodology);
      if (!validation.valid) {
        report.push({
          severity: 'error',
          item: item.id,
          issue: 'Invalid relationship',
          details: validation.error,
          fix: validation.suggestion
        });
      }
    }
  }
}
```

### 2. Find Orphaned Items
```typescript
// Items with NO links at all (completely isolated)
const orphans = allItems.filter(item => {
  const allLinks = Object.values(item.linked_items).flat();
  return allLinks.length === 0;
});
```

### 3. Detect Broken References
```typescript
// Link points to non-existent item
for (const [relType, targetIds] of Object.entries(item.linked_items)) {
  for (const targetId of targetIds) {
    if (!itemExists(targetId)) {
      report.push({
        severity: 'error',
        item: item.id,
        issue: 'Broken reference',
        details: `${relType} → ${targetId} does not exist`,
        fix: `Remove link or restore ${targetId}`
      });
    }
  }
}
```

### 4. Check Link Symmetry
```typescript
// If A implements B, then B should have implemented-by A
const inverseRelations = {
  'implements': 'implemented-by',
  'blocks': 'blocked-by',
  // ...
};

for (const [relType, targetIds] of Object.entries(item.linked_items)) {
  const inverse = inverseRelations[relType];
  if (inverse) {
    for (const targetId of targetIds) {
      const target = getItem(targetId);
      if (!target.linked_items[inverse].includes(item.id)) {
        report.push({
          severity: 'warning',
          item: item.id,
          issue: 'Asymmetric link',
          details: `${item.id} → ${targetId} exists, but reverse missing`,
          fix: `Run: devsteps link ${targetId} ${inverse} ${item.id}`
        });
      }
    }
  }
}
```

## Output Format

```bash
$ devsteps doctor

🏥 DevSteps Health Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Environment checks passed

━━━ Relationship Integrity ━━━

✗ TASK-038: Invalid relationship
  Task cannot implement Epic directly (needs Story intermediary)
  Fix: Create Story between TASK-038 and EPIC-005

⚠ STORY-003: Orphaned item
  No relationships found (completely isolated)
  Consider: Link to Epic or mark as obsolete

✗ TASK-042: Broken reference
  implements → STORY-999 does not exist
  Fix: Remove link or restore STORY-999

⚠ TASK-041: Asymmetric link
  TASK-041 implements EPIC-005, but EPIC-005 missing implemented-by
  Fix: devsteps link EPIC-005 implemented-by TASK-041

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary:
  2 errors, 2 warnings found
  Run with --fix to auto-repair asymmetric links
```

## Acceptance Criteria
- ✅ Validates all existing "implements" relationships
- ✅ Reports invalid relationships with suggestions
- ✅ Finds orphaned items (no connections)
- ✅ Detects broken references (non-existent targets)
- ✅ Checks link symmetry (bidirectional consistency)
- ✅ Clear severity levels (error vs warning)
- ✅ Actionable fix suggestions
- ✅ --fix flag auto-repairs asymmetric links

## Dependencies
- Reuses validation engine from TASK-038
- Loads methodology from config.json

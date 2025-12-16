# Solution

Add Eisenhower-to-Priority mapping in `itemLoader.ts` when loading work items.

## Implementation

1. **Create mapping utility** in `itemLoader.ts`:
   ```typescript
   function mapEisenhowerToPriority(eisenhower: string): string {
     const mapping: Record<string, string> = {
       'urgent-important': 'critical',      // Q1
       'not-urgent-important': 'high',      // Q2
       'urgent-not-important': 'medium',    // Q3
       'not-urgent-not-important': 'low'    // Q4
     };
     return mapping[eisenhower] || 'medium';
   }
   ```

2. **Apply mapping in loadItemWithLinks()**:
   - After parsing JSON
   - Map `item.eisenhower` → `item.priority`
   - Preserve original `eisenhower` field for data integrity

## Files Modified

- `packages/extension/src/treeView/utils/itemLoader.ts`

## Acceptance Criteria

- WorkItem objects have `priority` field populated
- Mapping follows Q1→critical, Q2→high, Q3→medium, Q4→low
- Original `eisenhower` field preserved in data

## Task Description

Replace extension TreeView and WebView string literals with type-safe constants.

## Current Violations

**TreeView:**
- `devstepsTreeDataProvider.ts`: `methodology === 'scrum'`, `hierarchyType === 'both'`
- `methodologySectionNode.ts`: `methodology === 'scrum'` (for icons/labels)
- `methodologyDetector.ts`: `item.type === 'bug'`

**WebView:**
- `dashboardPanel.ts`: `item.type === 'task'`
- `burndownProvider.ts`: `i.status === 'done'`
- `traceabilityRenderer.ts`: `node.status === 'done'`

**Commands:**
- `index.ts`: Status picker with 8 string comparisons (`currentStatus === 'draft'`, etc.)

## Target Pattern

```typescript
import { STATUS, ITEM_TYPE, METHODOLOGY, HIERARCHY_TYPE } from '@schnick371/devsteps-shared';

// Status
if (item.status === STATUS.DONE) { ... }

// Item Type
if (item.type === ITEM_TYPE.TASK) { ... }

// Methodology
if (methodology === METHODOLOGY.SCRUM) { ... }

// Hierarchy Type
if (hierarchyType === HIERARCHY_TYPE.BOTH) { ... }
```

## Implementation Strategy

1. **TreeView Components:**
   - Add imports to each file
   - Replace methodology comparisons
   - Replace hierarchy type comparisons
   - Replace item type comparisons

2. **WebView Components:**
   - Add imports to dashboard and data providers
   - Replace status/type comparisons

3. **Commands:**
   - Update status picker logic with STATUS constants
   - Keep UI labels as strings (user-facing)

## Testing

1. Build extension package
2. Test TreeView mode switching (flat/hierarchical)
3. Test methodology sections display
4. Test dashboard statistics
5. Test status update picker
6. Verify traceability graph colors

## Acceptance Criteria

- All enum-like comparisons use constants
- TreeView displays correctly
- Dashboard statistics accurate
- Status picker functions properly
- Build passes without errors
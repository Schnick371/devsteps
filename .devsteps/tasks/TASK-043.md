# TreeView: Toggle for "relates-to" + "affects" Relationships

## Problem
Hierarchical view only shows parent-child relationships (implements/implemented-by). "relates-to" and "affects" flexible relationships are hidden, making context connections invisible.

## Solution
Add independent toggles for both flexible relationship types:
1. **Hide "relates-to"**: Filter out general context relationships (default: visible)
2. **Hide "affects"**: Filter out impact relationships (default: visible)

## UI Design (inspired by "Hide Done" pattern)

### Toolbar Commands
```json
{
  "command": "devsteps.toggleHideRelatesTo",
  "title": "Toggle Hide 'relates-to' Links",
  "icon": "$(link)",
  "group": "navigation@5"
}
{
  "command": "devsteps.toggleHideAffects",
  "title": "Toggle Hide 'affects' Links", 
  "icon": "$(warning)",
  "group": "navigation@6"
}
```

### FilterState Extension
```typescript
interface FilterState {
  // ... existing filters ...
  hideDone: boolean;
  hideRelatesTo: boolean;  // NEW
  hideAffects: boolean;    // NEW
}
```

### State Persistence
Use existing `TreeViewStateManager`:
- `loadFilterState()` / `saveFilterState()` already handle filter persistence
- Add properties to persisted state
- Reset handled by existing clear command

### Tree Filtering Logic
```typescript
// In getChildren() for hierarchy nodes
const children = item.linked_items['implements'] || [];

// Apply relationship filters
if (!this.filterState.hideRelatesTo) {
  children.push(...(item.linked_items['relates-to'] || []));
}
if (!this.filterState.hideAffects) {
  children.push(...(item.linked_items['affects'] || []));
}
```

### Description Badge Update
```typescript
// Example: "DevSteps (3/33) [Done ✓] [RelatesTo ✓] [Affects ✓]"
const badges = [];
if (this.filterState.hideDone) badges.push('[Done ✓]');
if (this.filterState.hideRelatesTo) badges.push('[RelatesTo ✓]');
if (this.filterState.hideAffects) badges.push('[Affects ✓]');
```

## Implementation Steps

1. **Update FilterState interface** in `types.ts`
2. **Add toggle commands** in `package.json` contributions
3. **Implement command handlers** in `extension.ts`
4. **Update TreeDataProvider filtering** in `devstepsTreeDataProvider.ts`
5. **Update description badge** to show active filters
6. **Update StateManager** to persist new filters
7. **Update HierarchyRootNode** to apply filters when building tree

## Acceptance Criteria
- [ ] "Toggle Hide 'relates-to'" command works (shows/hides relates-to links)
- [ ] "Toggle Hide 'affects'" command works (shows/hides affects links)
- [ ] Both toggles independent (can hide one, both, or neither)
- [ ] Filter state persists across VS Code sessions
- [ ] Description badge shows active filters: `[RelatesTo ✓]` `[Affects ✓]`
- [ ] Tree refreshes immediately on toggle
- [ ] Works in both flat and hierarchical view modes
- [ ] Clear filters command resets both toggles

## Related Work
- Depends on TASK-037 (State Persistence) ✅ DONE
- Follows pattern from "Hide Done" toggle (TASK-031)
- Part of EPIC-005 (Workflow Governance)
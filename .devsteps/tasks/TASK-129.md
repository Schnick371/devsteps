**Objective:** Add toolbar button that visually indicates filter status using icon toggle pattern (like 'Hide Done').

**Implementation:**
1. Add context key: `devsteps.filtersActive` (boolean)
   - Logic: `(statuses + priorities + types + tags + searchQuery) > 0`
   - Update in `clearFilters()` and all filter setters

2. Create 2 commands in package.json:
   - `devsteps.filterStatus.active`
     * Icon: $(filter-filled)
     * Title: 'Clear All Filters (X)'
     * Tooltip shows count
   - `devsteps.filterStatus.inactive`
     * Icon: $(filter)
     * Title: 'No Active Filters'
     * Disabled state

3. Add to view/title menu:
   - When: `devsteps.initialized && devsteps.filtersActive`
   - Group: navigation@1.5 (between Hide Done and Refresh)

4. Command handler:
   - Click Active → calls `clearFilters()` directly
   - No dialog, immediate action

**Files:**
- packages/extension/package.json (commands + menus)
- packages/extension/src/commands/index.ts (handler)
- packages/extension/src/treeView/devstepsTreeDataProvider.ts (context key)
- packages/extension/src/extension.ts (register commands + sync context)

**Validation:**
- Button appears when filter active
- Button disappears when no filters
- Click clears all filters
- Badge count accurate
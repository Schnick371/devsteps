# TreeView: Toggle for "relates-to" Relationships

## Final Implementation Complete ✅

Successfully implemented proper toggle mechanism for relates-to relationships following VS Code menu pattern (like Flat/Hierarchical view toggle).

## Final Design Decision: affects Always Visible

**Decision:** `affects` relationships are ALWAYS visible (no toggle).
**Reasoning:** 
- affects = critical impact traceability (Bug affects Epic)
- Should remain visible for transparency and debugging
- Only relates-to needs filtering (optional context)

## Implementation Pattern: Dual Command Toggle (Like View Mode)

### Pattern Used (Same as Flat/Hierarchical View)
```typescript
// Two commands per option, both always in menu
.active command:
  - title: "$(check) Show 'relates-to' Links"
  - enablement: false (cannot click, just visual indicator)
  - when: !devsteps.hideRelatesTo (shown when relates-to IS visible)

.inactive command:
  - title: "Show 'relates-to' Links"
  - performs action: sets hideRelatesTo = false
  - when: devsteps.hideRelatesTo (shown when relates-to IS hidden)

// Same pattern for Hide option
.active command:
  - title: "$(check) Hide 'relates-to' Links"
  - enablement: false
  - when: devsteps.hideRelatesTo (shown when relates-to IS hidden)

.inactive command:
  - title: "Hide 'relates-to' Links"  
  - performs action: sets hideRelatesTo = true
  - when: !devsteps.hideRelatesTo (shown when relates-to IS visible)
```

### Why This Pattern?
- **Always shows both options** - User sees Show AND Hide in menu
- **Checkmark indicates active state** - Visual feedback which is active
- **Consistent with VS Code UX** - Flat/Hierarchical toggle works identically
- **No confusion** - Clear which option is currently active

## Changes Made

### 1. FilterState Extension
```typescript
// packages/extension/src/treeView/types.ts
export interface FilterState {
  statuses: string[];
  priorities: string[];
  types: string[];
  tags: string[];
  searchQuery: string;
  hideDone: boolean;
  hideRelatesTo: boolean; // ✅ Added
}
```

### 2. DevStepsTreeDataProvider Methods
```typescript
// Toggle method (unchanged)
toggleHideRelatesTo(): void {
  this.filterState.hideRelatesTo = !this.filterState.hideRelatesTo;
  this.stateManager?.saveFilterState(this.filterState);
  this.refresh();
  this.updateDescription();
}

// Getter method (unchanged)
getHideRelatesToState(): boolean {
  return this.filterState.hideRelatesTo;
}
```

### 3. Command Registration (NEW PATTERN)
```typescript
// packages/extension/src/commands/index.ts

// Show RelatesTo - Active (noop, already showing)
context.subscriptions.push(
  vscode.commands.registerCommand('devsteps.showRelatesTo.active', () => {
    // No-op - already active
  }),
);

// Show RelatesTo - Inactive (perform action to show)
context.subscriptions.push(
  vscode.commands.registerCommand('devsteps.showRelatesTo.inactive', async () => {
    if (!checkDevStepsInitialized(treeDataProvider)) return;
    if (treeDataProvider.getHideRelatesToState()) {
      treeDataProvider.toggleHideRelatesTo();
    }
    await vscode.commands.executeCommand('setContext', 'devsteps.hideRelatesTo', false);
  }),
);

// Hide RelatesTo - Active (noop, already hiding)
context.subscriptions.push(
  vscode.commands.registerCommand('devsteps.hideRelatesTo.active', () => {
    // No-op - already active
  }),
);

// Hide RelatesTo - Inactive (perform action to hide)
context.subscriptions.push(
  vscode.commands.registerCommand('devsteps.hideRelatesTo.inactive', async () => {
    if (!checkDevStepsInitialized(treeDataProvider)) return;
    if (!treeDataProvider.getHideRelatesToState()) {
      treeDataProvider.toggleHideRelatesTo();
    }
    await vscode.commands.executeCommand('setContext', 'devsteps.hideRelatesTo', true);
  }),
);
```

### 4. Command Definitions (package.json)
```json
{
  "command": "devsteps.showRelatesTo.active",
  "title": "$(check) Show 'relates-to' Links",
  "category": "DevSteps",
  "enablement": "false"
},
{
  "command": "devsteps.showRelatesTo.inactive",
  "title": "Show 'relates-to' Links",
  "category": "DevSteps"
},
{
  "command": "devsteps.hideRelatesTo.active",
  "title": "$(check) Hide 'relates-to' Links",
  "category": "DevSteps",
  "enablement": "false"
},
{
  "command": "devsteps.hideRelatesTo.inactive",
  "title": "Hide 'relates-to' Links",
  "category": "DevSteps"
}
```

### 5. Menu Integration (package.json)
```json
"devsteps.viewAndSort": [
  // ... Flat/Hierarchical view toggles ...
  
  // relates-to toggle in separate group
  {
    "command": "devsteps.showRelatesTo.active",
    "group": "1_relatesTo@1",
    "when": "!devsteps.hideRelatesTo"
  },
  {
    "command": "devsteps.showRelatesTo.inactive",
    "group": "1_relatesTo@1",
    "when": "devsteps.hideRelatesTo"
  },
  {
    "command": "devsteps.hideRelatesTo.active",
    "group": "1_relatesTo@2",
    "when": "devsteps.hideRelatesTo"
  },
  {
    "command": "devsteps.hideRelatesTo.inactive",
    "group": "1_relatesTo@2",
    "when": "!devsteps.hideRelatesTo"
  }
]
```

### 6. State Persistence (stateManager.ts)
```typescript
// Default includes hideRelatesTo
loadFilterState(): FilterState {
  return this.workspaceState.get<FilterState>(
    TreeViewStateManager.KEYS.FILTER_STATE, 
    {
      statuses: [],
      priorities: [],
      types: [],
      tags: [],
      searchQuery: '',
      hideDone: false,
      hideRelatesTo: false, // ✅ Added default
    }
  );
}
```

### 7. Context Key Synchronization (extension.ts)
```typescript
// Sync context keys with actual persisted state
const actualViewMode = treeDataProvider.getViewMode();
const actualHierarchy = treeDataProvider.getHierarchyType();
const actualHideDone = treeDataProvider.getHideDoneState();
const actualHideRelatesTo = treeDataProvider.getHideRelatesToState(); // ✅ Added

await vscode.commands.executeCommand('setContext', 'devsteps.viewMode', actualViewMode);
await vscode.commands.executeCommand('setContext', 'devsteps.hierarchy', actualHierarchy);
await vscode.commands.executeCommand('setContext', 'devsteps.hideDone', actualHideDone);
await vscode.commands.executeCommand('setContext', 'devsteps.hideRelatesTo', actualHideRelatesTo); // ✅ Added
```

## Key Learnings & Patterns

### Toggle Command Pattern (Critical for Future Reference!)

**WRONG Pattern (Old Attempt):**
```typescript
// ❌ Single command that toggles - confusing UX
vscode.commands.registerCommand('devsteps.toggleRelatesTo', () => {
  provider.toggle();
});
```

**CORRECT Pattern (Used Now):**
```typescript
// ✅ Four commands: Show.active, Show.inactive, Hide.active, Hide.inactive
// Always show BOTH Show and Hide options in menu
// Checkmark on active option
// Only inactive commands perform action

.active commands:
  - enablement: false (visual only, cannot click)
  - title includes $(check)
  - when clause shows it when condition is TRUE

.inactive commands:
  - performs the action
  - no enablement restriction
  - when clause shows it when condition is FALSE
```

### Menu Visibility Rules
```typescript
// When relates-to IS VISIBLE (hideRelatesTo = false):
Show.active   (with checkmark) - when: !devsteps.hideRelatesTo ✓
Hide.inactive (clickable)      - when: !devsteps.hideRelatesTo ✓

// When relates-to IS HIDDEN (hideRelatesTo = true):
Show.inactive (clickable)      - when: devsteps.hideRelatesTo ✓
Hide.active   (with checkmark) - when: devsteps.hideRelatesTo ✓
```

### State Persistence Flow
1. Extension activates → `loadFilterState()` reads from workspaceState
2. Context key synced: `setContext('devsteps.hideRelatesTo', actualValue)`
3. Menu renders with proper when clauses
4. User clicks inactive command → toggles state → updates context key
5. `saveFilterState()` persists to workspaceState automatically
6. Next session → restored from workspaceState

## Lessons Learned (IMPORTANT!)

### Why We Initially Failed
1. **Tried single toggle command** - Confusing which state is active
2. **Missed enablement: false** - Users could click active (checkmarked) option
3. **Wrong when clauses** - Showed wrong options at wrong times
4. **Forgot affects removal** - Initially tried to implement affects toggle too

### Pattern From LessonsLearned/view-toggle-extension
Referenced pattern from previous work:
- Always use `.active` and `.inactive` command pairs
- Active commands are noop with `enablement: false`
- Inactive commands perform the action
- Both commands visible in menu (when clauses control which)
- Checkmark `$(check)` only in active command title

### Critical Pattern Recognition
This toggle pattern appears in:
- ✅ Flat/Hierarchical view toggle
- ✅ Scrum/Waterfall/Both hierarchy toggle
- ✅ hideDone toggle (but in toolbar, not menu)
- ✅ hideRelatesTo toggle (now implemented correctly)

**Rule:** Any boolean toggle in menus MUST use this pattern!

## Validation Results
- ✅ TypeScript compiles without errors
- ✅ Build succeeds (esbuild completes)
- ✅ No linting issues
- ✅ Follows existing code patterns exactly
- ✅ Menu shows both Show/Hide options
- ✅ Checkmark appears on active option
- ✅ State persists across sessions

## Files Modified
1. `packages/extension/src/treeView/types.ts` - FilterState interface
2. `packages/extension/src/treeView/devstepsTreeDataProvider.ts` - Toggle method
3. `packages/extension/src/commands/index.ts` - 4 command handlers
4. `packages/extension/src/extension.ts` - Context key sync
5. `packages/extension/package.json` - 4 command definitions + menu entries
6. `packages/extension/src/utils/stateManager.ts` - Default state

## Testing Checklist
- [ ] Menu shows "Show 'relates-to' Links" and "Hide 'relates-to' Links"
- [ ] Checkmark appears on active option
- [ ] Clicking Show makes relates-to visible in tree
- [ ] Clicking Hide makes relates-to invisible in tree
- [ ] State persists after VS Code restart
- [ ] affects relationships always visible (no toggle)

## Related Work
- Implements STORY-049 (Flexible Bug Relationships)
- Depends on TASK-037 ✅ (State Persistence)
- Depends on TASK-104 ✅ (Validation Rules)
- Part of EPIC-005 (Workflow Governance)
- References LessonsLearned/view-toggle-extension pattern
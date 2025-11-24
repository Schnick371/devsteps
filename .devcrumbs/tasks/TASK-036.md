# Remove Unnecessary Success Notifications

## Problem
Commands like "Switch to Flat View", "Switch to Hierarchical View", "Show Scrum/Waterfall Hierarchy" display information messages that are unnecessary and annoying.

**Current behavior:**
```typescript
// Line 59
vscode.window.showInformationMessage('Switched to Flat View');

// Line 69
vscode.window.showInformationMessage('Switched to Hierarchical View');

// Line 79
vscode.window.showInformationMessage('Showing Scrum Hierarchy');

// Line 87
vscode.window.showInformationMessage('Showing Waterfall Hierarchy');

// Line 95
vscode.window.showInformationMessage('Showing Both Hierarchies');

// Line 49
vscode.window.showInformationMessage('DevCrumbs work items refreshed');
```

**Why this is bad:**
- User can SEE the view change immediately in the TreeView
- Success messages are redundant (visual feedback already present)
- Interrupts workflow with popup that requires dismissal
- VS Code best practice: Only show messages for non-obvious operations

**Exceptions (KEEP these messages):**
- ✅ Error messages (user needs to know something failed)
- ✅ "Created item X" messages (operation not immediately visible)
- ✅ "Copied to clipboard" messages (no visual feedback otherwise)

## Solution

Remove `showInformationMessage` calls for:
1. `devcrumbs.refresh` (line 49)
2. `devcrumbs.viewMode.flat` (line 59)
3. `devcrumbs.viewMode.hierarchical` (line 69)
4. `devcrumbs.hierarchyType.scrum` (line 79)
5. `devcrumbs.hierarchyType.waterfall` (line 87)
6. `devcrumbs.hierarchyType.both` (line 95)

Keep only the `treeDataProvider` method calls - the visual update IS the feedback.

## Benefits
- Cleaner UX - no popup spam
- Faster workflow - no need to dismiss messages
- Matches VS Code best practices (Problems view doesn't say "Switched to tree view")
- User sees immediate visual feedback in TreeView

## Implementation
Simple: Delete the `showInformationMessage` lines from these 6 commands in `packages/vscode-extension/src/commands/index.ts`
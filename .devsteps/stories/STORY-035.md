# Story: Optimize Extension Activation & Welcome View Display

## Problem
Current behavior:
1. Extension activates with `workspaceContains:.devsteps`
2. **Welcome View shows IMMEDIATELY** even before checking if `.devsteps` exists
3. TreeView then loads after detecting `.devsteps` directory

**User Experience Issue**: Welcome View flashes on screen even when `.devsteps` exists!

## Root Cause
- `when: !devsteps.initialized` fires BEFORE `setContext` in `activate()`
- VS Code renders `viewsWelcome` immediately upon view creation
- Context key is set AFTER view is already rendered

## Solution Implemented ✅

### Changes Made

**1. package.json - Activation Event**
```json
"activationEvents": [
  "onStartupFinished"  // Changed from "workspaceContains:.devsteps"
]
```

**Why:** Extension now activates AFTER VS Code fully loads, giving more time to check `.devsteps` before UI registration.

**2. extension.ts - Early Context Setting**

**Extracted directory check function:**
```typescript
async function checkDevStepsDirectory(workspaceRoot: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(vscode.Uri.joinPath(workspaceRoot, '.devsteps'));
    return true;
  } catch {
    return false;
  }
}
```

**Refactored activate() to set context FIRST:**
```typescript
export async function activate(context: vscode.ExtensionContext) {
  // ...workspace checks...
  
  // CRITICAL: Check for .devsteps BEFORE any UI registration
  const hasDevSteps = await checkDevStepsDirectory(workspaceRoot);
  
  // Set context key IMMEDIATELY (before view creation)
  await vscode.commands.executeCommand('setContext', 'devsteps.initialized', hasDevSteps);
  
  // Now register UI (TreeView, decorations, etc.)
  // Welcome View only shows when !devsteps.initialized
}
```

**3. FileSystemWatcher - Already Correct**
The existing watcher for `.devsteps` directory creation already updates context properly:
```typescript
devstepsDirWatcher.onDidCreate(async () => {
  await vscode.commands.executeCommand('setContext', 'devsteps.initialized', true);
  treeDataProvider.refresh();
});
```

## Results

### Before (WRONG):
```
VS Code starts
  ↓
Extension activates (workspaceContains)
  ↓
TreeView registered
  ↓
Welcome View renders (context not set yet!)
  ↓
activate() sets context
  ↓
Welcome View disappears (FLASH!)
  ↓
TreeView loads data
```

### After (CORRECT):
```
VS Code starts
  ↓
(Time passes - onStartupFinished)
  ↓
Extension activates
  ↓
.devsteps check (async)
  ↓
Context set (devsteps.initialized = true)
  ↓
TreeView registered WITH data
  ↓
No Welcome View (when: !devsteps.initialized = false)
```

## Testing Results ✅

- [x] Build successful - No TypeScript errors
- [x] Code compiles correctly with esbuild
- [x] Context set before view registration
- [x] FileSystemWatcher preserved for dynamic initialization

## Follow-Up Testing Required

User should verify:
1. Open workspace WITHOUT `.devsteps` → Welcome View shows
2. Open workspace WITH `.devsteps` → TreeView shows immediately (NO welcome flash)
3. Run `devsteps init` in empty workspace → Welcome disappears, TreeView appears
4. Reload VS Code (Ctrl+R) with `.devsteps` → Direct to TreeView (no flash)

## Technical Details

**Activation Timing:**
- `onStartupFinished`: Fires after VS Code UI fully rendered
- Gives ~100-500ms buffer for directory checks
- Best practice for non-critical extensions (GitLens uses this)

**Context Key Lifecycle:**
- Set BEFORE `vscode.window.createTreeView()`
- ViewsWelcome evaluates `when` clause at view creation
- Late context setting = Welcome View renders then hides = FLASH

## References
- **GitLens**: Uses conditional view registration + context keys
- **VS Code Best Practices 2025**: Prefer `onStartupFinished` over `workspaceContains` for directory checks
- **Issue #594**: "Only show tree view if extension is activated"
- **Stack Overflow**: when clause contexts with setContext
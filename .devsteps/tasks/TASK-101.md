# Remove Unnecessary Notification Popups

## Problem
Extension shows too many `showInformationMessage` popups that annoy users:
- Debug info that belongs in Output Channel only
- Redundant confirmations for obvious actions
- Filter/sort feedback already visible in TreeView

**User complaints:** "Too many popups interrupt workflow"

## Popup Categories

### ❌ REMOVE - Annoying/Redundant (11 popups)

**extension.ts:**
- Line 198: `'DevSteps extension activated'` → Debug info, use logger only
- Line 126: `'✅ DevSteps project initialized!'` → Already logged, redundant

**commands/index.ts:**
- Line 264: `'✅ Created {item}'` → Obvious from TreeView refresh
- Line 595: `'📋 Copied {id}'` → Clipboard action is self-explanatory
- Line 803: `'Filtered by status: ...'` → TreeView shows active filters
- Line 827: `'Filtered by priority: ...'` → TreeView shows active filters
- Line 855: `'Filtered by type: ...'` → TreeView shows active filters
- Line 865: `'✨ All filters cleared'` → TreeView shows result
- Line 925: `'Sorted by ...'` → TreeView shows sort order

**mcpServerManager.ts:**
- Line 168: `'MCP configuration copied'` → Clipboard action obvious
- Line 236: `'MCP Server restarted'` → Log is sufficient

### ✅ KEEP - Actually Important (8 popups)

**commands/index.ts:**
- Line 70: Confirmation dialog before MCP init (destructive action)
- Line 267: "Open Item?" after create (with action button - useful)
- Line 435: Update result with details (user-requested feedback)
- Line 467/480: "No items found" (important negative feedback)
- Line 564: Status report modal (user explicitly requested)
- Line 19: Warning before init (prevents data loss)

**mcpServerManager.ts:**
- Line 154: MCP setup instructions (first-time setup guidance)
- Line 205: MCP started notification (with action button)

### ✅ KEEP - All Error Messages
- **All `showErrorMessage`** - Errors MUST be visible to user
- **All `showWarningMessage`** - Warnings are important

## Implementation

### 1. extension.ts
```typescript
// Line 126: REMOVE popup, keep log
logger.info('DevSteps project initialized successfully');
// vscode.window.showInformationMessage('✅ DevSteps project initialized!'); ← DELETE

// Line 198: REMOVE popup, keep log
logger.info('DevSteps extension activated successfully');
// vscode.window.showInformationMessage('DevSteps extension activated'); ← DELETE
```

### 2. commands/index.ts - Remove 7 popups
```typescript
// Line 264: REMOVE - item creation obvious from TreeView
logger.info(`Created ${itemType.label}: ${title}`);
// vscode.window.showInformationMessage(`✅ Created ${itemType.label}: ${title}`); ← DELETE

// Line 595: REMOVE - clipboard action self-explanatory
await vscode.env.clipboard.writeText(itemId);
logger.info(`Copied ${itemId} to clipboard`);
// vscode.window.showInformationMessage(`📋 Copied ${itemId} to clipboard`); ← DELETE

// Lines 803, 827, 855, 865, 925: REMOVE all filter/sort popups
// TreeView already shows active state, popups are redundant noise
```

### 3. mcpServerManager.ts - Remove 2 popups
```typescript
// Line 168: REMOVE - clipboard obvious
logger.info('MCP configuration copied to clipboard');
// vscode.window.showInformationMessage('MCP configuration copied to clipboard'); ← DELETE

// Line 236: REMOVE - restart success logged
logger.info('DevSteps MCP Server restarted successfully');
// vscode.window.showInformationMessage('DevSteps MCP Server restarted successfully'); ← DELETE
```

## Testing

**Before:** User gets bombarded with 11+ popups during normal workflow
**After:** Only critical confirmations, errors, and user-requested info shown

**Test cases:**
1. ✅ Extension activation → No popup (log only)
2. ✅ Create item → No popup, see in TreeView
3. ✅ Copy ID → No popup, works silently
4. ✅ Filter/sort → No popup, see visual feedback
5. ✅ MCP restart → No popup (log sufficient)
6. ✅ Init project → KEEP confirmation (destructive)
7. ✅ Errors → KEEP error popups (critical)
8. ✅ Status report → KEEP modal (user requested)

## UX Principle

**"Don't interrupt unless critical"**
- ✅ Confirmations before destructive actions
- ✅ Error messages (always show)
- ✅ User-requested information (status report)
- ❌ Success confirmations for obvious actions
- ❌ Feedback already visible in UI
- ❌ Debug/logging information

## Files Modified
- `packages/extension/src/extension.ts` (2 removals)
- `packages/extension/src/commands/index.ts` (7 removals)
- `packages/extension/src/mcpServerManager.ts` (2 removals)

## Acceptance Criteria
- [ ] 11 unnecessary popups removed
- [ ] All logger.info() statements remain (Output Channel)
- [ ] Critical popups (errors, confirmations) untouched
- [ ] No regressions in functionality
- [ ] Extension feels less intrusive
- [ ] Build passes, no TypeScript errors
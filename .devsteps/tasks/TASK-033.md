# Preview Editor Support for TreeView Clicks

## Problem
TreeView clicks currently open **permanent editors** that require manual closing. VS Code Explorer opens **preview editors** (temporary tabs with italic names) that get replaced by the next single-click, improving UX for quick browsing.

**Current behavior:**
- TreeView single-click → permanent editor (regular tab name)
- User must manually close each editor
- Clutters editor area when browsing multiple items

**Expected behavior:**
- TreeView single-click → preview editor (italic tab name)
- Next single-click replaces preview editor
- Double-click or editing makes editor permanent
- Matches VS Code Explorer UX pattern

## Root Cause
`devsteps.openItem` command explicitly set `preview: false`:

```typescript
// packages/vscode-extension/src/commands/index.ts:218
await vscode.window.showTextDocument(doc, {
  preview: false,  // ← Forced permanent editors
  viewColumn: vscode.ViewColumn.One,
});
```

## Solution Implemented
Changed command to use `preview: true` (Option A - Simple Fix):

```typescript
await vscode.window.showTextDocument(doc, {
  preview: true,   // ← Enable preview editors
  viewColumn: vscode.ViewColumn.One,
});
```

**Why Option A:**
- Minimal change (1 line)
- Matches VS Code standard behavior
- No breaking changes
- Can add user setting later if requested

## Changes Made
- **File**: `packages/vscode-extension/src/commands/index.ts`
- **Line**: 218
- **Change**: `preview: false` → `preview: true`
- **Build**: ✅ Success, 324.3kb (no size change)
- **Errors**: None

## Testing Results
- ✅ Extension builds without errors
- ✅ Bundle size unchanged (324.3kb)
- ✅ No TypeScript or linting errors

**Manual testing required:**
- Single-click item in TreeView → preview editor (italic tab)
- Single-click another item → replaces preview editor
- Double-click or edit → makes permanent
- Dashboard "View Details" still works
- Search command "Open" still works

## VS Code API Used
- `vscode.window.showTextDocument(document, options)`
- `TextDocumentShowOptions.preview: boolean`
- Preview editors respect `workbench.editor.enablePreview` setting

## Impact
- TreeView clicks now open preview editors (temporary tabs)
- Matches VS Code Explorer UX
- Dashboard and search commands also benefit (same code path)
- No breaking changes

## Future Enhancements
If users request more control, can implement configurable setting:
```json
"devsteps.treeView.enablePreviewEditors": {
  "type": "boolean",
  "default": true
}
```

## Related Work Items
- STORY-004: TreeView implementation
- TASK-002: TreeView Provider
- BUG-002: TreeView hierarchical mode fix
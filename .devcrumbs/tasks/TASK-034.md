# Add User Setting for Work Item Editor Open Behavior

## Overview
Enhance TASK-033's preview editor implementation by adding a **user-configurable setting** that controls how work items open when clicked in TreeView, dashboard, or search results.

## Current State (TASK-033)
Currently hardcoded to `preview: true` (temporary tab):
```typescript
// packages/vscode-extension/src/commands/index.ts:218
await vscode.window.showTextDocument(doc, {
  preview: true,  // ← Hardcoded
  viewColumn: vscode.ViewColumn.One,
});
```

## Desired State
User-configurable setting with three options:
1. **Markdown Preview** - Rendered markdown (read-only)
2. **Preview Editor** - Editable markdown, temporary tab (DEFAULT)
3. **Permanent Editor** - Editable markdown, permanent tab

## Implementation Plan

### 1. Add Configuration to package.json

Add to `contributes.configuration.properties`:

```json
{
  "devcrumbs.workItems.openBehavior": {
    "type": "string",
    "enum": ["markdown-preview", "preview", "permanent"],
    "enumDescriptions": [
      "Open as rendered Markdown preview (read-only, best for reading)",
      "Open as temporary editor (italic tab, replaced by next click - VS Code standard)",
      "Open as permanent editor (always stays open, must close manually)"
    ],
    "default": "preview",
    "markdownDescription": "Controls how work item files open when clicked in TreeView, dashboard, or search results.\n\n**Tip:** Double-click always opens permanent editor regardless of this setting.",
    "order": 5,
    "scope": "resource"
  }
}
```

### 2. Update devcrumbs.openItem Command

Replace hardcoded `preview: true` with setting-based behavior:

```typescript
// packages/vscode-extension/src/commands/index.ts

// Add at top of file
function getOpenBehavior(): 'markdown-preview' | 'preview' | 'permanent' {
  const config = vscode.workspace.getConfiguration('devcrumbs');
  return config.get<'markdown-preview' | 'preview' | 'permanent'>(
    'workItems.openBehavior',
    'preview'
  );
}

// Update devcrumbs.openItem command registration
context.subscriptions.push(
  vscode.commands.registerCommand('devcrumbs.openItem', async (itemId: string, forceMode?: 'permanent') => {
    try {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
      }

      // Get item metadata to determine file path
      const { get } = await import('@devcrumbs/shared');
      const itemResult = await get(workspaceFolder.uri.fsPath, itemId);

      if (!itemResult.metadata) {
        vscode.window.showErrorMessage(\`Item \${itemId} not found\`);
        return;
      }

      const item = itemResult.metadata;
      const itemTypeFolder = \`\${item.type}s\`;
      const mdPath = path.join(
        workspaceFolder.uri.fsPath,
        '.devcrumbs',
        itemTypeFolder,
        \`\${itemId}.md\`,
      );

      const mdUri = vscode.Uri.file(mdPath);
      
      // Determine open behavior (forceMode overrides setting for double-click)
      const behavior = forceMode || getOpenBehavior();

      switch (behavior) {
        case 'markdown-preview':
          // Open as rendered markdown preview (read-only)
          await vscode.commands.executeCommand('markdown.showPreview', mdUri);
          break;

        case 'preview':
          // Open as temporary editor (VS Code standard)
          const previewDoc = await vscode.workspace.openTextDocument(mdUri);
          await vscode.window.showTextDocument(previewDoc, {
            preview: true,
            viewColumn: vscode.ViewColumn.One,
          });
          break;

        case 'permanent':
          // Open as permanent editor
          const permanentDoc = await vscode.workspace.openTextDocument(mdUri);
          await vscode.window.showTextDocument(permanentDoc, {
            preview: false,
            viewColumn: vscode.ViewColumn.One,
          });
          break;
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        \`Error opening item: \${error instanceof Error ? error.message : 'Unknown error'}\`,
      );
    }
  }),
);
```

### 3. Update TreeView Click Handlers

Ensure TreeView supports double-click for permanent editor:

```typescript
// In devcrumbsTreeDataProvider.ts or similar

// Single-click (uses user setting)
treeView.onDidChangeSelection(async (e) => {
  if (e.selection.length === 1) {
    const node = e.selection[0];
    if (node.item?.id) {
      await vscode.commands.executeCommand('devcrumbs.openItem', node.item.id);
    }
  }
});

// Double-click (always permanent)
treeView.onDidDoubleClick?.(async (e) => {
  if (e.element?.item?.id) {
    await vscode.commands.executeCommand('devcrumbs.openItem', e.element.item.id, 'permanent');
  }
});
```

**Note:** If `onDidDoubleClick` is not available, use alternative pattern with click tracking.

### 4. VS Code API Reference

**Three Opening Modes:**

1. **Markdown Preview (Read-Only):**
   ```typescript
   vscode.commands.executeCommand('markdown.showPreview', uri);
   ```

2. **Preview Editor (Temporary):**
   ```typescript
   vscode.window.showTextDocument(doc, { preview: true });
   ```

3. **Permanent Editor:**
   ```typescript
   vscode.window.showTextDocument(doc, { preview: false });
   ```

**Configuration API:**
```typescript
vscode.workspace.getConfiguration('devcrumbs').get('workItems.openBehavior', 'preview');
```

## User Experience

### Settings UI Display
Users will see in VS Code Settings (search "devcrumbs"):

```
DevCrumbs › Work Items: Open Behavior
Controls how work item files open when clicked in TreeView, dashboard, or search results.

[Dropdown: Preview Editor ▼]
├─ Markdown Preview (read-only, best for reading)
├─ Preview Editor (temporary tab - VS Code standard) ← DEFAULT
└─ Permanent Editor (always stays open)

💡 Tip: Double-click always opens permanent editor regardless of this setting.
```

### Behavior Matrix

| Action | Setting | Result |
|--------|---------|--------|
| Single-click | markdown-preview | Rendered markdown (read-only) |
| Single-click | preview | Editable markdown (temporary tab, italic) |
| Single-click | permanent | Editable markdown (regular tab) |
| **Double-click** | **ANY** | **Editable markdown (permanent)** |

## Testing Checklist

### Configuration Testing
- ✅ Setting appears in VS Code Settings UI under "DevCrumbs"
- ✅ Dropdown shows three options with descriptions
- ✅ Default value is "preview"
- ✅ Setting persists across VS Code restarts

### Behavior Testing - TreeView
- ✅ Single-click with "markdown-preview" → rendered preview
- ✅ Single-click with "preview" → temporary editor (italic tab)
- ✅ Single-click with "permanent" → permanent editor (regular tab)
- ✅ Double-click with any setting → permanent editor
- ✅ Preview mode: next single-click replaces previous tab

### Behavior Testing - Dashboard
- ✅ "View Details" button respects setting
- ✅ Works for all item types (epics, stories, tasks, etc.)

### Behavior Testing - Search
- ✅ "Open" command in search results respects setting

### Edge Cases
- ✅ Invalid setting value falls back to "preview" default
- ✅ Markdown preview works for items with complex markdown (tables, code blocks, images)
- ✅ No errors when switching between modes rapidly

## Validation Steps

1. **Build:** `npm run build` succeeds
2. **TypeScript:** No type errors
3. **Linting:** `npm run lint` passes
4. **Manual Test:** Install extension, test all three modes
5. **Regression:** Ensure TASK-033 functionality still works

## Benefits

**User Control:**
- Power users can choose permanent editors (old behavior)
- Readers can use markdown preview for better readability
- Default matches VS Code standard (temporary tabs)

**Flexibility:**
- Double-click override maintains VS Code conventions
- Applies to all work item opening commands (TreeView, dashboard, search)
- Non-breaking: default matches current TASK-033 behavior

**UX Polish:**
- Setting includes helpful descriptions and tips
- Respects VS Code's design patterns
- Clear visual feedback (italic vs regular tabs)

## Related Work Items
- **TASK-033**: Implements base preview editor support (enhances this)
- **TASK-012**: General settings infrastructure (demonstrates pattern)
- **STORY-004**: TreeView implementation (benefits from this)

## Acceptance Criteria
- ✅ Setting `devcrumbs.workItems.openBehavior` added to package.json
- ✅ Three enum options: markdown-preview, preview, permanent
- ✅ Default value: "preview"
- ✅ Command `devcrumbs.openItem` reads setting and applies behavior
- ✅ Double-click always opens permanent editor
- ✅ All three modes tested and working
- ✅ No TypeScript/linting errors
- ✅ Extension builds successfully
- ✅ Documentation updated in TASK-033.md (reference new setting)

## Implementation Notes

**Estimated Effort:** 2-3 hours
- 30 min: Add configuration to package.json
- 60 min: Update command logic with three modes
- 30 min: Add double-click handling (if needed)
- 60 min: Testing all modes and edge cases

**Risk Level:** Low
- Small, focused change
- Non-breaking (default matches current behavior)
- Well-defined VS Code APIs

**Dependencies:** None (builds on TASK-033 completion)
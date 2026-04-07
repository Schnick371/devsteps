Create `packages/extension/src/providers/DevStepsItemProvider.ts` — a `TextDocumentContentProvider` for the `devsteps-item://` URI scheme that generates a formatted Markdown rendering of any DevSteps work item. Opening via `markdown.showPreview` displays it in the built-in Markdown preview panel.

**Architecture:**
```typescript
// URI scheme: devsteps-item://item/STORY-042
class DevStepsItemProvider implements TextDocumentContentProvider {
  provideTextDocumentContent(uri): string {
    const itemId = uri.path.replace(/^\//, '');
    const item = itemCache.get(itemId);
    return renderItemAsMarkdown(item);  // generates formatted Markdown
  }
}
```

**Rendered Markdown output for each item:**
- `# {ID} · {Title}`
- `**Status:** {badge} · **Priority:** {priority} · **Type:** {type}`
- `## Description` — full description
- `## Linked Items` — each linked item as `[ID · Title](devsteps-item://item/ID)` (recursive)
- `## Tags` — inline tags
- `## Affected Paths` — file paths list

**New command:** `devsteps.previewItem` — opens item in markdown preview
**Update:** TreeView item click handler → use `devsteps.previewItem` instead of raw `showTextDocument`
**Register:** `workspace.registerTextDocumentContentProvider('devsteps-item', provider)` in `extension.ts`

**Depends on:** STORY-225 (item cache must exist for `itemCache.get(itemId)`)
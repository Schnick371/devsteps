Create `packages/extension/src/docs/DocIndex.ts` — the abstraction class for resolving which documentation sections relate to a given source file or symbol.

**Phase 1 method:** `getDocSectionsForFile(workspaceRelativePath: string): DocSection[]`
- Reads `docs-map-positions.json` shadow (from TASK-377)
- Reads DevSteps item `affected_paths` reverse lookup (from STORY-225 item cache)
- Finds `DocsMapNode` entries that list any matching item ID in `devsteps_items`
- Returns `{ docFilePath, anchorText, lineNumber, sectionTitle, hierarchyPath }[]`

**Constraints:**
- Pure TypeScript, no VS Code runtime API imports → unit testable with vitest
- `DocIndex` is the single, reusable foundation for WI-2 (CodeLensProvider) and WI-3 (HoverProvider)

**Prerequisites:** STORY-225 (item cache FSW) + TASK-377 (docs-map-positions.json shadow) must be `done` before this task can start.SPIKE-041 research update: Use `loadItemsByType('doc').filter(i => i.affected_paths.includes(relPath))` directly — no docs-map-positions.json dependency needed. Unblocked from TASK-377.

## SPIKE-041 Update (TASK-394 applied)

**Simplified approach — TASK-377 dependency removed:**

DocIndex.getDocSectionsForFile(relPath) no longer needs docs-map-positions.json.

New implementation pattern:
```
loadItemsByType('doc').filter(i => i.affected_paths.includes(relPath))
```

This returns all DOC items that cover the given file path. Section anchors are in `metadata.anchor` on each DOC item.

**TASK-377 is NOT a prerequisite.** STORY-229 (CodeLensProvider) and STORY-230 (HoverProvider) can proceed independently once BUG-075 is done.
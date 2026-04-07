Implement the VS Code "Depth View" feature (team name: Lupe) for filtered markdown rendering by heading depth level.

## Feature Description
Users can view a documentation file at a specific depth level:
- Level 1: H1 headings + directly following body paragraphs only (overview)
- Level N: H1..HN headings + their body text (progressive detail)
- Full: complete document

## Implementation Plan
- Register TextDocumentContentProvider with scheme devsteps-lens:
- Implement filterMarkdownByDepth(markdown: string, maxDepth: number): string
- Command: devsteps.lens.open — opens current doc in Depth View at current depth
- Command: devsteps.lens.setDepth — changes depth level
- Status bar: shows current depth level (Depth: L1 / Depth: L2 / Depth: full)
- EventEmitter<vscode.Uri> for live reload on depth change

## Constraints
- NO TreeView slider API exists in VS Code — use depth-aware TreeDataProvider + refresh()
- Path traversal guard: validate filePath is within workspace root
- VS Code ^1.109.0 required
- Named "Depth View" in VS Code UI, "doc-lens" / devsteps.lens.* in API
- "Lupe" is acceptable team shorthand only

See SPIKE-036 for full implementation pattern details.

---
**SCOPE UPDATE (SPIKE-040):** This story is repurposed to implement `devsteps-item://` TextDocumentContentProvider for previewing DevSteps items in Markdown preview. The original TSD depth view scope has been superseded by STORY-227 (previewScripts) per SPIKE-036 ADR-S2-01.
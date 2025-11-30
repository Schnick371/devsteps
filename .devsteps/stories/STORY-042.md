# Story: Move Export/Reporting to Shared Core

## User Need
As a **developer**, I need **export formatting centralized** so that CLI can generate reports without duplicating markdown/HTML generation.

## Current Pain
- `export.ts` handler contains 200+ lines of formatting logic
- Markdown/HTML generators embedded in MCP layer
- CLI cannot export reports without code duplication
- No reusable report templates

## Acceptance Criteria
1. New `packages/shared/src/core/export.ts` module
2. Functions: `exportToMarkdown()`, `exportToHTML()`, `exportToJSON()`
3. Handler becomes thin wrapper (<30 LOC)
4. Templates extracted to separate functions
5. CLI gains export subcommand using shared module

## Technical Design
```typescript
export interface ExportOptions {
  format: 'markdown' | 'json' | 'html';
  includeTypes?: ItemType[];
  outputPath?: string;
}

export async function exportProject(
  devstepsDir: string,
  options: ExportOptions
): Promise<ExportResult> {
  // Move current export.ts logic here
}
```

## Definition of Done
- [ ] export.ts module in shared/core
- [ ] Handler refactored to <30 LOC
- [ ] CLI export command implemented
- [ ] All export tests pass
- [ ] Generated reports match existing format

## Aufgabe

Implementiere `parseDocumentFragments(content: string, splitLevel: 1 | 2 | 3): FragmentBlock[]` als pure function in `packages/shared/src/core/doc-splitter.ts`.

### Verhalten

Returns array of `{ title: string, description: string, headingRange: [number, number] }`. One entry per heading at `splitLevel`. Each fragment's `description` contains the full content from the heading line through the last line before the next same-level heading (or end of document), INCLUDING all subordinate headings.

### Edge Cases
- No heading at `splitLevel` → return entire content as one fragment
- Content before first heading → prepend to first fragment
- Empty document → return `[]`
- Fenced code blocks (`\`\`\``) → headings inside fences are NOT split boundaries

### Verwendung
- Import-Chain: STORY-274 Mode B (single file) + Mode C (inline) nutzen parseDocumentFragments + Loop von `add` calls
- Bulk splitting bei `devsteps_docs_import` → `devsteps_docs_bom_commit`

### Acceptance Criteria
- [ ] `parseDocumentFragments` in `packages/shared/src/core/doc-splitter.ts`
- [ ] Fenced code block guard (headings inside ``` not treated as boundaries)
- [ ] Re-export from `packages/shared/src/core/index.ts`
- [ ] ≥8 unit tests in `doc-splitter.test.ts`
- [ ] File ≤ 80 lines
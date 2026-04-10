Create two pure functions in `packages/shared/src/core/doc-splitter.ts`:

### `parseDocumentFragments(content: string, splitLevel: 1 | 2 | 3): FragmentBlock[]`

Returns an array of `{ title: string, description: string, headingRange: [number, number] }`. One entry per heading at `splitLevel`. Each fragment's `description` contains the full content from the heading line through the last line before the next same-level heading (or end of document), INCLUDING all subordinate headings (H2 inside H1 block, H3 inside H2 block, etc.).

Edge cases:
- If no heading at `splitLevel` exists → return entire content as one fragment with title from frontmatter (or first H1 if present)
- Content before the first heading at `splitLevel` → prepend to first fragment
- Empty document → return `[]`

### `extractFrontmatter(content: string): { body: string; meta: Record<string, unknown> }`

Extracts YAML frontmatter delimited by `---\n...\n---`. Returns `{ body: string, meta: Record<string, unknown> }`. If no frontmatter: returns `{ body: content, meta: {} }`. Uses `js-yaml` (already a dependency via import-session.ts) for parsing. Pure function — no filesystem access.

Re-export both from `packages/shared/src/core/index.ts`.

## Acceptance Criteria
- [ ] `parseDocumentFragments` handles: no headings at level, content before first heading, nested headings preserved in body, empty document
- [ ] State machine protects fenced code blocks (headings inside ``` fences are NOT split boundaries) — reuse same guard pattern as TASK-436
- [ ] `extractFrontmatter` handles: valid frontmatter, no frontmatter, malformed YAML (returns `meta: {}` without throwing)
- [ ] File ≤ 100 lines; zero new dependencies (js-yaml already present)
- [ ] ≥10 unit tests covering all edge cases
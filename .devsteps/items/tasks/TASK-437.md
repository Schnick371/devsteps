Create `packages/shared/src/core/export.ts` with `exportHandler(devstepsDir, options)`. The handler assembles DOC items into a composite Markdown document: (1) loads all DOC items from the index; (2) for each item, reads the `.md` description, strips frontmatter via `stripFrontmatter()`; (3) applies `adjustHeadingLevels(content, offset)` when `heading_offset_mode !== 'none'`, computing offset from item hierarchy depth via relation traversal; (4) renders a cover section with root frontmatter from the first (root) item; (5) concatenates fragments with `\n\n---\n\n` separator. Accepts `ExportOptions` interface: `{ output?: string; heading_offset_mode?: 'auto' | 'manual' | 'none'; item_ids?: string[] }`. Default `heading_offset_mode: 'none'`. Writes output to `options.output` or `devsteps-export.md`.

Pre-condition: TASK-429 (stripFrontmatter) + TASK-436 (adjustHeadingLevels).

## Acceptance Criteria
- `heading_offset_mode: 'none'` produces raw strip-only output (no level changes)
- Multi-DOC export concatenates with separator correctly
- No crash on DOC items without frontmatter
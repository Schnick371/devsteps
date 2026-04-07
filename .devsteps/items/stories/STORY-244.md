Add heading-level normalization and frontmatter stripping to the document export pipeline. When DOC fragments are assembled into a composite document, heading levels are adjusted by depth offset (formula: `depth === 0 ? 0 : depth + 1`, capped at H6) and frontmatter is stripped from all non-root fragments. The CLI `exportCommand` stub is wired to an actual `exportHandler` implementation.

Depends-on: STORY-242 (frontmatter utilities must exist before export can strip them).

## Acceptance Criteria
- `adjustHeadingLevels(content, offset)` uses a fenced-block state machine; never promotes heading past H6; correct for all offset values 0–5
- `export.ts` strips frontmatter from all fragment descriptions before embedding; accepts optional `heading_offset_mode: 'auto' | 'manual' | 'none'` (default `'none'`)
- `devsteps export` CLI command invokes the actual export handler (no longer a stub)
- 30 test cases pass: H6 overflow, fenced code block passthrough, offset 0 identity, nested fence markers
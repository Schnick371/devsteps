Write unit tests for `DocFrontmatterSchema`, `stripFrontmatter()`, and `parseFrontmatter()`. Test coverage must include: (1) schema validation — all 6 Diátaxis types parse successfully; invalid `diataxis` value fails; missing required fields fail; per-type optional fields accepted; (2) `stripFrontmatter` — strips valid frontmatter, preserves body newlines, returns unchanged on no-frontmatter input, handles `---` in body (must not strip past first fence pair); (3) `parseFrontmatter` — returns `null` for no frontmatter, parses string/number/boolean/array scalars, handles multiline string values.

Pre-condition: TASK-428 + TASK-429 complete.

## Acceptance Criteria
- ≥ 39 test cases total across both test files
- All edge cases from quality analyst report covered (empty body, frontmatter with only newline, `---` in fenced code block in body)
- `vitest` runs green; no snapshot tests (pure assertion style)
Create `packages/shared/src/utils/frontmatter.ts` with two pure functions. `stripFrontmatter(content: string): string` removes the leading `---\n...\n---\n` block and returns the body unchanged; if no frontmatter is present returns `content` as-is. `parseFrontmatter(content: string): Record<string, unknown> | null` extracts the YAML block between `---` fences and parses it into a plain object using the same regex strategy as `init.ts:206` — no new dependencies, no `gray-matter` (CVE-2025-65108 CVSS 10.0 ban). Supports all scalar types (string, number, boolean) and simple arrays. Returns `null` when no frontmatter is present.

Re-export both from `packages/shared/src/utils/index.ts`.

## Acceptance Criteria
- `stripFrontmatter` is idempotent on content without frontmatter
- `parseFrontmatter` returns `null` for content starting without `---`
- Multi-line string values preserved correctly
- File ≤ 80 lines; zero new package.json dependencies
# guide_scan_todos — Codebase TODO/FIXME/BUG Scanner

## Context
EPIC-034: Daily Workflow. T2-H confirmed: "TODO/FIXME scanner is a natural MCP use case" (Docker MCP Toolkit tutorial; GitHub `todo-scanner` 820+ stars). Zero new npm dependencies required — uses only built-in Node.js APIs.

## Complete Spec (T2-H)

**Regex:** `/(?:\/\/|#|--|\/\*|<!--)\s*(TODO|FIXME|HACK|XXX|BUG|DEPRECATED|WARN|NOTE|OPTIMIZE)\b[:\s]*(.*)/i`

**Severity + DevSteps mapping:**
| Tag | Severity | type | priority |
|-----|----------|------|----------|
| BUG | CRITICAL | bug | urgent-important |
| FIXME | HIGH | bug | urgent-important |
| HACK, XXX | HIGH | task | urgent-important |
| DEPRECATED, WARN | MEDIUM | task | not-urgent-important |
| OPTIMIZE | MEDIUM | spike | not-urgent-important |
| TODO | LOW | task | not-urgent-not-important |
| NOTE | INFO | task | not-urgent-not-important |

**Fingerprint / dedup cache:** `.devsteps/guide/todo-scan.json`
`fingerprint = sha1(relative_path + ':' + line + ':' + rawText.trim())`

```typescript
GuideScanTodosInput {
  path:              string           // directory or single file
  include_patterns?: string[]         // glob (default: **/*.{ts,js,tsx,jsx,py,go,rs})
  exclude_patterns?: string[]         // default: ["**/node_modules/**", "**/dist/**"]
  min_severity?:     "INFO"|"LOW"|"MEDIUM"|"HIGH"|"CRITICAL"  // default: "LOW"
  dry_run?:          boolean          // DEFAULT: true  ← safety first
  group_by_file?:    boolean          // default: false
  auto_create?:      boolean          // default: false; only valid when dry_run: false
  incremental?:      boolean          // default: true → skip already-indexed fingerprints
}

GuideScanTodosOutput {
  todos: Array<{
    fingerprint; file; line; tag; severity; text
    suggested_type; suggested_priority; already_indexed: boolean
  }>
  stats: { total; by_severity; by_tag; new_count; skipped_count }
  created_items?: string[]            // DevSteps IDs when auto_create: true
}
```

**`auto_create` behavior:** Calls `devsteps_add` for each TODO with `already_indexed: false` and severity ≥ min_severity. Sets `affected_paths: [file]`, `tags: ["todo-scan", normalizedTag]`. Records fingerprint in cache.

**Zero new deps:** `node:crypto` for sha1, `node:fs/promises` + `node:path` for glob walk (no `fast-glob`).

## Acceptance Criteria

- [ ] `dry_run: true` (default) NEVER writes to cache or calls `devsteps_add`
- [ ] `auto_create: true` rejected when `dry_run: true` (input validation error)
- [ ] Regex correctly matches all 7 comment styles: `//`, `#`, `--`, `/*`, `<!--`
- [ ] `incremental: true` skips fingerprints already present in cache (idempotent re-runs)
- [ ] Zero new npm dependencies beyond what's already in `package.json`
- [ ] Unit tests: regex on 7 comment styles, severity+type mapping, fingerprint dedup, dry_run guard
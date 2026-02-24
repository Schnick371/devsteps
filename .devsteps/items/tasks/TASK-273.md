# Context Level: Standard

## Current State

`packages/shared/src/core/context.ts` exports `getQuickContext()` which is called by
`packages/mcp-server/src/handlers/context.ts`. Requesting `level: 'standard'` or
`level: 'deep'` currently throws an error immediately — the tool is listed in the spec
but not implemented.

## Standard Level: What to Include

| Section | Source | Notes |
|---|---|---|
| All `quick` fields | existing `getQuickContext()` | Reuse, don't duplicate |
| `open_items` | `.devsteps/index.json` | Items with status != done/cancelled/obsolete |
| `blocking_items` | index | Items with `status: 'blocked'` |
| `in_progress` | index | Items with `status: 'in-progress'`, include IDs + titles |
| `recent_changes` | index, sorted by `updated` | Last 10 items changed in past 7 days |
| `tech_stack` | parsed from PROJECT.md OR auto-detected | Array of strings |
| `key_paths` | `affected_paths` aggregated from all in-progress items | Top 10 unique paths |
| `context_meta` | generated | `{ generated_at, age_hours, is_stale: age_hours > 24 }` |

## Context Meta (required at all levels)

All context responses (even `quick`) should include `context_meta`:
```typescript
context_meta: {
  generated_at: string   // ISO 8601
  age_hours: number      // time since PROJECT.md was last written
  is_stale: boolean      // true if age_hours > 24
  level: 'quick' | 'standard' | 'deep'
}
```

## Implementation

1. In `packages/shared/src/core/context.ts`:
   - Add `getStandardContext(cwd, devstepsDir)` — calls `getQuickContext()` + enriches
   - Add `buildContextMeta(devstepsDir, level)` utility
2. In `packages/mcp-server/src/handlers/context.ts`:
   - Wire up `standard` case (currently falls through to error)
3. Update `devsteps_context` tool description to reflect working levels

## Acceptance Criteria

- [ ] `devsteps_context(level: 'standard')` returns data (no error)
- [ ] Response includes all fields listed in the table above
- [ ] `context_meta` present at all context levels (including `quick`)
- [ ] `is_stale: true` when `.devsteps/PROJECT.md` older than 24 hours
- [ ] `quick` response time < 50ms on typical project (still uses cache)
- [ ] Unit tests for `getStandardContext()` with mock filesystem
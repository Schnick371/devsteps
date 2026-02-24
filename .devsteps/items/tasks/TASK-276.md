# Context Staleness Detection

## Problem

AI agents receiving project context have no way to know if the context is fresh
or hours/days old. They may act on stale data without warning the user.

## Solution: `context_meta` Block

Add `context_meta` to every `devsteps_context` response:

```typescript
export interface ContextMeta {
  generated_at: string    // ISO 8601 timestamp of context generation
  project_md_age_hours: number  // age of .devsteps/PROJECT.md in decimal hours
  is_stale: boolean       // true when project_md_age_hours > 24
  level: 'quick' | 'standard' | 'deep'
  cache_hit: boolean      // whether this response came from cache
}
```

When `is_stale: true`, the tool **response text** should include a visible hint:
```
⚠️ Context may be stale (PROJECT.md is 36h old). Run `devsteps context generate` to refresh.
```

## Implementation

1. **`packages/shared/src/core/context.ts`**:
   - Add `buildContextMeta(devstepsDir, level, cacheHit): Promise<ContextMeta>`
   - Uses `fs.statSync('.devsteps/PROJECT.md').mtimeMs` to compute age
   - If PROJECT.md doesn't exist: `project_md_age_hours = Infinity`, `is_stale: true`

2. **`packages/shared/src/types/`** (or `packages/shared/src/core/context.ts`):
   - Export `ContextMeta` interface — add to shared barrel exports

3. **`packages/mcp-server/src/handlers/context.ts`**:
   - Append `context_meta` to response object before JSON serialization
   - Prepend stale warning to `content[0].text` when `is_stale: true`

4. **`packages/shared/src/utils/cache.ts`**:
   - Expose `isCacheHit(key)` boolean (or return hit status from get())

## Acceptance Criteria

- [ ] Every `devsteps_context` response includes `context_meta`
- [ ] `is_stale: true` when PROJECT.md older than 24h (or missing)
- [ ] Stale warning appears in response text (not just JSON metadata)
- [ ] `cache_hit: true` correctly indicates cache responses
- [ ] `ContextMeta` interface exported from shared package
- [ ] Unit test: mock PROJECT.md mtime to simulate stale + fresh states
# Fix purgeItems() — Replace index.json read with listItems()

## Context

BUG-054: `purgeItems()` in `shared/src/core/archive.ts` reads the legacy `index.json` flat file which no longer exists in refs-style projects. This makes both `mcp_devsteps_purge` and `devsteps purge` completely broken.

## Implementation Plan

### Step 1: Replace item discovery in purgeItems()

**Current (broken):**
```typescript
const indexPath = join(devstepsDir, 'index.json');
const index: DevStepsIndex = JSON.parse(readFileSync(indexPath, 'utf-8'));
let itemsToArchive = [...index.items];
const statusFilter = args.status || ['done', 'cancelled'];
itemsToArchive = itemsToArchive.filter((i) => statusFilter.includes(i.status));
if (args.type) {
  itemsToArchive = itemsToArchive.filter((i) => i.type === args.type);
}
```

**Fix:** Use `listItems()` which already handles both refs-style and legacy index transparently:
- Import `listItems` from `./list.js`
- For each status in `args.status || ['done', 'cancelled']`, call `listItems(devstepsDir, { status, type })` and collect results
- Deduplicate results by ID (in case of index overlap)
- Remove unused imports (`readFileSync`, `DevStepsIndex`)

### Step 2: Handle olderThan filter

After collecting items via `listItems()`, apply `args.olderThan` date filter manually on the metadata results (same approach as current code).

### Step 3: Update tests

In `archive.ts` tests (if they exist) or create new:
- Test purge with refs-style index (mock or real)
- Test status filter (done, cancelled, custom)
- Test type filter
- Test empty result (no matching items)

## Acceptance Criteria

- [ ] `purgeItems()` uses `listItems()` not `readFileSync(index.json)`
- [ ] No unused imports remain in archive.ts
- [ ] `devsteps purge` archives done items correctly
- [ ] `devsteps purge --status done cancelled --type story` works
- [ ] Unit tests pass
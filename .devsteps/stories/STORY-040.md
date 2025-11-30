# Story: Repository Pattern for Index/Config Access

## User Need
As a **developer**, I need **centralized index/config access** so that handlers don't repeatedly open the same files and caching becomes possible.

## Current Pain
- `status.ts`, `search.ts`, `export.ts` each read `index.json` independently
- No caching layer - every request re-parses JSON
- Scattered error handling for missing/corrupt files
- Difficult to add optimizations (memoization, dirty tracking)

## Acceptance Criteria
1. New `packages/shared/src/core/repository.ts` module
2. Single entry point: `getRepository(devstepsDir)` 
3. Methods: `getConfig()`, `getIndex()`, `getItem(id)`, `saveItem(item)`
4. Request-scoped caching (read once per operation)
5. All handlers use repository instead of direct fs
6. Migration path: gradual replacement, no breaking changes

## Technical Design
```typescript
export class DevStepsRepository {
  private configCache?: DevStepsConfig;
  private indexCache?: DevStepsIndex;
  
  async getConfig(): Promise<DevStepsConfig> {
    if (!this.configCache) {
      this.configCache = JSON.parse(await readFile(...));
    }
    return this.configCache;
  }
  
  async getIndex(): Promise<DevStepsIndex> { /* ... */ }
  async getItem(id: string): Promise<ItemMetadata> { /* ... */ }
  async saveItem(item: ItemMetadata): Promise<void> { /* ... */ }
}

export function getRepository(devstepsDir: string): DevStepsRepository {
  return new DevStepsRepository(devstepsDir);
}
```

## Benefits
- Single file read per request (50% I/O reduction for status/search)
- Consistent error messages
- Future: add write batching, transaction support

## Definition of Done
- [ ] repository.ts module created with tests
- [ ] status handler refactored to use repository
- [ ] search handler refactored to use repository  
- [ ] export handler refactored to use repository
- [ ] Performance benchmark: <5% overhead vs direct fs
- [ ] All tests pass

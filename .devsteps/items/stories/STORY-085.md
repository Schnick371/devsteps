# Problem: Massive Code Duplication

**50+ instances** of manual JSON.parse(readFileSync(...)) across all packages violates DRY principle.

## Categories

1. **Config Loading** (16 instances)
   - CLI: context.ts, index.ts (6x), setup.ts
   - MCP: export.ts, link.ts, search.ts, status.ts, update.ts  
   - Extension: MCP handlers, TreeView

2. **Item Metadata** (20+ instances)
   - Manual path construction + parsing
   - Should use getItem() from shared
   - Files: link.ts, update.ts, trace.ts, search.ts

3. **Index Loading** (Legacy)
   - Extension still uses old index.json
   - Should use loadAllIndexes() for refs-style

## Solution: Repository Pattern

Create centralized data access layer in shared:

```typescript
class DevStepsRepository {
  constructor(private devstepsDir: string) {}
  
  async getConfig(): Promise<DevStepsConfig>
  async getItem(id: string): Promise<GetItemResult>
  async listItems(filter?): Promise<ListItemsResult>
  // Built-in: caching, validation, error handling
}
```

## Benefits

- **DRY**: 50+ duplications → 1 implementation
- **Performance**: Built-in caching (1 config read per request)
- **Type Safety**: Consistent types everywhere
- **Error Handling**: Centralized validation
- **Testability**: Mock repository instead of filesystem

## Scope

- [ ] Create Repository class in shared
- [ ] Refactor CLI (7 files)
- [ ] Refactor MCP (5 files)
- [ ] Refactor Extension (5 files)
- [ ] Build succeeds, tests pass

## Impact

All packages cleaner, faster, more maintainable.
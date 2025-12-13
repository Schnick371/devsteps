# Story: Move Search Logic to Shared Core

## User Need
As a **developer**, I need **search logic centralized** so that CLI, MCP server, and extension can all use the same search algorithm.

## Current Pain
- `search.ts` handler contains 100+ lines of search implementation
- Algorithm embedded in MCP layer (not reusable)
- No index-based search optimization (iterates all files)
- Cannot add features like fuzzy matching without duplicating in CLI

## Acceptance Criteria
1. New `packages/shared/src/core/search.ts` module
2. Function: `searchItems(devstepsDir, query, options)`
3. Handler delegates to shared search (<20 LOC)
4. Search features preserved: wildcards, multi-word, type filter
5. Opportunity for index-based optimization (future enhancement)
6. Tests migrated to shared package

## Technical Design
```typescript
export interface SearchOptions {
  query: string;
  type?: ItemType;
  limit?: number;
  fields?: ('title' | 'description' | 'tags')[];
}

export async function searchItems(
  devstepsDir: string,
  options: SearchOptions
): Promise<SearchResult[]> {
  // Move current search.ts logic here
}
```

## Future Enhancements (Not in Scope)
- Index-based search (avoid file iteration)
- Fuzzy matching
- Full-text search with ranking

## Definition of Done
- [ ] search.ts module in shared/core
- [ ] Handler refactored to <20 LOC
- [ ] All search tests pass
- [ ] CLI can import search function (demo command)

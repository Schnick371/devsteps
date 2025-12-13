# Implement Fuzzy Search with Fuse.js

## Context

**Problem:** Current `#mcp_devsteps_search` uses exact string matching where ALL terms must match. When AI agents use multiple keywords (natural for LLMs), results = 0.

**Example failure:**
```bash
# Query: "search find filter query list fuzzy"
# Result: 0 matches (too restrictive)

# Query: "authentification" (typo)
# Result: 0 matches (should find "authentication" items)
```

**Research Findings:** (From Tavily searches 2025)
- **Fuse.js**: Lightweight (3KB), zero dependencies, threshold-based, easy to implement
- **FlexSearch**: 300x faster, but higher complexity
- **Recommendation**: Start with Fuse.js for quick wins, optimize later if needed

## Goal

Transform search from exact-match to intelligent fuzzy search with relevance ranking.

## Implementation Plan

### 1. Integrate Fuse.js (packages/shared)

**File:** `packages/shared/src/search/fuzzy-search.ts`

```typescript
import Fuse from 'fuse.js';
import type { DevStepsItem } from '../types';

export interface FuzzySearchOptions {
  threshold?: number;      // 0.0 = exact, 1.0 = match anything (default: 0.3)
  distance?: number;       // Max Levenshtein distance (default: 100)
  minMatchCharLength?: number; // Min chars to match (default: 2)
}

export class FuzzySearchEngine {
  private fuse: Fuse<DevStepsItem>;
  
  constructor(items: DevStepsItem[], options?: FuzzySearchOptions) {
    this.fuse = new Fuse(items, {
      keys: [
        { name: 'id', weight: 3.0 },           // Highest weight
        { name: 'title', weight: 2.0 },        // High weight
        { name: 'description', weight: 1.0 },  // Medium weight
        { name: 'tags', weight: 1.5 },         // High weight
        { name: 'category', weight: 0.8 }      // Lower weight
      ],
      threshold: options?.threshold ?? 0.3,
      distance: options?.distance ?? 100,
      minMatchCharLength: options?.minMatchCharLength ?? 2,
      includeScore: true,
      useExtendedSearch: true  // Enables 'word | "exact phrase"'
    });
  }
  
  search(query: string, limit = 10): Array<{ item: DevStepsItem; score: number }> {
    const results = this.fuse.search(query, { limit });
    return results.map(r => ({
      item: r.item,
      score: 1 - (r.score ?? 1) // Invert score (higher = better)
    }));
  }
}
```

### 2. Update MCP Search Tool (packages/mcp-server)

**File:** `packages/mcp-server/src/tools/search.ts`

**Changes:**
- Import FuzzySearchEngine from shared
- Replace simple string matching with fuzzy search
- Return relevance scores in results
- Support threshold parameter (optional)

**Before:**
```typescript
// Current: exact match only
const matches = items.filter(item => 
  item.title.toLowerCase().includes(query.toLowerCase())
);
```

**After:**
```typescript
// New: fuzzy search with ranking
const searchEngine = new FuzzySearchEngine(items, { threshold: 0.3 });
const matches = searchEngine.search(query, limit);
```

### 3. Update CLI Search Command (packages/cli)

**File:** `packages/cli/src/commands/index.ts` (search command)

**Add CLI options:**
```bash
devsteps search "auth user" --threshold 0.3 --limit 20
```

### 4. Testing

**Test Cases:**

```typescript
// Test 1: Typo tolerance
search("authentification") 
// Should find: items with "authentication"

// Test 2: Multi-word OR logic
search("multi-agent collaboration")
// Should find: items with "multi-agent" OR "collaboration"

// Test 3: Partial word matching
search("auth")
// Should find: "authentication", "authorization", "OAuth"

// Test 4: Tag search
search("#bug performance")
// Should find: items tagged "bug" containing "performance"

// Test 5: Exact ID (fast path)
search("TASK-192")
// Should return: exact match immediately
```

## Acceptance Criteria

- ✅ Install fuse.js in packages/shared (npm install fuse.js)
- ✅ Create FuzzySearchEngine class with field weighting
- ✅ Update mcp-server search tool to use FuzzySearchEngine
- ✅ Update cli search command with threshold option
- ✅ Add tests for typo tolerance (1-2 char errors)
- ✅ Add tests for multi-word queries (OR logic)
- ✅ Add tests for partial word matching
- ✅ Document threshold tuning (0.3 default, lower = stricter)
- ✅ Performance: <100ms for <1000 items
- ✅ Zero breaking changes (exact match still works)

## Configuration

**Threshold Guide:**
- `0.0` - Exact match only
- `0.1` - Very strict (1 typo in 10-char word)
- `0.3` - **Default** (1-2 typos, good balance)
- `0.5` - Loose (3+ typos, many false positives)
- `1.0` - Match anything (not useful)

**Recommendation:** Start with `0.3`, adjust based on user feedback.

## Dependencies

- **packages/shared**: Install fuse.js (peer dependency for cli/mcp-server)
- **packages/mcp-server**: Update search tool
- **packages/cli**: Update search command
- **Tests**: Unit tests for FuzzySearchEngine
- **Docs**: Update AI-GUIDE.md with search examples

## Affected Files

- `packages/shared/package.json` - Add fuse.js dependency
- `packages/shared/src/search/fuzzy-search.ts` - New file
- `packages/shared/src/index.ts` - Export FuzzySearchEngine
- `packages/mcp-server/src/tools/search.ts` - Update tool
- `packages/cli/src/commands/index.ts` - Update command
- `.devsteps/AI-GUIDE.md` - Document search best practices

## Future Enhancements (Not in this Story)

- BM25 relevance ranking (STORY-078)
- Semantic search with embeddings (STORY-079)
- Search result caching (TASK-xxx)
- Indexed search for >10K items (TASK-xxx)

## References

- Fuse.js Documentation: https://www.fusejs.io/
- Levenshtein Distance: https://en.wikipedia.org/wiki/Levenshtein_distance
- Research: "fuzzy search text matching algorithms 2025" (Tavily search results)
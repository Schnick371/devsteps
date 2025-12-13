# Intelligent Search & Discovery

## Problem Statement

**Current search limitations:**
- `#mcp_devsteps_search` uses exact string matching (all terms must match)
- AI agents use too many keywords → zero results
- No fuzzy matching for typos or similar terms
- No relevance ranking (all results equally weighted)
- No semantic understanding (synonyms, related concepts)

**Example failures:**
```
Query: "multi-agent collaboration concurrent parallel UUID"
Result: 0 matches (too many terms)

Query: "authentification" (typo)
Result: 0 matches (should find "authentication")

Query: "user management"
Result: Misses "authentication", "access control", "permissions"
```

## Vision: Intelligent Search

**Transform DevSteps search into intelligent discovery system:**

### 1. Fuzzy Matching
- Typo tolerance (Levenshtein distance ≤2)
- Partial word matching ("auth" finds "authentication")
- Case-insensitive, unicode-aware

### 2. Relevance Ranking
- BM25 algorithm (industry standard)
- Field weighting (title > description > tags)
- Boost recent items
- Boost linked items

### 3. Multi-Strategy Search
- **Exact**: Fast path for IDs (TASK-001)
- **Keyword**: BM25 for multi-term queries
- **Fuzzy**: Fuse.js for typo tolerance
- **Semantic**: (Future) Vector embeddings for concept search

### 4. Smart Query Processing
- Automatic OR logic for multiple terms
- Stop word removal (the, and, or, etc.)
- Stemming (running → run, authentication → auth)
- Tag extraction (#bug, @urgent)

## Research Findings (2025)

**Best Practices:**

| Library | Use Case | Performance | Complexity |
|---------|----------|-------------|------------|
| **Fuse.js** | Client-side fuzzy search | Fast (<100ms) | Low |
| **FlexSearch** | Fastest full-text | Ultra-fast (<10ms) | Medium |
| **Lunr.js** | Browser full-text | Medium | Low |
| **BM25** | Relevance ranking | Fast | Low |
| **Vector Embeddings** | Semantic search | Slow (GPU) | High |

**Recommendation: Hybrid Approach**
1. **Fuse.js** for fuzzy matching (typos, partial matches)
2. **BM25** for relevance ranking (multi-field weighting)
3. **Keep simple exact match** for fast ID lookups

## Architecture

```typescript
// packages/shared/src/search/search-engine.ts
class IntelligentSearch {
  // Strategy 1: Exact (fast path)
  exactMatch(query: string): DevStepsItem[]
  
  // Strategy 2: Fuzzy (typo tolerance)
  fuzzySearch(query: string, threshold: number): DevStepsItem[]
  
  // Strategy 3: BM25 (relevance ranking)
  rankedSearch(query: string): RankedResult[]
  
  // Smart dispatcher
  search(query: string): SearchResult[] {
    // Auto-select best strategy
    if (isID(query)) return exactMatch(query)
    if (hasTypos(query)) return fuzzySearch(query)
    return rankedSearch(query)
  }
}
```

## Success Criteria

- ✅ Find items with 1-2 typos
- ✅ Partial word matching works
- ✅ Multi-term queries use OR logic (not AND)
- ✅ Results ranked by relevance
- ✅ Search <100ms for <1000 items
- ✅ Zero-dependency (no external services)
- ✅ Offline-first compatible

## Scope

### Phase 1: Fuzzy + BM25 (This Epic)
- Integrate Fuse.js for fuzzy matching
- Implement BM25 relevance ranking
- Smart query processing
- Update CLI/MCP search tools

### Phase 2: Semantic Search (Future Epic)
- Vector embeddings (sentence-transformers)
- Concept-based search
- "Similar to this item" feature

## Benefits

**For AI Agents:**
- More natural queries ("find bugs about auth")
- Fewer "zero results" frustrations
- Better recommendations

**For Developers:**
- Faster discovery ("where did I put that?")
- Typo-tolerant search
- Relevance-ranked results

## References

- Fuse.js: https://www.fusejs.io/
- BM25 Algorithm: https://en.wikipedia.org/wiki/Okapi_BM25
- FlexSearch: https://github.com/nextapps-de/flexsearch
- Research: Fuzzy matching 2025 best practices
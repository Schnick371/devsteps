Implements "Dynamic Assembly" pattern: user question → real-time rollup of relevant
atoms → AI answers from actual content rather than from model memory.

## Architecture (BM25 at DevSteps scale, no vector DB)
1. AI calls devsteps_assemble_context with question + optional diataxis_type filter
2. Tool: tokenizes question (simple word split), filters by diataxis_type if specified
3. BM25 scoring over description bodies (tf-idf style, no external library needed)
4. Returns top-K fragments (default K=5) as {fragments: [{id,title,content}]}
5. AI constructs response from these fragments — cites item IDs

## Acceptance Criteria
- BM25 implementation in ~80 lines — no new dependencies
- Returns RAG-compatible format matching rollupHandler JSON output
- Optional diataxis_type filter narrows retrieval scope
- max_tokens parameter limits total response size

## Research basis: BM25 achieves 85% recall vs 87% for embeddings at <1000 items
## Estimated effort: 2 days

Note: This is the first step toward full RAG capability without vector infrastructure.## Auto-cluster suggestion (BM25 neighborhood, offline batch)

When a BM25 corpus query returns a cluster of N >= 5 fragments with high mutual similarity
(all-pairs score > threshold), and NO BOM node covers this topic cluster:
- Suggest a new BOM chapter: `{ suggested_title: 'API Authentication',
  fragment_ids: [...], confidence: 0.78 }`
- This is the BM25 approximation of "vector auto-clustering" from the Semantic Anchor proposal
- Implementation: offline batch operation O(N²) at N < 500 — feasible without embedding infrastructure
- User approves the suggestion; `appendDocsMapNode()` creates the BOM node
- Gate: check `appendDocsMapNode()` return value (returns false silently on missing parent — handle explicitly)

This satisfies Step 2 of the Semantic Anchor pipeline without violating the BM25-over-vectors ADR (DOC-060).
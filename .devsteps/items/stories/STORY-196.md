## Overview

Embedding-based semantic search and deduplication over DevSteps items. Enables:
1. **Search** — find similar items by natural language query (cosine similarity ≥0.75)
2. **Deduplication** — flag items with cosine similarity ≥0.82 as duplicate candidates
3. **Staleness scoring** — items cosine-similar to `done` items and not updated in 30+ days flagged as `obsolete` candidates

## Embedding Pipeline

**Primary path:** Ollama `nomic-embed-text-v1.5` via `fetch('http://localhost:11434/api/embeddings')`
**Fallback path:** Transformers.js v4 WASM (CPU, no sidecar, no GPU required)

**Model requirements (SS-11):** minimum 512-token context window — `all-MiniLM-L6-v2` is REJECTED (256 tokens); use `all-mpnet-base-v2` or `nomic-embed-text-v1.5`.

## Index Storage

`.devsteps/embeddings/index.jsonl` — one line per item:
```jsonl
{\"id\":\"TASK-328\",\"model\":\"nomic-embed-text\",\"vec\":[...],\"updatedAt\":\"2026-03-05T11:00:00Z\"}
```

Append-on-update (no full re-write). Cosine search is O(n) over items (acceptable for <10K items without HNSW).

## Re-embed Trigger

`mcp_devsteps_update` success → enqueue item ID → 2s debounced batch-embed → overwrite matching JSONL line.

## Security (SS-9)

Strip `assignee` email before embedding — zero PII in index.

## Quality Gates

- SS-10: cosine ≥0.72 on held-out DevSteps item pairs
- SS-11: 512-token context window minimum
- SS-3: top-5 recall ≥0.85
- SS-6: query latency ≤50ms at 10K items
- SS-8: multilingual EN + DE (German privacy policy docs in corpus)
- LI-7: graceful degradation — if no Ollama, switch to Transformers.js WASM fallback automatically

## New Files

- `packages/extension/src/embedding/embeddingIndex.ts` — JSONL index
- `packages/extension/src/embedding/ollamaEmbedder.ts` — Ollama HTTP client
- `packages/extension/src/embedding/transformersEmbedder.ts` — Transformers.js WASM fallback
- `packages/extension/src/embedding/semanticSearch.ts` — cosine similarity search
- New MCP tool: `devsteps_semantic_search` — query the index via MCP

## Acceptance Criteria

- [ ] `devsteps_semantic_search` MCP tool returns ≤10 results ranked by cosine similarity
- [ ] Duplicate detection badge appears in Tree View for items with cosine ≥0.82
- [ ] Staleness scorer runs nightly and updates item tags
- [ ] Index rebuilds within 2s for 1K items
- [ ] No PII (emails) appear in `.devsteps/embeddings/index.jsonl`
- [ ] All SS gates above pass
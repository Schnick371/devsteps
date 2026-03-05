## Summary

Add semantic similarity search across DevSteps work items using `nomic-embed-text` embeddings (137M params, ~0.5GB VRAM, 768-dim) via MCP server proxy. Latency: 20ms GPU vs 200ms CPU — enables real-time search-as-you-type.

## Prerequisites

- STORY: MCP server Ollama proxy completed (embed route + `mcp_devsteps_embed` tool)
- STORY: AI configuration schema completed
- `EmbeddingRecord` Zod schema available in `packages/shared`

## Acceptance Criteria

- [ ] `packages/shared`: `cosine(a: number[], b: number[]): number` utility added (pure, GPU-free)
- [ ] `packages/mcp-server`: New MCP tool `semantic_search`:
  - Input: `{ query: string, topK?: number }` (default topK=5)
  - Output: `{ results: Array<{ id: string, title: string, score: number }> }`
  - Embeds query via nomic-embed-text, cosine-ranks against cached embeddings
- [ ] Embedding cache stored in `.devsteps/embeddings.json`:
  - Rebuilt post `mcp_devsteps_add` / `mcp_devsteps_update` (async, non-blocking via `setImmediate`)
  - Incremental: only re-embeds items where `updatedAt` changed
- [ ] VS Code extension: search box in webview dashboard triggers `semantic_search` MCP tool call
- [ ] Results rendered as filtered tree view with relevance score badge
- [ ] Latency target: p95 < 50ms for 500-item corpus on GPU
- [ ] Graceful degradation: Ollama unavailable → fall back to existing `mcp_devsteps_search` (full-text)
- [ ] `devsteps embeddings rebuild` CLI subcommand added to `packages/cli`
- [ ] `packages/cli`: GPU-free (uses full-text search, never imports embedding logic)
- [ ] Unit tests: cosine similarity, cache delta logic
- [ ] Integration test: mock embed endpoint, verify ranking order
- [ ] `npm run build && npm test` passes

## Model Details

- nomic-embed-text: 137M params, ~0.5GB VRAM, runs simultaneously with Qwen2.5-Coder-7B
- Combined VRAM: 4.3 + 0.5 = 4.8GB — well within 8GB effective budget

## Effort Estimate

3 days
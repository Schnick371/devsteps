## Summary

Add OpenAI-compatible inference proxy to `packages/mcp-server` forwarding to local Ollama, and expose 3 new MCP tools (infer, embed, analyze-trace). This is the core GPU access gateway for all agent-facing features.

## Prerequisites

- STORY: P0/P1 security + staleness fixes (CSP connect-src needed)
- SPIKE: GPU capability detection completed (health probe pattern defined)

## Acceptance Criteria

- [ ] `packages/shared`: `EmbeddingRecord` Zod schema added (id, vector: number[], metadata) — zero GPU imports
- [ ] `packages/mcp-server/src/ollama-proxy.ts`: NEW — thin adapter with format translation (OpenAI ↔ Ollama)
- [ ] New Express routes in `http-server.ts` (before `app.listen()`):
  - `POST /v1/chat/completions` → proxy to Ollama `/api/chat` with format translation
  - `POST /v1/embeddings` → proxy to Ollama `/api/embeddings`
  - `GET /v1/models` → proxy to Ollama `/api/tags` with OpenAI format response
- [ ] Three new MCP tools:
  - `mcp_devsteps_infer`: structured prompt → Zod-validated JSON (Qwen2.5-Coder-7B)
  - `mcp_devsteps_embed`: text[] → EmbeddingRecord[] (nomic-embed-text)
  - `mcp_devsteps_analyze_trace`: DevSteps item ID → trace summary with risk score
- [ ] Ollama health probe on MCP server startup: exponential backoff (100ms, 200ms, 400ms, 800ms)
- [ ] `/health` endpoint response includes: `{ ollamaAvailable, gpuAccelerated, activeModel }`
- [ ] VRAM guard: reject requests if Ollama `/api/ps` shows < 500MB free
- [ ] HTTP client: native `fetch` (Node 22 built-in) — no new dependencies
- [ ] Timeouts: 30s chat/completions, 5s embeddings, 2s health probe
- [ ] `packages/cli`: zero changes (verified by TypeScript compiler)
- [ ] Unit tests: OpenAI ↔ Ollama format translation
- [ ] Integration test: mock Ollama + proxy verification
- [ ] `npm run build && npm test` passes

## Architecture Note

This is the ONLY package that contacts Ollama. Extension host calls MCP server via JSON-RPC tools/call. Webview connects to MCP server HTTP on localhost:3100 (CSP: connect-src http://localhost:3100). packages/shared and packages/cli never see GPU traffic.

## Model Details

- Inference: qwen2.5-coder:7b-instruct-q4_K_M (~4.3GB VRAM, 55-70 tok/s, 88.4% HumanEval)
- Embeddings: nomic-embed-text (~0.5GB VRAM, 768-dim)
- Total peak: 4.8GB within 8GB effective budget (12GB physical - 50% overhead)

## Effort Estimate

2 days
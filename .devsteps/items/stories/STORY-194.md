## Context

Research session (2026-03-05) confirmed the Continue.dev + AI Toolkit pattern as the validated production approach for GPU inference in VS Code extensions:

- VSIX = pure TypeScript coordinator, zero GPU code
- MCP server at `localhost:3100` gains OpenAI-compatible proxy routes to Ollama at `localhost:11434`
- Extension communicates via existing MCP JSON-RPC (no new HTTP servers)

This eliminates 5 CVE risk clusters and is validated by 6 of 9 real-world VS Code GPU projects.

## Components to Build

### packages/mcp-server/src/routes/ollama-proxy.ts
- Express Router mounted at `/v1`
- Routes: `GET /models`, `POST /chat/completions`, `POST /embeddings`
- Enforce `host: '127.0.0.1'` origin check
- Strip external auth headers; add version-check middleware (reject Ollama < 0.12.4)
- Return 503 with helpful error when Ollama unavailable

### packages/mcp-server/src/handlers/ollama-health.ts  
- MCP tool: `ollama_health_check`
- `GET localhost:11434/api/version` with 2s timeout
- Return: `{ available: boolean, version: string, models: string[], meetsMinVersion: boolean }`

### packages/mcp-server/src/handlers/ai-triage.ts
- MCP tool: `ai_triage`
- Input: `{ itemId: string, description: string }`
- Output: `{ classification: 'QUICK'|'STANDARD'|'FULL'|'COMPETITIVE', confidence: number, reasoning: string }`
- Uses `ollama_health_check` first; graceful error if Ollama unavailable

### packages/extension/src/commands/ollamaProxy.ts
- VS Code command: `devsteps.runAiTriage`
- Bridges: webview postMessage → MCP fetch to `localhost:3100/mcp`  
- No new `net.Server` — must comply with CVE-2025-65717

### packages/extension/src/gpuCapabilityManager.ts
- On startup: call `ollama_health_check` via MCP client
- Status bar item: `$(chip) Ollama 7B` / `$(warning) No GPU`
- Register in `context.subscriptions`

### packages/shared/src/schemas/ollama-config.ts
- Zod schema for `OllamaConfig`: `{ endpoint: z.string().url(), model: z.string(), timeout: z.number() }`
- Only GPU-adjacent code permitted in `packages/shared`

## Acceptance Criteria
- `curl localhost:3100/v1/models` returns Ollama model list when Ollama running
- Command `devsteps.runAiTriage` returns classification in < 5s
- Status bar shows Ollama availability within 3s of extension activation
- Unit tests mock Ollama; integration test skips when Ollama unavailable
- No new `net.createServer()` calls in extension host (CVE-2025-65717 compliance)
- Ollama version gate rejects < 0.12.4 with clear user error

## Security Constraints
- `connect-src http://127.0.0.1:3100` in CSP (extension → MCP, NOT extension → Ollama directly)
- Ollama endpoint configurable via `devsteps.ollamaEndpoint` setting (default: `http://127.0.0.1:11434`)
- All Ollama traffic mediated through MCP server (never direct from webview)

## References
- Research: `.devsteps/research/gpu-in-vscode-projects-2026-03-05.md` §Architecture Integration Map
- Validates: Continue.dev HTTP provider pattern, AI Toolkit sidecar health probe
- Depends on: STORY-193 (architecture foundation) + BUG-057 (nonce fix)
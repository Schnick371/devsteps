## Summary

Add `devsteps.ai.*` VS Code settings namespace, implement `gpuCapabilityManager.ts` in extension host, and add GPU/Ollama status bar item following the pattern from `mcpServerManager.ts:86`.

## Acceptance Criteria

- [ ] `package.json` (extension) contributes settings:
  ```json
  "devsteps.ai.enabled": { "type": "boolean", "default": false, "description": "Enable local AI features via Ollama" },
  "devsteps.ai.ollamaBaseUrl": { "type": "string", "default": "http://localhost:11434" },
  "devsteps.ai.model": { "type": "string", "default": "qwen2.5-coder:7b-instruct-q4_K_M" },
  "devsteps.ai.inferenceBackend": { "type": "string", "enum": ["ollama", "none"], "default": "none" },
  "devsteps.ai.vramLimitMB": { "type": "number", "default": 8192, "description": "Usable VRAM budget in MB" }
  ```
- [ ] `packages/extension/src/utils/gpuCapabilityManager.ts` created:
  - `GpuCapability` enum: `NONE | OLLAMA_AVAILABLE | OLLAMA_GPU_ACCELERATED`
  - Boot-time Ollama probe reading `devsteps.ai.ollamaBaseUrl`
  - Periodic re-probe every 60s (debounced)
  - EventEmitter for capability state changes
- [ ] Status bar item added (clone pattern from `mcpServerManager.ts:86`):
  - `$(circuit-board) GPU: Off` when `ai.enabled = false`
  - `$(circuit-board) GPU: Ready` when Ollama available + GPU accelerated
  - `$(warning) GPU: CPU only` when Ollama available but no GPU detected
  - `$(error) GPU: Unavailable` when Ollama unreachable
  - Click → opens output channel with last probe details + model list
- [ ] Settings change listener: immediate re-probe when `ollamaBaseUrl` or `enabled` changes
- [ ] CSP `connect-src` dynamically derived from current `ollamaBaseUrl` setting value
- [ ] API keys: stored in `context.secrets` (SecretStorage) ONLY — never in configuration settings
- [ ] Silent CPU fallback: Ollama unreachable → all AI features degrade (no throw, no modal)
- [ ] Unit tests: GpuCapability state machine transitions
- [ ] `npm run build` succeeds

## Security Note

connect-src in CSP must be derived from the setting, not hardcoded to localhost:11434. Pattern:
```typescript
const ollamaOrigin = vscode.workspace.getConfiguration('devsteps').get('ai.ollamaBaseUrl', 'http://localhost:11434');
const connectSrc = aiEnabled ? new URL(ollamaOrigin).origin : '';
```

## Effort Estimate

1.5 days
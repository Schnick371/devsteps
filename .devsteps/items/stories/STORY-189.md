## Summary

Implement automated QUICK/STANDARD/FULL/COMPETITIVE triage classification using Qwen2.5-Coder-7B Q4_K_M via MCP server. This is the **highest-value GPU use case**: 1-3s GPU vs 20-40s CPU makes it viable for interactive use.

## Prerequisites

- STORY: MCP server Ollama proxy completed
- STORY: AI configuration schema + status bar completed
- STORY: P0/P1 security fixes completed

## Acceptance Criteria

- [ ] New MCP tool `classify_triage` in `packages/mcp-server`:
  - Input: `{ title: string, description: string, affectedPaths: string[] }`
  - Output (Zod-validated): `{ triage: 'QUICK'|'STANDARD'|'FULL'|'COMPETITIVE', confidence: number, rationale: string }`
- [ ] Structured output uses Ollama JSON mode (`format: 'json'`) + Zod schema validation on response
- [ ] System prompt encodes Work-Type Dispatch Matrix from copilot-instructions.md
- [ ] Latency target: p95 < 3s on 12GB GPU (Qwen2.5-Coder-7B Q4_K_M, 55-70 tok/s)
- [ ] Extension command `devsteps.classifyTriage` added:
  - Runs on selected item (tree view context menu)
  - Updates `triage` tag via `mcp_devsteps_update`
  - VS Code status bar shows spinner during classification
- [ ] Result in tree view item tooltip (confidence %) + output channel for rationale
- [ ] Graceful degradation: command hidden if `devsteps.ai.ollamaAvailable` is false
- [ ] No auto-apply: first iteration always prompts user for confirmation
- [ ] Integration test: mock Ollama → valid JSON → Zod validates → item tag updated
- [ ] `npm run build && npm test` passes

## GPU Value Analysis (from aspect-impact)

Triage is the most consequential decision in the Spider Web pipeline. Wrong triage wastes tokens (STANDARD when QUICK suffices) or misses risks (QUICK when FULL needed). GPU: 1-3s → interactive. CPU: 20-40s → unacceptable for real-time UX.

## Effort Estimate

3 days
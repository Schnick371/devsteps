## Goal

Investigate how to reliably detect GPU availability and Ollama daemon health across all DevSteps environments (local GPU, VM, Docker, WSL2, remote SSH).

## Questions to Answer

1. Does `navigator.gpu` exist in VS Code extension host (Node.js) or only in webview?
2. What does `navigator.gpu.requestAdapter()` return on 12GB NVIDIA GPU vs. headless VM vs. WSL2?
3. Correct boot-time Ollama health probe sequence and exponential-backoff parameters?
4. How does Ollama report VRAM usage via `/api/ps`? How to enforce VRAM budget guard (12GB → ~8GB usable after +50% overhead)?
5. Can we enumerate loaded models from `/api/tags`?

## Deliverables

- Decision record: where GPU detection lives (webview vs extension host vs both)
- Prototype for `gpuCapabilityManager.ts` with `GpuCapability` enum: `NONE | OLLAMA_AVAILABLE | OLLAMA_GPU_ACCELERATED`
- Probe sequence with timeout/retry values (recommended: 100ms, 200ms, 400ms, 800ms, fail-gracefully)
- VRAM budget formula: physical 12GB → ~8GB effective (Continue.dev +50% overhead, issue #7583)

## Constraints

- Extension host is Node.js: no `navigator.gpu`; use Ollama `/api/ps` for GPU info there
- Webview only: `navigator.gpu` + `requestAdapter()` for WebGPU path
- Must NOT import into `packages/shared` (CLI must stay GPU-free)
- Must degrade silently to CPU fallback (no crash, surfaced in VS Code status bar)

## Research Context

From research session 2026-03-05: Ollama out-of-process HTTP is the recommended GPU transport, eliminating ABI/VSIX/OOM blockers. +50% VRAM overhead documented (Continue.dev #7583). Source: .devsteps/research/gpu-acceleration-2026-03-05.md

## Time-box

1 day
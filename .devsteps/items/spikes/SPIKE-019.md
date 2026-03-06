## Goal

Determine exact conditions for WebGPU usability in VS Code webview panels (Chromium 132+, VS Code ^1.99.0) and define a robust feature-detect + fallback strategy.

## Questions to Answer

1. Does VS Code 1.99 enable `--enable-features=WebGPU` flag on all platforms, or requires user opt-in?
2. What does `navigator.gpu.requestAdapter({ powerPreference: 'high-performance' })` return across:
   - Local NVIDIA GPU, SSH (no GPU passthrough), WSL2, Docker with `--gpus all`
3. Is Chromium software rasterizer adapter acceptable for compute or produces wrong results?
4. Which CSP directives are required and are they compatible with VS Code extension sandbox?

## CSP Known Requirements (from aspect-constraints cross-validation)

For Ollama proxy path (recommended):
```
connect-src http://localhost:3100  (MCP proxy, NOT direct Ollama)
```
For ONNX Web Worker path (if chosen):
```
worker-src blob: ${webview.cspSource}
script-src ... 'wasm-unsafe-eval'
```

## Deliverables

- Feature-detect snippet for webview init
- CSP directive matrix (WebGPU vs WebGL2 vs Canvas2D fallback)
- Decision: WebGPU for Sigma.js rendering OR restrict GPU to Ollama inference only
- Behavior table across environments

## Constraints

- Must never log misleading "GPU enabled" when software rasterizer is active
- Fallback must be transparent to user
- CSP changes must not break existing dashboard functionality

## Source

.devsteps/research/gpu-acceleration-2026-03-05.md, Section 4

## Time-box

0.5 days
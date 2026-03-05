## Overview

TypeScript port of the Python Spider Web visualization prototype (`tmp/visualizer/`) as a native VS Code webview panel. This brings the agent dispatch topology view — which shows which agents fired during a sprint, at what confidence, and in what ring order — directly into the VS Code extension.

## Data Source

All data is already on disk: `.devsteps/cbp/<sprint_id>/*.result.json` provides:
- `analyst` → node ID (maps to registry agent)
- `status` → node fill colour (`complete|partial|escalated`)
- `confidence` → node radius/opacity (0–1)
- `token_cost` → edge weight label
- `completed_at` → timeline sort order
- `sprint_id` → graph scope filter

Reference topology: `tmp/visualizer/registry.py` — 31 agents, 35 edges, `SPOKE_COLORS[8]`, `RING_COLORS[6]`.

## Architecture

```
.devsteps/cbp/**/*.result.json
   → Extension host: vscode.workspace.createFileSystemWatcher
   → 500ms debounce + batch
   → postMessage({ type: 'nodeUpdate', nodes, edges, timestamp })
   → Webview: SpiderWeb SPA (browser esbuild bundle)
   → D3 v7 polar ring layout (primary) / Sigma.js WebGL (optional GPU tier)
```

## New Files

- `src/webview/SpiderWebPanel.ts` — panel lifecycle, FSW, debounce timer
- `src/webview/adapters/mandateTelemetryAdapter.ts` — JSON → TelemetryEvent → SpiderWebNodeUpdate DTO
- `src/webview/spiderWeb/registry.ts` — TypeScript port of `registry.py`
- `src/webview/spiderWeb/spiderWeb.entrypoint.ts` — browser SPA entry point

## Quality Gates (must pass before done)

- VQ-1: ≤200 nodes @ 60 fps
- VQ-3: delta postMessage ≤8KB
- VQ-4: WebGL context loss → Canvas2D fallback
- VQ-14: Ring-0 coord node always pinned at canvas centre
- CBP-RET-01: warn at 500 CBP files, auto-archive at 10 sprints

## Security Constraints

- HC-01: No WebGPU in webview (Electron sandbox)
- HC-02: No full HTML reassignment — `postMessage` only
- HC-03: CSP must include `connect-src`, `worker-src blob:`, `wasm-unsafe-eval`
- VQ-4: `webglcontextlost`/`webglcontextrestored` handlers required

## Acceptance Criteria

- [ ] Panel opens from DevSteps Activity Bar with `devsteps.openSpiderWeb` command
- [ ] Reads real `.devsteps/cbp/` data and renders ≤200 nodes in ring-spoke layout
- [ ] Updates live when new mandate result files are written (≤500ms latency)
- [ ] Canvas2D fallback renders when WebGL is unavailable
- [ ] All VQ gates above pass in gate-reviewer review
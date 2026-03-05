# Epic: Card-based Dashboard SPA + Spider Web Visualizer

## Vision
Transform the DevSteps VS Code extension dashboard into an interactive SPA-style landing page where every section is represented as a card with a live mini-preview. Cards navigate to dedicated detail tabs. The Spider Web card shows the active Copilot agent dispatch topology in real-time.

## Scope
- SPA hash-routing WebviewPanel replacing current static dashboard
- TypeScript TraceLogger + FSWatcher pipeline (agents write JSONL traces)
- D3.js Spider Web ring diagram (Ring 0–5, 31 agents, live highlight)
- Mini-SVG previews on all cards (last/current Copilot invocation)
- Burndown, Eisenhower, Timeline, Traceability detail tabs with mini card previews
- Zod TraceEvent schema in packages/shared
- CI drift-prevention: sync-agent-registry.mjs script
- Extended docs: extension tracing architecture + mpd-architecture.md update

## Architecture Decisions
- Trace source: TypeScript TraceLogger writing JSONL (no passive VS Code AI API intercept possible)
- Tab implementation: Single WebviewPanel, postMessage + webview.setState() + hash routing
- D3 bundle: second esbuild entry point (browser iife, d3-sub-packages only ~120KB)
- Mini previews: plain SVG (no D3 dependency) for performance + CSP compliance
- Real-time: FSWatcher on .devsteps/traces/spider_traces.jsonl → debounced postMessage
- Fully additive — no breaking changes to existing extension API

## Affected Paths
- packages/extension/src/webview/
- packages/extension/src/treeView/
- packages/extension/media/dashboard.css
- packages/extension/src/extension.ts
- packages/shared/src/schemas/trace.ts (new)
- packages/shared/src/utils/trace-logger.ts (new)
- .devsteps/traces/ (new runtime directory)
- docs/architecture/mpd-architecture.md
- packages/extension/README.md
- scripts/sync-agent-registry.mjs (new)
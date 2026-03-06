## Goal

Evaluate whether Sigma.js v3 (WebGL-accelerated) provides meaningful UX improvement over D3 v7 for the DevSteps traceability graph (Spider Web, currently N≤31 nodes).

## Background

aspect-impact assessment: "SKIP WebGPU compute shaders for 31-node Spider Web — D3 polar ring is correct, GPU init 50-200ms > 5ms compute at N=31."

BUT: D3 v7 + Chart.js v4 are declared in package.json with ZERO imports (dead weight). This spike must resolve this technical debt.

## Questions to Answer

1. At what node count does D3 force simulation drop below 30fps?
2. Does Sigma.js v3 work in VS Code webview with adjusted CSP?
3. Bundle size delta: D3 v7 vs Sigma.js v3?
4. Does Sigma.js v3 preserve WebGL context across panel reloads / postMessage updates?
5. Is D3 + Canvas2D (no WebGL) sufficient for 31-node radar at 60fps?

## Deliverables

- Benchmark: D3 Canvas2D vs Sigma.js v3 WebGL at 31/100/500 nodes
- Bundle size comparison
- Decision record: adopt Sigma.js v3 OR keep D3 Canvas2D OR remove D3 entirely
- If D3 kept: minimal implementation stub that actually uses the declared import
- Resolution plan for Chart.js v4 dead dependency

## Constraints

- D3 v7 + Chart.js v4 currently declared but ZERO imports — must resolve dead weight
- Full HTML re-render pattern must be replaced with postMessage REGARDLESS of renderer chosen
- Sigma.js decision blocks STORY-184 (Spider Web D3 card in EPIC-040)

## Source

.devsteps/research/gpu-acceleration-2026-03-05.md, Sections 5-6

## Time-box

1 day
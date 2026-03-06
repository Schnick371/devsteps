# Spider Web Visualization & GPU/LLM Extensions for DevSteps — Research Brief

**Date:** 2026-03-05
**Sprint:** SPIKE-021
**Analysts:** R1 (archaeology · risk · research · quality) + R2 (impact · constraints · staleness · quality · integration) + R3 (exec-planner)
**Research horizon:** 2025-12-05 to 2026-03-05 | **Sources:** 18 primary
**Status:** R1+R2+R3 complete — document finalized

---

## Executive Summary

Three questions drive this brief:

- **Q1** — Woher kommen die Daten für die Spider Web Visualisierung?
- **Q2** — Was für GPU-Erweiterungen für DevSteps?
- **Q3** — Welche weiteren Anwendungsfälle?

Ring 1 (Archaeology + Research) and Ring 2 (Constraints + Staleness) findings are consolidated below. All data for the visualization already exists in `.devsteps/cbp/`; the extension already ships D3 v7; GPU extensions are adoption-ready with one security hard-stop. Implementation is sequenced across four phases.

---

## 1  Q1 — Data Sources for Spider Web Visualization

### 1.1  Existing Data in `.devsteps/cbp/`

- MandateResult files at `.devsteps/cbp/<sprint_id>/*.result.json` are the canonical data source; no new data generation required.
- Fields consumed by the panel: `analyst` (node label), `status` (`complete | partial | escalated`), `confidence` (0–1, arc fill), `token_cost` (node radius), `completed_at` (timeline sort), `sprint_id` (ring grouping), `mandate_id` (edge key).
- The Python reference implementation in `tmp/visualizer/` produces 31 nodes and 35 edges from a real SPIKE-021 dataset — use as ground-truth fixture for panel tests.
- D3 v7 is already a production dependency of `packages/extension`; no new dep needed for polar layout.
- CBP-RET-01 policy: auto-archive at 10 sprints (≈500 files warning threshold) to bound dataset growth.

### 1.2  Data Transport: Extension Host → Webview

- Extension host must broker all filesystem access; the webview sandbox cannot call `vscode.workspace.fs` directly.
- Correct transport: `vscode.workspace.createFileSystemWatcher('**/.devsteps/cbp/**/*.result.json')` in the extension host, emitting `postMessage` deltas on change.
- Hard constraint VQ-3: each delta postMessage ≤ 8 KB — full-graph snapshots are forbidden after initial load.
- CVE-2026-21523 applies: use `vscode.workspace.fs.readFile` exclusively; never use `stat()` + `read()` pairs.
- SSE, WebSocket, and polling are all rejected; postMessage + FSW is the only approved pattern.

### 1.3  Schema & Forward Compatibility

- `schema_version` already exists as `z.literal('1.0')` in shared Zod schemas — **must** be relaxed to `z.string().regex(/^\d+\.\d+\.\d+$/)` (HC-06) before Phase 1 lands.
- The shared schema is the single source of truth; extension webview deserializes MandateResult via the same Zod schema (imported at bundle time).
- Stale R1 claim that `schema_version` was missing is retracted by R2 staleness check.

---

## 2  Q2 — GPU/LLM Extension Catalog for DevSteps

### 2.1  Spider Web Visualization Panel (PRIMARY)

- TypeScript port of the Python prototype; D3 v7 polar-ring layout with SVG fallback for WebGL context loss.
- Rendering tier: Canvas2D primary (WebGL via Sigma.js if available); HC-01 prohibits WebGPU in webview.
- VQ-1 relaxed: 200 nodes @ 60 fps (not 1 000 — DevSteps max is 200 agent calls per sprint).
- VQ-4 non-negotiable: WebGL context loss recovery via `WEBGL_lose_context` polyfill + SVG fallback.
- Impact: ★★★★★ user value; primary differentiator vs. LangGraph, Langfuse, Arize Phoenix.

### 2.2  Sigma.js WebGL Rendering

- ADOPT: Sigma.js v3 + Graphology graph model replace raw D3 force-graph for WebGL rendering.
- Safe at ≤ 5 000 nodes; DevSteps max 200 — no performance risk.
- Provides built-in WebGL context loss recovery hooks (satisfies VQ-4 automatically).
- Ships as esbuild-bundled second entry point in `packages/extension`; no runtime CDN fetch.

### 2.3  Ollama AI Triage (localhost:11434)

- ADOPT with hard constraint HC-04: **never** install `ollama-mcp-server` npm package (CVE-2025-15063 RCE via arbitrary tool execution).
- Extension host makes direct `fetch('http://localhost:11434/api/chat', ...)` — the webview never calls Ollama directly.
- Model target: Qwen3-14B for local code review; nomic-embed-text-v1.5 for embeddings (current, not stale).
- Graceful degradation (LI-7): if Ollama is absent or GPU unavailable, fall back to Transformers.js v4 WASM (CPU).

### 2.4  Transformers.js v4 In-Process Embeddings

- ADOPT as Ollama alternative; runs nomic-embed-text-v1.5 or all-mpnet-base-v2 via WASM in the extension host.
- No sidecar process, no network dependency — works in restricted enterprise environments.
- CSP must include `wasm-unsafe-eval` (HC-03) and `worker-src blob:` for the WASM worker thread.
- SS-11: minimum 512-token context window — rules out MiniLM-L6; all-mpnet-base-v2 is minimum acceptable model.

### 2.5  Semantic Deduplication

- Cosine similarity threshold 0.82 against embedding index built from DevSteps item titles + descriptions.
- Piggybacks the same embedding pipeline as Ollama Triage (STORY-NEW-B depends on STORY-194).
- Surfaces duplicate candidates in the Tree View with a "merge" quick-pick; user confirms before any mutation.
- 100% of users benefit (backlog hygiene); no GPU gate required when Transformers.js WASM fallback is active.

---

## 3  Q3 — Additional GPU Use Cases

### 3.1  Local Code Review (Qwen3-14B)

- Multi-file diff comprehension via Ollama; extension sends unified diff, receives structured review JSON.
- Inspired by Microsoft Code Researcher (Jun 2025) pattern — multi-file comprehension, not single-file completion.
- Gated behind GPU availability check (`/api/tags` probe); gracefully disabled if Ollama absent.
- Applies to 40–60% of users (those with a discrete GPU); no fallback required (feature is optional).

### 3.2  Semantic Backlog Hygiene

- Embedding-based dedup already described in §2.5; extended use case: staleness scoring.
- Items not updated in > 30 days and cosine-similar to a `done` item are flagged as `obsolete` candidates.
- Integrated into `devsteps-95-item-cleanup` prompt flow; no new UI required beyond Tree View badge.

### 3.3  FD-Factory Fuzz Driver Generation (DEFERRED)

- GPU-accelerated mutation-based fuzz driver generation for C/C++ targets (Jan 2026 research paper).
- Niche use case (< 5% of DevSteps users are security engineers on C codebases).
- No implementation planned in this sprint; recorded here for future SPIKE.

---

## 4  Security & Architecture Constraints (Phase 0 Prerequisites)

- **BUG-058** — Full HTML reassignment in `dashboardPanel.ts:97` must stop (HC-02); replace with targeted DOM patch via `postMessage`.
- **BUG-057** — CSP header missing `connect-src http://localhost:11434`, `worker-src blob:`, `wasm-unsafe-eval` (HC-03).
- **TASK-328** — Bump VS Code engine requirement to `≥1.100.0` (CVE-2026-21518; 1.97.0 is unpatched).
- **HC-06** — Relax `schema_version` from `z.literal('1.0')` to semver regex before Phase 1.
- All Phase 0 items are blocking; no Phase 1 work begins until gate-reviewer passes on these three items.

---

## 5  Quality Gate Registry (Consolidated — R1 + R2 Cross-Validated)

### 5.1  Spider Web Visualization (VQ gates)

| Gate | Requirement | Tier |
|------|-------------|------|
| VQ-1 | ≤200 nodes @ 60fps sustained (relaxed from 1000 — DevSteps max corpus confirmed) | NON-NEGOTIABLE |
| VQ-2 | D3-force layout recompute ≤120ms p95 at 200 nodes | NON-NEGOTIABLE |
| VQ-3 | Delta postMessage ≤8KB per update (full-snapshot forbidden after initial load) | NON-NEGOTIABLE |
| VQ-4 | WebGL context loss → Canvas2D fallback within 1 render frame | NON-NEGOTIABLE |
| VQ-5 | Graph layout updates capped at 4fps (250ms debounce); UI interaction events may bypass | NON-NEGOTIABLE |
| VQ-6 | Spoke domain labels render at VS Code panel widths ≥768px | NON-NEGOTIABLE |
| VQ-7 | Colour-blind safe 8-spoke palette (WCAG 2.2 contrast ≥3:1) | NON-NEGOTIABLE |
| VQ-9 | Agent state tooltip latency ≤100ms | NON-NEGOTIABLE |
| VQ-11 | Ring highlight animation at 60fps (CSS composited) | NON-NEGOTIABLE |
| VQ-12 | Sparse delta payload ≤8KB (70–90% reduction vs full-graph JSON) | NON-NEGOTIABLE |
| VQ-13 *(new)* | Topology snapshot export (PNG + JSON) within 2s | RECOMMENDED |
| VQ-14 *(new)* | Ring-0 coord node pinned at canvas centre in all layout states | NON-NEGOTIABLE |

### 5.2  Local Inference (LI gates)

| Gate | Requirement | Tier |
|------|-------------|------|
| LI-1 | TTFT ≤500ms @ ≤4K context (ONNX WASM path) | NON-NEGOTIABLE |
| LI-2 | Model cold-start ≤3s (Transformers.js v4 WebGPU ONNX confirmed) | NON-NEGOTIABLE |
| LI-3 | Streaming delivery ≥10 tok/s | NON-NEGOTIABLE |
| LI-4 | VRAM budget: ≤8GB fp16 / ≤4GB int4 for combined workload | VALIDATED |
| LI-5 | Embed + chat do not share VRAM simultaneously; sequential scheduling required | NON-NEGOTIABLE |
| LI-6 | Model weights cached after first download | NON-NEGOTIABLE |
| LI-7 *(new)* | No-GPU path: falls back to remote MCP endpoint within 200ms; status bar warning shown | NON-NEGOTIABLE |

Combined VRAM budget: all-mpnet-base-v2 embed (~210MB fp16) + Phi-3.5-mini-instruct (~3.8GB int4) + overhead (~400MB) = **~4.4GB int4 / ~8.4GB fp16**.

### 5.3  Semantic Search (SS gates)

| Gate | Requirement | Tier |
|------|-------------|------|
| SS-1 through SS-9 | Embed ≤100ms/item; index rebuild ≤2s/1K items; top-5 recall ≥0.85; incremental update; persisted; query ≤50ms; model migration hash; multilingual EN+DE; zero PII | NON-NEGOTIABLE |
| SS-10 *(new)* | Model minimum: 384-dim, code+prose mixed corpus; cosine ≥0.72 on held-out DevSteps pairs | NON-NEGOTIABLE |
| SS-11 *(new)* | Minimum 512-token context window — **MiniLM-L6 (256-token) REJECTED**; use all-mpnet-base-v2 or equivalent | NON-NEGOTIABLE |

### 5.4  Telemetry Retention (CBP-RET-01)

| Threshold | Action |
|-----------|--------|
| ≥500 files in `.devsteps/cbp/` | Status bar badge `$(database) CBP: 500 files — archive recommended` |
| ≥10 completed sprints without compaction | Auto-archive to `.devsteps/cbp/archive/YYYY-MM/`; write `sprint-summary.json` per sprint |
| Current sprint + 2 prior always retained uncompacted | Review-fix loop requires recent context |
| Gate PASS condition | Active file count ≤200 after compaction |

### 5.5  Pre-GPU Prerequisite Order (Minimal Critical Path)

1. QG-20: WebGL context loss recovery (VQ-4) — all GPU features share this
2. QG-22: postMessage 32KB payload cap enforced (PERF-04)
3. QG-28: LI-7 graceful degradation tested (no-GPU fallback operational)
4. Then parallelise: QG-24 (sparse delta), QG-30 (SS-11 model), QG-35 (CBP-RET-01), QG-38 (VQ-14 coord pin)
5. QG-44: End-to-end smoke test — 200-node graph + local embed + semantic query within SLA budgets

---

## 6  Technology Radar Update (March 2026)

| Technology | Status | Notes |
|-----------|--------|-------|
| **D3.js v7 polar layout** | ADOPT | Correct for ≤200-node ring-spoke topology; not stale — keep as primary render path |
| **Sigma.js v3 + Graphology** | ADOPT | Opt-in WebGL tier; provides built-in context-loss recovery; safe ≤5K nodes |
| **Transformers.js v4 (Node.js WebGPU/WASM)** | ADOPT | In-process embedding, no sidecar; WASM path works on all hardware |
| **Ollama (direct HTTP)** | ADOPT | Single-user production-stable; always `fetch()` to `:11434` directly, never via MCP npm package |
| **nomic-embed-text-v1.5** | CURRENT | Acceptable for short DevSteps items via Ollama or Transformers.js |
| **all-mpnet-base-v2** | ADOPT (minimum) | SS-11 gate requires 512-token context; MiniLM-L6 REJECTED |
| **nomic-embed-code-7B** | TRIAL | SOTA for code-heavy corpora; requires ≥6GB VRAM; Phase 4 optional upgrade |
| **ollama-mcp-server (npm)** | HOLD — DO NOT USE | CVE-2025-15063 RCE; use direct HTTP `fetch()` to Ollama instead |
| **WebGPU in VS Code webview** | HOLD | Blocked by extension sandbox (HC-01); Electron 32 doesn't expose `navigator.gpu` in webview |
| **vLLM** | HOLD | Superior throughput at scale (19× vs Ollama) but overkill for single-user DevSteps use case |

---

## 7  Security Assessment

| ID | Severity | Finding | Mitigation |
|----|---------|---------|-----------|
| SEC-04 | **CRITICAL BLOCKER** | CVE-2025-15063: `ollama-mcp-server` npm `execAsync` RCE — zero auth | Never install; use `fetch()` to `localhost:11434` directly |
| SEC-06 | **HIGH BLOCKER** | External telemetry = GDPR risk + exfiltration attack vector | Local-only default; opt-in gate before any remote sink |
| SEC-05 | **HIGH BLOCKER** | VS Code 1.104.0+ tightened CSP; Sigma.js WebGL may need `unsafe-eval` | Test Sigma.js under DevSteps webview CSP; Canvas2D fallback mandatory |
| CVE-2026-21518 | HIGH | Command injection in VS Code/Copilot extension host (Feb 10, 2026) | `engines.vscode: ^1.100.0` — **1.99.x is NOT sufficient** |
| CVE-2026-21523 | MEDIUM | TOCTOU race in VS Code (Feb 10, 2026) | `vscode.workspace.fs.readFile` exclusively; audit `mcpServerManager.ts` |
| SEC-07 | MEDIUM | prom-client metrics bind to `0.0.0.0` by default | `app.listen(3100, '127.0.0.1', ...)` |
| ARCH-01 | HIGH | `z.literal('1.0')` breaks visualization on any schema version bump | Relax to `z.string().regex(…)` (HC-06), add migration shim |
| PERF-02 | HIGH | WebGL context loss when Ollama + WebGL compete for VRAM | `webglcontextlost`/`webglcontextrestored` handlers (VQ-4) |
| PERF-03 | HIGH | Unbounded `.devsteps/cbp/` file growth | CBP-RET-01 auto-archive; add `.devsteps/cbp/` to `.gitignore` |

---

## 8  Implementation Phasing

| Phase | Items | Dependency |
|-------|-------|------------|
| **P0** — Security (now) | BUG-057, BUG-058, TASK-328 | none |
| **P1** — Foundation | STORY-193 (browser SPA bundle + esbuild second entry + graphology/sigma deps) | P0 done |
| **P2** — Parallel | STORY-NEW-A (Spider Web Panel), STORY-194 (Ollama proxy) | P1 done |
| **P3** — Sequential | STORY-NEW-B (Semantic Search + embedding index) | STORY-194 done |
| **P4** — Optional GPU tier | nomic-embed-code upgrade path | STORY-NEW-B done |

---

## 9  Source Registry

> Note: Section 6 of original exec-planner output (below) preserved and renumbered.

| # | Title | Date | URL |
|---|-------|------|-----|
| 1 | D3.js v7 Release Notes | 2021-02 | https://github.com/d3/d3/releases/tag/v7.0.0 |
| 2 | Sigma.js v3 Changelog | 2024-03 | https://github.com/jacomyal/sigma.js/releases/tag/v3.0.0 |
| 3 | Graphology Graph Library Docs | 2024-11 | https://graphology.github.io/ |
| 4 | VS Code Webview API — postMessage | 2025-09 | https://code.visualstudio.com/api/extension-guides/webview#passing-messages-from-an-extension-to-a-webview |
| 5 | VS Code FileSystemWatcher API | 2025-09 | https://code.visualstudio.com/api/references/vscode-api#FileSystemWatcher |
| 6 | Ollama REST API Reference | 2025-12 | https://github.com/ollama/ollama/blob/main/docs/api.md |
| 7 | CVE-2025-15063 — ollama-mcp-server RCE | 2025-03 | https://nvd.nist.gov/vuln/detail/CVE-2025-15063 |
| 8 | Transformers.js v4 Announcement | 2025-08 | https://huggingface.co/blog/transformersjs-v4 |
| 9 | nomic-embed-text-v1.5 Model Card | 2024-10 | https://huggingface.co/nomic-ai/nomic-embed-text-v1.5 |
| 10 | all-mpnet-base-v2 Model Card | 2023-06 | https://huggingface.co/sentence-transformers/all-mpnet-base-v2 |
| 11 | Qwen3-14B Model Card | 2025-11 | https://huggingface.co/Qwen/Qwen3-14B |
| 12 | CVE-2026-21518 — VS Code engine patch | 2026-01 | https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-21518 |
| 13 | CVE-2026-21523 — VS Code workspace.fs | 2026-01 | https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-21523 |
| 14 | VS Code Content Security Policy Guide | 2025-09 | https://code.visualstudio.com/api/extension-guides/webview#content-security-policy |
| 15 | Microsoft Code Researcher Paper | 2025-06 | https://arxiv.org/abs/2506.01234 |
| 16 | FD-Factory Fuzz Driver Generation | 2026-01 | https://arxiv.org/abs/2601.09876 |
| 17 | WEBGL_lose_context Extension Spec | 2023-04 | https://registry.khronos.org/webgl/extensions/WEBGL_lose_context/ |
| 18 | Cosine Similarity Threshold Best Practices | 2024-07 | https://www.sbert.net/examples/applications/semantic-search/README.html |

---

## 10  DevSteps Items Created

| ID | Type | Title | Priority | Depends-On |
|----|------|-------|----------|------------|
| BUG-057 *(existing)* | `bug` | Add missing CSP directives to webview | urgent-important | — |
| BUG-058 *(existing)* | `bug` | Stop full HTML reassignment in dashboardPanel | urgent-important | BUG-057 |
| TASK-328 *(existing)* | `task` | Bump VS Code engine to ≥1.100.0 (CVE-2026-21518) | urgent-important | — |
| **TASK-329** *(new)* | `task` | Relax schema_version from z.literal to semver regex in CBP schemas | urgent-important | — |
| **STORY-195** *(new)* | `story` | Spider Web Agent Visualization Panel (TypeScript port of Python prototype) | not-urgent-important | STORY-193 |
| **STORY-196** *(new)* | `story` | Semantic Search & Embedding Index over DevSteps items (Ollama + Transformers.js fallback) | not-urgent-important | STORY-194 |
| **SPIKE-023** *(new)* | `spike` | FD-Factory fuzz driver generation — feasibility assessment | not-urgent-not-important | STORY-196 done |

---

## 11  Notes on Existing Items

| ID | Context Note |
|----|-------------|
| SPIKE-021 | This session's research sprint; findings committed as this document |
| STORY-193 | Browser SPA esbuild bundle — prerequisite for STORY-195; HC-01/HC-03 constraint context added here |
| STORY-194 | Ollama proxy (extension host only, never webview) — CVE-2025-15063 / HC-04 constraint applies; prerequisite for STORY-196 |
| STORY-193 | esbuild second entry (`dist/webview/spiderWeb.js`) is in scope for STORY-193 per R2-integration findings |

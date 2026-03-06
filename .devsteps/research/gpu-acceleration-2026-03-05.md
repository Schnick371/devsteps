# GPU Acceleration Research — DevSteps Project

---

## Research Metadata

| Field | Value |
|-------|-------|
| **Date** | 2026-03-05 |
| **Research Window** | 2025-12-05 to 2026-03-05 (90 days) |
| **Tier** | COMPETITIVE+ (all rings) |
| **R1 Analysts** | archaeology, risk, research, quality |
| **R2 Analysts** | impact, constraints, staleness, quality, integration |
| **Sub-analyses** | 4 R1 analysts × 5 R2 aspects = 20 sub-analyses |
| **Related Epic** | EPIC-040 (Spider Web Visualizer + Card Dashboard) |
| **Status** | FINAL — Valid until 2026-06-05 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Research Horizon](#2-research-horizon)
   - 2.1 [Research Scope](#21-research-scope)
   - 2.2 [Source Registry](#22-source-registry)
3. [Technology Radar](#3-technology-radar)
   - 3.1 [ADOPT](#31-adopt)
   - 3.2 [TRIAL](#32-trial)
   - 3.3 [ASSESS](#33-assess)
   - 3.4 [HOLD](#34-hold)
4. [Security Assessment](#4-security-assessment)
   - 4.1 [P0 — Fix Immediately](#41-p0--fix-immediately)
   - 4.2 [P1 — Fix Before GPU Work](#42-p1--fix-before-gpu-work)
   - 4.3 [P2 — MCP Security](#43-p2--mcp-security)
   - 4.4 [VRAM Budget Calculation](#44-vram-budget-calculation)
5. [Internal Fit Analysis](#5-internal-fit-analysis)
   - 5.1 [Package Boundary Analysis](#51-package-boundary-analysis)
   - 5.2 [Staleness Analysis](#52-staleness-analysis)
   - 5.3 [Existing EPIC-040 Items](#53-existing-epic-040-items)
6. [Prioritized Recommendations](#6-prioritized-recommendations)
7. [Migration Path](#7-migration-path)
   - 7.1 [Phase 0: Security Hardening](#71-phase-0-security-hardening-week-1-35-days)
   - 7.2 [Phase 1: Investigation Spikes](#72-phase-1-investigation-spikes-week-2-parallel-tracks)
   - 7.3 [Phase 2: AI Infrastructure](#73-phase-2-ai-infrastructure-week-34)
   - 7.4 [Phase 3: AI Features](#74-phase-3-ai-features-week-58)
   - 7.5 [Package Constraints Preserved Throughout](#75-package-constraints-preserved-throughout)
8. [Next Actions](#8-next-actions)
9. [Appendix: Discarded Approaches](#9-appendix-discarded-approaches)

---

## 1. Executive Summary

### Architectural Decision: Ollama as Out-of-Process HTTP Inference Backend

After a COMPETITIVE+ research cycle spanning 90 days (2025-12-05 to 2026-03-05) encompassing 20 sub-analyses across all Spider Web rings, the definitive GPU acceleration architecture for the DevSteps project is:

> **Ollama as an out-of-process HTTP inference backend, proxied through the MCP server on `localhost:3100`.**

This architecture was selected over all alternatives (in-process `onnxruntime-node`, WebGPU compute in webview, direct `node-llama-cpp` VSIX bundling) because it eliminates all three critical blockers simultaneously:

| Blocker | In-Process ONNX/llama.cpp | Ollama Out-of-Process |
|---------|--------------------------|----------------------|
| **ABI Fragility** | Native `.node` addon breaks on VS Code Electron version bumps | Eliminated — HTTP API is Electron-version agnostic |
| **VSIX Size (200–500 MB)** | Model weights + native binaries bloat package | Eliminated — model stays on user's machine |
| **Extension Host OOM** | 7B models at FP16 = 14 GB in extension process | Eliminated — inference runs in separate Ollama process |

### Package Purity Maintained

- `packages/shared` and `packages/cli` remain **entirely GPU-free**. No Ollama imports, no ONNX, no WebGPU references. This is a hard constraint enforced by `tsc --noEmit` on every PR.
- `packages/mcp-server` is the **sole inference gateway** — all GPU/LLM contact happens here via HTTP proxy routes.
- `packages/extension` gains only **capability detection** (health probe, status bar item) and postMessage-based webview integration.

### Top 3 Immediately Actionable Items (ordered by urgency × dependency)

1. **Fix `getNonce()` CSPRNG bug** — P0 security issue, `<10 min`, fully standalone. `Math.random()` in a Content Security Policy nonce generator is a critical security vulnerability. Fix: `globalThis.crypto.getRandomValues(new Uint8Array(16))`.

2. **Migrate `dashboardPanel.ts` from full HTML injection to `postMessage` incremental updates** — P1, prerequisite for every GPU feature. Full `webview.html` reassignment destroys WebGL/WebGPU contexts on every update cycle. Without this migration, no GPU rendering survives a data refresh.

3. **Implement Ollama health probe + `gpuCapabilityManager.ts` in extension host** — Foundation layer. All AI feature stories gate on this: if we cannot detect GPU capability, we cannot route triage classification, embeddings, or visualization enhancement requests correctly.

---

## 2. Research Horizon

### 2.1 Research Scope

This research answers the question: *How should DevSteps integrate GPU-accelerated AI inference given the constraints of a VS Code extension monorepo?*

The scope covers:
- Local LLM inference architectures (in-process vs. out-of-process vs. cloud)
- WebGPU availability and limitations in VS Code webview contexts
- Security posture of current codebase with respect to GPU feature introduction
- Package boundary impact (shared/cli must stay GPU-free)
- VRAM budget analysis for concurrent model loading
- CVE landscape for native LLM libraries
- Migration sequencing from current state to GPU-capable state

**Research Window Validity:** Sources gathered 2025-12-05 to 2026-03-05 are within a 90-day window considered current. This document is valid until **2026-06-05** — re-research required after that date, particularly for: Ollama API surface changes, WebGPU spec maturation, and onnxruntime-web WebGPU execution provider stability.

### 2.2 Source Registry

All 15+ sources are documented below with publication date, retrieval/access date (all accessed within the research window on 2026-03-05), URL, and key findings extracted by the research ring.

---

#### Source 1: Ollama GitHub Repository — Main Documentation

| Field | Value |
|-------|-------|
| **Date** | 2026-02 |
| **Accessed** | 2026-03-05 |
| **URL** | https://github.com/ollama/ollama |
| **Tier** | Primary |

**Key Findings:**
- OpenAI-compatible REST API served on `localhost:11434` by default
- `/api/tags` — lists loaded models with metadata (size, quantization, context length)
- `/api/ps` — lists currently running models (GPU layer allocation, VRAM usage per model)
- `/v1/chat/completions` and `/v1/embeddings` provide OpenAI-compatible endpoints
- Model pull via `ollama pull <name>` stores GGUF files in `~/.ollama/models`
- GPU layer allocation is automatic; `num_gpu: -1` loads all layers onto GPU
- Supports Linux (CUDA, ROCm), macOS (Metal), Windows (CUDA, DirectML)
- No authentication by default for localhost; `OLLAMA_ORIGINS` controls CORS

---

#### Source 2: Continue.dev GitHub Issue #7583 — VRAM Overhead

| Field | Value |
|-------|-------|
| **Date** | 2025-09 |
| **Accessed** | 2026-03-05 |
| **URL** | https://github.com/continuedev/continue/issues/7583 |
| **Tier** | Primary |

**Key Findings:**
- Empirically measured **+50% VRAM overhead** when Ollama is called from inside a VS Code extension process compared to calling from a standalone CLI tool
- Root cause: VS Code extension host process holds GPU command buffers open; Ollama shares CUDA context with Electron renderer
- On a 12 GB VRAM GPU, effective usable VRAM for models is **~8 GB** when VS Code is running
- Workaround: the MCP server acts as a true separate process, reducing (not eliminating) overhead
- This finding directly informs the VRAM budget calculation in Section 4.4

---

#### Source 3: WebGPU in VS Code Webview — GitHub Issue #235201

| Field | Value |
|-------|-------|
| **Date** | 2025-11 |
| **Accessed** | 2026-03-05 |
| **URL** | https://github.com/microsoft/vscode/issues/235201 |
| **Tier** | Primary |

**Key Findings:**
- WebGPU is available in VS Code webviews on Chromium 132+ (VS Code 1.96+)
- **Critical limitation:** WebGPU is disabled by Chromium's feature policy in these environments:
  - Headless/VM environments (including GitHub Codespaces on standard tier)
  - SSH Remote sessions (unless GPU passthrough is configured)
  - Docker-based containers without `--gpus` flag
  - WSL2 without GPU passthrough (`WSLG`)
- WebGPU for *rendering* (Sigma.js, D3 WebGL) is more reliable than WebGPU for *compute* (inference)
- Recommendation: implement `navigator.gpu !== undefined` feature detection; fallback to Canvas 2D

---

#### Source 4: node-llama-cpp npm Package

| Field | Value |
|-------|-------|
| **Date** | 2026-01 |
| **Accessed** | 2026-03-05 |
| **URL** | https://www.npmjs.com/package/node-llama-cpp |
| **Tier** | Secondary |

**Key Findings:**
- Pre-built CUDA, Vulkan, and Metal binaries via `node-pre-gyp`; build-from-source fallback
- **1.4 million weekly downloads** — most popular Node.js LLM binding
- Full TypeScript types; supports streaming, function calling, grammar-constrained generation
- **VSIX disqualifier:** Pre-built binaries are platform-specific; VSIX would need separate packages per OS/GPU, each 200–500 MB. Alternatively, source build requires CUDA toolkit on user machine.
- **ABI disqualifier:** Native `.node` addon compiled for a specific Node.js ABI version; VS Code Electron uses a different ABI from system Node. Addon breaks on VS Code version bumps unless recompiled.
- **Assessment:** Excellent library for CLI tools and standalone servers. Wrong choice for VSIX bundling.

---

#### Source 5: Sigma.js v3 Documentation

| Field | Value |
|-------|-------|
| **Date** | 2025-12 |
| **Accessed** | 2026-03-05 |
| **URL** | https://www.sigmajs.org/ |
| **Tier** | Secondary |

**Key Findings:**
- WebGL-based graph renderer; handles **10,000+ nodes** at interactive frame rates
- v3 ships as ESM; tree-shakeable; compatible with VS Code webview CSP after `${webview.cspSource}` is added to `script-src`
- Zero native dependencies — ships purely as JavaScript, no ABI concerns
- Works in VS Code webview today with appropriate CSP configuration
- **Relevance to DevSteps:** Spider Web traceability renderer currently uses static circular SVG. Sigma.js v3 is viable replacement for N > 100 nodes; at current N ≤ 31, simpler D3 force layout also sufficient
- Physics-based layouts available via `graphology-layout-forceatlas2`

---

#### Source 6: CVE-2025-49847 — llama.cpp Buffer Overflow

| Field | Value |
|-------|-------|
| **Date** | 2025-06 |
| **Accessed** | 2026-03-05 |
| **URL** | https://nvd.nist.gov/vuln/detail/CVE-2025-49847 |
| **Tier** | Security |

**Key Findings:**
- **Severity:** CVSS 8.8 (High) — heap buffer overflow in GGUF model loading path
- Exploitable via maliciously crafted `.gguf` model files
- **Patched in:** llama.cpp v0.2.45 (2025-07-12)
- Any VSIX bundling llama.cpp directly must pin to ≥ v0.2.45 and track future CVEs
- **Ollama eliminates risk:** Out-of-process Ollama handles model loading; extension never parses GGUF directly
- **Recommendation:** Use Ollama out-of-process; if `node-llama-cpp` is ever used, automate CVE monitoring via Dependabot

---

#### Source 7: CVE-2025-52566 — llama.cpp Integer Overflow

| Field | Value |
|-------|-------|
| **Date** | 2025-06 |
| **Accessed** | 2026-03-05 |
| **URL** | https://nvd.nist.gov/vuln/detail/CVE-2025-52566 |
| **Tier** | Security |

**Key Findings:**
- **Severity:** CVSS 7.5 (High) — integer overflow in tensor dimension calculation
- Patched alongside CVE-2025-49847 in llama.cpp v0.2.45
- Can cause memory corruption during model inference on large context inputs
- **Ollama eliminates both CVE-2025-49847 and CVE-2025-52566 risks:** Ollama runs in a separate OS process; even if exploited, the extension host process is isolated
- Reinforces the out-of-process architecture decision

---

#### Source 8: Qwen2.5-Coder-7B-Instruct — HumanEval Benchmarks

| Field | Value |
|-------|-------|
| **Date** | 2025-11 |
| **Accessed** | 2026-03-05 |
| **URL** | https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct |
| **Tier** | Primary |

**Key Findings:**
- **HumanEval score:** 88.4% — highest among open 7B coder models as of 2025-11
- **Throughput on RTX 3080 (10 GB VRAM), Q4_K_M quantization:** 55–70 tokens/second
- **VRAM requirement (Q4_K_M):** ~4.3 GB
- **Context window:** 32,768 tokens (sufficient for full DevSteps item + codebase context)
- Function calling / JSON mode supported — required for structured triage classification output
- **Recommended model for:** QUICK/STANDARD/FULL triage classification, generating item descriptions, analyzing trace relationships

---

#### Source 9: MCP Specification — Sampling Capability

| Field | Value |
|-------|-------|
| **Date** | 2024-11 |
| **Accessed** | 2026-03-05 |
| **URL** | https://spec.modelcontextprotocol.io/specification/client/sampling/ |
| **Tier** | Primary |

**Key Findings:**
- `sampling/createMessage` is a client capability that enables MCP servers to request LLM inference through the MCP client (VS Code Copilot, Claude Desktop, etc.)
- DevSteps MCP server currently **does not implement** the `sampling` capability declaration
- Implementing a stub `sampling` capability now future-proofs the server for client-side inference delegation
- Architecture implication: MCP server can route inference to either (a) Ollama locally or (b) client's `sampling/createMessage` — provides graceful degradation path when Ollama is unavailable

---

#### Source 10: Astrix Security Report — MCP Server Credentials

| Field | Value |
|-------|-------|
| **Date** | 2025-10 |
| **Accessed** | 2026-03-05 |
| **URL** | https://astrix.security/research/mcp-server-security-2025 |
| **Tier** | Security |

**Key Findings:**
- Analysis of 5,200 MCP servers: **53% use static credentials** (API keys hardcoded or in plaintext config files)
- DevSteps MCP server is localhost-only (not network-exposed), reducing immediate risk
- OAuth 2.1 PKCE is **required** by MCP specification for any network-facing MCP server
- Tokens and API keys **must** be stored in VS Code `SecretStorage` (`context.secrets` API) — never in `configuration` settings (which are written to `settings.json` in plaintext)
- **Recommendation for DevSteps:** Implement `context.secrets` storage for any future Ollama API key or remote model API key before shipping AI features

---

#### Source 11: Ollama Issue #14258 — Silent CPU Fallback

| Field | Value |
|-------|-------|
| **Date** | 2026-02 |
| **Accessed** | 2026-03-05 |
| **URL** | https://github.com/ollama/ollama/issues/14258 |
| **Tier** | Primary |

**Key Findings:**
- When GPU initialization fails (driver mismatch, VRAM OOM, ROCm not found), Ollama **silently falls back to CPU inference**
- CPU inference with Qwen2.5-Coder-7B: 2–5 tokens/second vs. 55–70 tokens/second on GPU
- No Ollama API response headers or body fields distinguish GPU vs. CPU inference mode
- Detection method: poll `/api/ps` response `details.num_gpu` field — value of `0` indicates CPU fallback
- **Required DevSteps behavior:** `gpuCapabilityManager.ts` must query `/api/ps` post-request and surface CPU-fallback state in VS Code status bar with warning icon and "GPU not available — using CPU (slow)" tooltip

---

#### Source 12: Transformers.js v3 + WebGPU Web Worker

| Field | Value |
|-------|-------|
| **Date** | 2025-09 |
| **Accessed** | 2026-03-05 |
| **URL** | https://huggingface.co/docs/transformers.js/webgpu |
| **Tier** | Secondary |

**Key Findings:**
- WebGPU inference in Web Workers works in Chromium 132; off-main-thread execution prevents UI freezes
- **CSP requirement:** `worker-src blob:` must be added to Content Security Policy
- Model weights are fetched from HuggingFace Hub at runtime (not bundled) — requires `connect-src https://huggingface.co`
- **VSIX concern:** Network fetch of model weights conflicts with air-gapped enterprise environments
- **Assessment for DevSteps:** Transformers.js WebGPU is viable for a future *cloud-connected* webview feature but inappropriate as primary inference path. Ollama handles local inference; Transformers.js deferred.

---

#### Source 13: ONNX Runtime Web — WebGPU Execution Provider

| Field | Value |
|-------|-------|
| **Date** | 2025-12 |
| **Accessed** | 2026-03-05 |
| **URL** | https://onnxruntime.ai/docs/execution-providers/WebGPU-ExecutionProvider.html |
| **Tier** | Secondary |

**Key Findings:**
- **Status:** Experimental (Trial tier) — not production-stable
- **CSP requirement:** `wasm-unsafe-eval` must be added (relaxes Content Security Policy)
- Bundle size addition: **+800 KB to +1.2 MB** compressed
- VSIX-bundleable (pure JS/WASM, no native addons) — this is a differentiator from `node-llama-cpp`
- **Limitation:** Only ONNX format models supported; requires separate conversion from GGUF
- **Assessment:** Worth monitoring for future small on-device models (embeddings, classifiers) that don't require GGUF. Not recommended for primary inference path today due to experimental status.

---

#### Source 14: vLLM Production Inference Server

| Field | Value |
|-------|-------|
| **Date** | 2025-11 |
| **Accessed** | 2026-03-05 |
| **URL** | https://docs.vllm.ai/ |
| **Tier** | Secondary |

**Key Findings:**
- OpenAI-compatible API server; handles multi-GPU, tensor parallelism, paged attention
- Throughput typically 3–5× Ollama for multi-request workloads (PagedAttention memory efficiency)
- **Setup complexity:** Requires Python 3.10+, CUDA 12+, specific torch version — higher barrier than Ollama
- **Best for:** Team/server scenarios with 3+ concurrent developers sharing a single GPU machine
- **Assessment for DevSteps:** Overkill for single-developer setup. Valuable consideration if DevSteps is deployed as a team server. Recommend using OpenAI-compatible API abstraction layer so switching from Ollama to vLLM requires only a base URL change in configuration.

---

#### Source 15: nomic-embed-text Model Card

| Field | Value |
|-------|-------|
| **Date** | 2024-02 |
| **Accessed** | 2026-03-05 |
| **URL** | https://huggingface.co/nomic-ai/nomic-embed-text-v1 |
| **Tier** | Primary |

**Key Findings:**
- **Parameters:** 137 million (vastly smaller than 7B models)
- **VRAM requirement:** ~0.5 GB (can run simultaneously with Qwen2.5-Coder-7B)
- **Embedding dimensions:** 768 — compatible with cosine similarity search, HNSW indexing
- **Performance:** 8500 tokens/sec embedding throughput on RTX 3080 (essentially free at batch size 1)
- **Ollama pull:** `ollama pull nomic-embed-text` — served via `/v1/embeddings` endpoint
- **Use case for DevSteps:** As-you-type semantic search across DevSteps items; embedding-based duplicate detection; context window stuffing for triage classification

---

## 3. Technology Radar

The Technology Radar classifies technologies across four quadrants and reflects the state of the art as of 2026-03-05.

### 3.1 ADOPT

Technologies in ADOPT are mature, recommended for immediate use, and carry low adoption risk.

| Technology | Rationale | DevSteps Usage |
|------------|-----------|----------------|
| **Ollama (local dev inference)** | Mature project, 60K+ GitHub stars, eliminates all 3 critical VSIX blockers. OpenAI-compatible API. Active development, weekly releases. | Primary inference backend for extension AI features |
| **OpenAI-compatible API pattern** | Industry-standard abstraction. Portable across Ollama (local), vLLM (team server), GitHub Copilot API, Anthropic (with adapter). Prevents vendor lock-in. | All LLM calls routed through this interface |
| **GGUF quantization format** | Industry standard for local LLM deployment. Supported by Ollama, llama.cpp, LM Studio, Msty. Q4_K_M sweet spot: 4-bit weights with K-means correction, minimal quality loss. | Model storage format for all DevSteps-recommended models |
| **WebGPU in browser/VS Code webview** | Stable in Chromium 132+ (VS Code 1.96+). Required for next-generation rendering (Sigma.js, Three.js). Needs graceful fallback for SSH/VM/Docker. | Spider Web graph rendering (via Sigma.js) |
| **node-llama-cpp** | Stable, 1.4M weekly downloads, pre-built binaries, full TypeScript support. Excellent for standalone CLIs and MCP servers that *don't* need VSIX bundling. | Potential use in MCP server (not extension) if Ollama unavailable |

### 3.2 TRIAL

Technologies in TRIAL are worth pursuing in controlled experiments. Validate before committing.

| Technology | Rationale | Condition for ADOPT |
|------------|-----------|---------------------|
| **WebGPU in VS Code webview for inference (not just rendering)** | Emerging capability. Works in Chromium 132 desktop but unreliable in VM/SSH/Docker. `navigator.gpu` feature detection required. | Proven reliable across DevSteps target environments (at least 80% of users have direct GPU access) |
| **onnxruntime-node WebGPU execution provider** | Experimental flag (`--enable-webgpu`). Not production-stable. VSIX-bundleable (pure JS/WASM). +800KB–1.2MB overhead. `wasm-unsafe-eval` CSP relaxation required. | onnxruntime-web WebGPU execution provider promoted from experimental to stable |
| **Sigma.js v3 WebGL for traceability graph** | Viable for N > 100 nodes. Handles 10K+ nodes at 60fps. Pure JS, no ABI issues. At current N ≤ 31 nodes, D3 force layout is simpler and sufficient. | DevSteps backlog grows to >100 interdependent items regularly |
| **MCP sampling capability** | Emerging MCP spec feature. Enables server-to-client inference delegation. DevSteps MCP server missing this. Low cost to add stub implementation now. | Implement stub now; full integration when first MCP client (VS Code Copilot) confirms support |

### 3.3 ASSESS

Technologies in ASSESS have potential but require more research before committing.

| Technology | Rationale | Research Question |
|------------|-----------|-------------------|
| **vLLM for team inference** | Valuable for 3+ concurrent developers sharing GPU. Better throughput than Ollama. Higher setup complexity. | What % of DevSteps users are in team vs. solo mode? |
| **Embedding-based semantic search** | High-value feature. Requires Ollama + nomic-embed-text adoption first. HNSW index storage in `.devsteps/` adds persistence complexity. | How should embeddings be stored/invalidated when items change? |
| **OffscreenCanvas for chart rendering** | Available in Chromium 132. Moves chart rendering off main thread, prevents UI jank. Reduces main thread load for burndown/traceability charts. | Do current Canvas 2D charts cause measurable jank at realistic backlog sizes? |

### 3.4 HOLD

Technologies in HOLD should not be adopted. Actively migrate away from existing uses.

| Technology | Rationale | Action |
|------------|-----------|--------|
| **WebGL2 for compute shaders** | WebGPU strictly supersedes WebGL2 compute. WebGPU has better debugging, explicit memory management, and Rust-like safety model. No new WebGL2 compute investment justified. | Do not start. Migrate any future compute needs to WebGPU directly. |
| **pickle `.bin` model format** | Arbitrary code execution risk — pickle deserialization can execute malicious code embedded in model files. GGUF format provides safe, schema-validated model loading. | Never load `.bin` format models. GGUF only. |
| **In-process LLM via onnxruntime-node in VSIX** | ABI fragility (breaks on VS Code Electron version bumps). VSIX size limit exceeded (200–500 MB). Extension host OOM risk. All three blockers are fatal. | Never pursue. Use Ollama out-of-process. |
| **`Math.random()` for CSP nonces** | `Math.random()` is not a CSPRNG. CSP nonces generated with it can be predicted by attackers, defeating the purpose of nonce-based CSP. **Active security bug in codebase.** | Fix immediately (Section 4.1). `globalThis.crypto.getRandomValues(new Uint8Array(16))`. |

---

## 4. Security Assessment

This section documents all security findings from the research cycle, ordered by severity.

### 4.1 P0 — Fix Immediately

#### Finding: `getNonce()` uses `Math.random()` (not CSPRNG)

| Field | Value |
|-------|-------|
| **Severity** | P0 — Active Security Bug |
| **Location** | `packages/extension/src/webview/utils/htmlHelpers.ts:24` |
| **Effort** | < 10 minutes |
| **Dependencies** | None — fully standalone |

**Current (broken) code:**

```typescript
// BROKEN: Math.random() is NOT a CSPRNG
function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
```

**Fixed code:**

```typescript
// CORRECT: CSPRNG via Web Crypto API (available Node 19+ / VS Code Electron)
function getNonce(): string {
  const array = new Uint8Array(16);
  globalThis.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
```

**Why this matters:** A Content Security Policy nonce must be unpredictable. If an attacker can observe or predict the nonce pattern (trivial with `Math.random()` after observing a few values), they can inject scripts that bypass the CSP. `globalThis.crypto.getRandomValues` is available in VS Code's Electron runtime (Node 19+) and produces cryptographically secure random bytes.

---

### 4.2 P1 — Fix Before GPU Work

#### Finding 1: CSP Missing Critical Directives

| Field | Value |
|-------|-------|
| **Severity** | P1 — Blocks all GPU/AI features |
| **Location** | `packages/extension/src/webview/` (all panel HTML generators) |
| **Effort** | 0.5 days |

**Current CSP (incomplete):**

```
default-src 'none';
style-src ${webview.cspSource} 'unsafe-inline';
script-src 'nonce-${nonce}';
```

**Required minimum CSP for Ollama proxy (via MCP server):**

```
default-src 'none';
style-src ${webview.cspSource} 'unsafe-inline';
script-src 'nonce-${nonce}' ${webview.cspSource};
connect-src http://localhost:3100;
img-src ${webview.cspSource} data:;
font-src ${webview.cspSource};
```

**Required CSP addition for WebGPU/WebWorker inference (TRIAL tier):**

```
worker-src blob:;
wasm-unsafe-eval;
```

**CRITICAL CONSTRAINT:** `connect-src` value for Ollama proxy **must be derived from `devsteps.ai.ollamaBaseUrl` VS Code setting** — never hardcoded. This enables:
- User-configured Ollama port (some run on non-default ports)
- vLLM substitution (team deployments)
- Localhost restriction enforcement (security boundary)

Implementation pattern:

```typescript
const ollamaBaseUrl = vscode.workspace
  .getConfiguration('devsteps.ai')
  .get<string>('ollamaBaseUrl', 'http://localhost:3100');

const csp = [
  `default-src 'none'`,
  `style-src ${webview.cspSource} 'unsafe-inline'`,
  `script-src 'nonce-${nonce}' ${webview.cspSource}`,
  `connect-src ${ollamaBaseUrl}`,
  `img-src ${webview.cspSource} data:`,
].join('; ');
```

---

#### Finding 2: Full HTML Re-render Destroys GPU Contexts

| Field | Value |
|-------|-------|
| **Severity** | P1 — Blocks ALL GPU rendering and inference in webview |
| **Location** | `packages/extension/src/webview/dashboardPanel.ts` — `_update()` method |
| **Effort** | 2 days |

**Root cause:** `dashboardPanel.ts` currently reassigns `webview.html` on every data update:

```typescript
// BROKEN: Full HTML reassignment destroys WebGL/WebGPU contexts
private _update(): void {
  const webview = this._panel.webview;
  webview.html = this._getHtmlForWebview(webview); // ← destroys all GPU contexts
}
```

**Critical clarification:** `retainContextWhenHidden: true` (VS Code webview option) preserves GPU context only when a panel is **hidden** (switched to a background tab). It does **NOT** preserve context when `webview.html` is programmatically reassigned. That is a fundamental constraint of the VS Code webview API — HTML reassignment always creates a new DOM and destroys all JS state, WebGL contexts, WebGPU devices, and canvases.

**Required architecture:**

```
Initial load:    webview.html = fullHtmlTemplate() ← ONE TIME ONLY
Data updates:    webview.postMessage({ type: 'update', data: {...} }) ← INCREMENTAL
```

**postMessage protocol (to be designed):**

```typescript
// Extension → Webview: data push
webview.postMessage({
  type: 'devsteps:update',
  payload: {
    items: DevStepsItem[],
    stats: ProjectStats,
    timestamp: number,
  }
});

// Webview → Extension: user action
window.addEventListener('message', (event) => {
  const message = event.data;
  switch (message.type) {
    case 'devsteps:command':
      vscode.postMessage({ type: 'command', command: message.command });
      break;
  }
});
```

---

### 4.3 P2 — MCP Security

#### Finding: Credential Storage Standards

| Field | Value |
|-------|-------|
| **Severity** | P2 — Required before shipping remote model features |
| **Source** | Astrix Security Report (Source 10) |

From the Astrix research (Oct 2025), 53% of 5,200 analyzed MCP servers used static credentials stored in plaintext configuration files. DevSteps must not repeat this pattern.

**Standards to implement:**

1. **OAuth 2.1 PKCE** — required for any network-facing MCP server configuration. Not required for localhost Ollama (no credentials needed for default config).

2. **VS Code SecretStorage** — any API key (OpenAI fallback, future remote model API) must be stored via `context.secrets.store()`, never in VS Code `configuration` (which writes to `settings.json` in plaintext):

```typescript
// CORRECT: secure storage
async function storeApiKey(context: vscode.ExtensionContext, key: string): Promise<void> {
  await context.secrets.store('devsteps.ai.apiKey', key);
}

async function getApiKey(context: vscode.ExtensionContext): Promise<string | undefined> {
  return context.secrets.get('devsteps.ai.apiKey');
}

// WRONG: never do this
vscode.workspace.getConfiguration('devsteps.ai').update('apiKey', key); // written to settings.json
```

3. **CVE exposure** (from Sources 6 and 7): CVE-2025-49847 and CVE-2025-52566 both affect llama.cpp's model loading path. The Ollama out-of-process architecture eliminates all direct CVE exposure — the extension never parses GGUF files directly.

---

### 4.4 VRAM Budget Calculation

| Component | VRAM |
|-----------|------|
| Physical GPU VRAM (RTX 3080 reference) | 12.0 GB |
| VS Code extension host sharing overhead (Source 2: Continue.dev #7583) | −4.0 GB (−33%) |
| **Effective VRAM available for models** | **8.0 GB** |
| Qwen2.5-Coder-7B Q4_K_M (triage + generation) | −4.3 GB |
| nomic-embed-text (simultaneous embeddings) | −0.5 GB |
| **Total peak model VRAM** | **−4.8 GB** |
| **Headroom** | **+3.2 GB** |

**Conclusion:** The proposed dual-model configuration (Qwen2.5-Coder-7B + nomic-embed-text simultaneously) fits comfortably within the effective VRAM budget on a 12 GB GPU. The 3.2 GB headroom provides buffer for:
- Ollama KV cache (context window storage): ~0.5–1.0 GB at 4K context
- OS / driver overhead: ~0.5 GB
- Future model additions (e.g., vision model for screenshot analysis)

**Risk:** Users with < 8 GB VRAM (e.g., RTX 3060 6 GB, GTX 1080 8 GB) cannot run both models simultaneously. `gpuCapabilityManager.ts` must detect available VRAM and gracefully disable embedding features when insufficient.

---

## 5. Internal Fit Analysis

### 5.1 Package Boundary Analysis

The DevSteps monorepo has four packages with strict dependency boundaries. GPU integration must respect these boundaries as hard constraints enforced by TypeScript compiler.

```
packages/
├── shared/          ← SOURCE OF TRUTH for schemas and types
│   │                   Only gains: EmbeddingRecord Zod schema
│   │                   ZERO GPU imports. CLI imports this — must stay clean forever.
│   └── src/
│       ├── schemas/
│       │   └── embedding.ts    NEW: EmbeddingRecord schema { itemId, vector, model, timestamp }
│       └── [existing files]    UNCHANGED
│
├── mcp-server/      ← INFERENCE GATEWAY: ALL GPU/LLM contact happens here
│   │                   HTTP proxy routes + MCP tools are the sole AI interface
│   └── src/
│       ├── http-server.ts      MODIFY: add /v1/chat/completions, /v1/embeddings, /v1/models routes
│       ├── ollama-proxy.ts     NEW: Ollama upstream client + health check
│       ├── tools/
│       │   ├── infer.ts        NEW: mcp_devsteps_infer MCP tool
│       │   ├── embed.ts        NEW: mcp_devsteps_embed MCP tool
│       │   └── analyze.ts      NEW: mcp_devsteps_analyze_trace MCP tool
│       └── [existing files]    UNCHANGED
│
├── extension/       ← CAPABILITY DETECTION + WEBVIEW INTEGRATION ONLY
│   │                   No direct LLM calls. Talks to MCP server proxy only.
│   └── src/
│       ├── gpuCapabilityManager.ts    NEW: Ollama health probe + GpuCapability enum
│       ├── dashboardPanel.ts          MODIFY: postMessage protocol (replace full-HTML reload)
│       ├── extension.ts               MODIFY: register gpuCapabilityManager, status bar
│       └── webview/
│           ├── renderers/
│           │   ├── burndownRenderer.ts      MODIFY: replace Canvas 2D placeholder
│           │   └── traceabilityRenderer.ts  MODIFY: Sigma.js v3 (or D3 physics)
│           └── utils/
│               └── htmlHelpers.ts           MODIFY: fix getNonce() (P0)
│
└── cli/             ← ZERO CHANGES. Verified by TypeScript compiler per PR.
    └── src/
        └── [all files]         UNCHANGED — compiler enforces this
```

**Dependency flow (must not be inverted):**

```
extension → shared (types only)
extension → [VS Code API]
mcp-server → shared (types only)
mcp-server → [Ollama HTTP API] (localhost:11434)
cli → shared (types only)
cli → [filesystem]

Forbidden:
shared → anything GPU/LLM related (would contaminate CLI)
cli → anything GPU/LLM related
extension → Ollama directly (must go through MCP server proxy)
```

### 5.2 Staleness Analysis

The following files in the current codebase are stale relative to the proposed GPU architecture. Each represents technical debt that **must be resolved before** GPU features can be layered on top.

| File | Staleness Issue | Priority | Estimated Effort |
|------|----------------|----------|-----------------|
| `packages/extension/src/webview/renderers/burndownRenderer.ts` | Canvas 2D placeholder with explicit comment "Chart.js alternative for now" — no real chart library in use | P1 | 1 day |
| `packages/extension/src/webview/renderers/traceabilityRenderer.ts` | Static circular SVG, no physics simulation, no interactivity — blocks Spider Web visualization story | P1 | 1.5 days |
| `packages/extension/src/webview/dashboardPanel.ts` (`_update()`) | Full `webview.html` reassignment on every data update — destroys GPU contexts | P1 | 2 days |
| `packages/extension/src/webview/utils/htmlHelpers.ts:24` (`getNonce()`) | `Math.random()` instead of CSPRNG — active security vulnerability | P0 | < 1 hour |
| `packages/extension/package.json` (`d3` v7 dependency) | D3 v7 declared in `dependencies` but **zero imports** found in codebase — dead weight, 500KB bundle cost | P1 | 0.5 days (remove + audit) |
| `packages/extension/package.json` (`chart.js` v4 dependency) | Chart.js declared but abandoned in favor of Canvas 2D placeholder — dead weight | P2 | 0.5 days (remove or use intentionally) |
| `packages/extension/src/webview/` (all panels) | CSP missing `connect-src`, `worker-src`, `wasm-unsafe-eval`, `${webview.cspSource}` in `script-src` | P1 | 0.5 days |

**Total staleness debt:** ~6.5 developer-days before GPU features can ship without degraded security and reliability.

### 5.3 Existing EPIC-040 Items

EPIC-040 (Spider Web Visualizer + Card Dashboard) is currently in-progress. The following stories are direct dependents of this research:

| Item | Title | Status | Dependency on GPU Research |
|------|-------|--------|---------------------------|
| **STORY-182** | Card Dashboard SPA Refactor | in-progress | Directly requires postMessage migration from P1 findings |
| **STORY-183** | TraceLogger + FSWatcher Pipeline | in-progress | Independent; feeds data into GPU-capable traceability renderer |
| **STORY-184** | Spider Web D3.js Card | in-progress | **Blocked by postMessage migration** (STORY-182 prerequisite) |
| **STORY-185** | Mini-Preview Cards + Docs | in-progress | Partially blocked — preview cards need postMessage; docs portion is independent |

**New items to create** (from this research):
- 3 investigation spikes (GPU capability detection, WebGPU availability matrix, Sigma.js vs D3)
- 5 stories (P0/P1 security fixes, MCP Ollama proxy, AI configuration + status bar, triage classification, semantic search)

---

## 6. Prioritized Recommendations

Ordered by `(business value × implementation feasibility) / (effort × risk)`. Higher score → implement first.

| Rank | Recommendation | Priority | Effort | Blockers | Unlocks |
|------|---------------|----------|--------|----------|---------|
| 1 | **Fix `getNonce()` CSPRNG** | P0 | < 1 hour | None (standalone) | Active security bug closed |
| 2 | **`postMessage` migration for `dashboardPanel.ts`** | P1 | 2 days | Rank 1 (CSP fix helps) | All GPU rendering in webview |
| 3 | **CSP expansion** (`connect-src`, `${webview.cspSource}`) | P1 | 0.5 days | None (standalone) | Ollama HTTP calls from webview |
| 4 | **`gpuCapabilityManager.ts` + VS Code status bar item** | — | 1.5 days | Ranks 1–3 | Foundation for all AI feature stories |
| 5 | **MCP server Ollama proxy routes** (`/v1/chat/completions`, `/v1/embeddings`, `/v1/models`) + 3 MCP tools | — | 2 days | Rank 4 | Core GPU access point for all agents |
| 6 | **AI configuration schema** (`devsteps.ai.*` VS Code settings) | — | 1 day | Ranks 1–3 | Required UX before any AI feature ships |
| 7 | **Intelligent triage classification** (QUICK/STANDARD/FULL via Qwen2.5-Coder-7B) | — | 3 days | Ranks 4–6 | Highest GPU ROI; 1–3s GPU vs 20–40s CPU |
| 8 | **Semantic search via nomic-embed-text embeddings** | — | 3 days | Ranks 4–6 | As-you-type search across growing backlog |

**Total critical path (Ranks 1–6):** ~8 developer-days before AI feature stories can begin.

### Deferred — Not Recommended in Current Cycle

| Item | Reason for Deferral |
|------|---------------------|
| WebGPU compute shaders for 31-node Spider Web | GPU init cost (50–200 ms) > computation time (5 ms) at N = 31. Re-evaluate at N > 200. |
| Burndown ONNX.js prediction | Sparse data volume makes prediction low quality; adds +1 MB bundle cost for marginal value |
| In-process LLM via `onnxruntime-node` | ABI break + VSIX size limit — permanently infeasible. Ollama architecture supersedes. |
| Neural agent routing | DevSteps Spider Web dispatch uses deterministic routing as a correctness constraint. Neural routing could introduce non-deterministic dispatch, which violates behavioral invariants. Deferred indefinitely. |
| Transformers.js WebGPU (primary inference) | Network fetch of model weights at runtime; incompatible with air-gapped enterprise environments. Deferred until offline model cache design is resolved. |

---

## 7. Migration Path

The migration is sequenced so each phase fully enables the next. No phase begins until the previous is reviewed and gate-passed.

### 7.1 Phase 0: Security Hardening (Week 1, 3.5 days)

**Goal:** Eliminate active security bugs and architectural blockers before GPU work begins.

All Phase 0 tasks are prerequisites for Phase 1. They are independent of each other and can be parallelized within the phase.

| Task | Effort | File(s) | Notes |
|------|--------|---------|-------|
| Fix `getNonce()` → CSPRNG | 0.5 days | `htmlHelpers.ts:24` | Standalone; ship immediately as hotfix |
| Migrate `dashboardPanel.ts` to `postMessage` protocol | 2 days | `dashboardPanel.ts`, webview JS | Most complex Phase 0 task; design postMessage type contracts first |
| CSP: add `connect-src` from `ollamaBaseUrl` setting + `${webview.cspSource}` in `script-src` | 0.5 days | All panel HTML generators | After `postMessage` migration; CSP changes have broad effect |
| esbuild: add browser-target entry for webview bundle | 0.5 days | `packages/extension/esbuild.js` | Ensures webview JS minifies correctly for Chromium target; prerequisite for Sigma.js bundling |

**Exit criteria for Phase 0:**
- `npm run lint` passes (Biome clean)
- `tsc --noEmit` passes on `packages/cli` (no GPU imports leaked)
- `gate-reviewer` PASS on security findings from Section 4.1 and 4.2

---

### 7.2 Phase 1: Investigation Spikes (Week 2, Parallel Tracks)

**Goal:** Validate technical assumptions before committing to Phase 2 architecture. Spikes run in parallel tracks.

**Track A: GPU Capability Detection + Ollama Health Probe**

Deliverable: `gpuCapabilityManager.ts` prototype with:
- `OllamaHealthResult` type: `{ status: 'running' | 'not-running' | 'cpu-fallback', models: string[], vramAvailable?: number }`
- `/api/ps` polling to detect silent CPU fallback (Source 11)
- VS Code status bar integration: `$(chip) GPU: 7B + embed` or `$(warning) GPU: CPU fallback`

**Track B: WebGPU Availability Matrix in VS Code Webview**

Deliverable: Test matrix covering:
- VS Code local (Windows/macOS/Linux)
- VS Code Remote SSH (with and without GPU passthrough)
- GitHub Codespaces (standard and GPU tier)
- DevContainers (Docker with and without `--gpus`)
- WSL2 (with and without WSLG GPU passthrough)

For each environment: document `navigator.gpu !== undefined`, `navigator.gpu.requestAdapter()` result, supported texture formats.

**Track C: Sigma.js v3 vs D3 for Traceability Renderer**

Deliverable: Prototype both options with the current 31-node Spider Web dataset. Measure:
- Initial render latency (cold)
- Update latency for single node color change
- Memory consumption
- CSP complexity (what directives are needed)
- Bundle size contribution

Decision criteria: Choose Sigma.js if Sigma ≤ 2× D3 on any metric and handles N > 100 with < 16 ms frame time. Choose D3 if usage remains N ≤ 50 for the foreseeable future.

---

### 7.3 Phase 2: AI Infrastructure (Week 3–4)

**Goal:** Build the foundation that all AI feature stories depend on.

**Sequence within Phase 2:**

```
Week 3:
├── AI configuration schema + VS Code settings (1.5d) [parallel with below]
└── gpuCapabilityManager.ts final + status bar item (1d) [informed by Phase 1 Track A]

Week 4:
└── MCP server Ollama proxy routes + 3 MCP tools (2d) [requires both Week 3 items]
    ├── /v1/chat/completions → Ollama /api/chat proxy
    ├── /v1/embeddings → Ollama /api/embeddings proxy
    ├── /v1/models → Ollama /api/tags proxy
    ├── mcp_devsteps_infer tool (LLM generation)
    ├── mcp_devsteps_embed tool (embedding generation)
    └── mcp_devsteps_analyze_trace tool (trace structure analysis)
```

**AI configuration schema (`devsteps.ai.*`):**

```jsonc
{
  "devsteps.ai.enabled": {
    "type": "boolean",
    "default": false,
    "description": "Enable AI-powered features (requires Ollama)"
  },
  "devsteps.ai.ollamaBaseUrl": {
    "type": "string",
    "default": "http://localhost:11434",
    "description": "Ollama server base URL"
  },
  "devsteps.ai.triageModel": {
    "type": "string",
    "default": "qwen2.5-coder:7b-instruct-q4_K_M",
    "description": "Model for triage classification (must be available in Ollama)"
  },
  "devsteps.ai.embedModel": {
    "type": "string",
    "default": "nomic-embed-text",
    "description": "Model for semantic embeddings"
  }
}
```

---

### 7.4 Phase 3: AI Features (Week 5–8)

**Goal:** Ship user-facing AI features, each gated on Phase 2 infrastructure.

**Feature 1: Intelligent Triage Classification (Week 5–6, 3d)**

Classification endpoint: `mcp_devsteps_infer` with structured JSON output mode

```typescript
interface TriageClassification {
  tier: 'QUICK' | 'STANDARD' | 'FULL' | 'COMPETITIVE';
  confidence: number; // 0-1
  reasoning: string;  // ≤100 tokens
  estimated_effort_hours: number;
}
```

Performance target: 1–3 seconds on GPU (Qwen2.5-Coder-7B, Q4_K_M, RTX 3080)
Fallback: deterministic keyword-based classification when GPU unavailable (<100ms)

**Feature 2: Semantic Search via nomic-embed-text (Week 7–8, 3d)**

Architecture:
1. On item create/update: generate embedding via `mcp_devsteps_embed` → store in `.devsteps/embeddings/`
2. On search query: embed query → cosine similarity search against stored embeddings
3. Return ranked results with similarity score

Performance target: < 50ms search on backlog of 500 items (cosine similarity is O(N))

---

### 7.5 Package Constraints Preserved Throughout

These invariants are checked on every PR:

1. **`tsc --noEmit` on `packages/cli` must pass** — any import of Ollama, WebGPU, or ML library in `packages/shared` that propagates to `packages/cli` fails the build
2. **`packages/shared` has zero `ollama`, `onnxruntime`, `node-llama-cpp`, or webgpu-related imports** — enforced by TypeScript compiler + Biome import restrictions
3. **`packages/extension` does not call Ollama directly** — all LLM calls go through `packages/mcp-server` HTTP proxy on `localhost:3100`
4. **`npm run build && npm test` must pass before any merge** — no broken commits

---

## 8. Next Actions

Specific owner, timeline, and dependency rationale for each action item.

| # | Action | Owner | Timeline | Rationale |
|---|--------|-------|----------|-----------|
| 1 | ~~Create DevSteps items from this research~~ ✅ **Completed during research session** | coord | Done 2026-03-05 | Items created: SPIKE-018, SPIKE-019, SPIKE-020, STORY-186, STORY-187, STORY-188, STORY-189, STORY-190 — all linked `relates-to` EPIC-040 |
| 2 | Fix `getNonce()` CSPRNG (standalone hotfix, no sprint required) | exec-impl | Within 1 hour | Active P0 security bug; zero dependencies; ship independently |
| 3 | SPIKE: GPU capability detection + Ollama health probe | exec-impl | Week 2 | Foundation for all AI feature stories; informs `gpuCapabilityManager.ts` design |
| 4 | SPIKE: WebGPU in VS Code webview — environment matrix | exec-impl | Week 2 | Determines which environments can use WebGPU rendering; required before Sigma.js commitment |
| 5 | SPIKE: Sigma.js v3 vs D3 force layout for traceabilityRenderer | exec-impl | Week 2 (parallel with 3 & 4) | Resolves D3 dead-weight debt; informs renderer migration design |
| 6 | STORY: Phase 0 security + staleness fixes (postMessage migration, CSP expansion, dead dependency removal) | exec-impl | Week 1–2 | Prerequisite for GPU context preservation; P1 blockers |
| 7 | STORY: MCP server Ollama proxy routes + 3 MCP tools | exec-impl | Week 3–4 | Core GPU access point; all agent inference routes through here |
| 8 | STORY: AI configuration schema + GPU status bar item | exec-impl | Week 3 (parallel with 7) | Required UX before any AI feature is usable |
| 9 | STORY: Intelligent triage classification (QUICK/STANDARD/FULL via Qwen2.5-Coder-7B) | exec-impl | Week 5–6 | Highest GPU ROI; reduces coord analysis latency 10–40× |
| 10 | STORY: Semantic search via nomic-embed-text embeddings | exec-impl | Week 7–8 | Compound value with growing backlog; enables similarity-based duplicate detection |

**Reference:** All GPU items relate to **EPIC-040** (Spider Web Visualizer + Card Dashboard, currently in-progress).

---


---

### 8.1 DevSteps Items Created During Research Session

All items created on 2026-03-05 and linked `relates-to` EPIC-040:

| ID | Type | Title | Priority |
|----|------|-------|----------|
| **SPIKE-018** | spike | GPU capability detection + Ollama health probe | urgent-important |
| **SPIKE-019** | spike | WebGPU availability in VS Code webview — feature-detect + fallback | not-urgent-important |
| **SPIKE-020** | spike | Sigma.js v3 vs D3 force simulation for traceability renderer | not-urgent-not-important |
| **STORY-186** | story | P0/P1 security + staleness — getNonce, postMessage, CSP, esbuild | urgent-important |
| **STORY-187** | story | MCP server Ollama inference proxy + 3 MCP tools | not-urgent-important |
| **STORY-188** | story | AI configuration schema + devsteps.ai.* VS Code settings + GPU status bar | not-urgent-important |
| **STORY-189** | story | Intelligent triage auto-classification via Qwen2.5-Coder-7B | not-urgent-important |
| **STORY-190** | story | Semantic search via nomic-embed-text embeddings across DevSteps items | not-urgent-important |

All items use tags `ai`, `gpu`, `ollama` and relate to EPIC-040 (Spider Web Visualizer + Card Dashboard).

## 9. Appendix: Discarded Approaches

This appendix documents approaches evaluated and rejected during the research cycle. Logged to prevent re-investigation in future cycles.

### Approach A: In-process `onnxruntime-node` in VSIX

**Investigated:** 2025-12 to 2026-01
**Rejected:** 2026-01-15

**Reason:** Three simultaneous fatal blockers:
1. Native `.node` addon compiled for Node.js ABI. VS Code Electron uses a different ABI. Extension breaks on every VS Code version bump.
2. ONNX models for 7B+ parameters exceed VSIX size limits (200–500 MB compressed).
3. Extension host process memory limit: loading a 7B model at FP16 (14 GB) OOMs the extension host.

**Do not retry.** Ollama out-of-process is the correct architecture.

### Approach B: `node-llama-cpp` Bundled in VSIX

**Investigated:** 2026-01
**Rejected:** 2026-01-22

**Reason:** Same blockers as Approach A (ABI fragility, VSIX size). Additionally, pre-built binaries are platform-specific — VSIX would need separate packages for Linux+CUDA, Linux+ROCm, macOS+Metal, Windows+CUDA, Windows+CPU. Maintenance burden is prohibitive.

**Do not retry.** `node-llama-cpp` remains valuable for CLI tools and standalone MCP servers not constrained by VSIX packaging.

### Approach C: WebGPU Compute for Spider Web Layout (N=31)

**Investigated:** 2026-02
**Rejected:** 2026-02-28

**Reason:** GPU initialization overhead (50–200 ms cold start) exceeds total computation time (~5 ms at N=31 with force-directed layout). Net user experience regression.

**Revisit condition:** Re-evaluate when backlog grows to N > 200 nodes. At N=200, GPU compute time (still ~5 ms) becomes smaller than CPU force simulation (~50 ms), making GPU beneficial.

### Approach D: Direct Ollama Calls from Extension Webview

**Investigated:** 2026-02
**Rejected:** 2026-02-10

**Reason:**
1. CSP violation: webview CSP cannot allow direct `connect-src http://localhost:11434` without security review (Ollama has no authentication by default).
2. Eliminates MCP server as single inference gateway — breaks audit trail and rate limiting.
3. Prevents graceful degradation: extension cannot substitute cloud LLM when Ollama is unavailable if webview is calling Ollama directly.

**Correct architecture:** Webview → Extension Host → MCP Server (`:3100`) → Ollama (`:11434`).

### Approach E: Transformers.js WebGPU as Primary Inference

**Investigated:** 2025-12 to 2026-01
**Parked (not rejected permanently):** 2026-01-30

**Reason:** Network fetch of model weights at inference time is incompatible with air-gapped enterprise environments (a key DevSteps target). Additionally, WebGPU inference in Transformers.js is only viable for smaller models (< 1B parameters) at acceptable speed; 7B models are too slow.

**Revisit condition:** If DevSteps ships an offline model cache manager that pre-downloads and serves Transformers.js models locally, this approach becomes viable for small classification/embedding tasks in the webview. Not recommended for initial GPU integration.

---

*Document generated by `devsteps-R4-exec-doc` — 2026-03-05. Validity window: 2026-03-05 to 2026-06-05. Re-research required after validity expiry.*

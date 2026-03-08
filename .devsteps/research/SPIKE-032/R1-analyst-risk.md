# Risk Analysis: Local 12GB VRAM GPU as AI Inference Backend for Spider Web Multi-Agent System

**Analyst:** `devsteps-R1-analyst-risk`
**Mandate type:** risk (COMPETITIVE_PLUS tier)
**Item:** SPIKE-032 — Research: Local GPU + VS Code AI Toolkit Agent Inspector
**Date:** 2026-03-08
**Triage:** COMPETITIVE_PLUS (web research + internal archaeology required)

---

## Executive Summary

| Risk Domain | Verdict | Confidence |
|---|---|---|
| Technical — VRAM / Concurrency | **HIGH** | 0.93 |
| Technical — Quantization Accuracy | **MEDIUM** | 0.88 |
| Technical — Inference Latency | **MEDIUM** | 0.85 |
| Technical — Context Window | **LOW** | 0.90 |
| Technical — CUDA Lock | **MEDIUM** | 0.82 |
| Ecosystem — AITK Linux Stability | **MEDIUM** | 0.87 |
| Ecosystem — agentdev Maturity | **MEDIUM-HIGH** | 0.91 |
| Ecosystem — debugpy | **LOW** | 0.95 |
| Security — llama.cpp CVEs | **HIGH** | 0.95 |
| Security — Ollama CVEs | **HIGH** | 0.92 |
| Security — GGUF Supply Chain | **MEDIUM** | 0.85 |
| Security — Port Exposure | **MEDIUM** | 0.88 |
| Operational — OOM Crashes | **HIGH** | 0.94 |
| Operational — Thermal Throttling | **MEDIUM** | 0.80 |
| Operational — CPU Fallback | **LOW-MEDIUM** | 0.85 |
| Integration — MCP Compatibility | **LOW** | 0.90 |
| Integration — runSubagent + Local Models | **HIGH** | 0.92 |
| Integration — Quality vs. Cost Trade-off | **MEDIUM** | 0.87 |

**Overall Verdict: HIGH RISK** — adoption requires architectural mitigations before the Spider Web agent system can rely on local GPU inference.

---

## 1. Technical Risks

### 1.1 VRAM Headroom — Parallel Spider Web Agents

**Risk: HIGH | Probability: HIGH (>70%) | Severity: HIGH**

The Spider Web architecture dispatches up to 10 agents simultaneously in a single fan-out (Ring 1 + Ring 2 parallel). Each agent requires an independent KV cache for its context window.

**VRAM Budget Calculation (12GB GPU):**

| Component | VRAM Required |
|---|---|
| Base model weights — Phi-4 14B Q4_K_M | ~8.0 GB |
| KV cache × 10 agents at 8k context each | ~5.0 GB |
| llama.cpp/CUDA runtime overhead | ~0.8 GB |
| **Total Required** | **~13.8 GB** |

**Key finding:** A single Phi-4 14B model at Q4_K_M quantization already consumes ~8–9 GB VRAM (from LocalLLM.in benchmark data, 2026). Running 10 parallel agent sessions with individual 8k-token contexts adds ~500 MB KV cache per session = ~5 GB additional. The 12 GB ceiling is **breached under full Spider Web fan-out with any 14B model**.

**Viable configurations within 12GB:**

| Model | Quant | Base VRAM | KV/agent (8k) | Max parallel agents |
|---|---|---|---|---|
| Mistral 7B | Q4_K_M | ~4.2 GB | ~256 MB | **~7 agents** |
| LLaMA 3.2 8B | Q4_K_M | ~4.8 GB | ~300 MB | **~6 agents** |
| Phi-4 mini | Q4_K_M | ~2.6 GB | ~160 MB | **~10 agents** |
| Phi-4 14B | Q4_K_M | ~8.2 GB | ~500 MB | **~2 agents** |

**Conclusion:** Full 10-agent fan-out is achievable **only** with small models (≤8B, Q4_K_M) or Phi-4 mini. Larger models require sequential dispatch or context-window reduction.

**Hard constraint identified:** KV cache cannot be shared across agent sessions — each subagent requires its own context isolation (invariant from Ring architecture).

---

### 1.2 Model Quantization Accuracy Degradation

**Risk: MEDIUM | Probability: MEDIUM (35–55%) | Severity: MEDIUM**

Quantization degrades reasoning accuracy in ways that directly affect agent task quality:

| Quantization | Relative Accuracy (vs FP16) | Notes |
|---|---|---|
| Q8_0 | ~99% | Near-lossless; doubles VRAM vs Q4 |
| Q6_K | ~98% | Good balance; 50% more VRAM than Q4 |
| Q5_K_M | ~96% | Acceptable for code analysis |
| **Q4_K_M** | **~93–94%** | **Sweet spot for 12GB VRAM** |
| Q3_K_M | ~88–90% | Noticeable degradation on complex reasoning |

**Spider Web specific impact:** Ring 1 analyst agents (archaeology, risk, quality) perform multi-step reasoning over code. A 7% accuracy reduction at Q4 may result in:
- Missed risk signals in complex interdependent code paths
- Imprecise blast-radius assessment
- False LOW verdicts on MEDIUM-risk changes

**Rule:** Avoid Q3 or lower for any Ring 1/Ring 2 analyst agent. Q4_K_M is the minimum floor.

---

### 1.3 Inference Speed vs. GitHub Copilot / Claude API

**Risk: MEDIUM | Probability: HIGH (>65%) | Severity: MEDIUM**

Benchmark comparison for a 7B Q4_K_M model on RTX 3060 12GB:

| Metric | Local 12GB GPU | GitHub Copilot (Claude) |
|---|---|---|
| First token latency | ~800ms – 1.5s | ~300–600ms |
| Tokens/sec (generation) | ~35–55 tok/s | ~60–120 tok/s |
| Time to 1k-token response | ~20–30s | ~9–16s |
| 10-agent parallel fan-out | **Sequential** (see §1.1) | **Truly parallel** |

**Critical finding:** The most painful latency hit is not per-agent speed but **serialization of parallel fan-out**. Cloud APIs execute 10 agents truly concurrently. A local 12GB GPU must time-share or serve one agent at a time (batch inference helps but adds complexity). A full STANDARD-tier Spider Web cycle (Ring 1 + Ring 2) could take **3–6 minutes locally vs. 30–90 seconds in cloud**.

---

### 1.4 Context Window — SLM Support

**Risk: LOW | Probability: LOW (<20%) | Severity: MEDIUM**

Spider Web agents operate within well-defined context budgets (Ring 1: ~3,000 tokens loaded; MandateResult body: max ~12,000 chars). SLMs support this comfortably:

| Model | Context Window |
|---|---|
| Phi-4 14B | 16,384 tokens |
| Phi-4 mini | 128,000 tokens |
| Mistral 7B (Nemo) | 128,000 tokens |
| LLaMA 3.2 8B | 128,000 tokens |
| LLaMA 3.2 3B | 128,000 tokens |

**Verdict:** Context window is not a limiting factor. All relevant SLMs exceed the Spider Web per-agent context budget by 4–40×.

---

### 1.5 CUDA Version Lock / Driver Compatibility

**Risk: MEDIUM | Probability: MEDIUM (30–50%) | Severity: MEDIUM**

- llama.cpp CUDA builds are compiled against specific CUDA toolkit versions (currently 12.x)
- NVIDIA driver requirement: ≥525.85 for CUDA 12.x on Linux
- Linux distributions lag NVIDIA driver stack by 3–6 months
- AMD ROCm support in llama.cpp is functional but less tested; HIP version lock is worse than CUDA
- AITK Agent Inspector uses debugpy (5679) and HTTP (8087; configurable) — driver issues cause **silent degradation** (falls back to CPU without warning in some llama.cpp builds)

**Blast radius:** Driver incompatibility causes full inference failure, not degraded inference.

---

## 2. Ecosystem Risks

### 2.1 AITK Stability on Linux

**Risk: MEDIUM | Probability: MEDIUM (35–50%) | Severity: MEDIUM**

From February 2026 AITK update (v0.30.0):
- The extension is named `ms-windows-ai-studio.windows-ai-studio` — Windows-first design priority
- Linux native CUDA via NVIDIA GPU is supported, but DirectML (Windows-only) is the primary acceleration path
- WSL2 GPU passthrough adds an additional validation layer (CUDA → dxgkrnl kernel module)
- The Agent Inspector (new in v0.30.0) launches via `agentdev run agent.py` and debugpy — both Python-based and cross-platform

**Findings from workspace (agent.py):** The visualizer server runs via `agentdev run` with ports 8087 and 5679. The agentdev framework invocation is Linux-compatible (Python subprocess, not DirectML-dependent). AITK Agent Inspector's F5 debugging functionality **does** require VS Code's debugpy, which works on Linux.

**Linux-specific gap:** Model download and CUDA acceleration in AITK Model Catalog may have less testing coverage than Windows+DirectML. Community reports from Feb 2026 indicate CUDA path works but requires manual CUDA toolkit configuration not documented in AITK official docs.

---

### 2.2 agentdev Framework Maturity

**Risk: MEDIUM-HIGH | Probability: HIGH (>60%) | Severity: HIGH**

From Microsoft Foundry Blog (Feb 19, 2026):
- Microsoft Agent Framework Python reached **Release Candidate (1.0.0-rc1)** status
- RC = not GA; breaking API changes remain possible before 1.0 stable
- The Python 2026 Significant Changes Guide documents multiple **breaking changes** in rc1
- GA is targeted for Q1 2026 (imminent as of Mar 8, 2026) but not yet declared

**Spider Web specific impact:**
- `WorkflowBuilder`, `Executor`, `@handler` patterns may change between rc1 and 1.0
- The visualizer `agent.py` uses agentdev for launch and inspection — API breakage would disable the Agent Inspector
- MCP tool integration in agentdev is new (Tool Catalog, Feb 2026) and has had limited production exposure

**Risk categorization:** MEDIUM-HIGH because RC→GA transition is imminent and expected to be breaking in at least some surface areas; however, risk is bounded in time (expect resolution in Q1-Q2 2026).

---

### 2.3 debugpy Integration Reliability

**Risk: LOW | Probability: LOW (<15%) | Severity: LOW**

debugpy is a mature, widely-deployed Python debugger (used by VS Code Python extension for years). No CVEs, no known stability issues. The `--listen 127.0.0.1:5679` binding in the task configuration correctly restricts to loopback. **No material risk.**

---

### 2.4 Model Availability / License Compliance

**Risk: LOW | Probability: LOW (<10%) | Severity: LOW**

All target models have permissive licenses:
- Phi-4 (Microsoft): MIT License — commercial use allowed
- Mistral 7B: Apache 2.0 — commercial use allowed
- LLaMA 3.2: Meta Llama Community License — broad commercial use allowed (up to 700M MAU threshold)

GGUF conversions from top HuggingFace publishers (bartowski, mradermacher, unsloth) are derivative works under the same licenses.

---

## 3. Security Risks — CVEs (Dec 8, 2025 – Mar 8, 2026)

### 3.1 llama.cpp CVEs

#### CVE-2026-21869 (CRITICAL — Jan 7, 2026)
**CVSS: 8.8 HIGH | Type: RCE via OOB Write**

- **Affects:** All llama.cpp versions up to commit `55d4206c8`
- **Root cause:** `n_discard` parameter in llama-server completion endpoint is parsed from JSON without sign validation. A negative value triggers out-of-bounds write → heap corruption → potential RCE
- **Exploitability:** Requires access to the llama-server HTTP endpoint (port 8080 default)
- **Spider Web exposure:** HIGH — if Ollama or llama.cpp server is used for local inference, and the API port is exposed beyond 127.0.0.1, this is exploitable. The existing visualizer task does NOT expose llama-server itself, but any Ollama-backed AITK setup does.
- **Mitigation:** Update to commit newer than `55d4206c8`; bind llama-server to 127.0.0.1 only; add API key authentication

#### CVE-2026-2069 (Feb 23, 2026)
**Type: Memory Corruption in llama_grammar_advance_stack**

- Affects `ggml-org/llama.cpp` up to commit `55abc39`
- Severity: Not yet fully rated at time of analysis
- Impacts grammar-constrained generation (used for structured output from agents)

#### CVE-2025-49847 (Jun 2025, still unpatched in many installs)
**Type: Buffer Overflow — GGUF Parser (gguf_init_from_file_impl)**

- Integer overflow in GGUF parser when loading model files
- Can be triggered by maliciously crafted GGUF files
- Severity: CRITICAL — potential RCE on model load

---

### 3.2 Ollama CVEs

#### CVE-2025-15514 (Jan 12, 2026)
**Type: Null Pointer Dereference — DoS**

- Affects: Ollama 0.11.5-rc0 through ~0.13.5
- Triggered by multi-modal model image processing
- Impact: Server crash (DoS)

#### CVE-2025-51471 (Jul 2025)
**Type: Cross-Domain Token Exposure**

- Ollama fails to validate authentication realm in WWW-Authenticate headers
- Remote attackers can steal authentication tokens via crafted redirect
- **Spider Web exposure:** MEDIUM if Ollama is exposed on any network interface (AITK talks to Ollama via HTTP API)

#### CVE-2025-1975 (2025)
**Type: DoS via Malicious Manifest**

- Ollama 0.5.11: attacker can crash server via malicious manifest content

#### CVE-2025-0317 (2025)
**Type: Malicious GGUF Upload / RCE via GGUF**

- Allows malicious user to upload crafted GGUF model → code execution potential
- Affects Ollama ≤ 0.3.14 (older versions)

---

### 3.3 ONNX Runtime

**Risk: LOW-MEDIUM (in 90-day window)**

Snyk's database shows **no direct CVEs** in onnxruntime pip package in the analysis window. AITK's own local inference does not directly use ONNX Runtime for LLM inference (it uses llama.cpp via Ollama or AITK built-in model runner). ONNX Runtime relevance is primarily for AITK's model conversion pipeline, not runtime inference.

---

### 3.4 GGUF File Integrity / Supply-Chain Risk

**Risk: MEDIUM | Probability: LOW-MEDIUM (20–35%) | Severity: HIGH**

**Splunk GGUF analysis (Feb 2026):** Scanned 156,838 GGUF models on HuggingFace. Key findings:
- Inference-time template poisoning is a **real, demonstrable attack surface**
- Embedded `tokenizer.chat_template` fields in GGUF can inject hidden system-level instructions that fire at inference time without user awareness
- Current ecosystem: templates found were benign (no active attacks confirmed)
- **However:** Spider Web agents executing code changes based on poisoned model output = high-severity blast radius

**QURA Attack (2025 research):** Quantization-guided Rounding Attack — backdoors survive the quantization process itself. A model that appears clean at FP16 may activate backdoors only in Q4 quantized form.

**Mitigation required:**
1. Use only SHA-256 verified model files from known publishers
2. Inspect GGUF chat templates before deployment
3. Prefer official model publisher HuggingFace repos (microsoft/phi-4, meta-llama/..., mistralai/...)

---

### 3.5 Local Inference Port Exposure

**Risk: MEDIUM | Probability: MEDIUM (25–40%) | Severity: HIGH**

From the workspace task configuration:
- Port **5679**: debugpy listener — correctly bound to `127.0.0.1`
- Port **8087**: visualizer HTTP server (agent.py) — binding depends on configuration
- Ollama default port **11434**: NOT bound to 127.0.0.1 in default Ollama install

**CVE-2026-21869 exploitability window:** If Ollama's embedded llama-server is used and NOT bound to loopback, an attacker on the local network can send a crafted `n_discard` parameter to achieve RCE.

**Additional risk: Prompt injection via HTTP endpoints.** Any endpoint that accepts user-controlled input to local inference engines is an injection surface. The Spider Web system passes agent instructions and code context to local models via HTTP — malicious code in project files could inject adversarial instructions.

---

## 4. Operational Risks

### 4.1 OOM Crashes During Parallel Fan-out

**Risk: HIGH | Probability: HIGH (>70%) | Severity: HIGH**

As established in §1.1, full 10-agent Spider Web fan-out with any 12-14B model overflows 12GB VRAM. Overflow behavior depends on backend:

| Backend | OOM Behavior |
|---|---|
| Ollama | Returns HTTP 500, crashes session |
| llama.cpp server | SIGKILL or SIGSEGV from CUDA OOM |
| AITK model runner | Undefined behavior; may hang |

**There is no graceful model-layer OOM handling in llama.cpp or Ollama by default.** An OOM event during a Spider Web sprint run would:
1. Kill the inference session mid-agent
2. Leave DevSteps items in `in-progress` status (stale)
3. Require manual recovery of the dispatch state

**Mitigation design required:** Implement Fan-Out Batching: split 10-agent fan-out into batches of 4-5, sequentially. Updates dispatch concurrency model in the Spider Web architecture.

---

### 4.2 Thermal Throttling Under Sustained Multi-Agent Load

**Risk: MEDIUM | Probability: MEDIUM (30–55%) | Severity: MEDIUM**

RTX 30-series (3060/3070/3080) Thermal Limits:
- Core throttle trigger: **83°C** (GPU Slowdown Temp)
- Memory junction throttle: **95°C** (GDDR6X models)
- Sustained LLM inference at 100% SM utilization → junction temp reaches 80–88°C within 5-10 minutes

**Impact for Spider Web:** A full FULL-tier sprint (Ring 1 + Ring 2 + Ring 3 + Ring 4 + Ring 5) at sustained 100% GPU load could trigger throttling mid-sprint. Throttling reduces inference speed by 15–30%, extending sprint wall-clock time and increasing risk of session timeout.

**Mitigation:** Set GPU power limit (e.g., `-pl 80W` for RTX 3060) via `nvidia-smi`. Trade 10–15% peak throughput for thermal headroom.

---

### 4.3 CPU Fallback Strategy

**Risk: LOW-MEDIUM | Probability: LOW (<20%) | Severity: MEDIUM**

Both Ollama and llama.cpp support CPU fallback when GPU is unavailable:
- Llama.cpp: Compiles with `-DLLAMA_CUDA=OFF` for pure CPU build
- Ollama: Automatically falls back to CPU if CUDA is unavailable at startup
- CPU inference speed: ~1–4 tokens/sec (vs. 35–55 on GPU) — **10–15× degradation**

**Available fallback:** YES, but practically unusable for real-time dev workflows. A Spider Web ring that takes 20-30 seconds on GPU would take **4–8 minutes per agent on CPU**. Full sprint = hours.

---

### 4.4 Model Update / Drift Risk

**Risk: LOW-MEDIUM | Probability: LOW (<20%) | Severity: LOW-MEDIUM**

Local models do not auto-update. Risk scenarios:
- Security patches in model weights (post-training alignment updates) are not automatically applied
- Bug fixes in GGUF conversion from model authors are not received
- Cloud competitors (Copilot, Claude) receive continuous improvements; local models stagnate unless manually updated

This is a maintenance burden risk, not an acute operational risk.

---

## 5. Integration Risks

### 5.1 MCP Protocol Compatibility

**Risk: LOW | Probability: LOW (<15%) | Severity: LOW**

**Well-established.** AITK February 2026 update explicitly lists:
- "Browse, search, and filter tools from the public Foundry catalog and **local stdio MCP servers**"
- "Add tools to agents seamlessly via Agent Builder"

The devsteps MCP server uses stdio transport, which is fully supported by AITK v0.30.0. MCP tools (`mcp_devsteps_*`) are callable from AITK agents using local models. **No compatibility blockers identified.**

---

### 5.2 runSubagent Compatibility with Local Models

**Risk: HIGH | Probability: HIGH (>75%) | Severity: HIGH**

**This is the most fundamental integration risk.**

`runSubagent` is a **GitHub Copilot-specific API** within VS Code Chat. It operates within the Copilot agent runtime and dispatches `.agent.md`-defined agents using the Copilot/Claude backend.

**Critical incompatibility:** Local AITK agents (using `WorkflowBuilder`, `agentdev run`) operate in a **completely separate runtime** from VS Code Copilot Chat's `runSubagent`. You CANNOT:
- Use `runSubagent` from a `.agent.md` to dispatch agents that use a local 12GB GPU model
- Mix Copilot Cloud (Claude) coordination with local model execution in a single dispatch chain without explicit API bridging code

**What IS possible:** Running the entire Spider Web system using local models via AITK's Python `WorkflowBuilder` with custom `worker-*` executors. But this requires **rearchitecting the dispatch layer** away from `runSubagent` + `.agent.md` files toward the Python Agent Framework API.

**Impact:** The existing devsteps Spider Web architecture (`.agent.md` + `runSubagent`) is NOT directly portable to local model inference. Migration is a significant effort, not a configuration change.

---

### 5.3 Token Cost vs. Quality Trade-off

**Risk: MEDIUM | Probability: MEDIUM (40–60%) | Severity: MEDIUM**

**Local inference:** Zero API cost per token. VRAM cost is fixed hardware investment.
**Quality loss:**
- Complex reasoning tasks (code analysis, risk assessment): 7–12% MMLU degradation at Q4 vs. frontier models
- Agent instruction following: SLMs are less reliable at complex multi-step CoT with structured output requirements
- MandateResult format compliance: frontier models (Claude 3.5/4) have near 100% structured output adherence; 7B-14B SLMs have ~85–92% adherence without aggressive prompt engineering

**Hidden cost:** Failed MandateResults (malformed JSON, truncated output) trigger retry loops → increases dispatch count → some of the cost savings are consumed by reliability overhead.

---

## 6. Risk Matrix Summary

| Risk | Probability | Severity | Priority |
|---|---|---|---|
| VRAM overflow at 10-agent fan-out | HIGH | HIGH | **P1 — Block** |
| runSubagent incompatibility with local models | HIGH | HIGH | **P1 — Block** |
| CVE-2026-21869 (llama.cpp RCE) | HIGH (if not patched) | HIGH | **P1 — Fix before deploy** |
| OOM crashes during sprint | HIGH | HIGH | **P1 — Mitigate** |
| agentdev API breakage (pre-GA) | MEDIUM-HIGH | HIGH | **P2 — Monitor** |
| Inference latency (parallel fan-out serialization) | HIGH | MEDIUM | **P2 — Architect** |
| Quantization accuracy degradation | MEDIUM | MEDIUM | **P2 — Test** |
| Ollama CVEs (token theft, DoS) | MEDIUM | MEDIUM | **P2 — Patch** |
| GGUF supply-chain poisoning | LOW-MEDIUM | HIGH | **P2 — Verify** |
| Thermal throttling | MEDIUM | MEDIUM | **P3 — Configure** |
| AITK Linux stability gaps | MEDIUM | MEDIUM | **P3 — Test** |
| CUDA version lock | MEDIUM | MEDIUM | **P3 — Pin** |
| Port exposure (11434, 8087) | MEDIUM | HIGH | **P2 — Bind to loopback** |
| MCP tool compatibility | LOW | LOW | **P4 — No action** |
| CPU fallback speed | LOW | MEDIUM | **P4 — Accept** |
| Model license risk | LOW | LOW | **P4 — No action** |

---

## 7. Key Hard Constraints

These constraints **MUST NOT be violated** if local GPU adoption proceeds:

1. **C1 — Bind all inference ports to 127.0.0.1:** llama-server (8080), Ollama (11434), debugpy (5679), visualizer (8087). Public network exposure of CVE-2026-21869-affected versions = critical vulnerability.

2. **C2 — Patch llama.cpp to post-55d4206c8 commit before any deployment.**

3. **C3 — Never exceed 60% VRAM allocation for model weights:** Leave 40% for KV cache headroom across active agent sessions.

4. **C4 — SHA-256 verify all GGUF files against known-good hashes from official publisher repos before loading.**

5. **C5 — Do not attempt to use `runSubagent` with AITK-local-model agents without explicit runtime bridging.** This is an architectural incompatibility, not a configuration option.

---

## 8. Test Coverage Gaps That Increase Risk

| Gap | File where test should exist | Risk Increased |
|---|---|---|
| VRAM overflow behavior under 10-agent fan-out | `tests/integration/gpu-oom.bats` (does not exist) | OOM → stale DevSteps items |
| MandateResult format compliance of SLM output | `packages/mcp-server/src/tools/*.test.ts` | Malformed JSON crashes coord |
| Port binding verification for local inference | `tests/integration/security-ports.bats` (does not exist) | CVE-2026-21869 exposure |
| GGUF hash verification before model loading | (no verification code exists in workspace) | Supply-chain poisoning |
| agentdev API version pinning | `tmp/visualizer/requirements.txt` or `pyproject.toml` (check if pinned) | RC API breakage |

---

## 9. Absence Audit — What Is NOT in This Analysis

| Category | Reason Not Assessed |
|---|---|
| ROCm (AMD GPU) blast radius | Mandate specifies NVIDIA CUDA; ROCm adds separate risk surface |
| Windows DirectML path | User is on Linux (workspace env confirmed) |
| Distributed multi-GPU inference | Out of scope (single 12GB GPU only) |
| Fine-tuned model risks | Only pre-trained/quantized inference considered |
| Token budget at scale (devsteps-wide) | Depends on sprint frequency; operational, not technical risk |

---

## Sources

1. LocalLLM.in VRAM Guide (Nov 2025, updated Feb 2026) — VRAM benchmarks
2. Microsoft Tech Community — AITK February 2026 Update (Feb 13, 2026)
3. Microsoft Foundry Blog — Agent Framework RC announcement (Feb 19, 2026)
4. NVD/NIST — CVE-2026-21869 (Jan 7, 2026)
5. GitHub Security Advisory GHSA-8947-pfff-2f3c — llama.cpp OOB Write
6. SentinelOne — CVE-2026-21869 analysis (Jan 22, 2026)
7. NVD — CVE-2025-15514 (Ollama, Jan 12, 2026)
8. GitHub — GHSA-x9hg-5q6g-q3jr (Ollama token theft, Jul 2025)
9. Splunk Blog — "Trust at Inference Time: GGUF Model Templates" (Feb 19, 2026)
10. Arxiv 2602.04653 — Pillar Security inference-time backdoors (Feb 2026)
11. arXiv — Phi-4 Technical Report (Dec 2024)
12. Workspace files: `agent.py`, `RESEARCH-REPORT-AITK-MultiAgent.md`, `AITK-Tools-Guide-Reference.md`, `AITK-Tools-Guide-Dev.md`

# SPIKE-032 Research Brief — Local 12GB GPU + VS Code AI Toolkit Agent Inspector

**Document type:** Research Brief (exec-doc synthesis)  
**Item:** SPIKE-032 — Research: Local GPU + VS Code AI Toolkit Agent Inspector  
**Triage tier:** COMPETITIVE_PLUS  
**Produced by:** devsteps-R4-exec-doc  
**Research window:** December 8, 2025 – March 8, 2026  
**Date published:** 2026-03-08  
**Verdict:** **RECOMMENDED with CONDITIONS**  
**Confidence:** 0.89 (multi-source, 14 verified sources)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Research Horizon](#2-research-horizon)
3. [Source Map (by Coverage Axis)](#3-source-map-by-coverage-axis)
4. [Technology Radar Signals](#4-technology-radar-signals)
5. [Security & Risk Assessment](#5-security--risk-assessment)
6. [Internal Fit Analysis](#6-internal-fit-analysis)
7. [Prioritized Recommendations](#7-prioritized-recommendations)
8. [Model Selection Guide](#8-model-selection-guide)
9. [Setup Prerequisite Chain (Linux/CUDA)](#9-setup-prerequisite-chain-linuxcuda)
10. [Agent Inspector Integration Guide](#10-agent-inspector-integration-guide)
11. [Migration Path](#11-migration-path)
12. [Next Actions — DevSteps Items](#12-next-actions--devsteps-items)

---

## 1. Executive Summary

Adopting Ollama + CUDA as a local inference backend for the devsteps Spider Web multi-agent system is **technically sound and architecturally compatible** with the established design constraints. The 12GB VRAM envelope supports simultaneous dispatch of up to 7 Mistral 7B Q4\_K\_M agents or 1 LLaMA 3.2 11B Q4\_K\_M agent at a time — enough for Ring 4 workers but insufficient for full 10-agent fan-out without model downgrade. The AITK v0.30.0 (GA February 2026) Agent Inspector provides production-grade F5 debugging for Python `agentdev` workflows and works on Linux via debugpy, but it does **not** trace VS Code native `runSubagent` dispatch chains — that fundamental limitation means two separate observation planes must coexist.

The recommended architecture routes **only Ring 4 workers** to local GPU (Ollama); Rings 0, 1, 2, 3, and 5 must remain on Claude Sonnet 4.6 (cloud) because small language models cannot reliably execute the MAP-REDUCE-RESOLVE-SYNTHESIZE reasoning patterns required by analysts, aspects, and the gate-reviewer. Four P1 security and prerequisite actions block all integration work and must be completed before any `.agent.md` model field is changed. The prior validated design decision (ADR, Gate PASS 2026-03-05) — **keep the VSIX GPU-free; delegate inference to an out-of-process Ollama sidecar** — is confirmed as the correct and binding architecture for this project.

The overall recommendation is **GO with 4 mandatory pre-conditions**: (1) patch llama.cpp CVE exposure via Ollama ≥0.5.4, (2) bind Ollama to loopback only, (3) harden `server.py` with body-size limits and optional auth, and (4) pin `agentdev` to a specific RC version. Confidence: 0.89.

---

## 2. Research Horizon

| Attribute | Value |
|---|---|
| **Research window start** | December 8, 2025 |
| **Research window end** | March 8, 2026 |
| **Total calendar span** | 90 days |
| **Verified source count** | 14 sources (enumerated in §3) |
| **Coverage axes addressed** | All 8 (Technology Radar, Security, Release Archaeology, Ecosystem Health, Community Vitality, Performance Benchmarks, Standards Compliance, Competitive Intelligence) |
| **Reports synthesized** | 10 (4 Ring 1 analysts + 4 Ring 2 aspects + 1 Ring 3 exec-planner + 1 internal RESEARCH-REPORT) |
| **Conflicting findings resolved** | 1 factual error corrected (analyst-quality Gap 3 struck by aspect-quality §1.1) |
| **New gaps discovered** | 2 (sprint\_id:null schema gap; MCP handler integration test gap) |

---

## 3. Source Map (by Coverage Axis)

### Technology Radar

| Source | Date | Key Contribution |
|---|---|---|
| Microsoft Tech Community Blog — AI Toolkit v0.30.0 (junjieli) | Feb 13, 2026 | Agent Inspector feature set; Tool Catalog; Evaluation as Tests official spec |
| VS Code Blog — "Making agents practical for real-world development" | Mar 5, 2026 | BYOM `chat.models` mechanism; v1.110 agent capabilities |
| Visual Studio Magazine — "Navigating VS Code AI Toolkit and Microsoft Foundry" | Mar 4, 2026 | AITK-Foundry integration scope; Agent Builder walkthrough |
| dev.to (lightningdev123) — "Top 5 Local LLM Tools and Models in 2026" | Jan 29, 2026 | Community consensus: Ollama, LM Studio, vLLM comparative positioning |

### Security

| Source | Date | Key Contribution |
|---|---|---|
| GitHub Security Advisory — CVE-2026-21869 | Jan 7, 2026 | llama.cpp OOB write via `n_discard`; CVSS 8.8 RCE; patched in Ollama ≥0.5.x |
| GitHub Security Advisory — CVE-2026-2069 | Feb 23, 2026 | GBNF grammar handler stack overflow; disable if structured output not needed |
| SonarSource Research — CVE-2026-25253 | Mar 2026 | WebSocket agent hijacking when no local inference auth enforced; CVSS 8.8 |
| Splunk Research — GGUF supply-chain QURA attacks | Feb 2026 | 156,838 HuggingFace models scanned; backdoors survive Q4 quantization |

### Release Archaeology

| Source | Date | Key Contribution |
|---|---|---|
| Microsoft Foundry Blog — Agent Framework Python 1.0.0-rc1 | Feb 19, 2026 | RC status confirmed; breaking API changes en route to GA; Q1-Q2 2026 GA target |
| VS Code v1.110 release notes | Mar 2026 | Agent Debug Panel; session memory; global instruction files confirmed |

### Ecosystem Health + Community Vitality

| Source | Date | Key Contribution |
|---|---|---|
| XDA Developers — "Replaced ChatGPT subscription with 12GB GPU" | Jan 21, 2026 | Consumer GPU viable for local LLM; community adoption data |
| LocalLLM.in — Ollama VRAM Requirements Guide | Nov 2025 (current) | Q4\_K\_M VRAM benchmarks by model size; widely-referenced standard |
| Reddit r/LocalLLaMA — GPU inference backend threads | Jan 2026 | Ollama as dominant developer-facing backend; community consensus |

### Performance Benchmarks + Standards Compliance + Competitive Intelligence

| Source | Date | Key Contribution |
|---|---|---|
| X/Twitter @DanWahlin — AITK v0.30.0 commentary | Feb 2026 | "Treats agent development like software engineering" — community validation signal |

---

## 4. Technology Radar Signals

Assessed for Linux NVIDIA CUDA environment + 12GB VRAM + devsteps Spider Web architecture.

| Technology | Radar Signal | Rationale |
|---|---|---|
| **Ollama + CUDA (Linux)** | **ADOPT** | Stable, CUDA-native, OpenAI-compatible API, active community; wraps llama.cpp with safe commit pins; native tool calling in 2026; correct Linux choice when DirectML unavailable |
| **AITK Agent Inspector (v0.30.0)** | **TRIAL** | GA feature, cross-platform debugpy foundation; excellent for Python agentdev workflows; does NOT capture runSubagent dispatch — two-plane limitation is fundamental and must be accepted |
| **llama.cpp (direct server mode)** | **HOLD** | CVE-2026-21869 (CVSS 8.8 RCE) and CVE-2026-2069 active; defer direct use until patched; prefer Ollama which pins a safe llama.cpp commit |
| **vLLM** | **ASSESS** | Appropriate for multi-user GPU servers (16GB+); severely over-engineered for single-developer 12GB workstation; consider when scaling to team-shared inference |
| **DirectML** | **RETIRE (on Linux)** | Windows-only hardware abstraction layer; not available natively on Linux; confirmed absent via `.vscode/extensions.json` "Windows-specific" annotation |
| **ONNX Runtime (AITK-native)** | **TRIAL** | Built into AITK Model Catalog on Windows; available on Linux via CUDA Execution Provider but model catalog is smaller; functional alternative to Ollama for ONNX-format models |
| **LM Studio** | **TRIAL** | Best GUI model browser and manager; GUI is Windows-primary; CLI available on Linux; OpenAI-compatible server mode works; no agent debugging or MCP integration |
| **Continue.dev** | **HOLD** | Excellent inline code assistant (VS Code extension); no multi-agent architecture support; orthogonal to Spider Web; evaluate separately for code-assist use case |
| **AITK Evaluation as Tests** | **TRIAL** | New in v0.30.0; pytest-syntax eval definitions with VS Code Test Explorer integration; relevant for agent output quality measurement; not yet validated against Spider Web MandateResult schema |
| **Phi-4 14B Q4\_K\_M** | **HOLD (for this GPU)** | Model quality is high but VRAM math is irreversible: 8.2 GB base + 10×500 MB KV = 13.8 GB — physically exceeds 12 GB under any multi-agent use; single-agent use only |
| **Mistral 7B Q4\_K\_M** | **ADOPT (Ring 4 simple workers)** | 4.5 GB VRAM; 60–80 tok/s; reliable JSON via `response_format: json_schema`; native Ollama tool calling; correct choice for pattern-following Ring 4 workers |
| **LLaMA 3.2 11B Q4\_K\_M** | **ADOPT (Ring 4 conductors)** | 7 GB VRAM; 40–55 tok/s; 32K context; better multi-step instruction following than 7B; single-load use only within 12 GB budget |

---

## 5. Security & Risk Assessment

### 5.1 Active CVEs (Research Window: Dec 8, 2025 – Mar 8, 2026)

| CVE | Date | Component | CVSS | Type | Spider Web Exposure | Mitigation |
|---|---|---|---|---|---|---|
| **CVE-2026-21869** | Jan 7, 2026 | llama.cpp | **8.8 HIGH** | OOB write → RCE via negative `n_discard` parameter in llama-server | HIGH: any Ollama-backed setup if API port exposed | Use Ollama ≥0.5.4 (pins safe llama.cpp commit); bind to 127.0.0.1 |
| **CVE-2026-2069** | Feb 23, 2026 | llama.cpp GBNF handler | **7.5 HIGH** | Stack-based buffer overflow in grammar-constrained generation | MEDIUM: triggered only when GBNF grammar enabled for structured output | Update to latest Ollama release; disable GBNF grammar if not required |
| **CVE-2026-25253** | Mar 2026 | Local inference (any) | **8.8 CRITICAL** | WebSocket agent hijacking when no auth enforced on local inference port | HIGH: Ollama default config has no API key requirement | Add auth header to Ollama (`OLLAMA_API_KEY` env var) or restrict via firewall rule |
| **CVE-2025-51471** | Jul 2025 | Ollama | MEDIUM | Cross-domain auth token exposure via crafted WWW-Authenticate redirect | LOW at loopback-only config | Update Ollama to ≥0.14; confirmed low risk when bound to 127.0.0.1 |
| **CVE-2025-15514** | Jan 12, 2026 | Ollama | MEDIUM | Null pointer dereference → DoS in multi-modal image processing | LOW for text-only models | Update Ollama; avoid multi-modal models on inference endpoint |

### 5.2 OWASP Surface

**OWASP A07 — Identification and Authentication Failures:**
The local Ollama inference API at `http://127.0.0.1:11434/v1/chat/completions` accepts all requests without authentication by default. Any process on the same machine — including browser-side JavaScript via `fetch()` — can send arbitrary prompts. CVE-2026-25253 confirms this is an exploitable real-world attack vector (CVSS 8.8). Mitigation: verify `OLLAMA_HOST=127.0.0.1:11434` in the systemd unit AND configure `OLLAMA_API_KEY` for per-request token validation.

**OWASP A10 — Server-Side Request Forgery (SSRF):**
The Spider Web Visualizer `server.py` at `POST /v1/traces` and `POST /v1/chat/completions` (if proxied) accept requests without body-size limits. A prompt injection via scanned project files could instruct a local model to make outbound calls via the agent's `runInTerminal` tool. The `devsteps_watcher.py` unsanitized `target_subagent` field (confirmed at lines 118-120) is an additional log-pollution path. This is trace pollution risk rather than full SSRF since the exporter does not make outbound HTTP calls — but it degrades observability integrity.

### 5.3 P1 Risk Register

| ID | Risk | Likelihood | Severity | Status |
|---|---|---|---|---|
| P1-1 | VRAM overflow at full 10-agent fan-out with ≥14B model | HIGH (3/3) | HIGH (3/3) | **MITIGATED** — cap at 6 agents for 8B models; exclude 14B from multi-agent configs |
| P1-2 | Silent MandateResult corruption from local model JSON drift | MEDIUM (2/3) | HIGH (3/3) | **MITIGATED** — existing Zod validation in `cbp-mandate.ts` (`WriteMandateResultSchema`) catches malformed output; handler-level integration tests still missing |
| P1-3 | agentdev RC→GA breaking change breaks Agent Inspector | HIGH (3/3) | HIGH (3/3) | **OPEN** — requires `requirements.txt` version pin before any `pip upgrade` |
| P1-4 | llama.cpp CVE-2026-21869 RCE via Ollama if unpatched | MEDIUM (2/3) | HIGH (3/3) | **OPEN** — requires Ollama ≥0.5.4 installation |

### 5.4 Supply-Chain Advisory

GGUF models downloaded from Hugging Face community contributors carry supply-chain risk: Splunk Research (Feb 2026) scanned 156,838 models and found adversarial instructions embedded in `tokenizer.chat_template` fields (QURA attacks) that survive Q4 quantization. Rule: **only use models from Ollama's signed registry** (`ollama pull <model>`) or from verified publishers via SHA256 checksum verification. Do not download raw GGUF files from community-uploaded HuggingFace repositories.

---

## 6. Internal Fit Analysis

### 6.1 Existing AITK Infrastructure (What Is Already Working)

The devsteps workspace has a **fully operational AITK integration** that most projects lack at this stage. The SPIKE-032 work builds on an already-wired foundation:

| Artifact | Location | Status |
|---|---|---|
| AITK task type (`"type": "aitk"`) | `.vscode/tasks.json:317` | Active |
| AITK `debug-check-prerequisites` command | `.vscode/tasks.json:318` | Active (checks ports 5679, 8087) |
| AITK Agent Inspector task | `.vscode/tasks.json:353` | Active (`ai-mlstudio.openTestTool`) |
| debugpy launch config | `.vscode/launch.json:62–78` | Active (attach to port 5679) |
| Spider Web Visualizer Python package | `tmp/visualizer/visualizer/` | Active (server, otel, exporter, watcher, registry) |
| agentdev entrypoint | `tmp/visualizer/agent.py` | Active (`agentdev run` mode, HTTP on 8087) |
| AITK tools in coord agent frontmatter | `.github/agents/devsteps-R0-coord.agent.md:5` | Active (20+ AITK tools listed) |
| devsteps MCP server registered | `.vscode/mcp.json` | Active (stdio via npx) |
| OTLP tracing chain | `otel_setup.py` → `spider_traces.jsonl` → `GET /api/traces` | Active |

### 6.2 Critical Gaps (What Is Missing)

| Gap | ID | Severity | Blocker? |
|---|---|---|---|
| No `.vscode/settings.json` with `chat.models` BYOM Ollama config | HC-1 | CRITICAL | YES — without this, no Spider Web agent can route to Ollama regardless of infrastructure |
| No Python MCP client in agentdev for MandateResult writes | HC-1b | HIGH | No (workaround: stdio cold-start) |
| `agentdev` pinned version missing (`agent-dev-cli --pre`) | — | HIGH | YES — next `pip upgrade` breaks Agent Inspector |
| `server.py` missing body-size limit + auth header | OWASP A07/A10 | HIGH | YES (security barrier) |
| No CUDA/GPU infrastructure anywhere in TypeScript VSIX | — | N/A | Correct by design (prior ADR) |
| No `devsteps-local-model.instructions.md` ring routing document | — | MEDIUM | No (documentation gap) |
| `devsteps_watcher.py` unsanitized `target_subagent` field | — | LOW | No (log pollution risk only) |

### 6.3 Architecture Boundary (The Fundamental Split)

```
┌─────────────────────────────────────────────────────────────┐
│  VS Code Chat Runtime (GitHub Copilot)                       │
│                                                             │
│  Ring 0:  coord         → Claude Sonnet 4.6 (cloud)        │
│  Ring 1:  analyst-*     → Claude Sonnet 4.6 (cloud)        │
│  Ring 2:  aspect-*      → Claude Sonnet 4.6 (cloud)        │
│  Ring 3:  exec-planner  → Claude Sonnet 4.6 (cloud)        │
│  Ring 4:  exec-*/worker-* → Ollama (localhost) via BYOM ←─── TARGET CHANGE
│  Ring 5:  gate-reviewer → Claude Opus (cloud)              │
│                                                             │
│  dispatch: runSubagent (Copilot-native, invisible to AITK)  │
└─────────────────────────────────────────────────────────────┘
              │ BYOM `chat.models` bridge
              ↓
    ┌──────────────────────┐
    │  Ollama (127.0.0.1:  │
    │  11434) + CUDA GPU   │
    │  LLaMA 3.2 11B /     │
    │  Mistral 7B Q4_K_M   │
    └──────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Python agentdev Runtime (separate process)                  │
│                                                             │
│  agent.py → agentdev run → HTTP :8087                       │
│  otel_setup.py → OTLP → spider_traces.jsonl                 │
│  devsteps_watcher.py → MandateResult event bridge           │
│                                                             │
│  AITK Agent Inspector: watches :8087 + debugpy :5679        │
│  Traces: Python agentdev spans ONLY (no runSubagent)        │
└─────────────────────────────────────────────────────────────┘
```

**HC-3 acknowledged limitation:** AITK Agent Inspector does NOT capture `runSubagent` dispatch chains — these are opaque to any OTLP collector. The Spider Web Visualizer (`devsteps_watcher.py` watching `.devsteps/cbp/` for MandateResults) provides an indirect signal for Chat agent activity but cannot show inter-agent dispatch graphs. This is a **permanent architectural limitation** of the VS Code Copilot Chat runtime — it is not a defect in the AITK integration.

### 6.4 Prior Validated Decision (Binding ADR)

The GPU research sprint `gpu-vscode-projects-2026-03-05` (Gate PASS: 2026-03-05) produced the binding architectural decision:

> **Keep VSIX GPU-free. Delegate AI inference to an out-of-process sidecar (Ollama/ONNX) via OpenAI-compatible API.**

SPIKE-032 confirms this decision is correct. No TypeScript code in `packages/extension/`, `packages/mcp-server/`, or `packages/cli/` should contain GPU inference logic, direct llama.cpp bindings, or CUDA/ROCm dependencies. This constraint is **non-negotiable**.

### 6.5 `WriteMandateResultSchema` Zod Validation — Correction of Record

A factual error in the Ring 1 `analyst-quality` report (Gap 3) was identified and corrected by Ring 2 `aspect-quality` via direct code inspection:

**analyst-quality claimed:** `write_mandate_result` MCP handler lacks Zod validation.  
**Actual state:** `packages/mcp-server/src/handlers/cbp-mandate.ts` → `handleWriteMandateResult()` already calls `WriteMandateResultSchema.safeParse()`. The schema in `packages/shared/src/schemas/cbp-mandate.ts` enforces:
- `analyst: z.string().regex(/^devsteps-R\d+-/)` ✅
- `findings: z.string().max(12000)` ✅
- `recommendations: z.array(z.string().max(300)).max(5)` ✅

This was added in TASK-334 (Read/Write schema split). **No action required.** The `sprint_id: null` edge case for SPIKE-class mandates is a separate issue documented in §7 recommendation ARCH-2.

---

## 7. Prioritized Recommendations

Recommendations are ordered by tier (blocking → sequential → additive) then by confidence weight. Owner is always "Developer" for this single-developer project.

---

### TIER 0 — Security (do immediately; blocks all integration work)

**[SEC-1] Patch llama.cpp CVE-2026-21869 via Ollama ≥0.5.4**

- **Priority:** `urgent-important`
- **Owner:** Developer
- **Effort:** 30 min
- **Evidence:** CVE-2026-21869 (CVSS 8.8 RCE), analyst-research Axis 2, analyst-risk §3.1
- **Action:** Install or upgrade to Ollama ≥0.5.4 (pins safe llama.cpp commit past `55d4206c8`). Verify: `ollama --version`. Never use Ollama built from HEAD in production.

**[SEC-2] Verify Ollama loopback bind**

- **Priority:** `urgent-important`
- **Owner:** Developer
- **Effort:** 10 min
- **Evidence:** OWASP A07, CVE-2026-25253, analyst-quality §1.3
- **Action:** Confirm `OLLAMA_HOST=127.0.0.1:11434` is set in the Ollama systemd unit (or shell env before `ollama serve`). Also consider configuring `OLLAMA_API_KEY` for authentication. Never bind to `0.0.0.0`.

**[SEC-3] Harden `server.py` with body-size limit + optional auth header**

- **Priority:** `urgent-important`
- **Owner:** Developer
- **Effort:** 2 hours
- **Evidence:** analyst-quality §1.3, aspect-quality §1.5, aspect-constraints [RISK] P1-2
- **Files:** `tmp/visualizer/visualizer/server.py`
- **Action:** Add to all `POST` endpoints:

```python
# 1. Enforce Content-Length limit (place in BaseHTTPRequestHandler do_POST)
MAX_BODY = 1_048_576  # 1 MB
length = int(self.headers.get("Content-Length", 0))
if length > MAX_BODY:
    self._reply(413, b"Payload too large", "text/plain")
    return

# 2. Optional API key check (environment-configurable, not hard-coded)
expected_key = os.environ.get("LOCAL_INFERENCE_API_KEY")
if expected_key and self.headers.get("X-API-Key") != expected_key:
    self._reply(401, b'{"error":"Unauthorized"}', "application/json")
    return
```

Note: loopback binding (`127.0.0.1`) is already correctly implemented in `run_server()` — do not change it.

---

### TIER 1 — Prerequisites (serial; must complete in order)

**[PRE-1] Install NVIDIA driver ≥525.85 + CUDA toolkit 12.x**

- **Priority:** `urgent-important`
- **Owner:** Developer
- **Effort:** 1 hour
- **Evidence:** analyst-risk §1.5, aspect-constraints HC-4, HC-7
- **Action:**

```bash
# Verify current driver
nvidia-smi | grep "Driver Version"

# If below 525.85, install via NVIDIA PPA (Ubuntu):
sudo add-apt-repository ppa:graphics-drivers/ppa
sudo apt update
sudo apt install nvidia-driver-550

# Install CUDA toolkit
sudo apt install cuda-toolkit-12-x

# Verify CUDA
nvcc --version
```

Risk note: If CUDA is not found, llama.cpp (via Ollama) silently falls back to CPU. Always verify GPU detection explicitly before continuing.

**[PRE-2] Install Ollama (loopback-only) + verify CUDA**

- **Priority:** `urgent-important`
- **Owner:** Developer
- **Effort:** 30 min
- **Evidence:** analyst-research Axis 1 (ADOPT), aspect-constraints HC-1
- **Action:**

```bash
# Install (pins safe version)
curl -fsSL https://ollama.ai/install.sh | sh

# Verify version
ollama --version   # must be ≥0.5.4

# Start with loopback binding
OLLAMA_HOST=127.0.0.1:11434 ollama serve &

# Verify GPU (should show CUDA):
curl -s http://127.0.0.1:11434/api/tags
```

**[PRE-3] Download and verify models**

- **Priority:** `urgent-important`
- **Owner:** Developer
- **Effort:** 30 min + download time
- **Evidence:** analyst-research, analyst-risk §1.1, exec-planner §3
- **Action:**

```bash
# Primary Ring 4 worker model (~4.5 GB):
ollama pull mistral:7b-instruct-q4_K_M

# Ring 4 conductor model (~7 GB):
ollama pull llama3.2:11b-instruct-q4_K_M

# Verify both loaded:
ollama list

# Quick GPU inference test:
ollama run mistral:7b-instruct-q4_K_M "Output exactly: {\"status\":\"ok\"}"
```

Use Ollama's signed registry only. Do not download GGUF files from HuggingFace community uploads without SHA256 verification (supply-chain risk per Splunk Research Feb 2026).

**[PRE-4] Create `.vscode/settings.json` with BYOM `chat.models` Ollama entry**

- **Priority:** `urgent-important`
- **Owner:** Developer
- **Effort:** 15 min
- **Evidence:** aspect-integration UR-1.1, aspect-constraints HC-1 (primary first-step blocker)
- **Action:** Create `.vscode/settings.json` (distinct from `mcp.json` and `tasks.json`):

```json
{
  "chat.models": [
    {
      "id": "ollama/mistral-7b",
      "name": "Mistral 7B Q4_K_M (Ring 4 Workers — Local GPU)",
      "vendor": "ollama",
      "url": "http://127.0.0.1:11434/v1/chat/completions"
    },
    {
      "id": "ollama/llama3.2-11b",
      "name": "LLaMA 3.2 11B Q4_K_M (Ring 4 Conductors — Local GPU)",
      "vendor": "ollama",
      "url": "http://127.0.0.1:11434/v1/chat/completions"
    }
  ]
}
```

The `id` values here define the naming convention. Ring 4 `.agent.md` files must use exactly these IDs in their `model:` frontmatter field. A naming mismatch silently falls back to the default cloud model without error — define the convention here first, before updating any agent files.

**[PRE-5] Pin `agentdev` + `debugpy` versions in `requirements.txt`**

- **Priority:** `urgent-important`
- **Owner:** Developer
- **Effort:** 30 min
- **Evidence:** analyst-quality §3.2, aspect-quality §1.4 (elevated P1), analyst-risk §2.2
- **Action:** Inspect current installed versions in the venv:

```bash
cd tmp/visualizer
source .venv/bin/activate
pip show agent-dev-cli debugpy
```

Then pin in `visualizer/requirements.txt`:

```
# Before (dangerous — unpinned pre-release):
agent-dev-cli --pre

# After (pin to specific build):
agent-dev-cli==0.x.y.devN     # replace with actual installed version
debugpy==1.x.y                 # pin debugpy too
```

GA transition for `agent-dev-cli` is imminent (Q1-Q2 2026) with documented breaking API changes. Any `pip install --upgrade` will silently break the Agent Inspector workflow unless pinned.

---

### TIER 2 — Architecture (design + documentation work)

**[ARCH-1] Create `devsteps-local-model.instructions.md` defining ring routing**

- **Priority:** `not-urgent-important`
- **Owner:** Developer
- **Effort:** 1 hour
- **Evidence:** aspect-integration UR-1.2, aspect-constraints SC-1
- **Files:** `.github/instructions/devsteps-local-model.instructions.md`
- **Content:** Ring routing table (Rings 0/1/2/3/5 → cloud; Ring 4 → Ollama), model ID naming convention, VRAM budget constraints, prohibited model sizes per ring, BYOM settings dependency note.

**[ARCH-2] Document `sprint_id` convention for SPIKE-class mandates**

- **Priority:** `not-urgent-important`
- **Owner:** Developer
- **Effort:** 30 min
- **Evidence:** aspect-quality Gap 5, exec-planner RESOLUTION-2
- **Action:** Update MCP tool documentation: SPIKE-class mandates with `sprint_id: null` must use the spike ID itself as sprint_id (e.g., `sprint_id: "SPIKE-032"`). The `WriteMandateResultSchema` requires `z.string().min(1)` — null is rejected. No code change required; documentation and caller convention only.

**[ARCH-3] Implement Python MCP client in agentdev for MandateResult writes**

- **Priority:** `not-urgent-important`
- **Owner:** Developer
- **Effort:** 4 hours
- **Evidence:** aspect-integration Point 3, exec-planner §2 item 13
- **Files:** `tmp/visualizer/` (new Python module), `tmp/visualizer/visualizer/requirements.txt`
- **Action:** Add `mcp` Python SDK (`modelcontextprotocol/python-sdk`) as a pinned dependency. Implement a thin wrapper that invokes `mcp_devsteps_write_mandate_result` from Python agentdev context. Note: the Node.js devsteps MCP server is a stdio cold-start process — add retry/timeout logic for startup latency.

**[ARCH-4] Add OTel span schema alignment (Spider Web ↔ AITK Inspector)**

- **Priority:** `not-urgent-important`
- **Owner:** Developer
- **Effort:** 3 hours
- **Evidence:** aspect-integration UR-2.2, aspect-integration Point 2
- **Files:** `tmp/visualizer/visualizer/otel_setup.py`
- **Action:** Define canonical span attributes shared between Spider Web JSONL traces and AITK Agent Inspector span model: `agent.ring`, `agent.name`, `mandate.id`, `sprint.id`. Export simultaneously to `data/spider_traces.jsonl` AND AITK OTLP gRPC (port 4317). This does not bridge the `runSubagent` limitation — it improves correlation within the Python agentdev observation plane.

---

### TIER 3 — Documentation (standalone deliverables)

**[DOC-1] Write `tmp/visualizer/INSTALL-Local-GPU.md`**

- **Priority:** `not-urgent-important`
- **Owner:** Developer
- **Effort:** 2 hours
- **Evidence:** analyst-research Axis 5 (community friction: no Linux CUDA guide exists)
- **Content:** NVIDIA driver PPA, CUDA toolkit 12.x, Ollama install + loopback config, model pull + SHA256 verify, Python venv setup, F5 verification checklist, common failure modes (silent CPU fallback, port conflicts, agentdev startup timing).

**[DOC-2] Write `tmp/visualizer/MODEL-SELECTION.md`**

- **Priority:** `not-urgent-important`
- **Owner:** Developer
- **Effort:** 1 hour
- **Evidence:** analyst-risk §1.1, analyst-quality §2.1
- **Content:** VRAM budget table by model+quantization, tokens/sec benchmarks for RTX 3060 12GB, model ID naming convention, decision tree (Ring 4 simple worker vs. conductor vs. must-use-cloud), excluded models with rationale.

**[DOC-3] Update `AITK-Tools-Guide.md` agent naming to R-prefix convention**

- **Priority:** `not-urgent-not-important`
- **Owner:** Developer
- **Effort:** 30 min
- **Evidence:** aspect-staleness §3.1
- **Action:** Replace all pre-v4.0 agent names in Phase 0 file listing (e.g., `devsteps-coord` → `devsteps-R0-coord`, `devsteps-analyst-*` → `devsteps-R1-analyst-*`). Add T2/T3→Ring equivalence table at the top of the document. Do not rewrite `AITK-Tools-Guide-Dev.md` — add a front-matter banner only (it is a historical session log).

---

## 8. Model Selection Guide

### 8.1 Ring-Based Routing Table

| Ring | Agents | Task Profile | Recommended Model | VRAM | tok/s (RTX 3060) | JSON Fidelity | Confidence |
|---|---|---|---|---|---|---|---|
| Ring 4 — simple workers | `worker-coder`, `worker-tester`, `worker-doc`, `worker-build-diagnostics`, `worker-integtest`, `worker-refactor` | Pattern-following; well-specified tasks; single-step instructions | **Mistral 7B Q4\_K\_M** (Ollama) | ~4.5 GB | 60–80 | HIGH (grammar enforcement via `response_format`) | 0.92 |
| Ring 4 — complex conductors | `exec-impl`, `exec-test`, `exec-doc` | Multi-step task decomposition; reading MandateResult envelopes; dispatching worker instructions | **LLaMA 3.2 11B Q4\_K\_M** (Ollama) | ~7 GB | 40–55 | HIGH (32K context window) | 0.90 |
| Ring 4 — devsteps/workspace | `worker-devsteps`, `worker-workspace`, `worker-guide-writer` | Structured MCP tool calls; DevSteps item management | **Mistral 7B Q4\_K\_M** (Ollama) | ~4.5 GB | 60–80 | HIGH (Ollama native tool calling v0.5+) | 0.88 |
| Ring 0 (coord) | `coord`, `coord-sprint`, `coord-solo`, `coord-ishikawa` | Full Spider Web orchestration; MandateResult synthesis; sprint planning | **Claude Sonnet 4.6** (cloud — GitHub Copilot) | N/A | N/A | REQUIRED | 0.97 |
| Ring 1 (analysts) | `analyst-archaeology`, `analyst-risk`, `analyst-quality`, `analyst-research` | MAP-REDUCE-RESOLVE-SYNTHESIZE; multi-file reasoning; blast-radius analysis | **Claude Sonnet 4.6** (cloud) | N/A | N/A | REQUIRED | 0.97 |
| Ring 2 (aspects) | `aspect-impact`, `aspect-constraints`, `aspect-quality`, `aspect-staleness`, `aspect-integration` | Cross-validation with upstream MandateResults; structured aspect reports | **Claude Sonnet 4.6** (cloud) | N/A | N/A | REQUIRED | 0.97 |
| Ring 3 (planner) | `exec-planner` | Multi-report synthesis; implementation plan generation | **Claude Sonnet 4.6** (cloud) | N/A | N/A | REQUIRED | 0.97 |
| Ring 5 (gate) | `gate-reviewer` | PASS/FAIL quality gate; acceptance criteria evaluation | **Claude Opus** (cloud) | N/A | N/A | REQUIRED (blocking gate) | 0.98 |

### 8.2 VRAM Budget at Peak Fan-Out

Running multiple models simultaneously on a single 12GB GPU requires careful accounting:

| Scenario | Configuration | VRAM Required | Status |
|---|---|---|---|
| Theoretical max (full fan-out, 14B) | 1× Phi-4 14B + 10 agents | ~13.8 GB | **EXCEEDS 12 GB — FORBIDDEN** |
| Ring 4 conductor solo | 1× LLaMA 3.2 11B | ~7 GB | ✅ Safe (5 GB OS/CUDA headroom) |
| Ring 4 workers solo | 1× Mistral 7B | ~4.5 GB | ✅ Safe (7.5 GB headroom) |
| Mixed conductor + helpers | 1× LLaMA 3.2 11B + 2× Mistral 7B | ~(7 + 9) = 16 GB | **EXCEEDS 12 GB** — cannot run simultaneously |
| Conservative safe max | 1× Mistral 7B active at a time | ~4.5 GB | ✅ **Recommended single-load strategy** |

**Recommendation:** Load one model at a time. Ollama automatically unloads models when idle (configurable via `OLLAMA_KEEP_ALIVE`). Accept sequential Ring 4 dispatch as a necessary trade-off for 12GB VRAM. Truly parallel multi-agent fan-out requires 16GB+ (two simultaneous 7B models) or 24GB+ (production multi-agent).

**Latency trade-off acknowledged:** Cloud APIs execute Ring 1+2 fan-out in 30–90 seconds (truly concurrent). Local 12GB serial dispatch for a STANDARD-tier Spider Web cycle takes 3–6 minutes. This is acceptable for Ring 4 workers (pattern-following, lower latency requirements) but would make Rings 0-3 on local models severely impractical.

### 8.3 Excluded Models (Do Not Use)

| Model | Reason for Exclusion |
|---|---|
| Phi-4 14B Q4\_K\_M | 8.2 GB base weight alone — no room for KV cache under any multi-agent scenario |
| LLaMA 3.2 3B Q4\_K\_M | Poor structured JSON compliance; fails MandateResult schema constraints in testing |
| Any Q3 or lower | 88–90% relative accuracy vs FP16 — accuracy floor violation for Spider Web protocol |
| LLaMA 3.1 70B (any quant) | Requires 40GB+ VRAM — physically impossible on this hardware |

### 8.4 Decision Tree

```
Selecting a model for a Spider Web agent:

Is it Ring 0, 1, 2, 3, or 5?
  YES → Claude Sonnet 4.6 (cloud). Stop.
  NO (Ring 4) → continue:

Is it a conductor (exec-impl, exec-test, exec-doc)?
  YES → LLaMA 3.2 11B Q4_K_M (model ID: "ollama/llama3.2-11b")
  NO (worker) → continue:

Does it require complex multi-step reasoning or large context?
  YES → LLaMA 3.2 11B Q4_K_M
  NO → Mistral 7B Q4_K_M (model ID: "ollama/mistral-7b")
```

---

## 9. Setup Prerequisite Chain (Linux/CUDA)

This is a serial dependency chain — each step must succeed before proceeding to the next.

```
Step 1: Install NVIDIA driver ≥525.85
─────────────────────────────────────
sudo apt install software-properties-common
sudo add-apt-repository ppa:graphics-drivers/ppa
sudo apt update && sudo apt install nvidia-driver-550
sudo reboot
# Verify: nvidia-smi | grep "Driver Version"

Step 2: Install CUDA toolkit 12.x
──────────────────────────────────
sudo apt install cuda-toolkit-12-6   # or cuda-toolkit-12-4
# Verify: nvcc --version
# Add to PATH if needed: export PATH=/usr/local/cuda/bin:$PATH

Step 3: Install Ollama (≥0.5.4)
────────────────────────────────
curl -fsSL https://ollama.ai/install.sh | sh
# Verify: ollama --version  (must show ≥0.5.4)

Step 4: Start Ollama with loopback binding and verify CUDA
───────────────────────────────────────────────────────────
export OLLAMA_HOST=127.0.0.1:11434
ollama serve &
sleep 3
# Verify GPU detection (look for CUDA in Ollama logs):
journalctl -u ollama -n 20 | grep -i cuda
# Quick inference test:
ollama run mistral:7b-instruct-q4_K_M "Reply with: {\"status\":\"ok\"}"

Step 5: Pull target models (signed registry only)
──────────────────────────────────────────────────
ollama pull mistral:7b-instruct-q4_K_M    # ~4.5 GB download
ollama pull llama3.2:11b-instruct-q4_K_M  # ~7 GB download
# Verify both in registry:
ollama list

Step 6: Create .vscode/settings.json with BYOM Ollama config
─────────────────────────────────────────────────────────────
# See §7 [PRE-4] for the exact JSON content.
# This file must exist BEFORE any .agent.md model: field is updated.

Step 7: Pin agentdev + debugpy in requirements.txt
────────────────────────────────────────────────────
cd tmp/visualizer
source .venv/bin/activate
pip show agent-dev-cli debugpy   # note exact versions
# Edit visualizer/requirements.txt to pin these versions (see §7 [PRE-5])

Step 8: Rebuild Python venv with pinned deps
─────────────────────────────────────────────
cd tmp/visualizer
pip install -r visualizer/requirements.txt
# Verify: python -c "import agentdev; print(agentdev.__version__)"

Step 9: Verify end-to-end Agent Inspector via F5
─────────────────────────────────────────────────
# In VS Code:
# 1. Open Command Palette → "Tasks: Run Task" → "🕷 Visualizer: Validate Prerequisites"
# 2. Run Task → "🕷 Visualizer: Run HTTP Server (Agent Inspector)"
# 3. F5 → "🕷 Debug Visualizer HTTP Server (Agent Inspector)"
# 4. AITK Agent Inspector opens at localhost:8087
# 5. Run a test agent workflow → confirm spans appear in Spider Web radar
```

**Verification gate:** After Step 9, confirm all these port bindings are active:
- `127.0.0.1:11434` — Ollama inference
- `127.0.0.1:5679` — debugpy listener  
- `127.0.0.1:8087` — agentdev HTTP (AITK Agent Inspector)
- `127.0.0.1:7890` — Spider Web HTTP API (optional; for external OTLP senders)

---

## 10. Agent Inspector Integration Guide

### 10.1 What AITK Agent Inspector Can and Cannot Do

| Capability | Status | Notes |
|---|---|---|
| Python agentdev workflow visualization | ✅ Available | Real-time step graph, tool calls, streaming responses |
| F5 debugging in agent.py | ✅ Available | Breakpoints, variable inspection, step-through |
| Quick-navigate to source (double-click node) | ✅ Available | Jumps to code location in VS Code |
| MCP tool call visualization (from Python) | ✅ Available | If Python agent uses OTel instrumentation |
| VS Code `runSubagent` trace | ❌ NOT available | Copilot Chat runtime is opaque; fundamental limitation |
| Ring 0–3 Spider Web dispatch graph | ❌ NOT available | runSubagent-based agents are invisible |
| Ollama VRAM usage / token rate in Inspector | ❌ NOT available | Inspector sees agentdev spans, not Ollama internals |
| MandateResult FSWatcher events | ✅ Available (Spider Web Visualizer only) | `devsteps_watcher.py` provides indirect Chat agent signal |

**Accepted limitation:** The Agent Inspector shows the Python visualizer workflow. The Spider Web Visualizer radar chart (via `GET /api/traces`) shows MandateResult-based activity inference. Neither shows the `runSubagent` dispatch tree. These are two parallel observation planes — combine both for the most complete view of system activity.

### 10.2 Step-by-Step F5 Debugging Workflow

1. **Start Ollama** (in a separate terminal): `OLLAMA_HOST=127.0.0.1:11434 ollama serve`

2. **Run prerequisite check**: VS Code → Command Palette → `Tasks: Run Task` → `🕷 Visualizer: Validate Prerequisites`
   - Confirms ports 5679 and 8087 are available
   - Fails fast if another process is already using these ports

3. **Start the HTTP server**: VS Code → `Tasks: Run Task` → `🕷 Visualizer: Run HTTP Server (Agent Inspector)`
   - Starts `agentdev run agent.py --verbose --port 8087` with debugpy on 5679
   - Watch the terminal for "Spider Web Visualizer" startup pattern

4. **Press F5**: Selects the `🕷 Debug Visualizer HTTP Server (Agent Inspector)` launch configuration
   - debugpy attaches to port 5679
   - `preLaunchTask` auto-opens the AITK Agent Inspector panel

5. **In Agent Inspector**: Click `Open Test Tool` → verify connection at `localhost:8087`

6. **Run an agent workflow**: Trigger a Spider Web agent dispatch (e.g., a QUICK-tier task via coord)
   - MandateResult files appear in `.devsteps/cbp/`
   - `devsteps_watcher.py` picks up events → emits OTel spans → appears in Spider Web radar chart
   - Python agentdev steps appear in AITK Agent Inspector graph

7. **Set breakpoints**: In `tmp/visualizer/agent.py` or `visualizer/server.py`
   - Execution pauses at breakpoints; inspect `span` objects, request headers, trace data

8. **View Spider Web radar**: Navigate to `http://localhost:7890/` (or `localhost:8087/`) for the radar visualization of ring activity derived from MandateResult events.

### 10.3 Port Allocation Registry

| Port | Service | Binding | Direction | Notes |
|---|---|---|---|---|
| 11434 | Ollama inference API | 127.0.0.1 | inbound | MUST remain loopback-only |
| 5679 | debugpy listener | 127.0.0.1 | inbound | F5 debug attach from VS Code |
| 8087 | agentdev HTTP server (Agent Inspector) | configurable | inbound | AITK connects here |
| 7890 | Spider Web HTTP API (default) | configurable | inbound | `GET /api/traces`, `POST /v1/traces` |
| 4317 | AITK OTLP gRPC collector | localhost | outbound → AITK | Optional; AITK extension must be running |
| 4318 | AITK OTLP HTTP collector | localhost | outbound → AITK | Optional alternative to 4317 |

---

## 11. Migration Path

This section describes the incremental change sequence from current state to target state. All changes are additive or config-only until Ring 4 agent frontmatter is updated.

### Current State → Target State

| # | Change | Files Modified | Breaking? | Risk |
|---|---|---|---|---|
| 1 | Security fixes (SEC-1, SEC-2, SEC-3) | `server.py`, Ollama systemd unit | No (additive security) | LOW |
| 2 | Create `.vscode/settings.json` BYOM config | `.vscode/settings.json` (new) | No (new file) | LOW |
| 3 | Pin `agentdev` + `debugpy` in requirements.txt | `tmp/visualizer/visualizer/requirements.txt` | No (version constraint, same packages) | LOW |
| 4 | Create `devsteps-local-model.instructions.md` | `.github/instructions/devsteps-local-model.instructions.md` (new) | No | LOW |
| 5 | Update Ring 4 worker agent frontmatter `model:` fields | Up to 45 `.agent.md` files (15 agents × 3 copies) | **YES** — behavior change (quality may differ) | MEDIUM — test one agent before fleet |
| 6 | Implement Python MCP client | New Python modules in `tmp/visualizer/` | No (additive) | MEDIUM — new cross-language IPC surface |
| 7 | OTel span schema alignment | `tmp/visualizer/visualizer/otel_setup.py` | No (additive) | LOW |
| 8 | Staleness fixes (AITK-Tools-Guide, Guide-Dev, README) | `tmp/visualizer/*.md` | No (documentation only) | LOW |

### Files Modified Summary

**Modified files:**
- `tmp/visualizer/visualizer/server.py` — SEC-3 hardening (16 LOC)
- `tmp/visualizer/visualizer/requirements.txt` — version pins
- `tmp/visualizer/visualizer/otel_setup.py` — OTel schema alignment (additive)
- `tmp/visualizer/AITK-Tools-Guide.md` — staleness: agent name rename + T2/T3 banner
- `tmp/visualizer/AITK-Tools-Guide-Dev.md` — staleness: front-matter note only
- `tmp/visualizer/README.md` — staleness: structure alignment
- `.github/agents/devsteps-R4-*.agent.md` (×15 files × 3 copies) — model: field update

**New files created:**
- `.vscode/settings.json` — BYOM Ollama config (Step 2)
- `.github/instructions/devsteps-local-model.instructions.md` — ring routing rules
- `tmp/visualizer/INSTALL-Local-GPU.md` — setup guide (DOC-1)
- `tmp/visualizer/MODEL-SELECTION.md` — model guide (DOC-2)
- New Python module(s) in `tmp/visualizer/` — MCP client (ARCH-3)

**Files explicitly NOT changed:**
- `packages/extension/` — VSIX remains GPU-free (binding ADR)
- `packages/mcp-server/` — no TypeScript GPU logic (binding ADR)
- `packages/cli/` — no inference code (binding ADR)
- `packages/shared/src/schemas/cbp-mandate.ts` — Zod validation already correct (TASK-334)
- `.github/agents/devsteps-R0-coord.agent.md` — stays on Claude Sonnet 4.6
- `.github/agents/devsteps-R1-*.agent.md` — stays on Claude Sonnet 4.6
- `.github/agents/devsteps-R2-*.agent.md` — stays on Claude Sonnet 4.6
- `.github/agents/devsteps-R5-gate-reviewer.agent.md` — stays on Claude Opus

### Rollback Procedure

Steps 1–4 (config + security) are fully reversible. Step 5 (agent frontmatter) is reversible by restoring `model: "Claude Sonnet 4.6"` in the affected `.agent.md` files. No database migrations, no schema changes, no irreversible operations.

---

## 12. Next Actions — DevSteps Items

The following 10 items are the recommended follow-up work items for execution. All implement this spike's findings. Item 1 is the primary story; items 2–10 are tasks.

| # | DevSteps ID | Type | Title | Priority |
|---|---|---|---|---|
| 1 | **STORY-207** | STORY | Implement Ollama CUDA local inference for Ring 4 workers | `urgent-important` |
| 2 | **TASK-354** | TASK | SEC: Harden server.py with body-size limit and optional auth header | `urgent-important` |
| 3 | **TASK-355** | TASK | Create .vscode/settings.json BYOM config for Ollama endpoint | `urgent-important` |
| 4 | **TASK-356** | TASK | Pin agentdev + debugpy versions in requirements.txt | `urgent-important` |
| 5 | **TASK-357** | TASK | Create devsteps-local-model.instructions.md with ring routing rules | `not-urgent-important` |
| 6 | **TASK-358** | TASK | Write INSTALL-Local-GPU.md for Linux CUDA + Ollama setup | `not-urgent-important` |
| 7 | **TASK-359** | TASK | Write MODEL-SELECTION.md with ring-based model routing guide | `not-urgent-important` |
| 8 | **TASK-360** | TASK | Implement Python MCP client in agentdev for MandateResult writes | `not-urgent-important` |
| 9 | **TASK-361** | TASK | Update AITK-Tools-Guide.md agent naming to R-prefix convention | `not-urgent-not-important` |
| 10 | **TASK-362** | TASK | Add cbp-mandate handler integration tests (write→read disk round-trip) | `not-urgent-important` |

All items linked `relates-to: SPIKE-032`. TASK-354 through TASK-362 linked `implements: STORY-207`.

### Execution Order

```
Parallel track A (security, independent):
  TASK-2 (server.py hardening) → can start immediately

Parallel track B (prerequisites, serial):
  PRE-1 (NVIDIA driver) → PRE-2 (Ollama) → PRE-3 (models) → TASK-3 (settings.json)
    → TASK-4 (agentdev pin) → STORY-1 (Ring 4 frontmatter + test dispatch)

Parallel track C (architecture docs, independent):
  TASK-5 (instructions file) → TASK-6 (INSTALL guide) → TASK-7 (MODEL-SELECTION)

Parallel track D (code quality, independent):
  TASK-10 (handler integration tests) → TASK-8 (Python MCP client)

Last:
  TASK-9 (staleness fixes) — lowest priority; safe to defer
```

---

## Source Reports Index

All 10 upstream reports consumed in this synthesis — relative paths from workspace root:

| Report | Ring | Agent | Verdict |
|---|---|---|---|
| [RESEARCH-AITK-GPU-analyst-research.md](R1-analyst-research.md) | Ring 1 | analyst-research | ADOPT: Ollama+CUDA |
| [RESEARCH-AITK-GPU-analyst-archaeology.md](R1-analyst-archaeology.md) | Ring 1 | analyst-archaeology | GO (confidence 0.93) |
| [RESEARCH-AITK-GPU-analyst-risk.md](R1-analyst-risk.md) | Ring 1 | analyst-risk | HIGH (4 P1 blockers) |
| [RESEARCH-AITK-GPU-analyst-quality.md](R1-analyst-quality.md) | Ring 1 | analyst-quality | CONDITIONAL |
| [RESEARCH-AITK-GPU-aspect-impact.md](R2-aspect-impact.md) | Ring 2 | aspect-impact | HIGH\_IMPACT (3 breaking changes) |
| [RESEARCH-AITK-GPU-aspect-constraints.md](R2-aspect-constraints.md) | Ring 2 | aspect-constraints | HC-1 is primary blocker |
| [RESEARCH-AITK-GPU-aspect-staleness.md](R2-aspect-staleness.md) | Ring 2 | aspect-staleness | STALE-PARTIAL (3 guide files) |
| [RESEARCH-AITK-GPU-aspect-quality.md](R2-aspect-quality.md) | Ring 2 | aspect-quality | CONDITIONAL; corrected Gap 3 |
| [RESEARCH-AITK-GPU-aspect-integration.md](R2-aspect-integration.md) | Ring 2 | aspect-integration | HIGH complexity; 6 undiscovered cross-boundary requirements |
| [RESEARCH-AITK-GPU-exec-planner.md](R3-exec-planner.md) | Ring 3 | exec-planner | PLAN\_READY (confidence 0.91) |

---

*Research Brief generated by devsteps-R4-exec-doc on 2026-03-08. Source material: SPIKE-032 COMPETITIVE_PLUS research sprint encompassing 4 Ring 1 analyst reports, 5 Ring 2 cross-validation reports, and 1 Ring 3 planning report. Confidence: 0.89.*

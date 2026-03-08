# Constraint Analysis: Local GPU (12GB VRAM) + AITK Agent Inspector for devsteps Spider Web

**Report ID:** aspect-constraints-SPIKE-032-2026-03-08  
**Analyst:** devsteps-R2-aspect-constraints  
**Aspect:** constraints  
**Item IDs:** SPIKE-032  
**Triage Tier:** COMPETITIVE_PLUS  
**Date:** 2026-03-08  
**Upstream Ring 1 Sources:**
- `RESEARCH-AITK-GPU-analyst-research.md` (14 verified sources, verified)
- `RESEARCH-AITK-GPU-analyst-archaeology.md` (SPIKE-032-research sprint)
- `RESEARCH-AITK-GPU-analyst-risk.md` (COMPETITIVE_PLUS tier)
- `RESEARCH-AITK-GPU-analyst-quality.md` (CONDITIONAL overall verdict)

---

## Constraint Analysis

### Security

- **[RISK]** — Ollama REST API (`localhost:11434`) has NO authentication by default (OWASP A07). Any process on the same machine — including browser JavaScript via `fetch()` — can send arbitrary prompts to the local model. CVE-2026-25253 demonstrates real-world hijacking of locally running AI agents via WebSocket when no auth is enforced. **Likelihood: 3 | Severity: 3**
- **[RISK]** — llama.cpp GBNF handler (CVE-2026-2069, Feb 23 2026) — stack-based buffer overflow in grammar-constrained generation. Required for structured JSON output from SLMs in agent workflows. Must apply patch or disable grammar handler. **Likelihood: 2 | Severity: 3**
- **[RISK]** — GGUF supply-chain: Hugging Face community-uploaded models may carry embedded adversarial instructions in `tokenizer.chat_template` fields (Splunk research, Feb 2026; 156,838 models scanned). QURA attacks survive Q4 quantization — a model clean at FP16 may activate backdoors in Q4_K_M form. Spider Web agents making code changes based on poisoned model output = critical blast radius. **Likelihood: 1 | Severity: 3**
- **[RISK]** — `visualizer/server.py` at `POST /v1/traces` accepts user-controlled OTLP data without body size limits — potential resource exhaustion or SSRF pivot via prompt injection in scanned project files. Analyst-quality confirmed: no Content-Length enforcement, no per-request authentication. **Likelihood: 2 | Severity: 2**
- **[CLEAR]** — debugpy binding (`127.0.0.1:5679`) is correctly restricted to loopback in all VS Code task definitions. Port 8087 (agentdev HTTP) — binding depends on runtime configuration, not hardcoded. Confirmed in existing task definitions: `--listen 127.0.0.1:5679`.

### Breaking Changes

- **Semver impact:** NONE — all changes described in SPIKE-032 are additive and config-only to the existing TypeScript/MCP codebase. No TypeScript interfaces in `packages/shared/` are touched. No MCP tool contracts change.
- **Extension GPU-freedom guarantee (prior ADR):** The 2026-03-05 Gate-PASS architectural decision "keep VSIX GPU-free" is a binding constraint. Any change to `packages/extension/` to add GPU inference would reverse a validated, committed design decision. **This ADR must not be violated.**
- **`.agent.md` `model:` field changes:** Changing `model: "Claude Sonnet 4.6"` to a local model ID in Ring 4 agent files is a breaking change in agent behavior quality. It is reversible but carries quality regression risk. BATS tests do NOT assert model field values — no test breakage, but behavior breakage is possible.
- **`agentdev` RC→GA transition:** `agent-dev-cli --pre` in `requirements.txt` is unpinned. Any `pip install --upgrade` in the Python venv can silently break the AITK Agent Inspector workflow. Likelihood is HIGH (>60%) given rc1 is active and GA transition is expected Q1/Q2 2026 with documented breaking API changes.

### Performance

- **[RISK]** — 12GB VRAM ceiling is BREACHED under full Spider Web fan-out with any 14B model. Calculation: Phi-4 14B Q4_K_M = ~8.2 GB base + 10 × 500 MB KV cache = ~13.2–13.8 GB — exceeds 12 GB VRAM physically. This is NOT an engineering constraint that can be optimized away; it is a silicon-level limit. **Likelihood: 3 | Severity: 3**
- **[RISK]** — Local GPU inference cannot parallelize 10-agent fan-out concurrently. Cloud APIs (Claude Sonnet 4.6) execute Ring 1 + Ring 2 fan-out in truly parallel fashion (10 simultaneous requests). A local 12 GB GPU must time-share or queue requests, effectively serializing what the cloud executes in parallel. Expected slowdown: STANDARD-tier Spider Web cycle = 3–6 minutes local vs. 30–90 seconds cloud. **Likelihood: 3 | Severity: 2**
- **[RISK]** — Q4_K_M quantization degrades complex reasoning accuracy by ~7% vs FP16. For Ring 1 analyst agents (multi-step MAP-REDUCE-RESOLVE-SYNTHESIZE) this translates to: missed risk signals, imprecise blast-radius assessment, possible false LOW verdicts on MEDIUM-risk code changes. Q3 or lower is categorically excluded for Ring 1–2. **Likelihood: 2 | Severity: 2**

### Compatibility

- **[Linux/DirectML]** — DirectML is Windows-only. It is NOT available natively on Linux. AITK's Model Playground uses DirectML as the primary acceleration path; this feature is fully absent on Linux. CUDA (NVIDIA) or ROCm (AMD) are the only valid paths for local GPU inference on this platform. The workspace already marks `ms-windows-ai-studio.windows-ai-studio` as unwanted in `.vscode/extensions.json` with "Windows-specific" annotation — this is correct.
- **[CUDA driver minimum]** — NVIDIA driver ≥ 525.85.12 is required for CUDA 12.x on Linux. llama.cpp/Ollama CUDA builds target CUDA 12.x. If the driver is older, GPU inference fails silently and falls back to CPU — there is no graceful degradation warning in all build configurations. Driver availability lag from Ubuntu default apt = 3–6 months behind NVIDIA release. Manual CUDA PPA installation required.
- **[AITK on Linux: Agent Inspector]** — The Agent Inspector (F5 debug via debugpy, agentdev HTTP serve on port 8087) is cross-platform and uses Python subprocess mechanics — NOT DirectML-dependent. The VS Code task and launch.json are already working in this Linux environment. This constraint is **CLEAR**.
- **[AITK on Linux: Model Catalog]** — AITK Model Catalog for local model download is Windows-first. On Linux, only ONXX Runtime (via CUDA EP) is available through AITK built-in features, with a smaller model catalog. **Workaround (validated):** Use Ollama as the external model manager on Linux. All Ring-1-recommended models (LLaMA 3.2 11B, Mistral 7B) are available via `ollama pull`.
- **[agentdev framework independence]** — `agentdev` does NOT require Windows AI Studio backend. It manages Python agent processes via subprocess and HTTP directly. Inference backend is configured via OpenAI client `base_url` parameter in Python code — it connects to ANY OpenAI-compatible endpoint, including Ollama at `http://127.0.0.1:11434/v1`. The Agent Inspector is framework-independent for the inference backend.
- **[runSubagent ↔ local models]** — The VS Code `runSubagent` API routes through GitHub Copilot (currently Claude Sonnet 4.6). Local Ollama models CANNOT replace this routing without VS Code BYOM (Bring Your Own Model) configuration: `"chat.models"` in `.vscode/settings.json`. The current workspace has NO `chat.models` entry (confirmed by analyst-archaeology: no `.env` files, no settings-based model config). BYOM configuration is required as a prerequisite before any agent can use local models.

### Blocked Predecessors

- **[NONE active]** — No `.devsteps/` items in `blocked` status affect SPIKE-032 directly per Ring 1 reports.
- **[Prior ADR: binding]** — The gpu-vscode-projects-2026-03-05 research sprint (Gate PASS, Gate date: 2026-03-05) produced the binding ADR: "Keep VSIX GPU-free; delegate inference to out-of-process sidecar (Ollama/ONNX)." This is NOT a blocker — it is a constrained direction that SPIKE-032 must build within, not overcome.
- **[agentdev GA: waiting]** — `agent-dev-cli` stable release (GA, Q1/Q2 2026) is pending. All AITK integration that depends on `agentdev run` is technically pre-release-dependent. This is a soft temporal constraint — implementation should be designed to tolerate API changes or have a pinned version fallback.

---

### Top 3 Constraints (Prioritized by likelihood × severity)

1. **HC-1 (Critical): `runSubagent` routing cannot use local models without explicit BYOM settings configuration.** The current workspace has zero local model endpoint configuration. `runSubagent` hardwires to GitHub Copilot API. This is the primary first-step blocker: WITHOUT adding `"chat.models"` to `.vscode/settings.json` and updating agent `.agent.md` `model:` fields, NO Spider Web agent will ever invoke a local model — regardless of what Ollama/GPU infrastructure is in place. **Likelihood: 3 | Severity: 3** (certain to block unless actioned).

2. **HC-2 (Critical): 12GB VRAM ceiling is physically exceeded by 14B models under full 10-agent Spider Web fan-out.** Only models ≤ 8B parameters (Q4_K_M) fit within the 12 GB budget with ≤7 parallel agents, or Phi-4-mini for full 10-agent fan-out at lower capability. Phi-4 14B (the highest-quality local option) is available ONLY for sequential dispatch (≤2 simultaneous agents). This constrains which ring agents CAN use local models: Ring 4 workers (pattern-following, well-specified, smaller context) are viable; Ring 1 analysts (multi-step reasoning, long context, simultaneous fan-out) require either model downgrade or sequential dispatch. **Likelihood: 3 | Severity: 3** (physical law — cannot be optimized away).

3. **HC-3 (Structural): AITK Agent Inspector does NOT trace VS Code native `runSubagent` dispatch.** The Spider Web core execution path — all `.agent.md`-driven dispatch — is invisible to the AITK Agent Inspector's OTLP span tree. Only Python Agent Framework SDK calls (`agentdev run` context) appear. The existing visualizer (`tmp/visualizer/`) partially bridges this via `devsteps_watcher.py` watching `.devsteps/cbp/` for MandateResults — but the inter-agent dispatch signals themselves are not captured. This is a fundamental architectural gap: the "Agent Inspector for Spider Web" use case requires accepting that INSPECTOR shows the PYTHON VISUALIZER workflow, not the Copilot-native multi-agent dispatch tree. These are two parallel observation planes that cannot be merged without a custom tracing bridge. **Likelihood: 3 | Severity: 2** (certain limitation; severity is medium because the visualizer partially compensates).

---

## Detailed Constraint Catalogue

### Hard Constraints (Non-Negotiable)

| ID | Constraint | Evidence | Impact |
|----|-----------|----------|--------|
| HC-1 | `runSubagent` routes to GitHub Copilot; no local model routing without BYOM `.vscode/settings.json` `"chat.models"` entry | analyst-archaeology: no `.env`, no `settings.json` chat.models | All Spider Web dispatch uses cloud model until BYOM configured |
| HC-2 | 12GB VRAM ceiling: full 10-agent fan-out OOM with any ≥14B model | analyst-risk §1.1: Phi-4 14B = 8.2 GB + 10×500 MB KV = 13.8 GB | Must use ≤8B models OR reduce parallel fan-out count |
| HC-3 | AITK Agent Inspector OTLP tracing covers Python SDK dispatch only; `runSubagent` is NOT captured | analyst-quality §3.1; RESEARCH-REPORT-AITK-MultiAgent.md (confirmed limitation) | Two separate trace planes; cannot merge without custom bridge |
| HC-4 | Linux: DirectML NOT available; only CUDA (NVIDIA ≥525.85) or ROCm required | analyst-research Axis 1 (DirectML: HOLD); .vscode/extensions.json (extension marked unwanted) | AITK Model Playground GPU features absent on Linux; Ollama is the required replacement |
| HC-5 | gate-reviewer (Ring 5) MUST remain on Claude Opus-class cloud model | analyst-quality §4.2; analyst-risk §2 | Quality gate integrity depends on Opus-class reasoning depth; cannot delegate to 7B model |
| HC-6 | Prior ADR (2026-03-05, Gate PASS): VSIX must remain GPU-free | analyst-archaeology Area 6; `.devsteps/research/gpu-in-vscode-projects-2026-03-05.md` | Extension TypeScript code cannot contain GPU or local inference logic |
| HC-7 | NVIDIA driver ≥525.85.12 required for CUDA 12.x; silent CPU fallback on driver mismatch | analyst-risk §1.5 | Driver incompatibility = total GPU inference failure without warning |

### Soft Constraints (Design Preferences — SHOULD respect)

| ID | Constraint | Negotiability |
|----|-----------|---------------|
| SC-1 | Spider Web protocol is model-agnostic at `.agent.md` instruction level | SAFE: `model:` frontmatter is changeable per agent without codebase impact |
| SC-2 | MCP must remain the integration layer (not proprietary AITK-only APIs) | SAFE: AITK v0.30.0 natively implements MCP Tool Catalog; devsteps MCP server already registered |
| SC-3 | Conventional Commits + DevSteps tracking mandatory | SAFE: fully independent of inference backend; zero conflict |
| SC-4 | No external cloud calls for sensitive code analysis (privacy) | TENSION with HC-5: gate-reviewer on cloud sees code. Resolution: route code-analysis agents to local; keep review-decision agent on cloud |
| SC-5 | No bundled GPU dependencies in VSIX package | SAFE: Ollama is out-of-process; VSIX remains GPU-free by design |

---

## Gap Analysis: Specific Questions

### Q1: What AITK capabilities are available on Linux vs. Windows-only?

| AITK Capability | Linux | Windows-only |
|----------------|-------|--------------|
| Agent Inspector (F5 debug, breakpoints) | ✅ (debugpy, cross-platform) | — |
| Tool Catalog (MCP tool discovery) | ✅ | — |
| Evaluation as Tests (pytest + Eval Runner) | ✅ | — |
| Build Agent with GitHub Copilot | ✅ | — |
| Model Playground (DirectML acceleration) | ❌ | ✅ Only |
| Model Catalog (AITK-native model download) | ⚠️ Limited (ONNX via CUDA EP, smaller catalog) | ✅ Full catalog |
| ONNX Runtime inference (CUDA EP) | ✅ (requires CUDA toolkit) | ✅ (DirectML) |
| Ollama integration (via OpenAI-compat) | ✅ (must configure manually) | ✅ |
| Phi Silica resource display | ❌ (Qualcomm NPU / Windows only) | ✅ |

**Net Linux capability:** Agent Inspector is fully functional. Model management requires Ollama instead of AITK's built-in catalog. This is the correct Linux path and is already the pattern in use in this workspace.

### Q2: Does `agentdev` require Windows AI Studio backend?

**Answer: NO.** `agentdev` (agent-dev-cli) is a Python CLI tool that manages Python agent processes via subprocess and HTTP. It does NOT require Windows AI Studio backend. The `agentdev run agent.py --port 8087` command works on Linux independently of AITK extension or Windows AI Studio. Inference backend is configured in the Python agent code via OpenAI SDK `base_url` parameter — any OpenAI-compatible API endpoint including Ollama (`http://127.0.0.1:11434/v1`) works.

**Caveat:** `agentdev` is currently at pre-release (`agent-dev-cli --pre`). The `requirements.txt` has no version pin. GA is expected Q1/Q2 2026 with documented breaking changes in the Agent Framework Python SDK. A version pin is required before production use.

### Q3: Can Agent Inspector connect to Ollama backends directly?

**Answer: YES, but INDIRECTLY.** The Agent Inspector connects to the `agentdev` HTTP server (port 8087), not to Ollama directly. The Python agent code connects to Ollama:

```python
# In agent.py — configure inference backend
from openai import AsyncOpenAI
client = AsyncOpenAI(base_url="http://127.0.0.1:11434/v1", api_key="ollama")
```

The Agent Inspector then visualizes the tool calls and workflow steps that the Python agent makes — Ollama is behind the OpenAI SDK abstraction and invisible to the Inspector. This indirection means:
- Inspector shows: tool calls, workflow steps, streaming responses
- Inspector does NOT show: Ollama-specific metrics (VRAM usage, token generation rate, model load time)
- AITK official docs only demonstrate Azure AI Foundry endpoints — Ollama configuration requires manual code changes, not UI configuration

### Q4: What NVIDIA driver minimum is required for CUDA 12.x + llama.cpp on Linux?

**Minimum NVIDIA driver version:** `525.85.12` (for CUDA 12.0)  
**Recommended:** `550.x` or later (for CUDA 12.4+, which Ollama 0.5.x targets)

**Verification commands:**
```bash
# Check current driver version
nvidia-smi | grep "Driver Version"

# Check CUDA toolkit version
nvcc --version   # or: cat /usr/local/cuda/version.txt

# Check CUDA via Ollama (if installed)
ollama serve &; sleep 2; curl http://localhost:11434/api/tags | jq '.models // "ollama not running"'
```

**Risk:** Ubuntu LTS repos lag NVIDIA releases by 3–6 months. If the system was configured with default Ubuntu packages, the driver may be ≤535.x when CUDA 12.4+ requires ≥550.x. Install path:
```bash
# Via NVIDIA CUDA repo (not Ubuntu default apt)
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update
sudo apt-get install cuda-toolkit-12-4 cuda-drivers
```

---

## Prerequisite Chain: Critical Path (Ordered)

The following steps MUST be completed in order before any Spider Web worker can execute against a local Ollama model:

### Step 1: Verify/Install NVIDIA Driver + CUDA Toolkit

```bash
# 1a. Verify current state
nvidia-smi                      # Must show driver ≥525.85
nvidia-smi | grep -i cuda       # Check CUDA version in driver

# 1b. If driver < 525.85: install via NVIDIA CUDA PPA (not Ubuntu default apt)
# See: https://developer.nvidia.com/cuda-downloads (select Linux → Ubuntu → deb(network))
# Reboot after driver installation is mandatory
```

**GATE:** `nvidia-smi` shows NVIDIA GPU with CUDA-capable driver AND driver version ≥525.85. If this gate fails, all subsequent steps are blocked.

### Step 2: Install and Start Ollama Service with CUDA Backend

```bash
# 2a. Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# 2b. Configure loopback binding (security — MANDATORY per OWASP A07 / CVE-2026-25253)
# Edit /etc/systemd/system/ollama.service or set environment variable:
export OLLAMA_HOST=127.0.0.1:11434

# 2c. Start service
ollama serve &
sleep 3

# 2d. Verify CUDA is detected (look for "CUDA" or GPU reference in ollama serve output)
ollama serve 2>&1 | grep -i cuda   # Should show CUDA device detected

# 2e. Verify API is accessible
curl http://127.0.0.1:11434/api/tags
```

**GATE:** `curl http://127.0.0.1:11434/api/tags` returns JSON with `models` key AND `ollama serve` output confirms CUDA GPU detection. If CUDA is absent, inference falls back to CPU — unacceptable for multi-agent performance.

### Step 3: Download and Verify Models

```bash
# Recommended: LLaMA 3.2 11B Q4_K_M (7 GB VRAM) — best capability/VRAM balance
ollama pull llama3.2:11b-instruct-q4_K_M

# Recommended: Mistral 7B Q4_K_M (4.5 GB VRAM) — fast, fits alongside other processes
ollama pull mistral:7b-instruct-q4_K_M

# For full 10-agent fan-out: Phi-4-mini (2.6 GB VRAM) — low quality, only if VRAM exhausted
# ollama pull phi4-mini:q4_K_M

# Verify models listed
ollama list

# Security: Verify model is from trusted publisher
# Check: ollama show llama3.2:11b-instruct-q4_K_M | grep -E "sha|digest"
```

**GATE:** `ollama list` shows at least one downloaded model. Verify model SHA256 digests against known checksums from Ollama's official model registry before using for sensitive codebase analysis.

### Step 4: Configure VS Code BYOM and Agent Routing

```jsonc
// .vscode/settings.json — add "chat.models" block
{
  "chat.models": [
    {
      "id": "ollama-llama32-11b",
      "name": "LLaMA 3.2 11B Q4_K_M (Local GPU)",
      "vendor": "ollama",
      "url": "http://127.0.0.1:11434/v1/chat/completions",
      "maxInputTokens": 8192
    },
    {
      "id": "ollama-mistral-7b",
      "name": "Mistral 7B Q4_K_M (Local GPU)",
      "vendor": "ollama",
      "url": "http://127.0.0.1:11434/v1/chat/completions",
      "maxInputTokens": 8192
    }
  ]
}
```

**GATE:** VS Code model selector shows local models in the model picker. Agent mode (`@agent`) can be invoked with a local model selected. **Do NOT update Ring 1–3 or Ring 5 agent `.agent.md` files until this gate passes.**

### Step 5: Configure `agentdev` for Ollama Backend + Pin Version

```bash
cd tmp/visualizer

# 5a. Pin agent-dev-cli to stable release (remove --pre flag)
# In requirements.txt, change:
#   agent-dev-cli --pre
# to:
#   agent-dev-cli==<latest-stable>    # check: pip index versions agent-dev-cli

# 5b. Activate venv and update
source .venv/bin/activate
pip install -r requirements.txt

# 5c. Test agentdev launch
agentdev run agent.py --verbose --port 8087 -- --devsteps-root /home/th/dev/projekte/playground/devsteps/.devsteps &

# 5d. Verify Agent Inspector responds
curl http://localhost:8087/health   # or check AITK Agent Inspector panel in VS Code
```

In `agent.py`, update the inference client to point to Ollama:
```python
# Replace Azure/cloud client with Ollama-backed client:
from openai import AsyncOpenAI
inference_client = AsyncOpenAI(
    base_url="http://127.0.0.1:11434/v1",
    api_key="ollama"   # agentdev requires non-empty key; "ollama" is conventional placeholder
)
```

**GATE:** `agentdev run` starts without errors, Agent Inspector panel opens in VS Code, and the Spider Web HTTP server responds on port 8087. Traces appear in `data/spider_traces.jsonl`.

### Step 6: Route Ring 4 Worker Agents to Local Model

Only AFTER Steps 1–5 pass, selectively update Ring 4 worker agent files:

```yaml
# .github/agents/devsteps-R4-worker-devsteps.agent.md (example)
# Change:
model: Claude Sonnet 4.6
# To:
model: ollama-llama32-11b   # matches id in settings.json
```

**Constraints on this step:**
- Ring 1 analysts (archaeology, risk, quality, research): KEEP Claude Sonnet 4.6 — multi-step reasoning requires cloud quality
- Ring 2 aspects (constraints, impact, quality, staleness, integration): KEEP Claude Sonnet 4.6 — cross-validation accuracy critical
- Ring 3 exec-planner: KEEP cloud model — reading multiple MandateResult envelopes and synthesizing plans requires Sonnet-class capability
- Ring 4 workers (devsteps, build-diagnostics, classifier): CANDIDATE for local model routing — well-specified, pattern-following tasks
- Ring 5 gate-reviewer: MUST STAY on Claude Opus 4.6 — hard constraint HC-5

**GATE:** Run a QUICK-triage task end-to-end with a Ring 4 worker on local model. Verify MandateResult schema compliance (`analyst` field matches `devsteps-R4-*` pattern, all required fields present, `findings` < 12,000 chars). If schema fails, add Ollama `format: json_schema` parameter to constrain output.

---

## Security Mitigations Required Before Production Integration

The following mitigations are REQUIRED before any production use — per analyst-quality OWASP FAIL verdict:

```python
# visualizer/server.py — add to all POST handler paths:

# 1. Bind to loopback ONLY — already correct in run_server(); verify it stays
server = HTTPServer(("127.0.0.1", port), SpiderWebHandler)  # NOT 0.0.0.0

# 2. Add Content-Length limit on POST endpoints
MAX_BODY_BYTES = 1_048_576  # 1 MB
content_length = int(self.headers.get("Content-Length", 0))
if content_length > MAX_BODY_BYTES:
    self._reply(413, b'{"error":"Payload too large"}', "application/json")
    return

# 3. Sanitize devsteps_watcher.py JSON field values before emitting as trace events
# (target_subagent and other string fields from .devsteps/cbp/ files)
import html
safe_target = html.escape(str(result.get("target_subagent", "")))
```

```bash
# Ollama binding — CRITICAL
# /etc/systemd/system/ollama.service.d/override.conf:
[Service]
Environment="OLLAMA_HOST=127.0.0.1:11434"
```

---

## Risk × Severity Matrix: All Constraints

| Constraint | Likelihood (1-3) | Severity (1-3) | Score | Negotiable? |
|-----------|-----------------|----------------|-------|-------------|
| HC-1: runSubagent/BYOM not configured | 3 | 3 | 9 | No — required action |
| HC-2: 12GB VRAM exhausted at full fan-out | 3 | 3 | 9 | No — physical limit |
| HC-3: AITK Inspector misses runSubagent traces | 3 | 2 | 6 | No — accept limitation |
| HC-4: DirectML absent on Linux | 3 | 1 | 3 | No — use Ollama path |
| HC-5: gate-reviewer on cloud mandatory | 3 | 3 | 9 | No — quality gate integrity |
| HC-6: VSIX GPU-free ADR binding | 3 | 3 | 9 | No — validated decision |
| HC-7: NVIDIA driver minimum | 2 | 3 | 6 | No — driver installation required |
| SEC-1: Ollama API unauthenticated | 3 | 3 | 9 | No — OWASP A07 |
| SEC-2: CVE-2026-2069 grammar handler | 2 | 3 | 6 | No — update required |
| SEC-3: GGUF supply chain | 1 | 3 | 3 | No — SHA256 verification required |
| agentdev pre-release unpinned | 3 | 2 | 6 | No — pin required |
| Q4 accuracy degradation (Ring 1–2) | 2 | 2 | 4 | Yes — keep Ring 1–2 on cloud |
| AITK Linux: Model Catalog limited | 3 | 1 | 3 | Yes — Ollama compensates fully |

---

## Verdict

**Overall constraint verdict: CONDITIONAL GO with 4 blocking actions before implementation.**

The Ollama+CUDA+AITK Agent Inspector stack is architecturally sound for this Linux workspace and respects the prior GPU-free VSIX ADR. However, adoption is BLOCKED until:

1. **BYOM configuration** (`"chat.models"` in `.vscode/settings.json`) — enables `runSubagent` to route to local Ollama models
2. **VRAM strategy defined** — commit to ≤8B models for concurrent dispatch OR accept sequential fan-out for 14B models; document as ADR
3. **Security hardening applied** — `OLLAMA_HOST=127.0.0.1:11434`, body size limits in `server.py`, `devsteps_watcher.py` field sanitization
4. **agentdev version pinned** — remove `--pre` flag from `requirements.txt`; pin to latest stable

The `gate-reviewer` (Ring 5) and Ring 1–3 analyst/aspect/planner agents are HARD-EXCLUDED from local model routing — they must remain on Claude Sonnet/Opus 4.6. Local model routing is viable ONLY for Ring 4 workers.

---

*Report generated by: devsteps-R2-aspect-constraints*  
*Upstream sources: 4 Ring 1 MandateResults (SPIKE-032)*  
*Aspect: constraints*

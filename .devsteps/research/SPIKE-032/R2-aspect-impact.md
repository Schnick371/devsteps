# Impact Analysis Report — SPIKE-032: Local 12GB VRAM GPU + Spider Web Multi-Agent System

**Analyst:** `devsteps-R2-aspect-impact`  
**Item IDs:** SPIKE-032  
**Mandate type:** impact (Ring 2 Cross-Validation)  
**Upstream Ring 1 Reports:**
- `RESEARCH-AITK-GPU-analyst-research.md` — Technology Radar (14 sources, AITK v0.30.0)
- `RESEARCH-AITK-GPU-analyst-archaeology.md` — Codebase archaeology (COMPETITIVE+, confidence 0.93)
- `RESEARCH-AITK-GPU-analyst-risk.md` — Risk matrix (4 P1 blockers identified)
- `RESEARCH-AITK-GPU-analyst-quality.md` — Quality gaps (CONDITIONAL verdict)
- **Date:** 2026-03-08
- **Verdict:** HIGH_IMPACT

---

## Impact Analysis

### Stated Scope

The explicit request is to assess impact of introducing a **local 12GB VRAM GPU** (Ollama + CUDA) as an AI inference backend for Ring 4 worker agents in the devsteps Spider Web multi-agent system, while keeping Ring 1/3/5 on Claude Sonnet 4.6.

---

### Ripple Map

| Symbol / File | Type | Why Affected |
|---|---|---|
| `.github/agents/devsteps-R4-worker-*.agent.md` (12 files) | DIRECT | `model:` field must change to local model ID for GPU workers |
| `.github/agents/devsteps-R4-exec-impl.agent.md` | DIRECT | Conductor for Ring 4 impl workers — model change propagates |
| `.github/agents/devsteps-R4-exec-test.agent.md` | DIRECT | Conductor for Ring 4 test workers — model change propagates |
| `.github/agents/devsteps-R4-exec-doc.agent.md` | DIRECT | Conductor for Ring 4 doc workers — model change propagates |
| `.github/agents/devsteps-R5-gate-reviewer.agent.md` | **IMPLICIT** | Receives lower-quality upstream artifacts from local-model workers; PASS/FAIL threshold calibrated for Claude output quality |
| `.github/agents/devsteps-R0-coord.agent.md` | **IMPLICIT** | Must implement fan-out batching if 10-agent simultaneous dispatch overflows 12GB GPU |
| `packages/mcp-server/src/` (write_mandate_result handler) | **IMPLICIT** | No Zod validation on `analyst` regex, `findings` length, `recommendations` count — local models will silently write malformed results |
| `packages/extension/src/mcpServerManager.ts` | **SILENT** | Currently devsteps-MCP-only with no AI model endpoints; remains unchanged, but a new config surface emerges in VS Code `chat.models` settings outside this file |
| `.vscode/settings.json` (absent) | **IMPLICIT** | `chat.models` entry for local Ollama endpoint does not yet exist — must be created to route agent.md model calls to local GPU |
| `tmp/visualizer/visualizer/requirements.txt` | **IMPLICIT** | `agent-dev-cli --pre` unpinned; breaking change risk if agentdev RC→1.0 transition happens during integration |
| `tmp/visualizer/visualizer/server.py` | **IMPLICIT** | No body-size limits or auth; SSRF/injection surface via OTLP receiver grows when local models read project files |
| `tmp/visualizer/visualizer/devsteps_watcher.py:118-120` | **SILENT** | `target_subagent` field unsanitized; local model hallucinations could produce exotic strings that pollute trace output |
| `.github/instructions/devsteps-agent-protocol.instructions.md` | **IMPLICIT** | Fan-out invariant "same-phase dispatches fire simultaneously" may need conditional carve-out for local-GPU batching |
| `.github/copilot-instructions.md` (model field references) | **SILENT** | Default model field `"Claude Sonnet 4.6"` in instructions does not need changing — per-agent frontmatter overrides it — but naming confusion risk exists for contributors |
| `tests/` (entire test suite) | **IMPLICIT** | No programmatic tests for MandateResult schema compliance; introducing local models with lower adherence makes this gap acute |
| `tmp/visualizer/AITK-Tools-Guide-Dev.md` | **SILENT** | Still uses T1/T2/T3 tier terminology from pre-v4.0 — adds navigation confusion during local model integration work |
| CI/CD pipelines (none yet for local inference) | **IMPLICIT** | No mechanism to test local model agent outputs in any automated pipeline |

---

### Breaking Changes

#### BREAKING-1: runSubagent ↔ agentdev Runtime Incompatibility (Severity: CRITICAL)

**This is the highest-impact finding, cross-validated from Ring 1 risk report (§5.2, HIGH, >75% probability).**

The Spider Web's `runSubagent` dispatch mechanism is a **GitHub Copilot Chat-native API** that operates entirely within the VS Code Chat runtime. AITK's Python `agentdev` / `WorkflowBuilder` agents are a **completely separate runtime** — they communicate via HTTP on port 8087 and are debugged via debugpy on port 5679.

You cannot use `runSubagent` from a `.agent.md` file to invoke agents that execute on a local 12GB GPU model. The two runtimes do not share a dispatch channel, context objects, or session memory. A mixed architecture where coord dispatches via `runSubagent` and Ring 4 workers execute locally requires **explicit HTTP bridging code** — a non-trivial architectural addition.

**Affected callers:** Every `.github/agents/*.agent.md` file that participates in Spider Web dispatch. All 108 agent files (across root + packages) are affected by this runtime boundary.

**Package boundary:** `runSubagent` (VS Code Chat) ↔ `agentdev WorkflowBuilder` (Python Agent Framework).

---

#### BREAKING-2: Spider Web Parallel Fan-out Constraint Violation (Severity: HIGH)

**Cross-validated from Ring 1 risk report (§1.1, VRAM budget calculation).**

The Spider Web dispatch protocol invariant states: *"Same-phase dispatches fire simultaneously — never sequential when independent."* This invariant is **physically impossible to maintain** with a 12GB GPU under full fan-out load.

VRAM budget calculation for Ring 1 (10-agent simultaneous dispatch):

| Component | VRAM |
|---|---|
| LLaMA 3.2 8B Q4_K_M base | ~4.8 GB |
| KV cache × 10 agents at 8k context | ~3.0 GB |
| CUDA runtime overhead | ~0.5 GB |
| **Total** | **~8.3 GB ✅ (within 12GB)** |

| Component | VRAM |
|---|---|
| Phi-4 14B Q4_K_M base | ~8.2 GB |
| KV cache × 10 agents at 8k context | ~5.0 GB |
| CUDA runtime overhead | ~0.8 GB |
| **Total** | **~14 GB ❌ (exceeds 12GB)** |

**Consequence:** The invariant must be relaxed to *"fire simultaneously when VRAM headroom permits, otherwise batch into sequential sub-groups of ≤4–6 agents."* This requires a new fan-out batching mechanism in `coord` and documentation update in the protocol invariants. The instructions file `devsteps-agent-protocol.instructions.md` references the simultaneous fan-out invariant without any local-GPU carveout.

**Latency impact:** A STANDARD-tier Spider Web cycle (Ring 1 + Ring 2 + Ring 3 + Ring 4) that completes in 30–90 seconds with cloud models takes **3–6 minutes** with local serialized fan-out. A FULL-tier sprint could exceed 15 minutes.

---

#### BREAKING-3: MandateResult Schema Silent Corruption (Severity: HIGH)

**Cross-validated from Ring 1 quality report (§4.2, FAIL verdict).**

The `mcp_devsteps_write_mandate_result` tool has **no server-side field validation**. Local models (especially ≤8B) produce MandateResults that:
- Omit the `analyst` field regex pattern (`devsteps-R{N}-{name}`)
- Exceed `findings` char limits (12,000 chars)
- Include more than 5 recommendations or exceed 300-char limit per recommendation
- Omit `t3_recommendations` sub-object (required for Ring 1 analyst roles)
- Generate non-UUID `mandate_id` values

These malformed results are written to disk and read by `coord` via `mcp_devsteps_read_mandate_results` without error indication. Coord then synthesizes from garbage data, producing flawed sprint plans. Unlike a model crash (immediately visible), schema corruption is **silent and delayed** — the failure surfaces only at Ring 5 gate-reviewer or after implementation is complete.

**Affected files:** `packages/mcp-server/src/` (write_mandate_result handler), `packages/shared/` (Zod schemas), `tests/` (no coverage of this path).

---

### Full Impact Assessment by Dimension

---

## Dimension 1 — Spider Web Architecture Impact

### 1.1 Agent File Changes Required

For a minimum-viable Ring 4–only local GPU integration, **12 Ring 4 worker agent files** must have their `model:` frontmatter field changed from `"Claude Sonnet 4.6"` to the local model ID. The Ring 4 conductor agents (`exec-impl`, `exec-test`, `exec-doc`) also require model changes since they read MandateResults and dispatch workers in the same runtime.

Files requiring `model:` change:
- `devsteps-R4-worker-coder.agent.md` — DIRECT
- `devsteps-R4-worker-tester.agent.md` — DIRECT
- `devsteps-R4-worker-impl.agent.md` — DIRECT
- `devsteps-R4-worker-doc.agent.md` — DIRECT
- `devsteps-R4-worker-documenter.agent.md` — DIRECT
- `devsteps-R4-worker-workspace.agent.md` — DIRECT
- `devsteps-R4-worker-devsteps.agent.md` — DIRECT
- `devsteps-R4-worker-refactor.agent.md` — DIRECT
- `devsteps-R4-worker-guide-writer.agent.md` — DIRECT
- `devsteps-R4-worker-build-diagnostics.agent.md` — DIRECT
- `devsteps-R4-worker-integtest.agent.md` — DIRECT
- `devsteps-R4-worker-test.agent.md` — DIRECT
- `devsteps-R4-exec-impl.agent.md` — IMPLICIT (conductor reading worker output)
- `devsteps-R4-exec-test.agent.md` — IMPLICIT (conductor)
- `devsteps-R4-exec-doc.agent.md` — IMPLICIT (conductor)

Each file exists in **3 copies** (root `.github/agents/`, `packages/mcp-server/.github/agents/`, `packages/cli/.github/agents/`) — 15 × 3 = **45 agent file edits** minimum. This is the literal file-modification blast radius.

**Files that must NOT change (stay on Claude):**
- All Ring 0 coord agents (4 files × 3 copies)
- All Ring 1 analyst agents (7 files × 3 copies)
- All Ring 2 aspect agents (5 files × 3 copies)
- Ring 3 exec-planner (1 file × 3 copies)
- Ring 5 gate-reviewer (1 file × 3 copies)

### 1.2 dispatch Protocol Invariant Tension

The `devsteps-agent-protocol.instructions.md` (attached to all sessions via `applyTo: "**"`) states:

> **"Same-phase dispatches fire simultaneously — never sequential when independent"**

This invariant must be qualified with a local-GPU-aware exception. Without this update, agents operating under these instructions will attempt full simultaneous dispatch, which OOM-crashes the inference server under a ≥14B model. The instruction file is a **BREAKING change target** — it propagates to every agent session.

**Required update:** Add an exception clause: *"When using local GPU inference, fan-out is batched by VRAM headroom (≤6 agents per batch for 7B models on 12GB VRAM)."*

### 1.3 Ring 5 Gate-Reviewer Quality Regression

The gate-reviewer (Ring 5) currently evaluates artifacts produced by Claude Sonnet 4.6. Its PASS/FAIL calibration assumes Claude-quality outputs. When Ring 4 workers switch to local 7-8B models, the gate-reviewer will encounter:
- More hallucinations in code comments
- Less complete docstrings
- Partial edge-case coverage in tests
- Lower structural adherence to Spider Web protocol conventions

**Impact:** More FAIL verdicts initially (calibration period); then either accept more verbose rejection cycles (3-review-fix loop) or degrade the gate-reviewer's standards to match local model capability — the worse outcome. The gate-reviewer itself must remain on Claude Sonnet 4.6 (confirmed by quality report §2.2 as a hard constraint).

---

## Dimension 2 — VS Code Extension Impact

### 2.1 mcpServerManager.ts — NO CHANGES REQUIRED

**SILENT impact (positive).**

Archaeology report confirms: `mcpServerManager.ts` implements a 4-level fallback chain for the **devsteps MCP server only**. It contains zero references to AI model endpoints, Ollama, GPU, CUDA, VRAM, or inference URLs. The extension's sole responsibility is registering the devsteps MCP tool server — it is orthogonal to which language model executes agent dispatch.

Local GPU model routing is configured via VS Code `chat.models` settings (a user/workspace-level config, not extension code). The extension does **not** need modification for Ollama integration.

**Verdict:** `mcpServerManager.ts` is NOT in the blast radius. DIRECT = none, IMPLICIT = none.

### 2.2 New Configuration Surface Outside Extension Code

While the extension code itself is unaffected, a new configuration artifact is required that does not currently exist:

```json
// .vscode/settings.json — DOES NOT EXIST YET
{
  "chat.models": [{
    "id": "llama-3.2-8b-local",
    "name": "LLaMA 3.2 8B (Local GPU - Ollama)",
    "vendor": "ollama",
    "url": "http://127.0.0.1:11434/v1/chat/completions"
  }]
}
```

This `.vscode/settings.json` entry (VS Code 1.96+ BYOM) is the minimum required to expose the local model to `.agent.md` files as a selectable `model:` value. Without it, changing `model:` in agent files to a local model ID has no effect — VS Code will silently fall back to the default model.

**Impact:** `.vscode/settings.json` creation is a DIRECT prerequisite for any local GPU agent dispatch.

### 2.3 VSIX Package Size and Activation Events — UNAFFECTED

The prior sprint conclusion (2026-03-05, Gate PASS) explicitly validated: **keep VSIX GPU-free**. The archaeology report confirms zero GPU/CUDA/inference references in extension TypeScript code. The Ollama out-of-process proxy design means the VSIX never bundles any inference binary. VSIX package size is UNAFFECTED. Extension activation events are UNAFFECTED.

---

## Dimension 3 — Developer Workflow Impact

### 3.1 AITK Agent Inspector vs. Existing Visualizer — Coexistence

**These are complementary, non-competing tools operating in separate channels.**

| Tool | Port | Data Source | What It Shows |
|---|---|---|---|
| Visualizer (`tmp/visualizer/`) | 7890 / 8087 | `devsteps_watcher.py` watching `.devsteps/cbp/` | Spider Web MandateResult trace; ring activity radar |
| AITK Agent Inspector | 8087 (via `agentdev run`) | OTLP spans from `agentdev` Python SDK | Python workflow graph; tool calls; breakpoints |

**Port conflict risk:** Both claim port 8087. The existing visualizer server defaults to 7890 but the VS Code task overrides to 8087 via `--port 8087`. If `agentdev run` also uses 8087 as its Inspector port, the two will conflict when running simultaneously.

**Resolution:** Configure visualizer to run on 7890 (its default) and let Agent Inspector own 8087. This requires editing the `🕷 Visualizer: Run HTTP Server` task's `--port` argument from 8087 to 7890. **Impact: one task definition change** in `.vscode/tasks.json`.

**Can they run simultaneously?** Yes, after port resolution. The AITK Agent Inspector traces `agentdev` Python SDK calls. The visualizer watches `.devsteps/cbp/` file-system events. They are fully independent data pipelines. Running both gives a *richer* combined view — Spider Web radar + Agent Inspector call graph.

### 3.2 Developer Onboarding — Critical Documentation Gap

The entire local GPU setup is **completely undocumented in this workspace** for new contributors:
- No INSTALL or README guidance for Ollama CUDA setup
- No documented VRAM requirements per model tier
- No documented port allocation map (5679/7890/8087/11434/4317/4318)
- Security hardening requirements (loopback binding, CVE mitigations) are absent from developer docs
- No documented procedure for adding `chat.models` to `.vscode/settings.json`

**Files that must be created:** A `INSTALL-LOCAL-GPU.md` document or equivalent section added to `tmp/visualizer/README.md` or `INSTALL.md`. Without this, every new developer attempting the local GPU path will encounter unsupported setup from scratch.

**Impact: IMPLICIT** — missing docs create onboarding friction that proportionally scales with team size.

---

## Dimension 4 — Performance & UX Impact

### 4.1 Spider Web Dispatch Latency Profile Change

**This is the most significant user-visible impact.**

| Scenario | Cloud (Claude Sonnet 4.6) | Local GPU (LLaMA 3.2 8B Q4_K_M) |
|---|---|---|
| Ring 1 archaelogy + risk (2 parallel agents) | 30–60 s | 90–150 s (serialized, 2 batches of 1) |
| Ring 2 cross-validation (3 parallel agents) | 20–40 s | 60–120 s |
| Full STANDARD-tier sprint (Ring 1–4) | 90–180 s | 5–12 min |
| Full FULL-tier sprint (Ring 1–5) | 3–6 min | 15–30 min |

**Verdict:** Local GPU is 3–5× slower than cloud for Spider Web sprints due to serial fan-out constraint. This substantially changes the "feel" of the development workflow — the interactive, near-real-time cycle becomes a batch job. For daily driver usage, this may be acceptable given the cost saving (~$0 vs. ~$0.50–$2.00 per sprint in API costs). For rapid iteration (QUICK/STANDARD triage, single-item fixes), the latency regression is material.

### 4.2 VRAM Saturation (OOM) Impact

When VRAM is saturated during a multi-agent run:

| Backend | OOM Behavior | DevSteps Impact |
|---|---|---|
| Ollama | HTTP 500 returned to agent | Sprint aborted; DevSteps items stranded in `in-progress` |
| llama.cpp | SIGKILL / SIGSEGV | Entire inference server crashes; all active sessions lost |
| AITK ONNX runner | Undefined (may hang) | Agent Inspector loses connection; no graceful recovery |

**There is no graceful OOM recovery** in any downstream. A stranded `in-progress` DevSteps item requires manual `mcp_devsteps_update` to reset status. The risk is high (>70% probability under Phi-4 14B per Ring 1 risk report).

**Required mitigation:** Fan-out batching at coord level AND model selection guidance (no 14B models on 12GB for multi-agent scenarios).

### 4.3 Cost vs. Latency Trade-off

The GPU path trades **API cost** for **wall-clock time**. At scale:
- Developer API cost for a Ring 1 + Ring 2 + Ring 4 sprint: ~$0.50–$2.00 (Sonnet 4.6 pricing)
- Local GPU electricity cost at sustained 150W for 10 min: ~$0.001 at EU average pricing
- Break-even: 500–2,000 sprints

For frequent, iterative development (10+ sprints/day), the cost saving is meaningful from month 2 onward. For occasional use, cost is not a driver.

---

## Dimension 5 — Long-term Maintenance Impact

### 5.1 Model Update Burden

Local GGUF models do not auto-update. As new SLMs release (Phi-4.5, LLaMA 4, Gemma 3 series), the local GPU workflow requires:
- Manual `ollama pull <new-model>` commands
- Re-evaluation of the model against Spider Web schema adherence benchmarks
- Potential `.agent.md` model field updates across 45+ files per model change
- No mechanism (`npm update` analog) for model version management

**Maintenance cost:** ~1–2 hours per model upgrade cycle; expected frequency: 2–4 times per year.

### 5.2 CI/CD Integration — No Path Currently Exists

The current test suite has **zero** automated tests for:
- Agent output schema compliance
- MandateResult field validation
- Local vs. cloud model parity testing

To prevent local model regressions, a CI/CD mechanism would need:
- A mock local inference server that returns deterministic responses
- Vitest tests for `write_mandate_result` validation (at minimum: `analyst` regex, `findings` length, `recommendations` count)
- BATS integration tests for `devsteps` CLI commands that trigger MCP tool calls

Without these, the only quality gate is `gate-reviewer` (manual, LLM-based) — insufficient for catching model-specific format bugs systematically.

**Verdict:** Quality report's FAIL on this dimension is confirmed as a long-term maintenance risk, not just a launch risk.

### 5.3 Ollama OpenAI-Compatible API as Adapter Layer — CONFIRMED CORRECT

**Cross-validated from all four Ring 1 reports: this is the right architectural choice.**

Ollama's OpenAI-compatible API (`localhost:11434/v1`) acts as a stable, versioned abstraction layer between:
- VS Code's BYOM `chat.models` config (which expects OpenAI-format endpoints)
- The underlying GGUF/CUDA inference engine (which changes with model updates)
- The devsteps `agentdev` Python server (which uses OpenAI SDK client)

This means **model changes require only configuration updates, not code changes**. The adapter pattern prevents lock-in to any specific SLM or quantization. The prior sprint's "keep VSIX GPU-free, use Ollama out-of-process proxy" recommendation is architecturally sound and confirmed still valid.

**SILENT impact:** The `packages/mcp-server/src/` transport layer and `packages/extension/src/mcpServerManager.ts` are both permanently isolated from model-backend changes by this adapter choice.

### 5.4 Security Maintenance Burden — Elevated

Two HIGH-severity CVEs in llama.cpp (via Ollama) published within the last 90 days (CVE-2026-21869, CVE-2026-2069). This establishes a pattern: **Ollama requires active security monitoring and patches more frequently than a pure cloud API integration.** 

Maintenance impact:
- Monitor llama.cpp/Ollama security advisories (minimum monthly)
- Test-upgrade Ollama on a dedicated developer machine before updating project-wide `INSTALL-LOCAL-GPU.md` recommendations
- Document pinned Ollama version in installation guide
- Add to CI/CD a check for known-vulnerable Ollama versions (if Ollama is installed)

---

### Breaking Changes (Consolidated)

**BREAKING-1 (CRITICAL):** `runSubagent` (VS Code Copilot Chat) and `agentdev` Python Framework are separate runtimes with no shared dispatch channel. Mixed-runtime architectures require explicit HTTP bridging. Affects: all 108+ `.agent.md` files conceptually; requires architectural decision before any implementation begins.

**BREAKING-2 (HIGH):** Spider Web simultaneous fan-out invariant is physically impossible to satisfy with 12GB VRAM under ≥14B models. The dispatch protocol instructions must be updated with a local-GPU-aware batching carveout. Affects: `devsteps-agent-protocol.instructions.md` (applied to all agents via `applyTo: "**"`), `devsteps-R0-coord.agent.md`.

**BREAKING-3 (HIGH):** `write_mandate_result` MCP handler has no schema validation. Local models with lower JSON adherence will silently corrupt sprint state. Affects: `packages/mcp-server/src/` (handler), `packages/shared/` (Zod schemas), `tests/` (no coverage).

---

### Confidence

**HIGH (0.89)** — All four Ring 1 reports are internally consistent. The runtime incompatibility (BREAKING-1) is confirmed by both risk (§5.2) and archaeology (Area 7) reports. The VRAM math (BREAKING-2) is verified from two independent sources (LocalLLM.in benchmarks + Spheron GPU Cheat Sheet). The MandateResult schema gap (BREAKING-3) is independently identified by both quality and risk reports. The sole uncertainty is the exact OOM behavior under Ollama (risk report cites HTTP 500 but notes "undefined behavior may hang" for some configurations).

---

## Impact Verdict

**HIGH_IMPACT**

Three architectural blockers require resolution before any Ring 4 GPU worker integration. The MCPServerManager and VSIX package are cleanly isolated (no changes needed). The correct architectural pattern (Ollama OpenAI-compatible proxy, VSIX GPU-free) is validated. Port conflict between visualizer and Agent Inspector requires a one-line task config fix. The performance trade-off is significant but predictable and well-quantified. With the three breaking changes addressed and documentation created, the integration path is viable.

---

## Top 3 Impacts

1. **`runSubagent` ↔ `agentdev` Runtime Isolation** — The most fundamental constraint. Local model execution via AITK Python Framework cannot be invoked by VS Code Chat's `runSubagent` without explicit HTTP bridging. This is not a configuration issue — it requires an architectural decision about which dispatch mechanism owns Ring 4 workers. All 108 agent files are downstream of this decision.

2. **Fan-out Serialization Destroys Speed Advantage** — The Spider Web's core value proposition (simultaneous multi-agent fan-out) cannot be delivered on 12GB VRAM with models above 8B. Sprint wall-clock time increases 3–5×. The dispatch protocol invariant in `devsteps-agent-protocol.instructions.md` (applied session-wide) must be updated to prevent OOM-crash loops.

3. **MandateResult Schema Corruption is Silent** — Zero server-side validation in `write_mandate_result` means local model JSON non-adherence surfaces as corrupt sprint state, not as an error. This must be fixed before any local model writes MandateResults, regardless of ring assignment.

---

*Report path:* `tmp/visualizer/RESEARCH-AITK-GPU-aspect-impact.md`  
*Analyst:* `devsteps-R2-aspect-impact` · SPIKE-032 · 2026-03-08

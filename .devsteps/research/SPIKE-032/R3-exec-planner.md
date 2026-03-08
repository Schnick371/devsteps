# Exec-Planner Synthesis — SPIKE-032: Local 12GB GPU + VS Code AI Toolkit Agent Inspector

**Agent:** `devsteps-R3-exec-planner`  
**Mandate type:** planning  
**Item IDs:** SPIKE-032  
**Date:** 2026-03-08  
**Triage Tier:** COMPETITIVE_PLUS  
**Verdict:** PLAN_READY  
**Confidence:** 0.91  
**Upstream reports consumed:** 8 (4 Ring 1 + 4 Ring 2)

---

## Pre-MAP: Existing MandateResults Consumed

| Source | Confidence | Key Verdict |
|--------|-----------|-------------|
| `analyst-research` | 0.95 | ADOPT: Ollama+CUDA; 14 sources; 4 CVEs confirmed |
| `analyst-archaeology` | 0.93 | GO; AITK visualizer fully wired; zero GPU infra |
| `analyst-risk` | 0.92 | HIGH overall; 4 P1 blockers; VRAM budget OK for ≤8B models |
| `analyst-quality` | 0.90 | CONDITIONAL; 1 factual error corrected; Gap 3 struck |
| `aspect-impact` | 0.91 | HIGH_IMPACT; 3 breaking changes cross-validated |
| `aspect-constraints` | 0.94 | 7 hard constraints catalogued; HC-1 is primary first blocker |
| `aspect-staleness` | 0.88 | STALE-PARTIAL on 3 guide files; Reference fresh |
| `aspect-quality` | 0.92 | Gap 3 FACTUAL ERROR confirmed + corrected; 2 new gaps added |

---

## Section 1 — Conflict Resolution: Factual Errors

### RESOLUTION-1: Gap 3 Struck from Backlog (analyst-quality error, confirmed by aspect-quality)

**Finding:** `analyst-quality` Gap 3 stated: *"write_mandate_result MCP handler lacks Zod validation of the `analyst` field regex."*

**Correction confirmed by `aspect-quality` via direct code inspection:**
`packages/mcp-server/src/handlers/cbp-mandate.ts` → `handleWriteMandateResult()` already calls `WriteMandateResultSchema.safeParse()`. The schema (`packages/shared/src/schemas/cbp-mandate.ts`) enforces:
- `analyst: z.string().regex(/^devsteps-R\d+-/)` ✅
- `findings: z.string().max(12000)` ✅
- `recommendations: z.array(z.string().max(300)).max(5)` ✅

Added in TASK-334 (Read/Write schema split). **This item is STRUCK from the P1 backlog.** No implementation action required.

**Impact on backlog:** One P1 slot freed. The corrected P1 list has 4 items, not 5.

### RESOLUTION-2: `sprint_id: null` Protocol Gap (aspect-quality new finding)

**Finding:** `WriteMandateResultSchema` requires `sprint_id: z.string().min(1)` — null is rejected. Cross-spike mandates (like SPIKE-032 itself) have no sprint context and would be rejected by the validator.

**Action:** Document the protocol convention that SPIKE-type mandates use the spike ID itself as sprint_id (e.g., `sprint_id: "SPIKE-032"`). No code change required for the schema — only documentation and caller convention.

---

## Section 2 — Confidence-Weighted Recommendation Set

**Total recommendations: 22 | Priority-ordered (P1 → P4)**

---

### TIER P1 — Security (Mandatory; blocks all other integration work)

| # | Recommendation | Confidence | Owner | Effort | Evidence |
|---|---|---|---|---|---|
| 1 | **Patch llama.cpp CVE-2026-21869** (OOB via negative context range, CVSS 8.8 RCE): update Ollama to ≥0.5.x; pin the tagged release. Never use HEAD in production. | 0.97 | DevOps | Low (package update) | analyst-research Axis 2; analyst-risk §3; aspect-constraints [RISK] |
| 2 | **Patch llama.cpp CVE-2026-2069** (GBNF grammar handler stack overflow, CVSS 7.5): disable GBNF grammar if structured output is not needed; apply latest Ollama release. | 0.97 | DevOps | Low | analyst-research Axis 2; aspect-constraints [RISK] |
| 3 | **Bind Ollama API to loopback only** (`OLLAMA_HOST=127.0.0.1:11434`): OWASP A07 / CVE-2026-25253 — any same-machine process can send arbitrary prompts if port is open. Never bind to 0.0.0.0. | 0.98 | DevOps | Low (env config) | analyst-quality §1.3; aspect-quality §1.5; analyst-research §2 |
| 4 | **Harden `server.py`** with `Content-Length` body-size limit (≤1 MB on `POST /v1/traces`) and optional `X-API-Key` header check via env var `LOCAL_INFERENCE_API_KEY`. Loopback binding already correct; add per-request auth and body guard. | 0.95 | developer | Low (15 LOC) | analyst-quality §1.3; aspect-quality §1.5; aspect-constraints [RISK] |

---

### TIER P1 — Prerequisites (Serial; must complete before any agent integration)

| # | Recommendation | Confidence | Owner | Effort | Evidence |
|---|---|---|---|---|---|
| 5 | **Install NVIDIA driver ≥525.85 + CUDA toolkit 12.x** on Linux host. Verify with `nvidia-smi` + `nvcc --version`. Document in `INSTALL-Local-GPU.md`. | 0.96 | DevOps | Medium | analyst-risk §1.5; aspect-constraints HC-4, HC-7 |
| 6 | **Install Ollama with CUDA backend** (loopback-only). Test: `OLLAMA_HOST=127.0.0.1:11434 ollama serve`. Use tagged release (≥0.5.x), not HEAD. | 0.97 | DevOps | Medium | analyst-research Axis 1 (ADOPT); aspect-constraints HC-1 |
| 7 | **Download and SHA256-verify models**: LLaMA 3.2 11B Q4_K_M (~7GB) and Mistral 7B Q4_K_M (~4.5GB). Use Ollama signed registry; verify checksums before first agent use. Do NOT use Hugging Face community uploads without hash verification (GGUF supply-chain risk). | 0.93 | DevOps | Low | analyst-research §2 (supply chain); aspect-constraints [RISK] GGUF |
| 8 | **Create `.vscode/settings.json` with `chat.models` BYOM config** pointing to Ollama endpoint. Define model ID naming convention (e.g., `"ollama/llama3.2-11b"`, `"ollama/mistral-7b"`). This is HC-1 — without it, NO agent frontmatter model override takes effect. | 0.97 | developer | Low (JSON config) | aspect-integration UR-1.1; aspect-constraints HC-1 |
| 9 | **Pin `agentdev` (agent-dev-cli) version in `requirements.txt`** to specific RC build (e.g., `agent-dev-cli==0.x.y.devN`). Document pinned version. Add CI check. RC→GA transition is imminent; any `pip install --upgrade` will silently break Agent Inspector workflow. | 0.98 | developer | Low | analyst-quality §3.2; aspect-quality §1.4 (elevated to P1) |

---

### TIER P2 — Architecture Decisions (High-value; enables clean Ring routing)

| # | Recommendation | Confidence | Owner | Effort | Evidence |
|---|---|---|---|---|---|
| 10 | **Formalize Ring routing rule**: ONLY Ring 4 workers (`exec-impl`, `exec-test`, `exec-doc`, `worker-*`) route to local GPU (Ollama). Rings 0, 1, 2, 3, 5 remain on Claude Sonnet 4.6 (cloud). Rationale: local 7–11B models cannot reliably execute MAP-REDUCE-RESOLVE-SYNTHESIZE (Rings 1–2) or gate-review (Ring 5); VRAM budget supports ≤7 parallel agents at 8B model. | 0.95 | coord | Low (doc + config) | analyst-risk §1.1; analyst-quality §2.2; aspect-constraints HC-2, HC-5 |
| 11 | **Create `.github/instructions/devsteps-local-model.instructions.md`** documenting: Ring routing table, model ID naming convention, BYOM settings.json dependency, VRAM budget constraints, prohibited model size per ring. This is the authoritative reference for contributors and agents. | 0.92 | developer | Medium (doc) | aspect-integration UR-1.2; aspect-constraints SC-1 |
| 12 | **Document HTTP bridge architecture**: clarify that BYOM `chat.models` is the integration mechanism (not direct Ollama API from TypeScript); `runSubagent` routes via Copilot→BYOM→Ollama; `agentdev` Python agents connect to Ollama directly via OpenAI SDK `base_url`. The two runtimes CANNOT share dispatch channels natively. | 0.88 | developer | Low (doc in Brief) | aspect-integration Point 1; aspect-constraints HC-3 |

---

### TIER P2 — Integration (Cross-boundary requirements; 5 of 10 undiscovered by Ring 1)

| # | Recommendation | Confidence | Owner | Effort | Evidence |
|---|---|---|---|---|---|
| 13 | **Implement Python MCP client** (`mcp` SDK) in `agentdev` agents so Python-side workflow can call `mcp_devsteps_write_mandate_result` natively. Without this, Python agents cannot write MandateResults via MCP — they would need to call the Node.js MCP server via stdio cold-start on each invocation. | 0.85 | developer | High | aspect-integration Point 3 |
| 14 | **Add `mcp` Python SDK dependency to `requirements.txt`** with version pin. Separate from `agentdev` version. Use official `modelcontextprotocol/python-sdk` package. | 0.92 | developer | Low | aspect-integration package boundary |
| 15 | **Align OTel span schema** between Spider Web JSONL traces and AITK Inspector span model. Define canonical span attributes: `agent.ring`, `agent.name`, `mandate.id`, `sprint.id`. Export both to `data/spider_traces.jsonl` AND AITK OTLP gRPC (port 4317) simultaneously. | 0.80 | developer | Medium | aspect-integration Point 2 |
| 16 | **Create Python venv setup script** (`tmp/visualizer/setup.sh`) that installs pinned deps, validates CUDA availability, and checks NVIDIA driver version. Ensures reproducible environment across machines and CI. | 0.90 | DevOps | Low | aspect-integration (reproducibility); aspect-constraints HC-7 |
| 17 | **Register devsteps MCP server in AITK Tool Catalog** (in addition to existing `.vscode/mcp.json` registration). Dual registration ensures Python agentdev agents can discover tools via AITK Tool Catalog UI and `.vscode/mcp.json`-based routes simultaneously. | 0.82 | developer | Low | aspect-integration UR-4.1 |

---

### TIER P3 — Staleness Fixes (Low-effort; high reader-clarity payoff)

| # | Recommendation | Confidence | Owner | Effort | Evidence |
|---|---|---|---|---|---|
| 18 | **Update `AITK-Tools-Guide.md`** Phase 0 file listing: replace all pre-v4.0 agent names (`devsteps-coord`, `devsteps-analyst-*`) with Ring-numbered names (`devsteps-R0-coord`, `devsteps-R1-analyst-*`). Add T2/T3→Ring equivalence table at top. | 0.95 | developer | Low | aspect-staleness §3.1 |
| 19 | **Add cross-reference banner to `AITK-Tools-Guide-Dev.md`**: T2 = Ring 1+2; T3 = Ring 4; old taxonomy is historical. Do NOT rewrite the session log — add a front-matter note only. | 0.92 | developer | Low | aspect-staleness §3.2 |
| 20 | **Align `tmp/visualizer/README.md`** with actual file structure (all new report files, R-prefix naming, active ports). Remove stale references to old agent names. | 0.90 | developer | Low | aspect-staleness §3 |

---

### TIER P4 — Documentation (Standalone deliverables; exec-doc output targets)

| # | Recommendation | Confidence | Owner | Effort | Evidence |
|---|---|---|---|---|---|
| 21 | **Write `tmp/visualizer/INSTALL-Local-GPU.md`**: Linux + CUDA + Ollama setup guide. Cover: NVIDIA driver PPA, CUDA toolkit 12.x, Ollama install + loopback config, model pull + SHA256 verify, venv setup, F5 verification checklist. | 0.92 | developer | Medium | analyst-research Axis 4 (community friction: no Linux-CUDA guide) |
| 22 | **Write `tmp/visualizer/MODEL-SELECTION.md`**: ring-based model routing guide with VRAM budget table, tok/s benchmarks, model ID naming convention, and decision tree for selecting Mistral 7B vs LLaMA 3.2 11B per Ring 4 sub-role. | 0.90 | developer | Medium | analyst-risk §1.1; analyst-quality §2.1 |

---

## Section 3 — Model Selection Matrix (Final Recommendation)

**Decision basis:** VRAM budget (12 GB), parallel fan-out requirement per ring, JSON accuracy floor, and task complexity profile.

| Spider Web Ring | Recommended Model | VRAM | tok/s (RTX 3060 12GB) | Rationale | Confidence |
|---|---|---|---|---|---|
| **Ring 4 simple workers** (`worker-coder`, `worker-doc`, `worker-build`) | **Mistral 7B Q4_K_M** (Ollama) | ~4.5 GB | 60–80 | Fast, reliable JSON via `response_format: json_schema`; tool calling in Ollama v0.5+; leaves headroom for ≤7 parallel dispatches | 0.92 |
| **Ring 4 complex exec conductors** (`exec-impl`, `exec-test`) | **LLaMA 3.2 11B Q4_K_M** (Ollama) | ~7 GB | 40–55 | Better multi-step instruction following; handles 2–3 step task decomposition; stays within 12 GB solo run | 0.90 |
| **Rings 0, 1, 2, 3, 5** (coord, analysts, aspects, planner, gate-reviewer) | **Claude Sonnet 4.6** (cloud — GitHub Copilot) | N/A | N/A | Complex MAP-REDUCE-RESOLVE-SYNTHESIZE; PASS/FAIL quality gate; parallel fan-out (cloud = truly concurrent); 7% accuracy loss at Q4 is unacceptable for Ring 1 | 0.97 |

**EXCLUDED models:**
- Phi-4 14B: exceeds 12 GB under any multi-agent fan-out (8.2 GB base + KV headroom = OOM at ≥3 parallel agents)
- LLaMA 3.2 3B: poor structured JSON compliance; not suitable for MandateResult schema
- Any Q3 or lower: accuracy floor violation for Spider Web protocol compliance

---

## Section 4 — Research Brief Structure for exec-doc

**Output file:** `docs/research/SPIKE-032-local-gpu-ai-toolkit.md`

| § | Title | Key Content | Source Reports |
|---|---|---|---|
| 1 | Executive Summary | 3-paragraph synthesis: what we found, recommendation, boundary conditions | All reports |
| 2 | Research Horizon | Dec 8 2025 – Mar 8 2026; 14 verified sources; research window scope | analyst-research |
| 3 | Source Map | Table of all 14 sources by coverage axis (backend, security, AITK, ecosystem, benchmarks) | analyst-research |
| 4 | Technology Radar | ADOPT/ASSESS/TRIAL/HOLD/RETIRE table per backend (Ollama, llama.cpp, LM Studio, ONNX, vLLM, DirectML) | analyst-research Axis 1 |
| 5 | Security & Risk Assessment | CVE table (CVE-2026-21869, CVE-2026-2069, CVE-2026-25253); P1 blockers risk matrix; supply-chain notes | analyst-risk; analyst-quality §1.3; aspect-constraints |
| 6 | Internal Fit Analysis | How findings map onto Spider Web arch: runSubagent boundary, VRAM fan-out constraint, MandateResult schema, Agent Inspector dual-plane visualization | analyst-archaeology; aspect-integration; aspect-constraints HC-1–HC-7 |
| 7 | Prioritized Recommendations | This document's §2 recommendation set (22 items, Tier P1–P4, confidence weights, owners) | This document §2 |
| 8 | Model Selection Guide | This document's §3 matrix + decision tree + excluded models rationale | This document §3 |
| 9 | Setup Prerequisite Chain | Ordered 9-step serial chain: driver → CUDA → Ollama → models → settings.json → requirements.txt → venv → verify GPU → F5 test | analyst-risk; aspect-constraints HC-4, HC-7; recommendation set §2 items 5–9 |
| 10 | Agent Inspector Integration Guide | F5 walkthrough: task chain, ports (5679/7890/8087/4317/4318), launch.json config, debugpy attach, what AITK traces vs. what Spider Web Visualizer traces | analyst-archaeology Area 3; aspect-integration Point 2; aspect-constraints HC-3 |
| 11 | Migration Path | Incremental change list: settings.json → model pin → Ring 4 agent frontmatter updates → staleness fixes → verification gate | This document §5 items 1–10 |
| 12 | Next Actions | DevSteps follow-up items (10 items from §5); spawn sequence for worker-devsteps; SPIKE-032 close criteria | This document §5 |

---

## Section 5 — Follow-up DevSteps Items (for worker-devsteps)

**Spawn order:** worker-devsteps creates all items in one batch; all link to SPIKE-032 as parent via `implements` relation.

| # | Type | Title | Priority | Parent Link | Notes |
|---|------|---|---|---|---|
| 1 | STORY | Implement Ollama CUDA local inference for Ring 4 workers | `urgent-important` | `implements: SPIKE-032` | Primary delivery; includes BYOM settings.json, agent frontmatter updates, gate test |
| 2 | TASK | Security: Harden server.py with body-size limit and optional auth header | `urgent-important` | `implements: SPIKE-032` | 15 LOC; P1 security blocker; file: `tmp/visualizer/visualizer/server.py` |
| 3 | TASK | Create .vscode/settings.json BYOM config for Ollama endpoint | `urgent-important` | `implements: SPIKE-032` | HC-1 prerequisite; defines model ID naming convention |
| 4 | TASK | Pin agentdev + debugpy versions in requirements.txt | `urgent-important` | `implements: SPIKE-032` | P1 deterministic breakage risk; file: `tmp/visualizer/visualizer/requirements.txt` |
| 5 | TASK | Create devsteps-local-model.instructions.md with ring routing rules | `not-urgent-important` | `implements: SPIKE-032` | Authoritative routing table for contributors + agents |
| 6 | TASK | Write INSTALL-Local-GPU.md for Linux CUDA + Ollama setup | `not-urgent-important` | `implements: SPIKE-032` | exec-doc deliverable; covers NVIDIA driver PPA, Ollama, model verify, F5 checklist |
| 7 | TASK | Write MODEL-SELECTION.md with ring-based model routing guide | `not-urgent-important` | `implements: SPIKE-032` | exec-doc deliverable; VRAM table, decision tree |
| 8 | TASK | Implement Python MCP client in agentdev for MandateResult writes | `not-urgent-important` | `implements: SPIKE-032` | `mcp` SDK pip dep; Python→MCP write path; integration complexity HIGH |
| 9 | TASK | Update AITK-Tools-Guide.md agent naming to R-prefix convention | `not-urgent-not-important` | `implements: SPIKE-032` | Staleness fix; Phase 0 file listing + T2/T3 terminology banner |
| 10 | TASK | Add cbp-mandate handler integration tests | `not-urgent-important` | `implements: SPIKE-032` | Handler-level test for write→read disk round-trip; not covered by schema unit tests |

---

## Dependency Order Between Implementation Steps

For exec-impl and exec-doc, the following ordering constraints apply:

```
Step 1 (CVE patches / Ollama install: items #1, #2, #3 recommendations)
  └─→ Step 2 (settings.json BYOM config: recommendation #8 / follow-up item #3)
        └─→ Step 3 (Ring 4 agent frontmatter model: field updates)
              └─→ Step 4 (Python MCP client: follow-up item #8)
                    └─→ Step 5 (Integration test gate: follow-up item #10)

Step A (agentdev pin: recommendation #9 / follow-up item #4) — INDEPENDENT, run in parallel with Step 1
Step B (instructions file: follow-up item #5) — INDEPENDENT, run in parallel with Step 2
Step C (staleness fixes: follow-up items #9, guide updates) — INDEPENDENT, low-risk
Step D (INSTALL doc + MODEL-SELECTION doc) — INDEPENDENT from code steps; exec-doc only
```

**Risk tier per step:**
- Steps 1 (CVE patch): STANDARD — external package change, verify with `ollama version`
- Step 2 (settings.json): QUICK — JSON config only, no code
- Step 3 (agent frontmatter): STANDARD — behavior change, requires single test dispatch
- Step 4 (Python MCP): FULL — new module, cross-language IPC
- Step 5 (integration tests): FULL — new test infrastructure
- Steps A,B (version pin + instructions): QUICK
- Steps C,D (docs): QUICK

---

## Pre-Located File Paths for exec-impl / exec-doc

| File | Role | Action |
|---|---|---|
| `tmp/visualizer/visualizer/server.py` | OTLP receiver HTTP server | Add auth header check + body size guard |
| `tmp/visualizer/visualizer/requirements.txt` | Python deps | Pin `agent-dev-cli`, `debugpy` versions |
| `.vscode/settings.json` | VS Code BYOM config | Create new file; add `chat.models` entry |
| `.github/instructions/devsteps-local-model.instructions.md` | Ring routing rules | Create new file |
| `tmp/visualizer/AITK-Tools-Guide.md` | Workplan | Phase 0 file listing update + T2/T3 banner |
| `tmp/visualizer/AITK-Tools-Guide-Dev.md` | Session log | Add front-matter cross-reference banner |
| `tmp/visualizer/README.md` | Workspace doc | Structure alignment update |
| `tmp/visualizer/INSTALL-Local-GPU.md` | Setup guide | Create new file (exec-doc deliverable) |
| `tmp/visualizer/MODEL-SELECTION.md` | Model guide | Create new file (exec-doc deliverable) |
| `docs/research/SPIKE-032-local-gpu-ai-toolkit.md` | Research Brief | Create new file (exec-doc primary deliverable) |

---

## Absence Audit (Adversarial Gap Challenge)

**"What prerequisite step is missing that would cause Step N to fail silently?"**

| Step | Hidden Prerequisite | Risk |
|---|---|---|
| Step 2 (settings.json BYOM) | VS Code version must support `chat.models` field (≥1.105). Workspace is already at VS Code v1.110 — CLEAR. | LOW |
| Step 3 (frontmatter model change) | Model ID in `chat.models` setting must exactly match the `model:` value in `.agent.md`. A naming mismatch silently falls back to the default cloud model without error. Naming convention must be defined BEFORE updating any agent file. | HIGH — document convention in Step B first |
| Step 4 (Python MCP client) | The Node.js devsteps MCP server must be running (stdio cold-start) when Python client calls it. Startup latency is non-zero. Add retry/timeout logic. | MEDIUM |
| Step 5 (integration tests) | `sprint_id: null` breaks `WriteMandateResultSchema` — Spike-class mandates must use `sprint_id: "SPIKE-032"` convention. Document in test harness setup. | MEDIUM — resolved by RESOLUTION-2 |

---

## Summary Verdict

**22 recommendations** across 4 priority tiers. **4 P1 security+prerequisite blockers** must be resolved before any Ring 4 agent targets a local model. **10 follow-up DevSteps items** ready for worker-devsteps. The Research Brief at `docs/research/SPIKE-032-local-gpu-ai-toolkit.md` is fully specifiable from this planning document — exec-doc can proceed immediately in parallel with worker-devsteps item creation. No architectural ambiguities remain unresolved.

The integration is **technically feasible within the existing architecture** (confirmed by aspect-constraints: HC-1–HC-7 all have actionable mitigations). The critical path is: security patches → Ollama install → settings.json BYOM → agent frontmatter → verification gate.

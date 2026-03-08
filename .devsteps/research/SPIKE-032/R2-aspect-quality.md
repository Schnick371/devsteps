# Quality Cross-Validation Report — AITK Local GPU Inference for devsteps Spider Web

**Analyst:** `devsteps-R2-aspect-quality`
**Item:** SPIKE-032 — Research: Local GPU + VS Code AI Toolkit Agent Inspector
**Ring:** 2 — Cross-Validation (validates Ring 1 analyst findings)
**Upstream reports:** RESEARCH-AITK-GPU-analyst-research.md · RESEARCH-AITK-GPU-analyst-quality.md · RESEARCH-AITK-GPU-analyst-risk.md
**Date:** 2026-03-08
**Overall Verdict:** CONDITIONAL — three of four stated quality gaps require correction or reclassification; two new blocking gaps identified

---

## Executive Summary

Cross-validation of Ring 1 findings reveals one **factual error** in `analyst-quality` that must be corrected before implementation planning proceeds: the `write_mandate_result` MCP handler **already has** Zod schema enforcement. Gap 3 as stated is incorrect. This changes the P1 backlog.

Two **new gaps** are identified from direct code inspection that Ring 1 missed:
- No MCP handler-level integration tests (only Zod schema unit tests exist)
- `sprint_id: null` breaks `WriteMandateResultSchema` validation — cross-spike mandates with no sprint context are rejected silently

The overall SPIKE-032 acceptance surface requires:
1. **Security hardening** (`server.py` auth + body size — no handler, no auth) — P1 BLOCKING
2. **`agentdev` version pin** — P1 BLOCKING (RC→GA imminent; pin now or break on next upgrade)
3. **MCP handler integration tests** — P1 REQUIRED before local model Ring 4 use
4. **Local model ring constraints documentation** — P2 mandatory
5. **`sprint_id: null` protocol gap** — P2 mandatory for SPIKE-class mandates

---

## Part 1 — Ring 1 Cross-Validation Verdicts

### 1.1 Correcting Gap 3: `write_mandate_result` Zod Validation (analyst-quality)

**✗ FACTUAL ERROR — Gap 3 as stated is wrong.**

`analyst-quality` claimed: *"write_mandate_result MCP handler lacks Zod validation of the analyst field regex"*

**Direct code inspection refutes this:**

`packages/mcp-server/src/handlers/cbp-mandate.ts` — `handleWriteMandateResult()`:
```typescript
const parsed = WriteMandateResultSchema.safeParse(mandateResultArg);
if (!parsed.success) {
  const issues = parsed.error.issues.map(...).join(', ');
  throw new Error(`Invalid MandateResult: ${issues}`);
}
```

`packages/shared/src/schemas/cbp-mandate.ts` — `WriteMandateResultSchema`:
```typescript
analyst: z.string().regex(/^devsteps-R\d+-/, 'analyst must match devsteps-R{N}-{name} format'),
findings: z.string().max(12000, 'findings must be ≤12000 chars'),
recommendations: z.array(z.string().max(300)).max(5),
sprint_id: z.string().min(1).regex(/^[a-zA-Z0-9_.-]+$/),
```

**What Gap 3 analysts missed:** The Zod validation was added in TASK-334 (Read/Write schema split). The `ReadMandateResultSchema` is intentionally lenient (for historical file toleration); `WriteMandateResultSchema` is strict and IS enforced in the handler.

**Consequence for P1 backlog:** The P1 action "Add Zod schema validation to write_mandate_result" from `analyst-quality` is **already done**. This frees one P1 slot.

---

### 1.2 Correcting Gap 1: Schema Validation Tests (analyst-quality)

**⚠️ PARTIALLY INCORRECT — Schema tests exist; handler tests are missing.**

`analyst-quality` claimed: *"No MandateResult schema validation tests exist"*

**Direct inspection of `packages/shared/src/schemas/cbp-mandate.test.ts`** reveals an extensive TASK-334 regression gate suite:

| Test | Covers |
|------|--------|
| RC-1 through RC-5 | `ReadMandateResultSchema` tolerance invariants |
| WC-1: Rejects `item_ids:[]` | Write-path minimum count |
| WC-2, WC-3: Rejects non-R{N} analyst names | `devsteps-t2-archaeology` correctly rejected |
| WC-4: Accepts `devsteps-R1-*`, `devsteps-R2-*`, `devsteps-R4-*` | Ring-format validation |
| WC-5: Multi-item `item_ids` | Array validation |

**What IS missing (new finding):** Integration tests for `handleWriteMandateResult` as the **MCP handler function** — the atomic write path, error return format, and the full disk round-trip (`write → read` cycle) are not covered. Schema validity ≠ handler behavior.

---

### 1.3 Confirming Gap 2: No Agent Output Quality Tests

**✓ CONFIRMED — full scope as stated.**

No test anywhere in the codebase asserts behavioral correctness of local model output relative to the Spider Web protocol. This includes:
- No test that feeds a Spider Web analyst role prompt to a model and asserts `MandateResult` format compliance
- No eval harness for measuring `t3_recommendations` structural adherence across models
- No regression test for `CompressedVerdict` envelope token budget
- No `read_mandate_results` envelope shape invariant tests (the `{ results[], count, quorum_ok, ... }` structure)

This gap becomes critical with local models at Ring 4: silent malformed output degrades coord without error.

---

### 1.4 Confirming Gap 4: `agentdev` Unpinned

**✓ CONFIRMED — elevated to P1.**

From analyst-quality (confirmed by analyst-risk §2.2):
- `requirements.txt` uses `agent-dev-cli --pre` without version pin
- Microsoft Agent Framework is at Release Candidate 1.0.0-rc1 as of 2026-03-08
- GA is imminent; RC→GA transitions historically carry breaking API changes
- The `agentdev run agent.py --verbose --port 8087` CLI signature may change

**Elevation rationale:** Risk analyst classified this MEDIUM-HIGH because GA is imminent. I elevate to P1 because ANY `pip install --upgrade` in the current CI state will pull the new RC or GA release without warning, silently breaking the Agent Inspector task on the next VS Code session start. This is a deterministic breakage path, not a probability — it will happen unless pinned.

---

### 1.5 Cross-Validating Security Findings (analyst-quality + analyst-research)

**✓ CONFIRMED with precision adjustments.**

`server.py` security surface (confirmed via analyst-quality §1.3):
- Loopback binding (`127.0.0.1`) is CORRECTLY implemented — mitigates external network exposure
- No per-request `X-API-Key` authentication — CONFIRMED absent
- No `Content-Length` body size limit on `POST /v1/traces` — CONFIRMED absent
- `devsteps_watcher.py` unsanitized `target_subagent` field — CONFIRMED (lines 118-120)

**CVE prioritization from analyst-research (cross-validated against analyst-risk §3):**

| CVE | Severity | Relevance to 12GB Linux setup | Action |
|-----|----------|-------------------------------|--------|
| CVE-2026-21869 (llama.cpp OOB) | HIGH | DIRECT — if Ollama uses embedded llama.cpp | Bind to 127.0.0.1 + update |
| CVE-2026-2069 (GBNF stack overflow) | HIGH | IF grammar sampling used for structured output | Disable GBNF or update |
| CVE-2026-25253 (WebSocket agent hijack) | CRITICAL | Applies if no API key on local inference port | Add auth or use Ollama's API key support |
| CVE-2025-51471 (Ollama token theft) | MEDIUM | Low risk at loopback-only | Update Ollama to ≥0.14 |

**OWASP A10 SSRF precision:** `analyst-quality` correctly identified the `devsteps_watcher.py` injection path. The `target_subagent` string from a malformed MandateResult file is read and emitted to trace events without sanitization — this is CONFIRMED. A local model with low instruction adherence could produce a MandateResult with a crafted `target_subagent` string that pollutes traces, though actual SSRF requires the trace emitter to make outbound HTTP calls, which it doesn't in the current implementation. The risk is trace log pollution, not SSRF proper.

---

## Part 2 — New Gaps Identified by Cross-Validation

### Gap 5: `sprint_id: null` Breaks `WriteMandateResultSchema` (NEW)

**Severity: HIGH — Protocol gap for SPIKE-class mandates**

`WriteMandateResultSchema` enforces:
```typescript
sprint_id: z.string().min(1).regex(/^[a-zA-Z0-9_.-]+$/)
```

Many SPIKE-class mandates are issued with `sprint_id: null` (including this very mandate: *"sprint_id: null"*). When a local model attempts to write its MandateResult following the mandate, it will either:
1. Omit `sprint_id` → Zod rejects with `Required`
2. Pass `null` → Zod rejects with `Expected string, received null`
3. Guess a sprint ID string that may not match the path where coord expects to read results

This creates a **silent failure** for SPIKE-class research sprints — the analyst produces a valid result but cannot write it. No test covers this path.

**Required action:** Define the canonical `sprint_id` substitution rule for non-sprint mandates (e.g., use the item ID: `"SPIKE-032"`) and document it in both the protocol instructions and the `write_mandate_result` tool description.

---

### Gap 6: No MCP Handler Integration Tests (NEW)

**Severity: MEDIUM-HIGH — Handler behavior ≠ schema validity**

`packages/mcp-server/src/handlers/cbp-mandate.ts::handleWriteMandateResult` has:
- Atomic write pattern (`.tmp → rename`)
- String-to-JSON coercion guard
- Zod `safeParse` with error formatting

None of these behaviors are covered by any test. The existing `cbp-mandate.test.ts` tests Zod schemas in isolation. The handler's disk I/O, error message format, relative path construction, and coercion guard are untested.

**Critical for local model adoption:** Local models often produce `mandate_result` as a JSON string inside the tool call argument (type confusion). The coercion guard on line ~88 of `cbp-mandate.ts` handles this — but it's not tested. One malformed string from a local model that hits an edge case in this guard silently fails the entire analyst run.

**Required test:**
```typescript
// packages/mcp-server/src/handlers/cbp-mandate.test.ts (does not exist)
it('coerces mandate_result JSON string to object', async () => { ... })
it('writes file atomically via .tmp rename', async () => { ... })
it('returns correct relative path in response text', async () => { ... })
it('throws descriptive error for invalid analyst format', async () => { ... })
```

---

## Part 3 — Quality Surface: What Must Be Tested

### 3.1 Acceptance Criteria Audit — SPIKE-032

| Criterion | Testable? | Test Type | Status | Notes |
|-----------|-----------|-----------|--------|-------|
| Ollama running with CUDA backend (>30 tok/s) | YES | Manual benchmark | ❌ No harness | Needs `ollama ps` + token rate measurement script |
| Ring-4 worker produces valid MandateResult from local model | YES | Integration | ❌ Missing | Requires `handleWriteMandateResult` integration test |
| Agent Inspector traces in AITK UI for complete agent run | YES | Manual visual | ❌ No automation | F5 → Agent Inspector panel — manual verification only |
| VRAM peak usage measured and documented | YES | Manual measurement | ❌ Not done | `nvidia-smi --query-gpu=memory.used` during agent run |
| No security regressions (CVE mitigations applied) | YES | Security test | ❌ Missing | Port binding test + dependency version audit required |
| `agentdev` version pinned | YES | Dependency audit | ❌ Not done | Simple `pip freeze` + lock file check |
| `server.py` body size limit enforced | YES | Unit test | ❌ Missing | HTTP POST with >1MB payload → expect 413 |
| `server.py` optional auth enforced when env var set | YES | Unit test | ❌ Missing | Set `LOCAL_INFERENCE_API_KEY`, verify 401 on missing header |
| `target_subagent` field sanitized before trace emission | YES | Unit test | ❌ Missing | Inject 200-char string with special chars → verify truncation |

### 3.2 Model Output Quality Tests

**Concrete test scenarios for each integration point:**

#### MandateResult JSON Schema Conformance

For each mandate type (archaeology, risk, quality, research), produce a fixture prompt → expected MandateResult and validate with `WriteMandateResultSchema.safeParse()`:

```typescript
// tests/integration/mandate-quality/
describe('local-model-mandate-conformance', () => {
  // Fixture: minimal analyst prompt for each ring type
  // Assertion: parsed result passes WriteMandateResultSchema
  // Coverage: analyst (ring regex), findings (≤12000), recommendations (≤5 × ≤300)
})
```

**Priority model matrix:**

| Model | Test Priority | Rationale |
|-------|-------------|-----------|
| Mistral 7B Instruct (Ollama Q4_K_M) | HIGH | Recommended for Ring 4 workers; tool calling via Ollama v0.5+ |
| Phi-4-mini (Q4_K_M) | MEDIUM | Fits 12GB with 10-agent headroom; good JSON adherence |
| LLaMA 3.2 11B (Q4_K_M) | MEDIUM | Best capability/VRAM balance; needs validation |
| LLaMA 3.2 3B (Q4_K_M) | LOW | Expected poor JSON schema adherence; confirm baseline |

#### Tool-Calling Accuracy

Can local model correctly invoke `mcp_devsteps_write_mandate_result` with valid args?

- Test via AITK Agent Builder → tool catalog → devsteps MCP → send `write_mandate_result` request
- Assert: tool call args pass `WriteMandateResultSchema.safeParse()` before write
- Measure: % of calls that pass validation on first attempt per model

#### Multi-Step Instruction Following

Can local model execute Spider Web analyst roles end-to-end?

- Ring 4 worker test: 4-step task (read item → analyze → write MandateResult → confirm path)
- Metric: % of steps completed in correct order without dropping steps
- Threshold: ≥90% step completion rate to qualify for Ring 4 use

#### Context Window Overflow Behavior

| Context Size | Test Scenario | Expected Behavior |
|-------------|--------------|------------------|
| 8K tokens | Ring 1 analyst with full codebase context | Completes; check for truncation in findings |
| 16K tokens | exec-planner with 3 MandateResult envelopes | Completes; no truncation |
| 32K tokens | Simulated Ring 2 cross-validation with large upstream paths | May fail gracefully; check for OOM or truncation-induced errors |

### 3.3 Infrastructure Tests

| Test | File Location | Scenario | Assert |
|------|-------------|---------|--------|
| Ollama service health check | `tests/integration/infra/ollama-health.bats` | `GET http://localhost:11434/api/version` | HTTP 200 + version field |
| GPU memory OOM detection | `tests/integration/infra/gpu-oom.bats` | Load Phi-4 14B → start 10 parallel sessions | Graceful HTTP 500 from Ollama, no SIGKILL |
| OTLP trace propagation | Manual | Run agent → check visualizer span tree | `python_agent_id` appears in Spider Web radar |
| Agent Inspector connectivity | Manual | F5 → AITK debug panel | Breakpoints hit in `agent.py` |
| Port binding verification | `tests/integration/security/port-binding.bats` | Check `ss -tlnp` or `netstat` for Ollama port | Not bound on 0.0.0.0 |

### 3.4 Security Tests

| Security Test | Mechanism | Tool |
|--------------|-----------|------|
| Ollama API localhost binding | `OLLAMA_HOST=127.0.0.1:11434` env var verification | `curl http://0.0.0.0:11434` → connection refused |
| GGUF model SHA256 verification | Before `ollama pull` or `llama-server -m` | `sha256sum` vs published hash from microsoft/phi-4 |
| POST body size limit | `POST /v1/traces` with 2MB body | HTTP 413 response |
| Auth header enforcement | `LOCAL_INFERENCE_API_KEY` env set, wrong key | HTTP 401 |
| CVE-2026-21869 mitigation | Ollama version check ≥ patched | `ollama --version` ≥ post-patch release |
| GBNF handler disabled or patched | llama-server startup flags | `--no-grammar` flag present or updated build |

---

## Part 4 — What Must Be Documented

### 4.1 Prerequisites Guide (Linux + NVIDIA CUDA)

**Required document:** `tmp/visualizer/INSTALL-Local-GPU.md`

Must cover:
1. NVIDIA driver requirements: ≥525.85 for CUDA 12.x
2. CUDA toolkit installation (system package vs. conda)
3. Ollama installation: `curl https://ollama.ai/install.sh | sh`
4. Ollama binding configuration: `OLLAMA_HOST=127.0.0.1:11434` — required before service start
5. Model pull + verification: `ollama pull llama3.2:11b-instruct-q4_K_M` + SHA256 check
6. agentdev installation: `pip install agent-dev-cli==<PINNED_VERSION>` (version to be determined and pinned)
7. Environment test: `ollama ps`, `nvidia-smi`, `agentdev --version`

### 4.2 Model Selection Guide

**Required document:** `tmp/visualizer/MODEL-SELECTION.md`

Must cover:

| Ring | Recommended Model | VRAM | Rationale | Prohibited for |
|------|------------------|------|-----------|----------------|
| Ring 4 workers | Mistral 7B Instruct Q4_K_M | ~4.5GB | Tool calling via Ollama v0.5+, room for 7 parallel | Ring 1-2 analysts |
| Ring 4 workers (quality-sensitive) | LLaMA 3.2 11B Q4_K_M | ~7GB | Better reasoning, still fits 12GB | Ring 3 planner, Ring 5 gate |
| Ring 4 (budget/parallel) | Phi-4-mini Q4_K_M | ~2.6GB | Allows 10-parallel within 12GB | Any reasoning-heavy ring |
| Ring 1-2, Ring 3 | Cloud model (Claude 3.5/4) | N/A | Reasoning depth required | No substitution below Phi-4 14B |
| Ring 5 gate-reviewer | Cloud model ONLY (Claude Opus) | N/A | QA gate must not be downgraded | No local model substitution |

### 4.3 Performance Expectations

Document measured (not estimated) values after SPIKE completion:
- Tokens/second per model at Q4_K_M on local GPU
- VRAM peak during single-agent vs. 4-agent batch vs. 7-agent (max stable) fan-out
- Time-to-first-token for Spider Web analyst prompts (~3K tokens input)
- Full Ring 4 worker cycle time (item read → analysis → MandateResult write)

### 4.4 Troubleshooting Guide

**Required sections:**
- OOM during fan-out: symptoms (HTTP 500 from Ollama), recovery (restart Ollama, set `OLLAMA_MAX_LOADED_MODELS=1`)
- CUDA not found: driver version check, `nvidia-smi` validation
- Port conflicts: `ss -tlnp | grep 11434` + kill existing Ollama instance
- `agentdev run` fails: version mismatch symptoms, pin resolution steps
- MandateResult validation failure: how to read the Zod error from the MCP server response

### 4.5 Agent Inspector Usage Guide

**Required:** step-by-step debugging workflow in `AITK-Tools-Guide.md`:
1. Run `🕷 Visualizer: Validate Prerequisites` task first
2. Run `🕷 Visualizer: Run HTTP Server (Agent Inspector)` task (starts `agentdev` + `debugpy --listen 127.0.0.1:5679`)
3. Open Agent Inspector panel in VS Code sidebar
4. Set breakpoints in `agent.py`
5. Trigger agent dispatch from devsteps Spider Web
6. Observe: MandateResult writes emit file-system events → watcher → OTLP spans → visualizer
7. Inspect variables at breakpoint: `mandate_result`, `sprint_id`, `analyst` name

### 4.6 Local Model Ring Constraints (Protocol Documentation)

**Required:** New instruction file `.github/instructions/devsteps-local-model.instructions.md`

Must define:
- Which rings may use local models (Ring 4 workers: conditional YES)
- Which rings MUST use cloud models (Ring 1-2 analysts: NO; Ring 5 gate: NO)
- `sprint_id` substitution rule for non-sprint mandates (use item ID, e.g., `"SPIKE-032"`)
- Fan-out batching constraint (max 4-5 agents per batch on 12GB GPU with ≤11B model)
- Grammar enforcement requirement (Ollama `format: json_schema` MUST be used)

---

## Part 5 — Acceptance Criteria for SPIKE-032 "Done"

| # | Criterion | Verification Method | Priority |
|---|-----------|--------------------|-|
| AC-1 | Ollama running with CUDA backend, measured >30 tok/s with LLaMA 3.2 11B Q4_K_M | `ollama ps` + token rate benchmark script | MUST |
| AC-2 | At least one Ring-4 worker agent produces valid `MandateResult` from local model (passes `WriteMandateResultSchema`) | Integration test in `tests/integration/mandate-quality/` | MUST |
| AC-3 | Agent Inspector traces appear in AITK UI for complete agent run (Python agent only — `runSubagent` traces are a known limitation) | Manual F5 + visual verification | MUST |
| AC-4 | VRAM peak usage measured and documented for: Mistral 7B, LLaMA 3.2 11B, Phi-4-mini during 4-agent fan-out | `nvidia-smi dmon` output added to MODEL-SELECTION.md | MUST |
| AC-5 | No NEW security regressions: Ollama bound to 127.0.0.1, CVE-2026-21869 mitigated (version ≥ patched) | Port binding test + version audit | MUST |
| AC-6 | `agentdev` pinned to specific version in `requirements.txt` | CI check / `pipdeptree` output audit | MUST |
| AC-7 | `server.py` body size limit and optional auth header implemented and tested | Unit test (2 new tests) | MUST |
| AC-8 | `sprint_id: null` substitution rule documented and validated in protocol instructions | Instruction file exists + reviewed | MUST |
| AC-9 | `handleWriteMandateResult` handler integration tests added (coercion, atomic write, error format) | `packages/mcp-server/src/handlers/cbp-mandate.test.ts` | SHOULD |
| AC-10 | Documentation complete: INSTALL-Local-GPU.md, MODEL-SELECTION.md, troubleshooting guide | Files present and reviewed | SHOULD |
| AC-11 | `AITK-Tools-Guide-Dev.md` updated to Spider Web v4.0 ring nomenclature (remove T1/T2/T3 references) | Diff review | COULD |

---

## Part 6 — Gap Severity and Prioritization (Cross-Validated Assessment)

| Gap | analyst-quality Stated Severity | Cross-Validation Verdict | Corrected Priority | Rationale |
|-----|--------------------------------|--------------------------|--------------------|-----------|
| **Gap 1: No schema validation tests** | "HIGH" (fail) | PARTIAL — schema tests exist; handler tests missing | P1 (handler tests only) | Handler behavior (coercion, disk, error format) is untested |
| **Gap 2: No agent output quality tests** | "HIGH" (fail) | CONFIRMED HIGH | P1 | Local model adoption without behavioral tests is scientifically unsound |
| **Gap 3: MCP handler lacks Zod validation** | "P1 — must fix" | INCORRECT — already implemented | RESOLVED (TASK-334 done) | Do NOT add duplicate Zod validation; it's present |
| **Gap 4: agentdev unpinned** | "P2 — conditional" | ELEVATED TO P1 | P1 BLOCKING | RC→GA transition is imminent and deterministic; not probabilistic |
| **Gap 5: sprint_id null protocol gap** | Not identified | NEW GAP — HIGH | P2 BLOCKING | Every SPIKE-class mandate fails write path silently without this |
| **Gap 6: Handler integration tests missing** | Not identified | NEW GAP — MEDIUM-HIGH | P1 | Foundation for local model validation testing |
| **Security (server.py auth + body limit)** | "P1 — must fix" | CONFIRMED P1 | P1 BLOCKING | CVE-2026-25253 applies; loopback-only is necessary but not sufficient |

---

## Part 7 — Critical Hard Constraints (Cross-Validated)

These constraints are validated across all three Ring 1 analysts and confirmed by code inspection:

1. **Ring 5 gate-reviewer MUST remain on cloud model (Claude Opus or equivalent).** No local model substitution. HARD CONSTRAINT — analyst-quality and analyst-risk are in full agreement. Gate quality is the last defense against malformed implementation; degrading it with a local 7B model removes the safety net.

2. **`runSubagent` + local AITK models are architecturally incompatible.** Analyst-risk §5.2 is CONFIRMED correct. The VS Code Copilot Chat `runSubagent` runtime and AITK Python Agent Framework `WorkflowBuilder` are separate runtimes. Mixing them requires explicit HTTP bridging code. This is not a configuration option.

3. **12GB VRAM cannot sustain 10-agent fan-out with any model >8B Q4_K_M.** Fan-out must be batched to 4-5 agents maximum. This architectural constraint requires updating the Spider Web dispatch layer to support batched fan-out when running on local GPU.

4. **All inference server ports MUST be bound to 127.0.0.1.** Ollama at `localhost:11434`, visualizer at `localhost:8087`, debugpy at `localhost:5679`. This is confirmed correct in the existing task configuration for debugpy and the visualizer. Ollama requires explicit `OLLAMA_HOST=127.0.0.1:11434` environment variable — this is NOT set by default.

5. **GGUF model SHA256 MUST be verified against the official publisher hash before first load.** Not currently automated. Required for SPIKE AC-5 baseline.

---

## Appendix A — Summary for exec-planner

**Quality verdict: CONDITIONAL**

**Corrected P1 backlog (after Gap 3 factual correction):**
1. `server.py` — add body size limit + optional auth header (2 Python changes, 2 new tests)
2. `agentdev` — pin version in `requirements.txt` + add startup version check
3. `handleWriteMandateResult` — add handler-level integration tests
4. Add agent output quality behavioral tests (mandate conformance harness)

**New items for P2:**
- Define and document `sprint_id` substitution rule for non-sprint mandates
- Write `devsteps-local-model.instructions.md` ring constraint policy
- Write INSTALL-Local-GPU.md and MODEL-SELECTION.md documentation

**Not to do (Gap 3 retraction):**
- Do NOT add duplicate Zod validation to `write_mandate_result` handler — it already has `WriteMandateResultSchema.safeParse()` enforcement via TASK-334.

---

## Appendix B — Affected Files

- `tmp/visualizer/server.py` — body size limit, auth header (security, P1)
- `tmp/visualizer/requirements.txt` — agentdev pin (P1)
- `tmp/visualizer/devsteps_watcher.py` — `target_subagent` sanitization (P2)
- `packages/mcp-server/src/handlers/cbp-mandate.ts` — no changes needed (Gap 3 resolved)
- `packages/mcp-server/src/handlers/cbp-mandate.test.ts` (NEW) — handler integration tests (P1)
- `.github/instructions/devsteps-local-model.instructions.md` (NEW) — ring constraints + sprint_id rule (P2)
- `tmp/visualizer/INSTALL-Local-GPU.md` (NEW) — prerequisites guide (P2)
- `tmp/visualizer/MODEL-SELECTION.md` (NEW) — model selection guide (P2)
- `tmp/visualizer/AITK-Tools-Guide-Dev.md` — update T1/T2/T3 → Ring 0-5 nomenclature (P3)

---

*Report written by `devsteps-R2-aspect-quality` · SPIKE-032 · 2026-03-08*

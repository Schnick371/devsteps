# Quality Analysis Report — AITK Local GPU Inference for devsteps Spider Web

**Analyst:** `devsteps-R1-analyst-quality`  
**Item:** SPIKE-032 — Research: Local GPU + VS Code AI Toolkit Agent Inspector  
**Triage tier:** COMPETITIVE_PLUS  
**Date:** 2026-03-08  
**Verdict:** CONDITIONAL

---

## Executive Summary

Adopting VS Code AI Toolkit (AITK v0.30.x, February 2026) with local GPU inference for the devsteps Spider Web multi-agent system is technically feasible and architecturally aligned — but carries four quality gaps that prevent an unconditional GO verdict:

1. **OWASP A07 / SSRF** — local inference server exposes unauthenticated HTTP on localhost with no capability restriction; must be mitigated before production integration.
2. **SLM JSON reliability bottleneck** — Phi-4 14B and Mistral 7B produce structured JSON reliably for simple schemas but degrade on complex multi-step instructions (exec-planner, analyst-quality roles); a format-enforcement layer is required.
3. **Zero programmatic tests for agent output quality** — the current codebase has no automated assertions for MandateResult format compliance, dispatch correctness, or structured output validation. The only quality gate is the LLM-based `gate-reviewer`, which cannot catch model-specific failure modes.
4. **`agent-dev-cli` pre-release** — the `agent-dev-cli --pre` pip dependency in `visualizer/requirements.txt` is not API-stable; production integration requires a pinned stable release.

Items 1 and 3 must be resolved before Ring 4–5 agents can run on local models in STANDARD+ triage sprints. Items 2 and 4 are conditional — required if local models are used for coordinator or planner roles.

---

## Dimension 1 — Standards Compliance

### 1.1 MCP Protocol Compliance

**Verdict: GO**

AITK v0.30.0 (February 2026) implements the MCP specification correctly for tools, resources, and prompts capability as of the current release:

- The new Tool Catalog (v0.30.0) provides a unified discovery, configuration, and registration surface for MCP servers — including the devsteps MCP server (`mcp_devsteps_*`).
- AITK's Agent Builder tests tool calls interactively, verifying parameter schemas before dispatch — this is consistent with MCP tool schema validation requirements.
- The Agent Inspector visualizes MCP tool calls as first-class nodes in the dispatch tree.
- The devsteps MCP server (`packages/mcp-server/`) is already integrated and tested within the workspace. No protocol compliance gap exists in the current integration.

**Gap:** AITK's local inference path (ONNX/Ollama models) still routes tool calls through the same MCP layer — there is no local-inference-specific deviation from the protocol.

### 1.2 OpenAI-Compatible API

**Verdict: CONDITIONAL**

AITK supports local inference via two pathways, each with different OpenAI-compatibility profiles:

| Pathway | OpenAI Compatibility | Tool Calling | Context Limit |
|---------|---------------------|--------------|---------------|
| ONNX Runtime (DirectML / CUDA) | Partial — chat completions endpoint, no function-calling v2 | Only via grammar sampling or shims | Model-dependent (Phi-4: 16K) |
| Ollama (bundled inference) | Full — `/v1/chat/completions` with tools parameter | Yes — for supported models | Model-dependent |

For `agent.py` and the `visualizer/server.py` OTLP receiver, both local pathways are drop-in compatible with OpenAI SDK clients once the endpoint is configured. However, the ONNX Runtime pathway does not reliably implement the `tools` parameter for function calling with all models — particularly for instruction-following with complex tool schemas.

**Required action:** Use Ollama for local inference if function calling is needed. Do not rely on ONNX Runtime for tool-use unless the model is verified with the specific schema.

### 1.3 OWASP Security Surface

**Verdict: FAIL (must resolve)**

The local inference server (ONNX Runtime or Ollama) exposes an HTTP endpoint on `localhost` with **no authentication**, **no authorization**, and **no request size limits** by default. This creates the following OWASP risks:

**OWASP A07 — Identification and Authentication Failures**

- The local inference API at `http://localhost:<port>/v1/chat/completions` accepts any client request without a token, API key, or session credential.
- Any process running on the same machine (including browser JavaScript via `fetch()`) can send arbitrary prompts to the model.
- CVE-2026-25253 (published March 2026): Websites can hijack locally-running AI agents via WebSocket when no authentication is enforced on the local port (CVSS 8.8).

**OWASP A10 — Server-Side Request Forgery (SSRF)**

- The `visualizer/server.py` OTLP receiver at `POST /v1/traces` and the inference server both accept requests from any process. A prompt injection in a malicious file read during agent execution could instruct the model to make outbound HTTP calls via the agent's `execute/runInTerminal` tool, effectively using the local inference server as a SSRF pivot.
- The `devsteps_watcher.py` reads JSON from `.devsteps/cbp/` without sanitizing field values before emitting them as trace events — a malicious `target_subagent` string could pollute trace logs.

**Required mitigations:**

```python
# 1. Bind inference server to loopback only — never 0.0.0.0
server = HTTPServer(("127.0.0.1", port), handler)

# 2. Add optional API key header check (environment-configurable)
expected_key = os.environ.get("LOCAL_INFERENCE_API_KEY")
if expected_key and request.headers.get("X-API-Key") != expected_key:
    self._reply(401, b'{"error":"Unauthorized"}', "application/json")
    return

# 3. Enforce Content-Length limit on all POST endpoints
MAX_BODY = 1_048_576  # 1 MB
length = int(self.headers.get("Content-Length", 0))
if length > MAX_BODY:
    self._reply(413, b"Payload too large", "text/plain")
    return
```

The existing `server.py` already uses `127.0.0.1` binding (confirmed in `run_server()`), which mitigates external network exposure. However, per-request authentication and body size limits are absent.

### 1.4 Licensing

**Verdict: GO**

| Component | License | OSS Compatible |
|-----------|---------|----------------|
| VS Code AI Toolkit Extension | MIT | ✅ |
| agentdev Python package (ms-windows-ai-studio) | MIT | ✅ |
| Microsoft Agent Framework Python SDK | MIT | ✅ |
| Phi-4 / Phi-4-mini models | MIT (Microsoft) | ✅ |
| Mistral 7B | Apache 2.0 | ✅ |
| LLaMA 3.2 | Meta LLaMA 3 License (open, commercial-use permitted) | ✅ for non-distribution use |
| ONNX Runtime | MIT | ✅ |
| Ollama | MIT | ✅ |

All components are compatible with the devsteps project (MIT-adjacent). LLaMA 3.2 requires compliance with Meta's non-redistribution clause for model weights — acceptable for local development use but must not be bundled in distributed artifacts.

---

## Dimension 2 — Agent Quality for devsteps Spider Web

### 2.1 Small Language Model JSON Output Reliability

**Verdict: CONDITIONAL**

MandateResult writing (`mcp_devsteps_write_mandate_result`) requires structured JSON with 10 mandatory fields and specific format constraints (e.g., `findings` ≤ 12,000 chars, `recommendations` max 5 items of ≤ 300 chars, `analyst` matching `devsteps-R{N}-{name}` pattern). This is a non-trivial schema adherence requirement.

| Model | VRAM at 12GB | JSON Schema Adherence | Tool Calling | Multi-step Instructions |
|-------|-------------|----------------------|--------------|------------------------|
| Phi-4 (14B, ONNX Q4) | ~8-9GB | Good — strong structured output via grammar sampling | Limited (needs shim) | Moderate — follows ~90% of instructions at 2-3 step depth |
| Mistral 7B (Ollama) | ~5GB | Good — with `response_format: json_schema` in Ollama | Yes (Ollama v0.5+) | Good for single-role tasks |
| LLaMA 3.2 (3B) | ~2.5GB | Poor for complex schemas — high hallucination rate | Unreliable | Poor — misses constraints |
| LLaMA 3.2 (11B Vision) | ~8GB | Moderate — better than 3B | Moderate | Moderate |

**Specific gap for devsteps Spider Web:**

The Spider Web protocol requires that each Ring 1 analyst also produce a `t3_recommendations` map (MUST/SHOULD/COULD per aspect type) and `n_aspects_recommended`. This is a semi-structured nested JSON sub-object that SLMs frequently omit or malform. **No grammar enforcement exists for this field in the current `write_mandate_result` MCP tool.**

**Required action:** Implement Pydantic-based JSON grammar sampling or Ollama's `format: json_schema` for all local model invocations. Add server-side schema validation in `mcp_devsteps_write_mandate_result` that returns a detailed error instead of silently accepting malformed results.

### 2.2 Multi-Step Instruction Following

**Verdict: CONDITIONAL**

Benchmarks from the Goose tool-calling evaluation (April 2025) show Phi-4 (14B) achieves close performance to Llama 3.3 (70B) on tool-calling tasks when fine-tuned or prompted correctly. However:

- **Ring 1 Analysts** (analyst-quality, analyst-risk): require MAP-REDUCE-RESOLVE-SYNTHESIZE protocol across 4 phases — SLMs drop steps at indices 2-3 of a 4-step protocol
- **Ring 3 exec-planner**: requires reading multiple MandateResult envelopes and producing a coherent implementation plan — high reasoning demand, borderline for Phi-4 14B
- **Ring 4 exec-impl / workers**: well-specified pattern-following tasks — Mistral 7B and Phi-4-mini handle these acceptably
- **Ring 5 gate-reviewer**: PASS/FAIL with specific acceptance criteria evaluation — Phi-4 14B is rated "adequate" but misses edge conditions that Claude Opus catches

**Conclusion:** Local models are appropriate for Ring 4 workers (well-specified, pattern-following). Ring 1+2 analysts should remain on cloud models or use Phi-4 14B with grammar enforcement. Ring 5 gate-reviewer should NOT be downgraded to a 7B model without extensive evaluation.

### 2.3 Function Calling / Tool Use Reliability

**Verdict: CONDITIONAL**

The devsteps MCP tools are called via Copilot's native MCP integration — the local model does not need to invoke tools itself if running through the `.agent.md` dispatch mechanism. The model generates prose/JSON which Copilot parses and routes. This is architecturally sound.

**However**, if using the Microsoft Agent Framework Python SDK directly (for tracing integration), the model must generate tool call objects natively. Phi-4 ONNX does not reliably produce OpenAI-format tool call JSON without explicit grammar constraints. Ollama v0.5+ with Mistral 7B achieves ~85% tool call format compliance on standard schemas.

---

## Dimension 3 — Developer Experience Quality

### 3.1 Agent Inspector UI Stability

**Verdict: GO**

AITK v0.30.0 Agent Inspector (GA, February 2026) provides:

- F5 one-click debugging with breakpoints and variable inspection
- Real-time streaming visualization of tool calls and multi-agent workflows
- Copilot auto-configuration of agent code and debugging setup
- Double-click workflow nodes → jump to source

The existing visualizer (`tmp/visualizer/`) implements a complementary Spider Web radar chart that lights up agent nodes as MandateResults are written to `.devsteps/cbp/`. The `devsteps_watcher.py` pattern (file-system events → trace events → OTLP) is architecturally compatible with AITK's tracing infrastructure.

**Gap:** AITK Agent Inspector traces ONLY Python Agent Framework SDK calls via OTLP. VS Code Chat's `.agent.md`-driven `runSubagent` dispatch is NOT captured in the OTLP span tree — it's visible in the Chat UI only. This remains the fundamental tracing limitation documented in the existing `RESEARCH-REPORT-AITK-MultiAgent.md`.

### 3.2 agentdev Framework Stability

**Verdict: CONDITIONAL**

The `visualizer/requirements.txt` specifies `agent-dev-cli --pre` (pre-release channel). This is a quality risk:

- Pre-release packages may break between minor versions without semver guarantees
- The `agentdev run agent.py --verbose --port 8087` command used in `.vscode/tasks.json` depends on the `agentdev` CLI API being stable
- No version pin is present — any `pip install --upgrade` will silently update to a newer pre-release

**Required action:** Pin to a specific pre-release version (`agent-dev-cli==0.x.y.devN`). Document the version in `visualizer/INSTALL.md`. Add a CI check that validates the pinned version is still available.

### 3.3 F5 Debug Experience Quality

**Verdict: GO**

The VS Code task `🕷 Visualizer: Run HTTP Server (Agent Inspector)` correctly uses `debugpy --listen 127.0.0.1:5679` (loopback-only binding — correct security posture). The F5 workflow is documented and functional.

---

## Dimension 4 — Current devsteps Quality Patterns

### 4.1 Standards Conflict / Support Analysis

**Verdict: GO (no conflicts)**

Reading all instruction files in `.github/instructions/`:

| Instruction | Conflict with local models? | Assessment |
|-------------|---------------------------|------------|
| `devsteps-agent-protocol.instructions.md` | None — model-agnostic | The protocol operates at the `.agent.md` dispatch level; model field is changeable |
| `devsteps-code-standards.instructions.md` | None | TypeScript code quality standards don't depend on the inference backend |
| `devsteps-testing.instructions.md` | None | Testing standards are independent of model source |
| `devsteps-typescript-implementation.instructions.md` | None | Implementation standards are model-agnostic |
| `devsteps-commit-format.instructions.md` | None | Commit standards are model-agnostic |
| `devsteps-classification.instructions.md` | None | Classification taxonomy is model-agnostic |

The `.github/copilot-instructions.md` specifies `model: 'Claude Sonnet 4.6'` defaults — these are per-agent frontmatter values and can be overridden per agent. No structural conflict exists.

### 4.2 Quality Gates Compatibility with Local Model Outputs

**Verdict: CONDITIONAL**

The Spider Web protocol has one programmatic quality gate and one structural invariant relevant to local model quality:

**Gate-reviewer (Ring 5):** Currently a LLM-based PASS/FAIL decision using Claude Opus 4.6. If the gate-reviewer itself is downgraded to a local model, the quality gate loses the reasoning depth needed to catch subtle failures. **Gate-reviewer must remain on Claude Opus or equivalent cloud model** — this is a hard constraint for the adoption plan.

**MandateResult schema invariant:** The `write_mandate_result` MCP tool accepts `findings` as a free-text string. There is **NO server-side validation** of the `analyst` field regex (`devsteps-R{N}-{name}`), `recommendations` length limits, or `t3_recommendations` formatting. Local models with lower instruction adherence will silently write malformed results that coord then reads without error. This is the highest-priority quality gap.

**Required action:** Add Zod schema validation in the `write_mandate_result` MCP handler (in `packages/mcp-server/src/`) that enforces:
```typescript
const analystPattern = /^devsteps-R\d+-/;
// validate all fields before writing to disk
```

### 4.3 Existing Agent Output Quality Tests

**Verdict: FAIL (gap)**

Searching across the entire test suite (`packages/*/`, `tests/integration/`):

- **Unit tests found:** `htmlHelpers.test.ts`, `debounce.test.ts`, `ring-extractor.test.ts` — all test utility functions, not agent behavior
- **CLI integration tests (BATS):** `scrum-hierarchy.bats`, `waterfall-hierarchy.bats`, `setup.bats` — test CLI commands, not MandateResult quality
- **No tests found for:**
  - MandateResult schema compliance
  - `write_mandate_result` field validation
  - MandateResult `analyst` field format regex
  - `t3_recommendations` structure validation
  - `findings` character limit enforcement
  - CompressedVerdict envelope token budget compliance
  - `read_mandate_results` envelope structure invariants

This is a pre-existing quality gap that becomes critical when local models are introduced, since local models have lower adherence to complex schemas than Claude Opus.

---

## Dimension 5 — Documentation Quality Assessment

### 5.1 AITK Documentation Completeness

**Verdict: CONDITIONAL**

| Documentation Area | Quality | Gap |
|-------------------|---------|-----|
| AITK overview + model catalog | ✅ Complete | None |
| Agent Inspector setup (F5 debug, `agentdev run`) | ✅ Good | Minor: no multi-process debug example |
| ONNX local model setup for GPU | ⚠️ Partial | Missing: VRAM requirements table per model, DirectML vs CUDA configuration for Linux |
| Ollama integration | ✅ Good | None |
| OTLP tracing setup | ✅ Complete (SDK) | Gap: no VS Code Chat subagent tracing (confirmed limitation) |
| Multi-agent Spider Web patterns | ⚠️ Partial | Missing: parallel fan-out + MandateResult pattern in Agent Framework |
| Evaluation for custom MandateResult schemas | ⚠️ Partial | Missing: code-based custom evaluator templates for non-standard schemas |
| Security / localhost inference | ❌ Absent | No docs on authentication, OWASP risks, or CVE-2026-25253 mitigation |

### 5.2 Workspace Documentation Quality

**Verdict: GO**

The existing workspace documentation is well-structured:

- `AITK-Tools-Guide.md` — clear phased plan for problems A/B/C, actionable steps
- `AITK-Tools-Guide-Dev.md` — thorough ADRs, failure modes, architecture decisions
- `AITK-Tools-Guide-Reference.md` — accurate ring topology reference, updated to Spider Web v4.0 (2026-03-04)
- `RESEARCH-REPORT-AITK-MultiAgent.md` — clearly marked as historical artifact (T1/T2/T3 pre-v4.0), correct deprecation notice

**Gap noted:** The historical report's deprecation notice is accurate, but the 3-tier T1/T2/T3 terminology used in `AITK-Tools-Guide-Dev.md` (Phase 3 steps, ADR-002, ADR-003) has NOT yet been updated to the Spider Web v4.0 ring nomenclature. This creates a documentation staleness gap — the guide-dev file references "T2 conductors" which no longer exist as a separate tier.

---

## Quality Verdict Summary

| Dimension | Verdict | Critical? |
|-----------|---------|-----------|
| MCP Protocol Compliance | GO | — |
| OpenAI-compatible API | CONDITIONAL | Medium |
| OWASP Security (local inference API auth) | FAIL → must fix | **HIGH** |
| Licensing | GO | — |
| SLM JSON reliability | CONDITIONAL | **HIGH** for Ring 1-3 |
| Multi-step instruction following | CONDITIONAL | Medium |
| Function calling reliability | CONDITIONAL | Medium |
| Agent Inspector stability | GO | — |
| agentdev pre-release dependency | CONDITIONAL | Medium |
| Standards conflict with local models | GO | — |
| Quality gates vs. local model output | CONDITIONAL | **HIGH** |
| Existing agent output quality tests | FAIL → gap | **HIGH** |
| AITK documentation completeness | CONDITIONAL | Medium |
| Workspace documentation quality | GO | — |

**Overall: CONDITIONAL**

---

## Required Actions (Priority Order)

### P1 — Must resolve before any local model Sprint

1. **[server.py]** Add request authentication (optional `X-API-Key` header, loopback-only binding) and body size limit to the OTLP receiver endpoint.
2. **[packages/mcp-server/src/]** Add Zod schema validation to `write_mandate_result` handler: enforce `analyst` regex, `findings` char limit, `recommendations` count and length, validate `mandate_id` UUID format.
3. **[tests/]** Add unit tests for MandateResult schema validation (minimum: field presence, `analyst` regex, `findings` length, `recommendations` max count). Target: 100% coverage of validation paths.

### P2 — Required for local models in Ring 1-3 roles

4. **[agent invocation layer]** Implement Ollama `format: json_schema` or Pydantic grammar enforcement for all local model MandateResult production calls.
5. **[visualizer/requirements.txt]** Pin `agent-dev-cli` to a specific version. Add version check at startup.
6. **[.github/instructions/]** Add a `devsteps-local-model.instructions.md` defining which ring agents are permitted to use local models (Ring 4 workers: allowed; Ring 5 gate-reviewer: forbidden).

### P3 — Recommended improvements

7. **[AITK-Tools-Guide-Dev.md]** Update T1/T2/T3 references to Spider Web v4.0 ring nomenclature (Ring 0-5).
8. **[AITK documentation]** File a documentation issue: missing security/OWASP guidance for localhost inference servers.
9. **[visualizer/devsteps_watcher.py:118-135]** Sanitize the `target_subagent` field value before using it in trace outputs (strip non-alphanumeric, max 64 chars) — prevents trace-log pollution from malformed MandateResults.

---

## Specific File:Line Issues

| File | Line | Issue | Suggestion |
|------|------|-------|-----------|
| [visualizer/requirements.txt](../visualizer/requirements.txt) | 5 | `agent-dev-cli --pre` — no version pin | Pin to `agent-dev-cli==<specific-version>` |
| [visualizer/server.py](../visualizer/server.py) | ~70 | `do_POST`: no body size limit before `self.rfile.read(length)` | Add `if length > MAX_BODY: return 413` guard before read |
| [visualizer/server.py](../visualizer/server.py) | ~45 | No `X-API-Key` authentication check | Add optional auth header check, controlled via env var |
| [visualizer/devsteps_watcher.py](../visualizer/devsteps_watcher.py) | 118-120 | `raw_role = data.get("target_subagent")` — unsanitized field used in trace output | Sanitize: `raw_role = str(data.get("target_subagent", ""))[:64]` |
| packages/mcp-server/src/ | (handler) | `write_mandate_result` handler — no Zod validation of `analyst` regex or `findings` length | Add Zod safeParse with detailed error response |

---

*Report written by `devsteps-R1-analyst-quality` · SPIKE-032 · 2026-03-08*

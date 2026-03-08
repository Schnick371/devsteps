# Integration Analysis Report — AITK Local GPU + Spider Web Architecture
## Cross-Boundary Coordination Requirements for SPIKE-032

**Analyst:** `devsteps-R2-aspect-integration`  
**Aspect:** Integration Cross-Validation  
**Item IDs:** SPIKE-032  
**Triage Tier:** COMPETITIVE_PLUS  
**Date:** 2026-03-08  
**Upstream Ring 1 Reports Consumed:**
- `RESEARCH-AITK-GPU-analyst-research.md` (Research, ADOPT: Ollama+CUDA)
- `RESEARCH-AITK-GPU-analyst-archaeology.md` (Archaeology, GO verdict, confidence 0.93)
- `RESEARCH-AITK-GPU-analyst-risk.md` (Risk, OVERALL HIGH)
- `RESEARCH-AITK-GPU-analyst-quality.md` (Quality, CONDITIONAL)

**Integration Complexity Verdict: HIGH**  
**Confidence:** 0.91

---

## Executive Summary

The integration surface between local GPU inference (Ollama+CUDA) and the existing devsteps Spider Web architecture is **substantially larger than what is explicit in the task description**. Six undiscovered cross-boundary requirements are identified that are not stated in the SPIKE-032 mandate. The largest single blocker is the **`runSubagent` runtime boundary** — VS Code Copilot Chat agents and Python `agentdev` agents are completely separate runtimes with no native bridging mechanism. The only viable integration path without full rearchitecting is VS Code's BYOM (Bring Your Own Model) `chat.models` mechanism, which requires a `.vscode/settings.json` configuration file that does not currently exist. All integration points are solvable but require coordinated changes across **4 distinct layers** (VS Code config, Python visualizer, TypeScript MCP server, and agent frontmatter).

---

## Integration Analysis

### Package Boundary Crossings

| Changed In | Also Requires Change In | Coupling Type | Discovered By |
|---|---|---|---|
| `.vscode/settings.json` (new - BYOM Ollama model entry) | All `.github/agents/*.agent.md` `model:` frontmatter for Ring 4 workers | CONFIG-PROPAGATION | Integration analysis |
| `packages/mcp-server/src/` (Zod validation on `write_mandate_result`) | Python agentdev agents calling `mcp_devsteps_write_mandate_result` | PROTOCOL-CONTRACT | Quality report |
| `tmp/visualizer/visualizer/server.py` (OTLP security hardening) | Inbound OTLP from any agent using `configure_spider_web_tracing()` | SECURITY-BOUNDARY | Quality report |
| `tmp/visualizer/visualizer/requirements.txt` (pin agentdev version) | `.vscode/tasks.json` task definitions for Visualizer | DEPENDENCY-LOCK | Quality + Archaeology reports |
| AITK Tool Catalog registration config (new) | `.vscode/mcp.json` (already exists, separate registration system) | DUAL-REGISTRATION | Integration analysis |
| Python MCP client in `tmp/visualizer/agent.py` (not yet implemented) | `packages/mcp-server/` Node.js stdio server (cold-start per call) | CROSS-LANGUAGE-IPC | Integration analysis |

---

## Point 1: `runSubagent` ↔ Ollama Bridge

**Integration Complexity: HIGH**  
**Undiscovered Requirements: 2**

### What is stated

Ring 4 worker agents could redirect their LLM call to Ollama instead of Copilot.

### Actual Integration Boundary

`runSubagent` is a **GitHub Copilot-proprietary API** within VS Code Chat. It dispatches `.agent.md`-defined agents using the Copilot/Claude backend exclusively. There is **no native mechanism** to redirect a `runSubagent` dispatch to a local Ollama endpoint at the protocol level.

The ONLY viable bridge without rearchitecting the dispatch layer is **VS Code BYOM via `chat.models`**:

```json
// .vscode/settings.json — FILE DOES NOT CURRENTLY EXIST
{
  "chat.models": [
    {
      "id": "ollama/llama3.2-11b",
      "name": "LLaMA 3.2 11B (Local GPU — Ollama)",
      "vendor": "ollama",
      "url": "http://127.0.0.1:11434/v1/chat/completions"
    }
  ]
}
```

The `model:` field in `.agent.md` frontmatter would then reference `"ollama/llama3.2-11b"`. VS Code's chat model routing layer resolves this to the Ollama endpoint. **No extension code changes required for this path.**

### Python WorkflowBuilder is a completely separate runtime

Python `agentdev` agents using `WorkflowBuilder` + `Executor` cannot dispatch via `runSubagent`. These are **mutually exclusive runtimes**. Mixing them in a single dispatch chain requires explicit HTTP bridging code (e.g., Ring 4 worker calls `agentdev run` as a subprocess, then reads its output). This is a significant architectural seam.

### Undiscovered Requirements

**UR-1.1 — VS Code settings.json BYOM config does not exist:**
The file `.vscode/settings.json` (distinct from `.vscode/mcp.json` and `.vscode/tasks.json`) does not currently contain a `chat.models` entry. This must be created before any agent frontmatter `model:` update takes effect. Without it, `runSubagent` targeting a local model ID will fail silently by falling back to the default cloud model.

**UR-1.2 — Model ID naming contract undefined:**
A model ID naming convention for BYOM local models is not established. The `model:` field in `.agent.md` frontmatter must use an ID that exactly matches the `id` key in `chat.models`. If IDs diverge (e.g., `"ollama/llama3.2:11b"` vs `"llama-3.2-11b"`), routing silently fails. A workspace-level naming convention must be codified before updating agent files.

### Integration Sequence for Point 1

1. Create `.vscode/settings.json` with `chat.models` entry (Ollama endpoint)
2. Define and document model ID convention in `AITK-Tools-Guide-Reference.md`
3. Update Ring 4 worker `.agent.md` files: update `model:` frontmatter for target agent class
4. Verify routing with a single Ring 4 worker test dispatch before fleet-wide rollout
5. Gate: confirm `runSubagent` successfully dispatches to Ollama endpoint

---

## Point 2: AITK Agent Inspector ↔ Spider Web Visualizer

**Integration Complexity: LOW (coexistence) / HIGH (trace unification)**  
**Undiscovered Requirements: 2**

### What is stated

Two visualization systems must coexist: AITK Agent Inspector (ports 5679/8087) and Spider Web Visualizer (port 7890).

### Actual Topology

These are **not competing systems** — the Spider Web Visualizer (`tmp/visualizer/agent.py`) IS the agentdev agent running on ports 5679/8087. The "two systems" are different views of the same process:

- Port **8087**: `agentdev` HTTP server (AITK Agent Inspector connection point)  
- Port **7890**: Spider Web HTTP API (REST/OTLP receiver for external OTLP senders)  
- Port **5679**: debugpy listener (F5 debugging)
- Ports **4317/4318**: AITK OTLP gRPC/HTTP collectors (optional; AITK extension must be running)

These all coexist without conflict today. The actual tension is in **what gets traced**:

| Event Source | Captured by Spider Web Visualizer | Captured by AITK Agent Inspector |
|---|---|---|
| Python agentdev workflow steps | ✅ (via OTLP to :7890) | ✅ (via debugpy + agentdev span model) |
| `runSubagent` VS Code Chat dispatches | ❌ (fundamental limitation — Chat runtime is opaque) | ❌ (same limitation) |
| FSWatcher MandateResult writes | ✅ (devsteps_watcher.py → trace) | ❌ (not in agentdev span model) |
| MCP tool calls from Chat agents | ❌ | ❌ |
| MCP tool calls from Python agentdev agents | ✅ (via tracing instrumentation in caller) | ✅ (if traced via OTel SDK) |

**Critical finding:** `runSubagent`-based VS Code Chat agent dispatches are **invisible to both** visualization systems. The archaeology and quality reports confirm this as a fundamental, documented limitation. The FSWatcher bridge is the only indirect signal for Chat agent activity.

### Undiscovered Requirements

**UR-2.1 — Port allocation registry does not exist:**
With ports 5679, 7890, 8087, 4317, 4318, 11434 (Ollama) all potentially in use in the devsteps workspace, there is no central port allocation document. When any port conflict occurs (e.g., another process using 7890), the Visualizer task fails silently. A port registry in `AITK-Tools-Guide-Reference.md` is needed.

**UR-2.2 — `devsteps_watcher.py` ↔ AITK Agent Inspector span model mismatch:**
The `devsteps_watcher.py` FSWatcher creates OTel spans from MandateResult file events. These spans use a custom attribute schema (`mandate_id`, `item_ids`, `analyst`, `ring`). AITK Agent Inspector renders spans from the standard agentdev span model (`workflow_id`, `step_id`, `agent_name`). The two span schemas are incompatible — custom spans from `devsteps_watcher` will appear in the Spider Web radar chart but NOT in AITK's agent workflow graph. A span translation layer or unified span schema is required for cross-system visualization.

---

## Point 3: MCP Protocol ↔ AITK Tool Catalog

**Integration Complexity: LOW**  
**Undiscovered Requirements: 1**

### What is stated

AITK v0.30.0+ supports local stdio MCP servers. The devsteps MCP server could be registered as an AITK Tool Catalog entry.

### Actual Integration Boundary

The devsteps MCP server is already registered in **two places** for VS Code native use:
- `.vscode/mcp.json` — VS Code 1.109+ native MCP client
- `packages/extension/src/mcpServerManager.ts` — VSIX extension provider

AITK Tool Catalog uses a **third, separate registration mechanism** that is distinct from `.vscode/mcp.json`. Based on AITK v0.30.0 documentation and the `aitk_agent_as_server` tool registered in coord's agent frontmatter, the AITK Tool Catalog registration likely uses:

```json
// Likely config path: .vscode/ai-toolkit.json or AITK extension settings
{
  "mcp_servers": {
    "devsteps": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "--package=@schnick371/devsteps-mcp-server@next", "devsteps-mcp", "${workspaceFolder}"]
    }
  }
}
```

The exact AITK Tool Catalog config format requires verification (see Action ATK-3.1 below).

### Schema & Migration Requirements

**NONE** — no data structure changes. MCP protocol is fully compatible as confirmed by research report (Axis 7). The devsteps MCP stdio transport is supported by AITK v0.30.0 Tool Catalog without modification.

### Undiscovered Requirements

**UR-3.1 — Dual MCP registration configs required:**
VS Code native MCP (`.vscode/mcp.json`) and AITK Tool Catalog registration are **separate configs** targeting different consumers. If devsteps MCP is registered in Tool Catalog, both configs must be kept in sync when the MCP server version is updated. No synchronization mechanism exists today. A shared variable (e.g., npm package version env var) or documentation note in `AITK-Tools-Guide-Reference.md` is needed.

---

## Point 4: `agentdev` ↔ TypeScript Monorepo

**Integration Complexity: MEDIUM**  
**Undiscovered Requirements: 3**

### What is stated

`agentdev` is Python-based (`tmp/visualizer/agent.py`). TypeScript Spider Web agents are VS Code Chat extensions. Integration path for a Python agent calling devsteps MCP tools is needed.

### Two Invocation Paths — Neither Currently Implemented

**Path A (Correct — MCP Protocol):**
```
Python agentdev agent
  └── Python MCP client (mcp Python SDK)
      └── stdio → npx @schnick371/devsteps-mcp-server@next (Node.js process)
          └── MCP tool: mcp_devsteps_write_mandate_result, etc.
```

This is the architecturally correct path. It respects the MCP protocol contract and ensures Zod validation runs server-side. The devsteps MCP server spawns per invocation or uses a persistent connection.

**Path B (Bypass — Direct Filesystem):**
```
Python agentdev agent
  └── json.dump() → .devsteps/cbp/{sprint_id}/{mandate_id}.result.json
```

This bypasses MCP entirely, violating the "NEVER edit `.devsteps/` directly — MCP tools only" invariant from `copilot-instructions.md`. **Path B MUST NOT be used.**

**Current state:** Neither path is implemented in `agent.py`. The current `agent.py` is a pure HTTP server with FSWatcher — it does not invoke any devsteps MCP tools.

### Undiscovered Requirements

**UR-4.1 — No Python MCP client wrapper exists:**
The devsteps MCP server has no Python client SDK or generated bindings. If Python agentdev agents need to write MandateResults, they must either:
a. Use the generic `mcp` Python SDK (`pip install mcp`) with the stdio server
b. Implement a thin Python `DevstepsMCPClient` wrapper class in `visualizer/` 

No client implementation or installation instruction exists in `visualizer/requirements.txt`.

**UR-4.2 — MCP stdio cold-start overhead under parallel access:**
The current `.vscode/mcp.json` spins up the MCP server via `npx -y --package=@schnick371/devsteps-mcp-server@next`. Each call to spawn the stdio server has cold-start overhead (~1–3 seconds for npx + node startup). Under parallel fan-out with 10 Python agents simultaneously calling the MCP server, this creates 10 concurrent `npx` subprocess spawns. The installed package path (`~/.npm/_npx/`) may partially cache this, but the first-run overhead can cause fan-out timing issues.

**Resolution:** Use the locally installed MCP server binary (`packages/mcp-server/dist/index.js`) instead of npx in the Python MCP client config, pointing to the local build.

**UR-4.3 — Python venv lifecycle not integrated into npm workspace:**
The `.venv` at `tmp/visualizer/.venv` is:
- Not tracked by git (correct)
- Not created/validated by any `package.json` script
- Not reproducible via standard `npm install`

When a developer clones the repo and runs `npm install`, the Python venv for the visualizer is silently absent. The AITK task chain then fails when `tmp/visualizer/.venv/bin/python` is missing. A `preinstall` or `postinstall` npm script (or a `Makefile`/`scripts/setup-visualizer.sh`) is needed to create and populate the venv.

---

## Point 5: Evaluation Framework Integration

**Integration Complexity: MEDIUM**  
**Undiscovered Requirements: 2**

### What is stated

AITK v0.30.0 has "Evaluation as Tests" (pytest syntax). How does this integrate with Vitest + BATS?

### Actual Integration Boundary

These are **completely separate** test paradigms with no native integration:

| Dimension | Vitest (TypeScript) | BATS (bash) | AITK Eval as Tests (Python pytest) |
|---|---|---|---|
| Scope | Unit tests for shared/mcp-server/extension TypeScript code | CLI integration tests | Agent output quality evaluation |
| Runner | Vitest test runner + VS Code Test Explorer | bats CLI | pytest + Eval Runner SDK + VS Code Test Explorer |
| Parallel execution | Yes | Sequential bash | Parallel via pytest |
| Result format | TAP / JUnit XML | TAP | AITK Eval Results format (tabular, Data Wrangler) |
| CI integration | `npm test` → vitest | `npm run test:cli` → bats | `pytest evaluations/` (not yet configured) |

These layers can coexist without conflict. They cannot share test results or assertions directly.

### Can AITK eval tests call devsteps MCP?

Yes — via the Python MCP client (Path A from Point 4). An AITK eval test can spawn the devsteps MCP stdio server as a subprocess and query item state:

```python
# evaluations/test_mandate_result_quality.py (does not exist yet)
import pytest
from mcp import StdioMCPClient

@pytest.fixture
def devsteps():
    return StdioMCPClient("node", ["packages/mcp-server/dist/index.js", "."])

def test_mandate_result_has_valid_analyst_format(devsteps):
    result = devsteps.call("mcp_devsteps_read_mandate_results", {"sprint_id": "SPIKE-032-research"})
    for r in result.results:
        assert re.match(r"^devsteps-R\d+-", r["analyst"])
```

This requires the Python MCP client (UR-4.1) and a built MCP server dist (`packages/mcp-server/dist/index.js`).

### Undiscovered Requirements

**UR-5.1 — No `evaluations/` directory or pytest config:**
AITK eval tests require a pytest configuration and an `evaluations/` directory structure. Neither exists in the monorepo. Adding AITK eval tests requires:
- `evaluations/conftest.py` (devsteps MCP fixture)
- `pytest.ini` or `pyproject.toml` in `tmp/visualizer/`
- `requirements.txt` addition: `pytest azure-ai-evaluation`

**UR-5.2 — Cross-language result schema mismatch:**
AITK eval results are output in a proprietary tabular format consumed by Data Wrangler. They cannot be ingested into Vitest's reporter pipeline. CI pipelines that run `npm test` will not see AITK eval results unless a separate pytest CI job is added. The `.github/workflows/` CI configuration (if it exists) must be extended.

---

## Point 6: Cross-Package Coordination Requirements

**Integration Complexity: MEDIUM-LOW**  
**Undiscovered Requirements: 1**

### Package Change Matrix

| Package | Change Required | Type | Priority |
|---|---|---|---|
| `tmp/visualizer/visualizer/server.py` | Body size limit + optional X-API-Key auth | SECURITY (OWASP A07) | P1 |
| `tmp/visualizer/visualizer/devsteps_watcher.py:118` | Sanitize `target_subagent` field | SECURITY (OWASP A10) | P1 |
| `tmp/visualizer/requirements.txt` | Pin `agent-dev-cli` to specific version | STABILITY | P1 |
| `packages/mcp-server/src/` | Add Zod validation to `write_mandate_result` handler | QUALITY | P1 |
| `.vscode/settings.json` (NEW FILE) | Add `chat.models` BYOM entry for Ollama | INTEGRATION | P2 |
| `.github/agents/worker-*.agent.md` (Ring 4) | Update `model:` frontmatter to BYOM local model ID | INTEGRATION | P2 |
| `tmp/visualizer/visualizer/requirements.txt` | Add `mcp` Python SDK | INTEGRATION | P2 |
| `tmp/visualizer/agent.py` or new `mcp_client.py` | Implement Python MCP client wrapper | INTEGRATION | P2 |
| `scripts/setup-visualizer.sh` (NEW) | Python venv creation/validation script | DX | P3 |
| `package.json` root | Add `preinstall`/`setup` script to call `setup-visualizer.sh` | DX | P3 |
| `evaluations/` (NEW DIRECTORY) | AITK eval tests structure | QUALITY | P3 |

**No new TypeScript package is required.** The prior GPU research Gate PASS decision stands: "Keep VSIX GPU-free. Use Ollama out-of-process."

### Build Coordination

Build steps that must run in order:

```
1. npm run build (packages/mcp-server → dist/) — prerequisite for Python MCP client
2. pip install -r requirements.txt (with pinned versions) — Python venv setup
3. ollama serve + ollama pull llama3.2:11b — GPU inference backend
4. VS Code: add settings.json chat.models — BYOM routing
5. Visualizer: npm run visualizer:start (new script) OR F5 debug
```

**Undiscovered Requirement:**

**UR-6.1 — No documented startup order or health check:**
The integration has a hard dependency ordering: MCP server must be built before Python client, Ollama must be running before agents dispatch, VS Code BYOM settings must be in place before Chat agent routing. No startup order documentation, health check script, or `wait-for` mechanism exists. A `scripts/check-integration-health.sh` or an npm `precheck` script is needed.

---

## Schema/Migration Requirements

**NONE for `.devsteps/` data model.** All `.devsteps/` JSON schemas remain unchanged. No migration is required for existing items, indexes, or MandateResults.

The only schema addition is **server-side Zod validation** in `write_mandate_result`:
- This is additive enforcement (returns error on malformed input)
- Existing valid MandateResults continue to work unchanged
- Malformed MandateResults that previously silently passed will now return an error

---

## Protocol Coordination

| Requirement | Who Needs to Act | Restart/Reload Required? |
|---|---|---|
| `.vscode/settings.json` added | VS Code must reload window | YES — reload window for `chat.models` to take effect |
| AITK Tool Catalog registration | User must add via AITK Tool Catalog UI | YES — AITK extension restart |
| Ollama server startup | System service or manual `ollama serve` | NO — runs as local service |
| Python venv update (new packages) | `pip install -r requirements.txt` | NO — available immediately |
| MCP server rebuild | `npm run build` in mcp-server | NO — CLI picks up new dist/ |
| agentdev version pin | `pip install agent-dev-cli==<pinned>` | YES — restart Visualizer task |

---

## Undiscovered Requirements Summary

> **10 previously unstated cross-boundary coordination requirements identified:**

| ID | Requirement | Priority | Affects |
|---|---|---|---|
| **UR-1.1** | Create `.vscode/settings.json` with `chat.models` BYOM Ollama entry | P1 | runSubagent routing to local GPU |
| **UR-1.2** | Define model ID naming convention for BYOM models | P1 | Agent frontmatter, chat.models, BYOM routing |
| **UR-2.1** | Create port allocation registry document | P3 | docs, AITK-Tools-Guide-Reference.md |
| **UR-2.2** | Span schema translation layer: devsteps OTel → AITK Agent Inspector span model | P2 | devsteps_watcher.py, AITK tracing |
| **UR-3.1** | Dual MCP registration sync policy (mcp.json + AITK Tool Catalog) | P2 | .vscode/mcp.json, AITK registration |
| **UR-4.1** | Python MCP client implementation (mcp Python SDK + DevstepsMCPClient wrapper) | P1 | agent.py, visualizer/ Python layer |
| **UR-4.2** | MCP stdio cold-start under parallel Python fan-out → use local dist path | P2 | visualizer/ MCP client config |
| **UR-4.3** | Python venv lifecycle integration into npm workspace (setup script) | P2 | DX, CI, onboarding |
| **UR-5.1** | Create `evaluations/` directory + pytest config + fixtures | P3 | AITK eval tests |
| **UR-5.2** | Separate CI job for AITK eval tests (not part of `npm test`) | P3 | CI pipeline |
| **UR-6.1** | Startup order documentation + health check script | P2 | DX, onboarding |

---

## Integration Sequence (Ordered by Dependency)

```
Phase 1 — Security (unblock all subsequent work)
  └── server.py: body size limit + X-API-Key header check         [P1]
  └── devsteps_watcher.py: sanitize target_subagent              [P1]
  └── requirements.txt: pin agent-dev-cli version                 [P1]
  └── mcp-server/src/: Zod validation for write_mandate_result   [P1]

Phase 2 — Configuration (enable BYOM routing)
  └── Create .vscode/settings.json with chat.models (Ollama)      [P1, UR-1.1]
  └── Document BYOM model ID naming convention                    [P1, UR-1.2]
  └── Register devsteps MCP in AITK Tool Catalog                  [P2, UR-3.1]
  └── Implement Python MCP client wrapper                         [P1, UR-4.1]

Phase 3 — Agent Frontmatter (selective local model rollout)
  └── Update Ring 4 worker/.agent.md: set model: ollama/<id>      [P2]
  └── Verify single-agent test dispatch via BYOM                  [P2]

Phase 4 — Developer Experience
  └── Create scripts/setup-visualizer.sh + npm precheck           [P2, UR-4.3]
  └── Add port registry to AITK-Tools-Guide-Reference.md          [P3, UR-2.1]
  └── Add startup order docs + health check script                [P2, UR-6.1]

Phase 5 — Evaluation (optional, P3)
  └── Create evaluations/ + pytest fixtures + CI job              [P3]
```

---

## Key Architectural Decisions Required

### ADR-SPIKE-032-1: Python WorkflowBuilder vs `runSubagent` BYOM

**Decision needed:** Should the local GPU integration path be:

- **Option A (BYOM RECOMMENDED):** Configure VS Code `chat.models` → Ollama; update `.agent.md` `model:` frontmatter; `runSubagent` dispatches to local model via VS Code BYOM. No dispatch architecture change. Selective rollout: Ring 4 workers only initially.
  - Pros: Minimal change, selective, reversible
  - Cons: VRAM fan-out risk (10-agent parallel → must batch or use small model ≤8B)

- **Option B (FULL REARCHITECT):** Replace `runSubagent` + `.agent.md` dispatch with Python `WorkflowBuilder` + `agentdev` for all agents. Full Spider Web runs in Python.
  - Pros: Full control over model routing, native AITK tracing
  - Cons: Complete rearchitect of 36-agent system; loses VS Code Chat UX; months of work

**Recommendation:** Option A (BYOM), Ring 4 workers only, with sequential fan-out batching (≤6 parallel on 12GB VRAM with 8B models).

### ADR-SPIKE-032-2: runSubagent vs Python MCP calls for MandateResults

**Decision needed:** When Python agentdev agents participate in a sprint (e.g., as eval agents), should they write MandateResults via:

- **Option A:** Python MCP client → `mcp_devsteps_write_mandate_result` (correct, validates schema)
- **Option B:** Direct filesystem write to `.devsteps/cbp/` (violates protocol invariant)

**Recommendation:** Option A exclusively. Implement Python MCP client wrapper (UR-4.1).

---

## Appendix: Port Allocation Map (Not Currently Documented)

| Port | Service | Who Binds | Config Source |
|---|---|---|---|
| `5679` | debugpy remote listener | `tmp/visualizer/.venv/bin/python` | `.vscode/tasks.json:324` |
| `7890` | Spider Web HTTP server | `visualizer/server.py` | `visualizer/server.py:run_server()` |
| `8087` | agentdev HTTP server (Agent Inspector) | `agentdev run agent.py` | `.vscode/tasks.json:326` |
| `4317` | AITK OTLP gRPC collector | AITK extension | `otel_setup.py:configure_spider_web_tracing()` |
| `4318` | AITK OTLP HTTP collector | AITK extension | `otel_setup.py:configure_spider_web_tracing()` |
| `11434` | Ollama inference API | `ollama serve` | ENV: `OLLAMA_HOST=127.0.0.1:11434` |

**All ports must bind to `127.0.0.1` only — never `0.0.0.0`.**

---

*Report written by `devsteps-R2-aspect-integration` · SPIKE-032 · 2026-03-08*  
*Integration Complexity: HIGH | Undiscovered Requirements: 10*

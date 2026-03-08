# Archaeology Report — SPIKE-032: Local GPU + VS Code AI Toolkit Agent Inspector

**Mandate type:** archaeology  
**Agent:** devsteps-R1-analyst-archaeology  
**Item IDs:** SPIKE-032  
**Triage tier:** COMPETITIVE_PLUS  
**Date:** 2026-03-08  
**Sprint ID:** SPIKE-032-research  
**Verdict:** GO  
**Confidence:** 0.93  

---

## Executive Summary

The devsteps monorepo has a **substantial, fully-operational AITK integration** built around the Spider Web Visualizer (`tmp/visualizer/`), with `agentdev`, `debugpy`, and OTLP tracing infrastructure already wired into VS Code tasks and launch configurations. However, there is **zero GPU/CUDA/local-model infrastructure** anywhere in the TypeScript extension or MCP server — all agents uniformly call cloud LLMs (Claude Sonnet 4.6) through VS Code's built-in `runSubagent` mechanism. A prior COMPETITIVE+ GPU research sprint (`gpu-vscode-projects-2026-03-05`, Gate PASS 2026-03-05) validated and concluded: **keep VSIX GPU-free; use Ollama out-of-process proxy**. SPIKE-032 builds on that validated foundation and has a clear, unobstructed integration path.

---

## Area 1 — AITK Integration Evidence

### What Exists Today

| Artifact | Location | Status |
|----------|----------|--------|
| AITK task type (`"type": "aitk"`) | `.vscode/tasks.json:317` | Active |
| AITK `debug-check-prerequisites` command | `.vscode/tasks.json:318` | Active (checks ports 5679, 8087) |
| AITK Agent Inspector task | `.vscode/tasks.json:353` | Active (uses `ai-mlstudio.openTestTool`) |
| AITK debug launch config | `.vscode/launch.json:62–78` | Active (`debugpy` attach to port 5679) |
| AITK tool calls in coord agent | `.github/agents/devsteps-R0-coord.agent.md:5` | Active (20+ AITK tools in `tools:` list) |
| AITK extension in extensions.json | `.vscode/extensions.json:58` | Unwanted (Windows-specific note) |
| AITK research report | `tmp/visualizer/RESEARCH-REPORT-AITK-MultiAgent.md` | Final (2026-03-01) |
| AITK guide (workplan) | `tmp/visualizer/AITK-Tools-Guide.md` | Active workplan |
| AITK guide reference | `tmp/visualizer/AITK-Tools-Guide-Reference.md` | Final (2026-03-04) |
| AITK guide dev/session log | `tmp/visualizer/AITK-Tools-Guide-Dev.md` | Active |

### AITK Tools Registered in coord agent

The coord agent (`devsteps-R0-coord.agent.md`) has explicit AITK tools in its `tools:` frontmatter:

```
ms-windows-ai-studio.windows-ai-studio/aitk_get_ai_model_guidance
ms-windows-ai-studio.windows-ai-studio/aitk_get_agent_model_code_sample
ms-windows-ai-studio.windows-ai-studio/aitk_get_tracing_code_gen_best_practices
ms-windows-ai-studio.windows-ai-studio/aitk_get_evaluation_code_gen_best_practices
ms-windows-ai-studio.windows-ai-studio/aitk_convert_declarative_agent_to_code
ms-windows-ai-studio.windows-ai-studio/aitk_evaluation_agent_runner_best_practices
ms-windows-ai-studio.windows-ai-studio/aitk_evaluation_planner
ms-windows-ai-studio.windows-ai-studio/aitk_get_custom_evaluator_guidance
ms-windows-ai-studio.windows-ai-studio/check_panel_open
ms-windows-ai-studio.windows-ai-studio/get_table_schema
ms-windows-ai-studio.windows-ai-studio/data_analysis_best_practice
ms-windows-ai-studio.windows-ai-studio/read_rows / read_cell / export_panel_data / get_trend_data
ms-windows-ai-studio.windows-ai-studio/aitk_list_foundry_models
ms-windows-ai-studio.windows-ai-studio/aitk_agent_as_server
ms-windows-ai-studio.windows-ai-studio/aitk_add_agent_debug
ms-windows-ai-studio.windows-ai-studio/aitk_gen_windows_ml_web_demo
```

**Risk:** `ms-windows-ai-studio.windows-ai-studio` is labelled "Windows-spezifisch" in `extensions.json` and marked unwanted — on Linux, these tools may not respond even if the extension is installed.

---

## Area 2 — Multi-Agent Infrastructure (Spider Web Visualizer)

### Python Package Inventory (`tmp/visualizer/visualizer/`)

| File | Role |
|------|------|
| `server.py` | HTTP server (port 7890 default), OTLP JSON receiver at `POST /v1/traces`, REST API |
| `otel_setup.py` | OTel tracing config — `configure_spider_web_tracing()` with AITK gRPC port 4317 support |
| `otel_exporter.py` | Custom `SpiderWebSpanExporter` — writes spans to `data/spider_traces.jsonl` |
| `devsteps_watcher.py` | FSWatcher on `.devsteps/` — watches MandateResults, feeds real-time visualizer |
| `spider_web_chart.py` | Generates Spider Web radar HTML chart |
| `registry.py` | Agent topology registry (all 36 agents, Ring 0–5) → `GET /api/topology` |
| `trace.py` / `trace_loader.py` | JSONL trace I/O, snapshot builder |
| `classifier.py` | Maps raw agent names to canonical IDs |
| `agent.py` (root) | `agentdev run` entrypoint — delegates to `visualizer.server.run_server()` |

### OTLP Tracing Chain

```
Python agent process
  └── SpiderWebSpanExporter → data/spider_traces.jsonl
  └── OTLPSpanExporter (optional) → localhost:4317 (AITK gRPC) or :4318 (HTTP)

VS Code Visualizer
  └── GET /api/traces → real-time span snapshots
  └── POST /v1/traces → OTLP JSON ingestion (set OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:7890)

AITK Agent Inspector
  └── ai-mlstudio.openTestTool(port=8087)  ← Visualizer runs here via agentdev
  └── Receives debugpy attach on 127.0.0.1:5679
```

### `agentdev` (`agent-dev-cli`) Integration

- `requirements.txt`: `agent-dev-cli --pre` (Microsoft Agent Framework CLI pre-release)
- Launch command: `python -m debugpy --listen 127.0.0.1:5679 -m agentdev run agent.py --verbose --port 8087`
- The `--server` flag in `agent.py` enables compatibility with `agentdev`'s agent-as-server pattern
- The `agentdev` package manages the agent HTTP lifecycle, enabling AITK's Agent Inspector to connect

---

## Area 3 — VS Code Task Definitions (Visualizer / AITK)

### Visualizer Task Chain (`.vscode/tasks.json`)

```
🕷 Visualizer: Validate Prerequisites  (type: aitk, command: debug-check-prerequisites)
  └── args: { portOccupancy: [5679, 8087] }
  └─→ 🕷 Visualizer: Run HTTP Server (Agent Inspector)
        command: ${workspaceFolder}/tmp/visualizer/.venv/bin/python
                 -m debugpy --listen 127.0.0.1:5679
                 -m agentdev run ${workspaceFolder}/tmp/visualizer/agent.py
                 --verbose --port 8087
                 -- --devsteps-root ${workspaceFolder}/.devsteps
        isBackground: true
        problemMatcher: waits for "Spider Web Visualizer" pattern
        └─→ 🕷 Visualizer: Open Agent Inspector
              command: ai-mlstudio.openTestTool { port: 8087 }
🕷 Visualizer: Terminate All Tasks
  command: workbench.action.tasks.terminate
```

### Debug Launch Configuration (`.vscode/launch.json`)

```json
{
  "name": "🕷 Debug Visualizer HTTP Server (Agent Inspector)",
  "type": "debugpy",
  "request": "attach",
  "connect": { "host": "localhost", "port": 5679 },
  "preLaunchTask": "🕷 Visualizer: Open Agent Inspector",
  "postDebugTask": "🕷 Visualizer: Terminate All Tasks",
  "pathMappings": [{ "localRoot": "${workspaceFolder}/tmp/visualizer", "remoteRoot": "..." }]
}
```

**Ports in use:**
- `5679` — debugpy remote debug listener (Python process)
- `7890` — Spider Web HTTP server (default; tasks use 8087)
- `8087` — Agent Inspector / agentdev server port
- `4317` — AITK OTLP gRPC collector (optional, AITK must be running)
- `4318` — AITK OTLP HTTP collector (optional)

---

## Area 4 — `tmp/visualizer/` Complete Inventory

```
tmp/visualizer/
├── agent.py                          ← agentdev entrypoint (Spider Web HTTP server)
├── AITK-Tools-Guide.md               ← Active workplan (German, phases 0–6)
├── AITK-Tools-Guide-Dev.md           ← Session log + ADRs (Architecture Decision Records)
├── AITK-Tools-Guide-Reference.md     ← Spider Web v4.0 architecture reference
├── QUICK_REFERENCE.md                ← Dispatch protocol quick reference card
├── README.md                         ← AI Toolkit Agent Development Workspace doc
├── RESEARCH-REPORT-AITK-MultiAgent.md ← Research (2026-03-01, historical T1/T2/T3)
├── data/
│   └── spider_traces.jsonl           ← Live trace data (appended by SpiderWebSpanExporter)
├── visualizer/                       ← Python package
│   ├── __init__.py / __main__.py
│   ├── server.py                     ← HTTP server + OTLP receiver
│   ├── otel_setup.py                 ← configure_spider_web_tracing() helper
│   ├── otel_exporter.py              ← SpiderWebSpanExporter (JSONL writer)
│   ├── spider_web_chart.py           ← Radar chart HTML generator
│   ├── devsteps_watcher.py           ← FSWatcher → live MandateResult bridge
│   ├── registry.py                   ← 36-agent topology registry
│   ├── trace.py / trace_loader.py    ← JSONL I/O
│   ├── classifier.py                 ← Agent name normalizer
│   ├── chart.py / loader.py / main.py
│   └── requirements.txt             ← plotly, watchdog, debugpy, agent-dev-cli --pre
└── .venv/                            ← Python virtual environment (present)
```

---

## Area 5 — MCP Client Configuration / Extension AI Endpoints

### `.vscode/mcp.json`

```json
{
  "servers": {
    "devsteps": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "--package=@schnick371/devsteps-mcp-server@next", "devsteps-mcp", "/home/th/dev/projekte/playground/devsteps"],
      "env": {}
    }
  }
}
```

**Finding:** Only one MCP server registered — devsteps MCP. No local inference server, no Ollama proxy, no GPU endpoint configured.

### `packages/extension/src/mcpServerManager.ts`

- Implements a 4-level fallback chain: HTTP in-process → stdio via npx → stdio via node → error
- Has `McpHttpServerDefinition` type (VS Code 1.109+) but **only used for devsteps MCP server**
- No AI model endpoint references anywhere in the class
- No `ollama`, `llama`, `GPU`, or inference URL references
- Extension declares `McpStdioServerDefinition` and `McpHttpServerDefinition` — both for devsteps only

### Extension `package.json`

- `"engines": { "vscode": "^1.109.0" }` — minimum required for in-process MCP
- `contributes.mcpServerDefinitionProviders`: `[{ "id": "devsteps-mcp", "label": "DevSteps MCP Server" }]`
- No GPU, CUDA, Ollama, or inference-related dependencies

---

## Area 6 — References to agentdev / debugpy / GPU Technologies

### `agentdev` (agent-dev-cli)

- `requirements.txt`: `agent-dev-cli --pre` — installed as Python CLI tool
- `tasks.json:326`: `python -m debugpy ... -m agentdev run agent.py --verbose --port 8087`
- `agent.py:7`: docstring states "Designed to be launched via: `agentdev run agent.py --verbose --port 8087`"
- **Gap:** `agentdev` is an internal Microsoft tool/CLI; public availability and API stability unclear

### `debugpy`

- `requirements.txt`: `debugpy` (no version pinned)  
  → **Risk:** Version unpinned; compatibility with Python venv may drift
- `.vscode/extensions.json`: `ms-python.debugpy` in `unwantedRecommendations` for the TS workspace
- But used explicitly in Visualizer task for remote debugging
- `launch.json`: `"type": "debugpy"`, `"request": "attach"` at port 5679

### GPU Technologies — Complete Absence in TypeScript/Extension Code

| Technology | Found? | Location |
|-----------|--------|----------|
| CUDA | No | — |
| GPU (code) | No | — |
| VRAM | No | — |
| Ollama | No | — |
| llama.cpp | No | — |
| ONNX | No | — |
| WebGPU | No | — |
| Local inference | No | — |

**Exception:** `.devsteps/research/gpu-in-vscode-projects-2026-03-05.md` references all of these — but as **research documents**, not as implementation code.

### Prior GPU Research in `.devsteps/`

- Comprehensive research report at `.devsteps/research/gpu-in-vscode-projects-2026-03-05.md`
- Sprint: `gpu-vscode-projects-2026-03-05` with 4 MandateResults (PASS)  
- Sprint: `gpu-research-2026-03-05` with 1 MandateResult (malformed — empty item_ids)
- **Research conclusion (Gate PASS):** "Keep VSIX GPU-free. Delegate to out-of-process sidecar (Ollama/ONNX). The winning approach uses pure TypeScript coordinator + HTTP proxy."

---

## Area 7 — Spider Web Protocol Model Routing

### Current Model: Uniform Claude Sonnet 4.6

Every `.github/agents/*.agent.md` file has `model: "Claude Sonnet 4.6"` in frontmatter:

| Agent | Ring | Model |
|-------|------|-------|
| coord, coord-sprint, coord-solo, coord-ishikawa | 0 | Claude Sonnet 4.6 |
| All analyst-* agents (archaeology, risk, quality, research, context, internal, web) | 1 | Claude Sonnet 4.6 |
| All aspect-* agents (impact, constraints, quality, staleness, integration) | 2 | Claude Sonnet 4.6 |
| exec-planner | 3 | Claude Sonnet 4.6 |
| All exec-* and worker-* agents | 4 | Claude Sonnet 4.6 |
| gate-reviewer | 5 | Claude Sonnet 4.6 |

**Note:** `AITK-Tools-Guide-Dev.md` (session log, 2026-02-28) references `Claude Opus 4.6` for analyst-context, analyst-internal, analyst-web, and all aspect agents. This is **historical** — predates Spider Web v4.0 (2026-03-04). Current agent files all specify Sonnet 4.6.

### How Model Routing Works

- All model calls go through VS Code's `runSubagent` mechanism
- No hardcoded API endpoints, no Azure OpenAI config, no API keys in codebase
- No `.env` files exist (confirmed: `file_search` for `.env*` returned empty)
- `AITK-Tools-Guide-Dev.md` confirms: "T2 agents call `aitk_get_ai_model_guidance` to get model recommendations from AITK — this is advisory only, not enforced routing"
- AITK tool `aitk_list_foundry_models` registered in coord — lists available Foundry models but does not configure routing

### How a Local GPU Model Would Connect

Based on the research (`gpu-in-vscode-projects-2026-03-05.md`) and VS Code 1.96+ BYOM capability:

```json
// .vscode/settings.json (not yet present/configured)
"chat.models": [{
  "id": "llama-3.2-11b-vision",
  "name": "LLaMA 3.2 11B (Local GPU)",
  "vendor": "ollama",
  "url": "http://127.0.0.1:11434/v1/chat/completions"
}]
```

The `model:` field in `.agent.md` files would then reference the local model ID. No code changes in extension required.

---

## Pattern Questions — Direct Answers

| Question | Answer |
|----------|--------|
| Does the project have GPU/CUDA configuration? | **No.** Zero GPU code anywhere in TypeScript/extension. Research only. |
| What model does Spider Web currently target? | **Claude Sonnet 4.6** — all 36 agents uniformly. No local model configured. |
| Are there `.env` files with AI endpoint URLs? | **No.** No `.env` files found. No hardcoded endpoints. |
| What `agentdev` references exist in `tmp/visualizer/`? | `agent-dev-cli --pre` in requirements.txt; launch command in tasks.json; entry point pattern in agent.py comment |
| Existing `launch.json` debug configs for agents? | Yes: `🕷 Debug Visualizer HTTP Server`, plus `Debug CLI`, `Debug MCP Server`, `Run Tests`, `Debug Current Test`, `Run Extension` |
| MCP client pointing to local GPU inference? | **No.** Only devsteps MCP server configured. |

---

## Architectural Risk Hotspots for SPIKE-032

1. **`agentdev` CLI not publicly documented:** `agent-dev-cli --pre` is pre-release. If AITK updates break the protocol, the Visualizer task chain fails silently. File: `tmp/visualizer/visualizer/requirements.txt:5`

2. **AITK tools Windows-specific:** The 20+ `ms-windows-ai-studio.windows-ai-studio/*` tools in coord's toolset are flagged as Windows-specific in `extensions.json`. On Linux, these calls may no-op. Risk for GPU integration research.

3. **No Python error handling in .venv:** The Visualizer task hardcodes `.venv/bin/python` path. If the venv is missing or broken, task silently fails with no guidance. File: `tasks.json:326`

4. **Port conflicts undetected:** Ports 5679 and 8087 are checked by AITK prereq task, but if AITK extension is unresponsive, the `validate-prerequisites` task may not surface the failure. File: `tasks.json:317–319`

5. **SPIKE-032 has no linked items:** The item has no `implements` or `depends-on` relationships. Linking to EPIC-040 (Dashboard/Visualizer) and the GPU research prior art is needed for traceability.

---

## Entry Points for Implementation (Pre-Located)

| Area | File | Line | What |
|------|------|------|------|
| AITK task definitions | `.vscode/tasks.json` | 315–375 | All 4 Visualizer tasks + inputs |
| Debug launch config | `.vscode/launch.json` | 61–80 | Debugger attach config |
| agentdev entrypoint | `tmp/visualizer/agent.py` | 1–60 | HTTP server bootstrap |
| OTLP tracing config | `tmp/visualizer/visualizer/otel_setup.py` | 1–80 | `configure_spider_web_tracing()` |
| OTLP receiver | `tmp/visualizer/visualizer/server.py` | 80–150 | `POST /v1/traces` handler |
| MandateResult watcher | `tmp/visualizer/visualizer/devsteps_watcher.py` | all | FSWatcher bridge |
| Extension MCP manager | `packages/extension/src/mcpServerManager.ts` | 1–150 | MCP server lifecycle |
| MCP config | `.vscode/mcp.json` | all | Current MCP server config |
| Agent model specs | `.github/agents/*.agent.md` | 3 | `model:` frontmatter line |
| GPU research report | `.devsteps/research/gpu-in-vscode-projects-2026-03-05.md` | all | Prior research baseline |

---

## Recommendations for exec-planner

1. **Build on existing Visualizer (not from scratch):** `tmp/visualizer/` is a functioning OTLP + FSWatcher infrastructure. GPU integration work should extend `otel_setup.py` and `devsteps_watcher.py`, not replace them.

2. **Local model integration via VS Code BYOM, not extension code:** Add `chat.models` entry to `.vscode/settings.json` pointing to Ollama `localhost:11434`. Update agent frontmatter `model:` field for target agent class. No extension code changes needed.

3. **Research AITK `aitk_agent_as_server` capability on Linux:** This tool is registered in coord — its behavior on Linux (non-Windows) needs verification before relying on it for GPU agent-server pattern.

4. **Fix `gpu-research-2026-03-05` MandateResult:** Only entry in that sprint has `EMPTY_ITEM_IDS + BAD_ANALYST_FORMAT` (per TASK-335 audit). Should be linked to SPIKE-032 retroactively or archived.

5. **Guard `agent-dev-cli --pre`:** Pin the version or add a `--no-pre` fallback in the Visualizer requirements.txt. Pre-release CLIs can break without notice.

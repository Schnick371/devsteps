# Staleness Analysis — SPIKE-032: AITK Integration & Guide Documentation

**Report ID:** 7a2b3c4d-5e6f-4a8b-9c0d-e1f2a3b4c5d1  
**Analyst:** devsteps-R2-aspect-staleness  
**Item IDs:** SPIKE-032  
**Triage Tier:** COMPETITIVE+  
**Date:** 2026-03-08  
**Aspect:** staleness  
**Verdict:** STALE-PARTIAL  

---

## Staleness Analysis

### Upstream Ring 1 Inputs Consumed

| Report | Date | Key Assertion Verified |
|--------|------|------------------------|
| RESEARCH-AITK-GPU-analyst-research.md | 2026-03-08 | AITK v0.30.0 feature set; agentdev CLI command format |
| RESEARCH-AITK-GPU-analyst-archaeology.md | 2026-03-08 | AITK v0.30.1 installed; task chain; requirements.txt content |
| RESEARCH-AITK-GPU-analyst-quality.md | 2026-03-08 | agent-dev-cli --pre risk; server.py security posture |

---

### 1. Reference Check — All Concrete References in SPIKE-032 Scope

| Reference | Status | Detail |
|---|---|---|
| `tmp/visualizer/AITK-Tools-Guide.md` | EXISTS | Active workplan |
| `tmp/visualizer/AITK-Tools-Guide-Dev.md` | EXISTS | Session log + ADRs |
| `tmp/visualizer/AITK-Tools-Guide-Reference.md` | EXISTS | Architecture reference v4.0 |
| `tmp/visualizer/RESEARCH-REPORT-AITK-MultiAgent.md` | EXISTS | Historical artifact, self-labeled |
| `tmp/visualizer/README.md` | EXISTS | Template mismatch (see below) |
| `tmp/visualizer/QUICK_REFERENCE.md` | EXISTS | Spider Web v4.0 reference |
| `tmp/visualizer/visualizer/requirements.txt` | EXISTS | Unpinned deps (see below) |
| `.vscode/tasks.json` — Visualizer tasks | EXISTS | Lines 317–373 |
| `.github/agents/devsteps-R0-coord.agent.md` | EXISTS | 20+ AITK tools in frontmatter |
| `.github/agents/AGENT-DISPATCH-PROTOCOL.md` | EXISTS | Referenced from guide files, valid link |
| `devsteps-coord.agent.md` (old non-Ring name) | RENAMED | Actual file: `devsteps-R0-coord.agent.md` |
| `devsteps-analyst-*.agent.md` (old names in Guide) | RENAMED | Actual: `devsteps-R1-analyst-*.agent.md` |
| `devsteps-aspect-*.agent.md` (old names in Guide) | RENAMED | Actual: `devsteps-R2-aspect-*.agent.md` |

---

### 2. Recent Commits to Affected Paths

Git history query against `tmp/visualizer/*.md` since 2026-02-28 shows no tracked commits (the directory appears untracked or the files were created in-session). All guide files are authored within the current SPIKE-032 research sprint window (2026-02-28 to 2026-03-08), consistent with archaeology findings.

**Impact:** No intermediate commits have partially addressed SPIKE-032's scope — the guide files are authored fresh this sprint with no mid-flight invalidation.

---

### 3. Per-File Staleness Assessment

#### 3.1 `AITK-Tools-Guide.md` — Verdict: STALE-PARTIAL

**Version assumed:** Not explicitly stated. Content is written for AITK v0.30.x (uses `aitk_*` tools and Spider Web Ring Model).

**Issues:**

1. **Stale agent filename listing (Phase 0).** The document's Phase 0 Erkannte Dateistruktur section lists agent files using the pre-v4.0 naming convention without Ring numbers:
   - Shows: `devsteps-coord.agent.md`, `devsteps-coord-sprint.agent.md`, `devsteps-analyst-{archaeology,risk,...}.agent.md`
   - Actual: `devsteps-R0-coord.agent.md`, `devsteps-R0-coord-sprint.agent.md`, `devsteps-R1-analyst-archaeology.agent.md`
   - All agents have been renamed with `R{N}-` prefix as part of Spider Web v4.0 migration.

2. **Mixed T2/T3 + Ring terminology.** The body of the guide uses "T2/T3" language (Problem A, B, C descriptions) interchangeably without acknowledging the v4.0 rename. A reader following the file listing will look for files that don't exist.

3. **Phases 1–6 (⬜ Offen)** reference future AITK tool invocations without specifying version. The AITK task command calls (`aitk_get_ai_model_guidance`, `aitk_evaluation_planner`, etc.) remain valid for AITK v0.30.1. LOW RISK.

**Adjustment needed:** Update Phase 0 file listing to use Ring-numbered filenames. Add a note that T2/T3 terminology is superseded by Ring 0–5.

---

#### 3.2 `AITK-Tools-Guide-Dev.md` — Verdict: STALE-PARTIAL

**Version assumed:** Not stated. Written during Spider Web v4.0 transition (2026-03-01 timestamp in session log).

**Issues:**

1. **Agent role classifications are based on pre-v4.0 tier model.** The Phase 2 T3 Agent Survey table assigns:
   - `devsteps-analyst-context` → "T3 Deep Analyst" — Actual ring: Ring 1 (analyst tier)
   - `devsteps-analyst-internal` → "T3 Deep Analyst" — Actual ring: Ring 1 (analyst tier)
   - `devsteps-analyst-web` → "T3 Deep Analyst" — Actual ring: Ring 1 (analyst tier)
   - `devsteps-aspect-impact/constraints/quality/staleness/integration` → "T3 Aspect Analyst" — Actual ring: Ring 2
   - In v4.0 architecture, these are Ring 1 and Ring 2 agents, not "T3" workers. The "T3" label in the old model mapped to what are now Ring 4 worker agents.

2. **Model assignments in Phase 2 table may be outdated.** The table shows Claude Opus 4.6 for all aspect agents. If model assignments were changed during v4.0 migration, this would be incorrect. Cannot verify without reading each individual `.agent.md` file (out of scope for this analysis, flagged as open question).

3. **ADR-003 references "T2 → T3 boundary"** — superseded terminology. The architectural principle remains valid (build failures handled below Ring 0's awareness level) but the naming is obsolete.

4. **Status: ADRs themselves remain correct.** The ADR-001 (leaf node invariant), ADR-002 (Opus for tests, Sonnet for impl), ADR-004 (write_verdict for competitive mode) are all consistent with the current Spider Web v4.0 protocol.

**Adjustment needed:** Add a header banner noting that T2/T3 terminology = pre-v4.0 AND the ring equivalences. Do not rewrite the session log — it is a historical record. Add a cross-reference table at the top.

---

#### 3.3 `AITK-Tools-Guide-Reference.md` — Verdict: FRESH

**Version assumed:** "Spider Web v4.0, 2026-03-04" — explicitly dated.

**Assessment:**
- Ring → Agent mapping is current and matches actual `.github/agents/` file listing
- Agent shorthand names (e.g., `analyst-archaeology`) = shorthand for `devsteps-R1-analyst-archaeology.agent.md` — this is intentional shorthand, not staleness
- Context window budget table, dispatch rules, MUST/SHOULD/COULD table — all consistent with current instructions
- MandateResult limits described (`findings` ≤ ~800 tokens / 6,000 chars) — consistent with current MCP tool schema

**No adjustment required.**

---

#### 3.4 `RESEARCH-REPORT-AITK-MultiAgent.md` — Verdict: STALE-PARTIAL (by design)

**Self-labeled:** `⚠️ HISTORICAL ARTIFACT — 2026-03-01` with explicit migration note to Spider Web v4.0.

**Still accurate in the document:**
- AITK feature matrix (section 1.1): GA features list current for AITK v0.30.1 — VALID
- "What AITK traces" gap: No OTLP for `.agent.md` Copilot subagents — still valid March 2026
- "No programmatic evaluation of .devsteps/ artifacts" — still valid
- Microsoft Agent Framework Python SDK: `WorkflowBuilder`, `Executor`, `configure_otel_providers()` — current API

**Now outdated in the document:**
- **Scenarios A/B/C** reference "T1→T2→T3" dispatch chains — superseded by Ring 0→Ring 1→Ring 4 flat fan-out
- Section 3.2 "Scenario A — Sprint Development" describes T1 dispatches T2 dispatches T3 — incorrect in v4.0
- The Feature Gap table entry "3-tier agent dispatch (T1→T2→T3) — Partial" is confused: the limitation was never about VS Code 3-tier support, but about the architecture choice to flatten to flat fan-out

**Prior GPU research spike conclusion (referenced in archaeology report):**
- Prior spike: `gpu-vscode-projects-2026-03-05`, Gate PASS 2026-03-05
- Conclusion: **Keep VSIX GPU-free; use Ollama out-of-process proxy**
- This conclusion remains valid and architecturally sound in March 2026 per analyst-research findings

**Adjustment needed:** The document's disclaimer banner is sufficient. No rewrite required. If the Scenarios section is referenced in future planning, it should be updated or linked to the current guide.

---

#### 3.5 `README.md` — Verdict: STALE-PARTIAL (template mismatch)

**Version assumed:** Not versioned. Appears to be a generic AITK workspace template.

**Critical mismatches between README and actual `tmp/visualizer/` structure:**

| README describes | Actual in `tmp/visualizer/` | Status |
|---|---|---|
| Root folder: `ai-toolkit/` → `cd /home/th/dev/projekte/playground/ai-toolkit` | Actual root: `tmp/visualizer/` | WRONG PATH |
| `agents/` directory | Does NOT exist | MISSING |
| `workflows/` directory | Does NOT exist | MISSING |
| `tools/` directory | Does NOT exist | MISSING |
| `evaluations/` directory | Does NOT exist | MISSING |
| `examples/` (simple_agent.py, multi_agent_workflow.py) | Does NOT exist | MISSING |
| `tests/conftest.py` + `test_agents.py` | Does NOT exist | MISSING |
| `requirements.txt` at root | Actual: `visualizer/requirements.txt` | WRONG PATH |
| `.env.example` | Does NOT exist | MISSING |
| `Azure OpenAI` credentials setup | Project uses Copilot/runSubagent (cloud), not direct Azure keys | WRONG SETUP |

The README was likely generated by AITK's "Create Agent Workspace" template and was never updated to reflect the Spider Web Visualizer actual content.

**Adjustment needed:** The README should be rewritten to document the actual `tmp/visualizer/` Spider Web Visualizer workspace (agent.py, visualizer/ Python package, VS Code task chain, etc.). This is not a hard blocker for SPIKE-032 execution but creates significant confusion for anyone new to the workspace.

---

#### 3.6 `QUICK_REFERENCE.md` — Verdict: FRESH

**Version assumed:** "Spider Web / Spinnennetz v4.0" (in header).

**Assessment:**
- Dispatch table (QUICK/STANDARD/FULL/COMPETITIVE) — matches current copilot-instructions.md
- `AGENT-DISPATCH-PROTOCOL.md` link → file EXISTS at `.github/agents/AGENT-DISPATCH-PROTOCOL.md` ✅
- Ring topology diagram and agent assignments — match actual file listing
- Anti-repeat `failed_approaches[]` section — matches mandate format

**No adjustment required.**

---

### 4. VS Code Tasks Staleness

**File:** `.vscode/tasks.json` (lines 317–373, Visualizer task chain)

| Parameter | Status | Evidence |
|---|---|---|
| `"type": "aitk"` task type | FRESH | AITK v0.30.x task provider API — confirmed by archaeology |
| `"command": "debug-check-prerequisites"` | FRESH | AITK v0.30.x prerequisite check command |
| `portOccupancy: [5679, 8087]` | FRESH | Ports match actual server config |
| `debugpy --listen 127.0.0.1:5679` | FRESH | Loopback-only bind — correct security posture per OWASP |
| `-m agentdev run agent.py --verbose --port 8087` | FRESH | `agentdev` CLI API matches installed version (per archaeology) |
| `-- --devsteps-root ${workspaceFolder}/.devsteps` | FRESH | agent.py accepts this argument |
| `"command": "ai-mlstudio.openTestTool"` | FRESH | Current AITK Agent Inspector command identifier |
| `"args": { "triggeredFrom": "tasks", "port": 8087 }` | FRESH | Confirmed current argument format |
| Port 8087 convention | FRESH | No port change detected |

**Verdict: FRESH throughout.** The VS Code task chain matches AITK v0.30.1 API.

---

### 5. Coord Agent AITK Tools Staleness

**File:** `.github/agents/devsteps-R0-coord.agent.md`

| Tool | Status | Notes |
|---|---|---|
| `aitk_get_ai_model_guidance` | FRESH | Core AITK guidance tool, GA in v0.30.x |
| `aitk_get_agent_model_code_sample` | FRESH | Agent code scaffolding, v0.30.x |
| `aitk_get_tracing_code_gen_best_practices` | FRESH | Tracing guidance, v0.30.x |
| `aitk_get_evaluation_code_gen_best_practices` | FRESH | Evaluation guidance, v0.30.x |
| `aitk_convert_declarative_agent_to_code` | FRESH | Declarative → code conversion, v0.30.x |
| `aitk_evaluation_agent_runner_best_practices` | FRESH | Eval runner, v0.30.x |
| `aitk_evaluation_planner` | FRESH | Evaluation planner, v0.30.x |
| `aitk_get_custom_evaluator_guidance` | FRESH | Custom evaluator guidance, v0.30.x |
| `check_panel_open` / `get_table_schema` / `data_analysis_best_practice` | FRESH | Data Wrangler integration, v0.30.x |
| `read_rows` / `read_cell` / `export_panel_data` / `get_trend_data` | FRESH | Data analysis tools, v0.30.x |
| `aitk_list_foundry_models` | FRESH | Model Catalog, v0.30.x |
| `aitk_agent_as_server` | FRESH | Agent-as-server pattern, v0.30.x |
| `aitk_add_agent_debug` | FRESH | Debug config scaffolding, v0.30.x (new in v0.30.0) |
| `aitk_gen_windows_ml_web_demo` | **CAVEAT** | Windows ML-specific; non-functional on Linux. Available in AITK v0.30.x but irrelevant for Linux GPU use case (SPIKE-032 target environment). Not deprecated — just scoped to Windows. |

**Verdict: FRESH** for AITK v0.30.1. The `aitk_gen_windows_ml_web_demo` tool is available but non-applicable on the Linux target environment. No tools have been deprecated between the guide writing and March 8, 2026.

---

### 6. Python Requirements Staleness

**File:** `tmp/visualizer/visualizer/requirements.txt`

```
plotly>=5.0
watchdog>=4.0
debugpy
agent-dev-cli --pre
```

| Package | Pin state | Current status | Risk |
|---|---|---|---|
| `plotly>=5.0` | Floating range | plotly 5.x is current in March 2026; breaking changes possible in minor versions | LOW |
| `watchdog>=4.0` | Floating range | watchdog 4.x is current; API stable | LOW |
| `debugpy` | **NO VERSION** | Latest is ~1.8.x; breaking debugpy CLI changes are rare but possible | MEDIUM |
| `agent-dev-cli --pre` | **NO VERSION, pre-release** | Uses pre-release channel; any `pip install --upgrade` silently updates; API stability not guaranteed | **CRITICAL** |

**The `agent-dev-cli --pre` dependency is the most significant staleness risk.**

The `agentdev run agent.py --verbose --port 8087` command in `.vscode/tasks.json` depends on the `agentdev` CLI interface being stable. A pre-release bump with a breaking change to the `run` command or `--port` argument would silently break the entire VS Code Visualizer task chain with no warning.

**Required action** (identified by analyst-quality, confirmed here):
```
# Pin to specific pre-release version:
agent-dev-cli==0.0.9.dev20260228     # example — verify with pip index versions agent-dev-cli --pre
```

Additionally:
```
debugpy==1.8.0     # or latest stable verified version
```

---

### 7. Assumption Validation

| Assumption | Status | Evidence |
|---|---|---|
| AITK v0.30.1 is installed and current | **VALID** | Archaeology report confirms v0.30.1; research analyst published AITK v0.30.0 changelog (Feb 13, 2026) |
| `agentdev run` CLI is stable | **CONDITIONALLY VALID** | Pre-release pip dep; stable as long as no upgrade occurs |
| Port 8087 is the Agent Inspector target | **VALID** | tasks.json and agent.py both use 8087 |
| Prior GPU spike conclusion (keep VSIX GPU-free, use Ollama proxy) | **VALID** | Archaeology confirms Gate PASS 2026-03-05; analyst-research confirms Ollama ADOPT status |
| `aitk_*` tools are available on Linux | **CONDITIONALLY VALID** | Extension installs on Linux but is labeled "Windows-spezifisch" in extensions.json; tools may respond with no-op or limited functionality |
| Spider Web v4.0 Ring architecture is current | **VALID** | All new agent files use Ring naming; instructions files reflect same |
| `AGENT-DISPATCH-PROTOCOL.md` exists at referenced path | **VALID** | File confirmed at `.github/agents/AGENT-DISPATCH-PROTOCOL.md` |

---

### 8. Work Item Overlap Check

- No `done` items found that cover SPIKE-032's scope
- SPIKE-032 builds on prior GPU spike (2026-03-05, Gate PASS) without overlap — the prior spike covered KEEP/SKIP decision; SPIKE-032 covers HOW to integrate
- No newer in-progress items cover the same AITK integration ground

---

### Verdict Summary

| File | Staleness Verdict | Severity | Action Required |
|---|---|---|---|
| AITK-Tools-Guide.md | STALE-PARTIAL | MEDIUM | Update Phase 0 file listing to Ring-numbered names; add T2/T3→Ring cross-reference |
| AITK-Tools-Guide-Dev.md | STALE-PARTIAL | LOW | Add header banner with T2/T3 → Ring nomenclature table; preserve ADRs as-is |
| AITK-Tools-Guide-Reference.md | FRESH | — | No action |
| RESEARCH-REPORT-AITK-MultiAgent.md | STALE-PARTIAL | LOW | Self-aware via disclaimer; no rewrite; continue to link as historical reference |
| README.md | STALE-PARTIAL | MEDIUM | Rewrite to reflect actual `tmp/visualizer/` Spider Web structure |
| QUICK_REFERENCE.md | FRESH | — | No action |
| `.vscode/tasks.json` (Visualizer) | FRESH | — | No action |
| Coord agent AITK tools | FRESH | — | Minor: note Windows-only caveat for `aitk_gen_windows_ml_web_demo` |
| `visualizer/requirements.txt` | STALE-PARTIAL | **CRITICAL** | Pin `agent-dev-cli` to specific version; add `debugpy==` pin |

**Overall Verdict: STALE-PARTIAL — Execute with adjustments.**

No HARD STOP conditions (no STALE-OBSOLETE, no STALE-CONFLICT). The integration path is clear. The most critical action before any SPIKE-032 execution that includes AITK Agent Inspector setup is **pinning `agent-dev-cli` in requirements.txt** to prevent silent API breakage.

---

## Recommendations

1. **[CRITICAL] Pin `agent-dev-cli` in `visualizer/requirements.txt`** — determine current pre-release version with `pip index versions agent-dev-cli --pre` and lock to that specific version before any execution.

2. **[MEDIUM] Update `AITK-Tools-Guide.md` Phase 0 file listing** — replace pre-v4.0 bare filenames with Ring-numbered names (`devsteps-R0-coord.agent.md`, `devsteps-R1-analyst-*.agent.md`, etc.). This prevents future agents from looking for files that no longer exist.

3. **[MEDIUM] Rewrite `README.md`** — current content is a generic AITK template that does not describe the actual Spider Web Visualizer workspace. Replace with the actual directory structure, setup instructions for `visualizer/requirements.txt`, and VS Code task chain description.

4. **[LOW] Add nomenclature banner to `AITK-Tools-Guide-Dev.md`** — the session log uses pre-v4.0 T2/T3 terminology; a two-line banner at the top clarifying the Ring equivalences prevents confusion for readers who only know the Ring names.

5. **[LOW] Pin `debugpy` version** in `requirements.txt` — prevents silent breaks if debugpy releases a CLI-breaking change.

---

## Report Path

`tmp/visualizer/RESEARCH-AITK-GPU-aspect-staleness.md`

# Agent Dispatch Protocol — Spider Web (Spinnennetz)

> **Version:** 4.0 — Spider Web / Radar Chart Model (2026-03-02)  
> **Scope:** Canonical operational rules for coord, analyst, aspect, exec, gate, and worker agents  
> **Evidence base:** Meta Wink (arXiv 2602.17037), EnCompass NeurIPS 2025, ETH Zurich agent study Feb 2026, Google Developer Knowledge API Feb 2026

---

## 0. Spider Web Dispatch — Architecture Model

The system is modelled as a **Spinnennetz (Spider Web)** — structurally identical to a **Radar / Spider Chart (Netzdiagramm)**. Two dimensions govern all dispatch decisions:

- **Konzentrische Ringe (Concentric Rings) = Execution Phases** — how deep into the pipeline are we?
- **Radiale Strahlen (Radial Spokes) = Domains** — which analytical dimension is relevant?

Like a spider web: threads are **denser near the centre** — coord reads many more signals than any outer ring agent produces. Spins outward, synthesizes inward.

```
    Research        Errors
        ↑               ↑
        │  ─ ─ ─ ─ ─ ─  │  Ring 5: gate-reviewer          (outermost)
        │ ─ ─ ─ ─ ─ ─ ─ │  Ring 4: exec-impl/test/doc
        │─ ─ ─ ─ ─ ─ ─ ─│  Ring 3: exec-planner
Risk ───┼─ ─ ─ ─ ─ ─ ─ ─┼─── Code
        │─ ─ ─ ─ ─ ─ ─ ─│  Ring 2: aspect-*  (parallel)
        │ ─ ─ ─ ─ ─ ─ ─ │  Ring 1: analyst-* (parallel)
        │   ┌─────────┐  │
        │   │  coord  │  │  Ring 0: Hub (Spinne im Zentrum)
        │   └─────────┘  │
        │ ─ ─ ─ ─ ─ ─ ─ │  Ring 1: analyst-*
        │─ ─ ─ ─ ─ ─ ─ ─│  Ring 2: aspect-*
Docs ───┼─ ─ ─ ─ ─ ─ ─ ─┼─── Tests
        │─ ─ ─ ─ ─ ─ ─ ─│  Ring 3: exec-planner
        │ ─ ─ ─ ─ ─ ─ ─ │  Ring 4: exec-impl/test/doc
        │  ─ ─ ─ ─ ─ ─  │  Ring 5: gate-reviewer          (outermost)
        ↓               ↓
    WorkItems       Infrastr
```

### Concentric Rings — Execution Phases

| Ring | Phase                | Agents                                 | Mode                 | Output                        |
| ---- | -------------------- | -------------------------------------- | -------------------- | ----------------------------- |
| 0    | **Hub**              | `devsteps-R0-coord-*`                     | orchestrates all     | dispatch + synthesis          |
| 1    | **Analysis**         | `analyst-*`                            | parallel fan-out     | MandateResults (~800 tok)     |
| 2    | **Cross-Validation** | `aspect-*`                             | parallel fan-out     | CompressedVerdicts (~150 tok) |
| 3    | **Planning**         | `exec-planner`                         | sequential           | ordered implementation plan   |
| 4    | **Execution**        | **Conductors:** `exec-impl` → `exec-test` → `exec-doc` (each dispatches its `worker-*`); **Workers:** `worker-*` dispatched by conductors, NOT coord | sequential           | code / tests / docs committed |
| 5    | **Quality Gate**     | `gate-reviewer`                        | sequential, blocking | PASS / FAIL / ESCALATE        |

Rings are **mandatory steps** — you cannot skip Ring 1 to go to Ring 4 except at QUICK triage.

### Radial Spokes — Domains

Like a radar chart, each spoke (domain) can be **weighted differently per task**. coord reads the task profile and selects which agents to dispatch on each spoke in each ring:

| Spoke / Domain | Ring 1 (analyst)                  | Ring 2 (aspect)                            | Ring 4 (worker)                                                                           |
| -------------- | --------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| **Code**       | `analyst-archaeology`             | `aspect-impact`                            | ¹`worker-impl` · ²`worker-coder`, `worker-refactor`                                       |
| **Tests**      | `analyst-quality`                 | `aspect-quality`                           | ¹`worker-test` · ²`worker-tester`                                                         |
| **Docs**       | —                                 | `aspect-staleness`                         | ¹`worker-doc` · ²`worker-documenter`                                                     |
| **Work Items** | —                                 | —                                          | ²`worker-devsteps`, `worker-guide-writer`                                                  |
| **Research**   | `analyst-research`, `analyst-web` | —                                          | —                                                                                         |
| **Risk**       | `analyst-risk`                    | `aspect-constraints`, `aspect-integration` | —                                                                                         |
| **Errors** ⚠️  | _(planned: `analyst-errors`)_     | —                                          | ¹`worker-build-diagnostics`                                                                |

> ¹ **Conductor-mediated** — dispatched by `exec-*` conductor (not coord directly); conductor writes MandateResult.  
> ² **Coord-direct** — dispatched by coord without an exec conductor; coord dispatches these on specific work types (refactor stories, work-item updates). Exec conductors MAY dispatch multiple workers **in parallel** within a single fan-out call.

> **⚠️ Errors spoke:** The **Errors** domain (`get_errors` / `#problems` panel) currently maps to `worker-build-diagnostics`. A dedicated `analyst-errors` agent is planned — it runs `get_errors` first, scans the Problems panel, and produces a MandateResult scoped to the error set before any implementation work begins. It can be activated directly from the `devsteps-30-rapid-cycle` prompt via `#get_errors`.

### Task Profile Examples — Radar Chart Emphasis

```
Bug fix:      Errors ████████  Code ██████  Tests █████  Risk ████   Research ██
Feature:      Research ███████  Code █████  Tests █████  Docs ████   Risk ████
Refactor:     Code ████████  Tests ███████  Risk █████   Research ███  Docs ███
Archaeology:  Code █████████  Risk ██████  Research ████  Errors ███  Docs ██
```

coord reads the incoming task and tilts the radar chart — dispatching more agents on the heavy spokes, fewer on the light ones.

**1-Level Nesting Rule:** VS Code Copilot supports exactly 1 level of `#runSubagent` nesting.  
→ coord dispatches ALL agents directly. Non-coord agents CANNOT dispatch sub-agents.  
→ All agents appear in `agents:` lists of coord only.  
→ Workers have `'agent'` in tools (for breadth) but MUST NEVER call `#runSubagent` — behavioral leaf nodes.

### Context Propagation Model (CIS — Context-Isolated Subagents)

Each `#runSubagent` call creates a **fresh context window** — the subagent sees nothing from the parent conversation by default. Communication is explicit and unidirectional:

| Direction | Mechanism | Notes |
| --------- | --------- | ----- |
| coord → subagent | `prompt` string in dispatch call | All context the agent needs MUST be included here |
| subagent → coord | `tool_result` block injected into parent history | Injected after the `runSubagent` call completes |
| subagent → subagent | Physically impossible (CIS) | coord mediates all cross-agent data via MandateResults |

**Token budget:** Each subagent `tool_result` adds ~800–2 000 tokens to coord's history. 10 parallel Ring-1+2 agents ≈ 8 000–20 000 tokens injected. After Ring-2, apply `/compact` (VS Code 1.110+) before dispatching Ring-3 forward.

**Payload rules (coord → subagent prompt):**
1. Always include: `item_id`, `sprint_id`, `triage_tier`
2. Ring-2+: comma-separated `report_paths` as prose strings (file paths to upstream MandateResults)
3. Ring-4 exec: ordered implementation steps from exec-planner MandateResult prose
4. NEVER paste raw findings text — pass file paths only (I-12)

> **VS Code requirement:** Parallel `#runSubagent` dispatch requires VS Code ≥ 1.109.0 (February 2026). See `INSTALL.md` System Requirements.

---

## 1. Dispatch Invariants (All Tiers)

| #    | Invariant                                           | Enforcement                                  |
| ---- | --------------------------------------------------- | -------------------------------------------- |
| I-1  | coord dispatches all agents — never nested dispatch | YAML `agents:` whitelist                     |
| I-2  | non-coord agents NEVER dispatch further agents      | No non-coord in `agents:` lists of non-coord |
| I-3  | workers/aspects NEVER call `#runSubagent`           | Explicit NEVER rule in every leaf agent file |
| I-4  | non-coord handoffs are FORBIDDEN                    | No `handoffs:` in non-coord agent files      |
| I-5  | coord reads ONLY MandateResults (analyst/exec)      | `read_mandate_results` tool only             |
| I-6  | coord reads ONLY CompressedVerdicts (aspect)        | `read_analysis_envelope(report_path)`        |
| I-7  | No tier pastes raw findings in chat                 | Structured paths only                        |
| I-8  | Same-phase dispatches are parallel                  | Single fan-out tool call block               |
| I-9  | `failed_approaches[]` propagates through Mandate    | All agents receive and honor it              |
| I-10 | Web-First at STANDARD triage                        | Staleness aspect = MUST at STANDARD+         |
| I-11 | coord delegates follow-up DevSteps ops to `worker-devsteps` | coord MAY directly call: `mcp_devsteps_add` (primary item bootstrap) · `mcp_devsteps_update` status (in-progress/review/done) · `mcp_devsteps_update` `append_description` (done-gate only). ALL other add/link/update ops MUST go via `worker-devsteps`. |
| I-12 | coord Ring→Ring handoff: item_id + sprint_id + prose report_paths only | All exec/aspect agents receive item_id + sprint_id + comma-separated report_path strings as prose context. coord NEVER forwards raw findings text or JSON blobs between rings. |

> **I-6 note:** `read_analysis_envelope(report_path)` — `report_path` is a **prose-string signal** (the file path passed in chat), not a JSON field in the persisted AnalysisBriefing. coord uses it as a lookup key; it never appears in the `.result.json` schema.

---

## 2. Tier-1 Coordinator — Dispatch Rules

**Model:** Claude Sonnet 4.6  
**tools:
  ['vscode', 'execute', 'read', 'agent', 'browser', 'bright-data/*', 'edit', 'search', 'web', 'devsteps/*', 'todo']`  
**YAML `agents:`\*\* must include ALL analyst/aspect/exec/gate/worker agents used (for dispatch)

### Triage → Dispatch Table

| Triage      | Round 1: Analysts (∥)              | Round 2: Aspects (∥)       | Round 3: Workers (seq)                                       |
| ----------- | ---------------------------------- | -------------------------- | ------------------------------------------------------------ |
| QUICK       | `planner` only                     | None                       | `coder` → `reviewer`                                         |
| STANDARD    | `archaeology` + `risk`             | MUST aspects + `staleness` | `coder` → `tester` → `reviewer`                              |
| FULL        | `archaeology` + `risk` + `quality` | All MUST + SHOULD aspects  | `coder` → `tester` + `integtest` ∥ `documenter` → `reviewer` |
| COMPETITIVE | `research` + `archaeology`         | MUST aspects + `staleness` | `coder` → `reviewer`                                         |

**Round 3 Worker Reference:**

| Worker                | Trigger                    | Responsibility                                         |
| --------------------- | -------------------------- | ------------------------------------------------------ |
| `worker-coder`        | always (after Planner)     | Write + commit implementation code                     |
| `worker-tester`       | STANDARD+                  | Write + run + commit unit tests                        |
| `worker-integtest`    | FULL or explicit           | Integration tests                                      |
| `worker-documenter`   | FULL (parallel with tester) | Docs, README, Changelog                               |
| `worker-devsteps`     | as needed                  | Manage DevSteps items                                  |
| `worker-refactor`     | Refactor-type stories      | Restructure code without behavior change               |
| `worker-workspace`    | new package/project        | Scaffold: create_new_workspace + pyproject.toml + venv |
| `worker-guide-writer` | after Execution            | Update guide files                                     |

### coord Round 2: How to Select Aspects

After Round 1, coord reads MandateResults and extracts `t3_recommendations` from each:

```json
{
  "t3_recommendations": {
    "impact": "MUST",
    "constraints": "MUST",
    "staleness": "MUST",
    "quality": "SHOULD",
    "integration": "COULD"
  },
  "n_aspects_recommended": 3
}
```

**T1 Selection Rules:**

- **MUST** → always dispatch, regardless of triage
- **SHOULD** → dispatch if triage ≥ STANDARD
- **COULD** → dispatch if triage = FULL and context budget allows
- **Anti-Repeat:** pass `failed_approaches[]` from dev-guide to every aspect/worker mandate

### coord Anti-Repeat — Failed Approaches

Before every Round 1 dispatch:

1. Read `AITK-Tools-Guide-Dev.md` session log
2. Collect all entries marked with ❌ or `approach: FAILED`
3. Populate `failed_approaches[]` in each analyst, aspect, and worker Mandate

**Loop Bounds for T1:**

| Loop                       | Max | On Breach                                  |
| -------------------------- | --- | ------------------------------------------ |
| Review-Fix cycles          | 3   | `write_escalation` → stop, report to user  |
| TDD iterations             | 3   | `write_escalation` → stop, report to user  |
| Clarification rounds       | 2   | Proceed with best judgment                 |
| Round 2 aspect re-dispatch | 1   | No second Round 2 — use available verdicts |

---

## 3. Tier-2 Analyst — 4-Phase MAP-REDUCE-RESOLVE-SYNTHESIZE

**Models:** Claude Sonnet 4.6 (default), Claude Opus 4.6 (quality-critical paths)  
**tools:
  ['vscode', 'execute', 'read', 'agent', 'browser', 'bright-data/*', 'edit', 'search', 'web', 'devsteps/*', 'todo']`  
**Note:** Non-coord agents do NOT have `'agent'` in tools for aspect dispatch — Spider Web means coord dispatches all.  
**`handoffs:`\*\* must be empty in all non-coord agent YAML files — non-coord never hands off to another non-coord.

### Phase 1: MAP (Internal — no sub-dispatch)

T2 does NOT dispatch T3. Instead:

1. Call `read_mandate_results(item_ids)` — check for already-covered domains
2. Independently research the mandate scope using available tools: `read`, `search`, `bright-data/*`
3. Apply reasoning scaling (see per-agent Reasoning Protocol)
4. Honor `failed_approaches[]` from Mandate — never suggest blocked approaches

### Phase 2: REDUCE (Internal Analysis)

1. Synthesize findings from internal research
2. Run **Absence Audit**: what domain is NOT covered that SHOULD be?
3. Classify potential issues (see Conflict Taxonomy below)
4. Determine `t3_recommendations` — which aspects would strengthen/validate findings

### Phase 3: RESOLVE (Internal — no re-dispatch from T2)

T2 cannot re-dispatch. Instead:

1. For contradictions or low-confidence findings: attempt a second search angle internally
2. Maximum 2 internal resolution attempts; mark low-confidence explicitly
3. If unresolved: include `escalation_reason` in MandateResult and proceed with caveated synthesis

### Phase 4: SYNTHESIZE — Write MandateResult

1. Produce findings (max 12000 chars / ~1600 tokens)
2. Build `t3_recommendations` map (MUST/SHOULD/COULD per aspect type)
3. Call `write_mandate_result` with full payload including `t3_recommendations`
4. Return to coord in chat: **ONLY** `{ report_path, verdict, confidence, t3_recommendations }`
   > ℹ️ **Prose-only chat signal** — these are NOT fields in MandateResult JSON v1.0. coord reads full content via `read_mandate_results(sprint_id)`. `report_path` here means the file path of the written .result.json for human traceability only.

### MandateResult Schema (extended)

```json
{
  "mandate_id": "uuid",
  "item_ids": ["STORY-001"],
  "sprint_id": "sprint-2026-03-01",
  "analyst": "devsteps-R1-analyst-archaeology",
  "status": "complete",
  "findings": "...(max 12000 chars / ~1600 tokens)...",
  "recommendations": ["top-5 actions, max 300 chars each"],
  "confidence": 0.85,
  "token_cost": 3200,
  "completed_at": "2026-03-01T14:00:00Z",
  "t3_recommendations": {
    "impact": "MUST",
    "constraints": "MUST",
    "staleness": "SHOULD",
    "quality": "COULD",
    "integration": "COULD"
  },
  "n_aspects_recommended": 2
}
```

### Conflict Taxonomy (T2 Internal)

| ID  | Name                 | Signal                                     | Action                                            |
| --- | -------------------- | ------------------------------------------ | ------------------------------------------------- |
| C1  | Direct-Contradiction | Two internal searches yield opposite facts | Second search with explicit contradiction context |
| C2  | Low-Confidence       | Finding confidence <0.6, no corroboration  | Second search on same scope, different angle      |
| C3  | Scope-Ordering       | Sequencing of steps unclear                | Internal re-analysis; mark `SHOULD: constraints`  |
| C4  | Missing-Coverage     | Critical domain not reachable internally   | Mark `MUST: <domain_t3>` in t3_recommendations    |

### Analyst/Exec Loop Bounds

| Loop                         | Max | On Breach                                  |
| ---------------------------- | --- | ------------------------------------------ |
| Internal resolution attempts | 2   | Caveated synthesis, mark escalation_reason |
| read_mandate_results calls   | 1   | Deduplication done once                    |
| bright-data searches         | 5   | Stop, use available data                   |

---

## 4. Tier-3 Aspect Analyst — ANALYZE–SEARCH–SYNTHESIZE

**Models:** Claude Sonnet 4.6 (default), Claude Opus 4.6 (quality, staleness)  
**tools:
  ['vscode', 'execute', 'read', 'agent', 'browser', 'bright-data/*', 'edit', 'search', 'web', 'devsteps/*', 'todo']`  
**CRITICAL:** Aspects/workers have NO `'agent'` tool — CANNOT dispatch sub-agents. Structural leaf-node enforcement.  
**Dispatched by:\*\* coord ONLY (Hub-and-Spoke Round 2)

### Aspect Types

| Agent                | Aspect        | Focus                                            | Web Required? |
| -------------------- | ------------- | ------------------------------------------------ | ------------- |
| `aspect-staleness`   | `staleness`   | Libraries/APIs current as of today?              | **ALWAYS**    |
| `aspect-impact`      | `impact`      | Blast radius: which files/tests/consumers break? | No            |
| `aspect-constraints` | `constraints` | Ordering, dependency, scope constraints          | No            |
| `aspect-quality`     | `quality`     | Code standards, test coverage, DRY               | Rarely        |
| `aspect-integration` | `integration` | External systems, packages, APIs                 | Sometimes     |

### Step 1: ANALYZE

1. Read Mandate: `aspect`, `item_ids`, `triage_tier`, `failed_approaches[]`
2. Check `failed_approaches` FIRST — if planned approach is listed → pivot immediately
3. Pull context: read affected files, grep, semantic search
4. Apply reasoning scaling:
   | Triage | Depth |
   |---|---|
   | QUICK | Single-pass, most likely answer |
   | STANDARD | Multi-angle, 2–3 hypotheses |
   | FULL | Exhaustive: adversarial review, absence audit |

### Step 2: SEARCH (Conditional)

Run when ANY staleness trigger is present OR when `aspect = staleness`.

**Web-First Trigger Table:**

| Signal                          | Risk     | Action                                              |
| ------------------------------- | -------- | --------------------------------------------------- |
| Library/package version in code | HIGH     | `mcp_bright_data_search_engine` for current version |
| Framework pattern questions     | HIGH     | Scrape official framework docs                      |
| API integration / SDK           | CRITICAL | Always web-search, compare endpoint signatures      |
| Config file syntax              | HIGH     | Web-search official schema                          |
| Error message lookup            | MEDIUM   | Web-search error string + version                   |
| "Best practice" / "recommended" | HIGH     | Web-search, require source from last 6 months       |
| Security/auth patterns          | CRITICAL | Always web-search, compare OWASP current            |
| Cloud service configuration     | HIGH     | Web-search official cloud docs                      |

**Tool sequence:** `mcp_bright_data_search_engine` → `mcp_bright_data_scrape_as_markdown`

### Step 3: SYNTHESIZE

1. Finding: max 1000 chars
2. Set `confidence`: 0.0–1.0 (use 0.5 for conflicting evidence, not absent)
3. Set `verdict`: `PASS` | `WARN` | `FAIL` | `NEEDS_WEB` (if search was needed but skipped)
4. If approach was blocked by `failed_approaches` → document alternative used
5. Call `write_analysis_report`
6. Return to coord ONLY: `{ report_path, verdict, confidence, aspect }`
   > ℹ️ **Prose-only chat signal** — these are NOT fields in AnalysisBriefing JSON. coord reads full content via `read_analysis_envelope`. `report_path` is the .json file path for human traceability only.

### Staleness Aspect — Special Rules

1. **Web-First without exception**: start with `mcp_bright_data_search_engine`
2. **Version-specific output**: always include in-use vs current version numbers
3. **Date-awareness**: state the search date; flag if source is >3 months old
4. **Breaking-change flag**: explicitly mark `BREAKING CHANGE` when a version bump breaks APIs
5. **Output format** (structured JSON within finding):
   ```json
   {
     "libraries_checked": [
       {
         "name": "openai",
         "in_use": "1.14.0",
         "current": "1.58.0",
         "breaking_change": true,
         "notes": "migration guide: https://..."
       }
     ],
     "verdict": "WARN",
     "staleness_score": 0.7
   }
   ```

### Aspect/Worker Anti-Repeat Rules

Evidence: Meta Wink (2602.17037v2): 30% of trajectories had misbehaviors; 37% of non-recoveries ignored course-correction.

1. Read `failed_approaches[]` from Mandate BEFORE any action
2. If planned approach matches any failed entry → pivot immediately, log reason
3. If no viable alternative → return `verdict: FAIL`, `confidence: 0.1`, escalation flag
4. NEVER retry the same approach twice — one attempt only

### CompressedVerdict Contract (max 150 tokens)

Aspect agents return to coord in chat ONLY:

```json
{
  "aspect": "staleness",
  "report_path": ".devsteps/analysis/STORY-001/t3-aspect-staleness.json",
  "verdict": "WARN",
  "confidence": 0.88
}
```

No prose. No summary. No recommendations in chat. coord uses `read_analysis_envelope(report_path)` for full content.

### Aspect Loop Bounds

| Loop                        | Max | On Breach                            |
| --------------------------- | --- | ------------------------------------ |
| SEARCH retries (same query) | 2   | Move on, mark `confidence: 0.5`      |
| ANALYZE re-reads            | 3   | Stop, synthesize with available data |
| Total execution steps       | 15  | Hard stop → synthesize immediately   |

---

## 5. Communication Contracts Summary

| Direction               | Channel                                        | T reads via              | T writes via            |
| ----------------------- | ---------------------------------------------- | ------------------------ | ----------------------- |
| coord → analyst Mandate | In-chat Mandate JSON                           | —                        | Chat prompt             |
| analyst → coord Result  | `.devsteps/cbp/[sprint]/[mandate].result.json` | `read_mandate_results`   | `write_mandate_result`  |
| coord → aspect Mandate  | In-chat Mandate JSON                           | —                        | Chat prompt             |
| aspect → coord Verdict  | `.devsteps/analysis/[itemId]/[agent].json`     | `read_analysis_envelope` | `write_analysis_report` |

**Forbidden patterns:**

- Pasting raw file content in chat between tiers
- analyst/exec reading aspect envelope files directly (filesystem paths)
- coord reading raw result files directly (must use MCP read tools)
- non-coord dispatching agents (only coord dispatches)

---

## 6. Disabled-Tool Protocol

| Tool disabled      | Protocol                                                                    |
| ------------------ | --------------------------------------------------------------------------- |
| `runSubagent`      | **STOP immediately.** Report: "Agent dispatch unavailable. Cannot proceed." |
| DevSteps MCP tools | **STOP immediately.** Report missing tools by name.                         |
| Bright Data MCP    | **WARN user.** Proceed with training data, explicitly flag staleness risk.  |

---

_See also:_

- _[REGISTRY.md](./REGISTRY.md) — agent routing table and spoke/ring reference_
- _[README.md](./README.md) — agent roster and naming convention_
- _[../instructions/devsteps-agent-protocol.instructions.md](../instructions/devsteps-agent-protocol.instructions.md) — Copilot dispatch invariants_

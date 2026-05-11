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
| 4    | **Execution**        | **Conductors** (`exec-impl`, `exec-test`, `exec-doc`, `dispatch_role: conductor`) dispatch their worker pools via `runSubagent`; **Workers** (`worker-*`, `dispatch_role: leaf`) dispatched by conductors (primary) or coord directly | sequential           | code / tests / docs committed |
| 5    | **Quality Gate**     | `gate-reviewer`                        | sequential, blocking | PASS / FAIL / ESCALATE        |

Rings are **mandatory steps** — you cannot skip Ring 1 to go to Ring 4 except at QUICK triage.

### Radial Spokes — Domains

Like a radar chart, each spoke (domain) can be **weighted differently per task**. coord reads the task profile and selects which agents to dispatch on each spoke in each ring:

| Spoke / Domain | Ring 1 (analyst)                            | Ring 2 (aspect)                            | Ring 4 (exec / worker)                                                                    |
| -------------- | ------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| **Code**       | `analyst-internal`                          | `aspect-impact`                            | `exec-impl` · `worker-coder`, `worker-refactor`                                           |
| **Tests**      | `analyst-quality`                           | `aspect-quality`                           | `exec-test` · `worker-tester`                                                              |
| **Docs**       | —                                           | `aspect-staleness`                         | `exec-doc` · `worker-documenter`                                                          |
| **Work Items** | —                                           | —                                          | `worker-devsteps`, `worker-guide-writer`                                                   |
| **Context**    | `analyst-context`                           | —                                          | — _(always dispatched at STANDARD+)_                                                      |
| **Research**   | `analyst-research`, `analyst-web`           | —                                          | —                                                                                         |
| **Risk**       | `analyst-risk`                              | `aspect-constraints`, `aspect-integration` | —                                                                                         |
| **Git History**| `analyst-archaeology`                       | —                                          | — _(FULL tier or on-demand for git forensics)_                                            |
| **Errors** ⚠️  | _(planned: `analyst-errors`)_               | —                                          | `worker-build-diagnostics`                                                                 |

> **Read mechanism:** `analyst-archaeology`, `analyst-risk`, `analyst-quality`, `analyst-research` → `write_mandate_result` → read via `read_mandate_results`. `analyst-context`, `analyst-internal`, `analyst-web` → `write_analysis_report` → read via `read_analysis_envelope(report_path)`. Coord MUST call both mechanisms after Ring 1 completes.

> **Conductor model (depth-2):** `exec-impl/test/doc` have `dispatch_role: conductor` — they are dispatched by coord and in turn dispatch their worker pools via `runSubagent`. Workers (`worker-coder`, `worker-tester`, etc.) have `dispatch_role: leaf`. Coord may also dispatch workers directly for specific work types (QUICK triage, refactor stories, work-item updates). **⚠️ VS Code requirement:** `allowInvocationsFromSubagents: true` must be set for conductor→worker dispatch to function; default is `false`.

> **⚠️ Errors spoke:** The **Errors** domain (`get_errors` / `#problems` panel) currently maps to `worker-build-diagnostics`. A dedicated `analyst-errors` agent is planned — it runs `get_errors` first, scans the Problems panel, and produces a MandateResult scoped to the error set before any implementation work begins. It can be activated directly from the `devsteps-30-rapid-cycle` prompt via `#get_errors`.

### Task Profile Examples — Radar Chart Emphasis

```
Bug fix:      Errors ████████  Code ██████  Tests █████  Risk ████   Research ██
Feature:      Research ███████  Code █████  Tests █████  Docs ████   Risk ████
Refactor:     Code ████████  Tests ███████  Risk █████   Research ███  Docs ███
Archaeology:  Code █████████  Risk ██████  Research ████  Errors ███  Docs ██
```

coord reads the incoming task and tilts the radar chart — dispatching more agents on the heavy spokes, fewer on the light ones.

**Conductor Model (depth-2):** coord (Ring 0) dispatches analysts, aspects, planner, and conductors directly. Conductors (`exec-impl`, `exec-test`, `exec-doc`, `dispatch_role: conductor`) dispatch their worker pools via `runSubagent` (depth-2 nesting).  
→ Agents with `dispatch_role: leaf` (analysts, aspects, workers) NEVER call `#runSubagent`.  
→ Conductors appear in coord's `agents:` list AND have their own `agents:` list for their designated workers.  
→ Conductors have `'agent'` in their tools list; `dispatch_role: leaf` agents do NOT.

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
| I-13 | Scope-split fan-out: coord MAY dispatch multiple instances of the same analyst type with non-overlapping scope partitions | Each instance receives a distinct `Scope shard:` in its dispatch prompt. Instances of `write_mandate_result` types (risk, quality, archaeology, research) are safe now (UUID-keyed). Instances of `write_analysis_report` types (context, internal, web) require distinct `scope_shard` parameter — otherwise the second instance silently overwrites the first. |
| I-14 | Single-concern mandate: each analyst/aspect mandate covers ONE investigation question | coord MUST scope-split when ≥2 orthogonal concerns are present; concern-split produces at most MAX_SPLIT=4 additional agents total across all splits |

> **I-6 note:** `read_analysis_envelope(report_path)` — `report_path` is a **prose-string signal** (the file path passed in chat), not a JSON field in the persisted AnalysisBriefing. coord uses it as a lookup key; it never appears in the `.result.json` schema.

### Scope-Split Fan-Out (Multi-Instance Dispatch)

Standard dispatch assigns one instance per analyst type ("type-parallel"). **Scope-split fan-out** dispatches multiple instances of the **same** analyst type, each scoped to a non-overlapping partition of the problem ("instance-parallel"). Both modes fire simultaneously in Ring 1.

**When to scope-split:**

1. **Subtree split** — affected paths span ≥2 independent packages or modules → dispatch one `analyst-internal` per subtree
2. **Angle split** — task involves ≥2 orthogonal research questions → dispatch one `analyst-web` or `analyst-research` per question
3. **Concern split** — task touches ≥2 distinct concern domains (e.g. security + performance) → dispatch one `analyst-risk` per concern
4. **Volume split** — scope exceeds single-agent token budget (~12 000 chars findings) → partition by file group or functional boundary

**Coord responsibilities for scope-split:**

- Define non-overlapping partitions BEFORE dispatch — no partition may cover the same files or questions
- Append `Scope shard: {partition_description}` to each instance's dispatch prompt
- After completion: synthesize all instance results into a single coherent picture before passing to Ring 2
- Apply `/compact` when total Ring 1 instances exceed 6 to manage token budget

**I-14 concern-split guard:** Splitting by concern (type 3) produces at most MAX_SPLIT=4 additional agents total. A 4-concern task → dispatch at most 4 analyst instances, not 4×N.

**Write-path constraint:** `write_mandate_result` uses UUID-keyed paths — safe for multi-instance without changes. `write_analysis_report` uses a fixed `[aspect]-report.json` path — a second instance of the same type overwrites the first. Until the MCP schema adds a `scope_shard` path discriminator, scope-split is limited to `write_mandate_result` types (risk, quality, archaeology, research) for safe concurrent writes. For `write_analysis_report` types (context, internal, web), coord must dispatch instances sequentially or accept that only the last writer's result persists.

---

## 2. Tier-1 Coordinator — Dispatch Rules

**Model:** Claude Sonnet 4.6  
**tools:** `['vscode', 'execute', 'read', 'agent', 'browser', 'bright-data/*', 'edit', 'search', 'web', 'devsteps/*', 'playwright/*', 'todo']`  
**YAML `agents:`** must include ALL analyst/aspect/exec/gate/worker agents used (for dispatch)

### Triage → Dispatch Table

| Triage      | Round 1: Analysts (∥)                                                                | Round 2: Aspects (∥)       | Round 3–5: Exec → Gate (seq)                                      |
| ----------- | -------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------ |
| QUICK       | `planner` only                                                                   | None                       | `exec-impl` → `gate-reviewer`                                |
| STANDARD    | `context` + `internal` + `risk`                                                  | MUST aspects + `staleness` | `exec-impl` → `exec-test` → `gate-reviewer`                  |
| FULL        | `context` + `internal` + `risk` + `quality` + `archaeology` + `web`              | All MUST + SHOULD aspects  | `exec-impl` → `exec-test` ∥ `exec-doc` → `gate-reviewer`      |
| COMPETITIVE | `research` + `internal` + `web` + `context`                                      | MUST aspects + `staleness` | `exec-impl` → `gate-reviewer`                                |

> **`analyst-archaeology`** = git forensics (blame, reverts, recent structural changes). Dispatched at FULL tier or on-demand. NOT part of the STANDARD core.

> **∥ = PARALLEL BATCH DISPATCH (technical):** The `∥` symbol means emit ALL listed `runSubagent` calls in a **single response turn** (same JSON tool-call array). Do NOT call one `runSubagent`, wait for its result, then call the next. Emit analyst-context + analyst-internal + analyst-risk together in ONE response, then wait for all results. Same for Ring 2 aspects. Violating this = sequential dispatch = FORBIDDEN for same-phase agents (I-8). Requires VS Code ≥ 1.109.0.

**Direct Worker Dispatch (coord → worker):**

coord dispatches workers directly for specific work types that don’t need the full exec pipeline:

| Worker                | When to dispatch directly         | Responsibility                                         |
| --------------------- | --------------------------------- | ------------------------------------------------------ |
| `worker-coder`        | QUICK triage (simple code change) | Write + commit implementation code                     |
| `worker-tester`       | Targeted test additions           | Write + run + commit unit tests                        |
| `worker-integtest`    | FULL or explicit                  | Integration tests                                      |
| `worker-documenter`   | Standalone doc updates            | Docs, README, Changelog                                |
| `worker-devsteps`     | Follow-up items + links           | Manage DevSteps items                                  |
| `worker-refactor`     | Refactor-type stories             | Restructure code without behavior change               |
| `worker-workspace`    | New package/project               | Scaffold: create_new_workspace + pyproject.toml + venv |
| `worker-guide-writer` | After Execution                   | Update guide files                                     |

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

### Dispatch Prompt Format (DPF)

Every `runSubagent` call MUST include a structured prompt. Agents are Context-Isolated (CIS) — they receive ONLY their `.agent.md` + this prompt. No shared context exists.

**Ring 1 (Analysts):**
```
Mandate: {mandate_type}
Item: {item_id} | Sprint: {sprint_id} | Tier: {triage_tier}
Title: {task_title}
Description: {task_description}
Affected paths: {affected_paths}
Constraints: {constraints}
Failed approaches: {failed_approaches}
Relevant files: {pre_scan_results}   # FULL tier only; omit at QUICK/STANDARD
```

**Ring 2 (Aspects) — include upstream reports:**
```
Mandate: {aspect_type}
Item: {item_id} | Sprint: {sprint_id} | Tier: {triage_tier}
Title: {task_title}
Description: {task_description}
Affected paths: {affected_paths}
Upstream reports: {ring1_report_paths}
Relevant files: {pre_scan_results}   # FULL tier only; omit at QUICK/STANDARD
```

> coord populates `Relevant files:` at FULL tier from a brief pre-scan before Ring 1 dispatch (see Step 0.5 in coord agent). Omit the field at QUICK/STANDARD — do not include an empty placeholder line.

**Ring 3 (Planner):**
```
Mandate: planning
Item: {item_id} | Sprint: {sprint_id} | Tier: {triage_tier}
Upstream reports: {ring1_report_paths}, {ring2_report_paths}
Constraints: {constraints}
```

**Ring 4 (Exec):**
```
Mandate: {implementation|testing|documentation}
Item: {item_id} | Sprint: {sprint_id} | Tier: {triage_tier}
Planner report: {planner_report_path}
Upstream reports: {all_report_paths}
```

**Ring 5 (Gate):**
```
Mandate: review
Item: {item_id} | Sprint: {sprint_id} | Tier: {triage_tier}
Implementation report: {impl_report_path}
Test report: {test_report_path}
Upstream reports: {all_report_paths}
Acceptance criteria: {acceptance_criteria}
```

When using **scope-split fan-out** (multiple instances of the same analyst type), append a `Scope shard:` field to each instance prompt identifying its non-overlapping partition.

---

## 3. Tier-2 Analyst — 4-Phase MAP-REDUCE-RESOLVE-SYNTHESIZE

**Models:** Claude Sonnet 4.6 (default), Claude Opus 4.6 (quality-critical paths)  
**tools:** `['vscode', 'execute', 'read', 'browser', 'bright-data/*', 'edit', 'search', 'web', 'devsteps/*', 'playwright/*', 'todo']`  
**Note:** Agents with `dispatch_role: leaf` do NOT have `'agent'` in tools — they cannot dispatch. Conductors (`dispatch_role: conductor`) DO have `'agent'` in tools to dispatch their worker pools.  
**`handoffs:`** must be empty in all non-coord agent YAML files — non-coord never hands off to another non-coord.

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

### Tier-Adjusted Tool-Call Ceiling (informational guideline)

Analysts should self-limit total tool calls per mandate:

| Tier     | Recommended ceiling |
| -------- | ------------------- |
| QUICK    | 5                   |
| STANDARD | 12                  |
| FULL     | 20                  |

Exceeding the ceiling is permitted if still within the bright-data search limit. This is a self-regulation signal, not a hard cutoff.

---

## 4. Tier-3 Aspect Analyst — ANALYZE–SEARCH–SYNTHESIZE

**Models:** Claude Sonnet 4.6 (default), Claude Opus 4.6 (quality, staleness)  
**tools:** `['vscode', 'execute', 'read', 'browser', 'bright-data/*', 'edit', 'search', 'web', 'devsteps/*', 'playwright/*', 'todo']`  
**CRITICAL:** Agents with `dispatch_role: leaf` (aspects, workers, analysts) do NOT have `'agent'` in tools — cannot dispatch. Conductors (`exec-impl`, `exec-test`, `exec-doc`) DO have `'agent'` to dispatch their designated worker pools.  
**Dispatched by:** coord ONLY (Hub-and-Spoke Ring 2)

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

| Direction               | Channel                                        | Reader tool              | Writer tool             |
| ----------------------- | ---------------------------------------------- | ------------------------ | ----------------------- |
| coord → agent prompt     | `runSubagent` prompt parameter (structured)    | —                        | coord builds prompt     |
| analyst → coord Result  | `.devsteps/cbp/[sprint]/[mandate].result.json` | `read_mandate_results`   | `write_mandate_result`  |
| aspect → coord Verdict  | `.devsteps/analysis/[itemId]/[agent].json`     | `read_analysis_envelope` | `write_analysis_report` |
| exec → coord Result     | `.devsteps/cbp/[sprint]/[mandate].result.json` | `read_mandate_results`   | `write_mandate_result`  |
| gate → coord Result     | `.devsteps/cbp/[sprint]/[mandate].result.json` | `read_mandate_results`   | `write_mandate_result`  |

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

---

## Glossary

**cbp/** — *Coordinator Backplane Protocol*. The `.devsteps/cbp/` directory stores all `MandateResult` JSON files produced by Ring 1–5 agents (`write_mandate_result` MCP tool). Files are UUID-named, sprint-keyed (path: `.devsteps/cbp/{sprint_id}/{mandate_uuid}.result.json`). Read exclusively by Ring 0 `coord` agents via `read_mandate_results(sprint_id)`. Distinct from `.devsteps/analysis/` which stores `AnalysisBriefing` envelopes from `write_analysis_report`.

**analysis/** — The `.devsteps/analysis/` directory stores `AnalysisBriefing` JSON envelopes (Ring 1 internal/context/web analysts and all Ring 2 aspect agents). Path: `.devsteps/analysis/{item_id}/{aspect}-report.json`. Read by Ring 0 coord via `read_analysis_envelope(task_id, aspect)`. Distinct from `.devsteps/cbp/` (MandateResults) and `.devsteps/context/` (long-lived project context).

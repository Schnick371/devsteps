---
applyTo: "**"
description: "Spider Web dispatch protocol and behavioral invariants"
---

# Spider Web Dispatch Protocol

## Architecture — Spinnennetz (Spider Web)

The system is a **Spinnennetz / Radar Chart**: `coord` sits at the centre (Ring 0), concentric rings are execution phases, radial spokes are domains (Code, Tests, Docs, Risk, Research, Work Items, Errors). Threads are denser near the centre — coord reads more signals than any outer ring produces.

```
  Research        Errors
      ↑               ↑
      │  Ring 5: gate-reviewer                        (outermost)
      │  Ring 4: exec-impl → exec-test → exec-doc
      │  Ring 3: exec-planner
Risk ─┼─ Ring 2: aspect-* (parallel) ─────────────── Code
      │  Ring 1: analyst-* (parallel)
      │    ┌─────────┐
      │    │  coord  │  Ring 0 · Spinne im Zentrum
      │    └─────────┘
      │  Ring 1: analyst-*
      │  Ring 2: aspect-*
Docs ─┼─ Ring 3: exec-planner ────────────────────── Tests
      │  Ring 4: exec-impl/test/doc
      │  Ring 5: gate-reviewer                        (outermost)
      ↓               ↓
  WorkItems       Infrastr
```

### Ring → Agent Mapping

| Ring | Phase            | Agents                                                                                            | Mode                  |
| ---- | ---------------- | ------------------------------------------------------------------------------------------------- | --------------------- |
| 0    | Hub              | `coord-*`                                                                                         | dispatch + synthesis  |
| 1    | Analysis         | `analyst-archaeology`, `analyst-risk`, `analyst-research`, `analyst-quality`, `analyst-context`, `analyst-internal`, `analyst-web` | Parallel fan-out      |
| 2    | Cross-Validation | `aspect-impact`, `aspect-constraints`, `aspect-quality`, `aspect-staleness`, `aspect-integration`, `aspect-naming` | Parallel fan-out      |
| 3    | Planning         | `exec-planner` (reads Ring 1+2 results)                                                           | Sequential            |
| 4    | Execution        | **Conductors** (`dispatch_role: conductor`): `exec-impl` → `exec-test` ∧ `exec-doc` — each dispatches its designated worker pool via `runSubagent`; **Workers** (`dispatch_role: leaf`): `worker-*` dispatched by conductors (primary) or coord directly; `worker-workspace` (new projects, coord-dispatched first) | Sequential / parallel |
| 5    | Quality Gate     | `gate-reviewer` (blocking PASS/FAIL) · `gate-naming` (FULL tier, blocking naming check on committed files) | Sequential / parallel |

### Triage → Dispatch Mapping

| Triage      | Ring 1 — Analysis (parallel)                                                                                      | Ring 2 — Cross-Validation (parallel, after Ring 1)                             | Ring 3–5                                                                    |
| ----------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| QUICK       | _(whitespace / typo ONLY — no logic, no structure change)_                                                        | _(skip)_                                                                       | → direct `exec-impl` → `gate-reviewer`                                      |
| STANDARD    | `analyst-context` + `analyst-internal` + `analyst-risk`                                                           | `aspect-constraints` + `aspect-impact`                                         | → `exec-planner` → `exec-impl` → `exec-test` → `gate-reviewer`              |
| FULL        | `analyst-context` + `analyst-internal` + `analyst-risk` + `analyst-quality` + `analyst-archaeology` + `analyst-web` | `aspect-constraints` + `aspect-impact` + `aspect-staleness` + `aspect-quality` + `aspect-naming` | → `exec-planner` → `exec-impl` → `exec-test` ∥ `exec-doc` → `gate-reviewer` ∥ `gate-naming` |
| COMPETITIVE | `analyst-research` + `analyst-internal` + `analyst-web` + `analyst-context`                                       | `aspect-constraints` + `aspect-staleness`                                      | → `exec-planner` → `exec-impl` → `gate-reviewer`                            |

> **Read split:** `archaeology·risk·quality·research` → `read_mandate_results(item_ids)` · `context·internal·web` → `read_analysis_envelope(report_path)` (these write `write_analysis_report`)
> **`analyst-archaeology`** git forensics only — dispatched at FULL tier or explicitly when git history analysis is needed (reverts, blame, structural changes).

---

## Dispatch Invariants

1. **coord dispatches Ring 1–4 agents directly** — at most depth-2 nesting (coord → conductor → worker). coord dispatches analysts, aspects, exec-planner, and conductors. Conductors dispatch their designated worker pools. Workers never dispatch further.
2. **Dispatch role governs `runSubagent` access** — `dispatch_role: coordinator` (Ring 0 coord-*) has full authority. `dispatch_role: conductor` (exec-impl, exec-test, exec-doc) may ONLY dispatch agents in their `agents:` frontmatter list. `dispatch_role: leaf` (default for all others) NEVER calls `runSubagent`.
3. **Same-phase dispatches fire simultaneously** — never sequential when independent
4. **coord reads results by mechanism** — `read_mandate_results(item_ids)` for `archaeology/risk/quality/research`; `read_analysis_envelope(report_path)` for `context/internal/web`. Never raw envelopes.
5. **Communication is structured paths only** — never paste findings in chat
6. **Ring 2 fires AFTER Ring 1 completes** — aspects are cross-validators; pass Ring 1 `report_path` values as `upstream_paths`
7. **New project/package → `worker-workspace` first** — dispatch before `exec-impl`; `pip install -e .` must succeed without `PYTHONPATH` hacks
8. **Never Act Alone** — R1 minimum (context + internal + risk for STANDARD+) fires before ANY non-trivial action regardless of work type (code, docs, planning, git, release, backlog). QUICK is restricted to whitespace/typo only. `analyst-archaeology` added only when git history analysis is needed. Work-type dispatch matrix is in `copilot-instructions.md`.
9. **Scope-split fan-out** — coord MAY dispatch multiple instances of the same analyst type with non-overlapping scope partitions (subtree, angle, concern, or volume split). Safe for `write_mandate_result` types (UUID-keyed). `write_analysis_report` types require sequential dispatch or accept last-writer-wins until MCP adds `scope_shard`. See AGENT-DISPATCH-PROTOCOL.md §1 I-13.
10. **Single-concern mandate (I-14)** — Each analyst/aspect mandate covers ONE investigation question. coord MUST scope-split when ≥2 orthogonal concerns are present. Concern-split produces at most MAX_SPLIT=4 additional agents total.

---

## Anti-Repeat Rules

- **Track all approaches** in guide-dev file (`AITK-Tools-Guide-Dev.md`)
- **On failure:** log the approach, what failed, and why
- **On re-dispatch:** pass exclusion constraint listing failed approaches to coord
- **Never retry the same approach more than once** — cycle to alternative strategy
- **If all approaches exhausted:** escalate via `write_escalation`, return to user

---

## Disabled-Tool Protocol

### `runSubagent` unavailable

→ **Switch to `devsteps-R0-coord-solo`.** Report: _“Agent dispatch (`runSubagent`) is unavailable. Switching to coord-solo fallback.”_ Condense to single-pass analysis. Triage task size (Trivial / Small / Medium / Large); for Large → warn user full Spider Web is recommended. DevSteps + Conventional Commits remain MANDATORY. Never simulate MandateResult structures.

### DevSteps MCP tools unavailable

→ **STOP immediately.** Report specific missing tools:

> "Required DevSteps MCP tools are unavailable: [list tools]. Cannot manage work items without MCP access."

Fallback to CLI only if explicitly authorized by user.

### Bright Data / web search tools unavailable

→ **Warn user** before proceeding with stale knowledge:

> "Web research tools unavailable. Proceeding with training data only — results may be outdated."

---

## Web-First Research Rules

1. **Any library/framework/API question** → web search FIRST, implement SECOND
2. **Use `bright-data` tools** for current documentation, changelogs, deprecation notices
3. **Cross-validate** web findings against internal codebase patterns
4. **Acknowledge staleness** — state when relying on training data vs. live sources
5. **Minimum 3 sources** for technology decisions; 10+ for architecture choices

---

## Guide System Integration

1. **Session start:** Read `AITK-Tools-Guide-Dev.md` for failed approaches and session context
2. **After each step:** Update guide-dev with status, findings, and decisions
3. **On failure:** Log approach details for cycling prevention
4. **On success:** Record working approach for future reference
5. **Guide hierarchy:** Guide (walkthrough) → Guide-Dev (session log) → Guide-Reference (architecture)

---

## Loop Bounds

| Loop                          | Max Iterations | On Breach                  |
| ----------------------------- | -------------- | -------------------------- |
| Review-Fix cycles             | 3              | `write_escalation`         |
| TDD iterations                | 3              | `write_escalation`         |
| Clarification rounds (CSPG)   | 1              | `write_escalation`         |
| Conflict resolution (analyst) | 2              | Caveated synthesis         |
| Aspect parallel dispatches    | 10             | Split into batches         |
| Guide-cycle continuity        | Until final ✅  | `write_escalation` if guide file missing |

---

## DevSteps MCP — Tool Reference

| Tool                                 | Usage                                                            | Caller                                                                 |
| ------------------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `mcp_devsteps_add`                   | Create new item (type, title, description, priority, tags)      | `coord (bootstrap primary) · worker-devsteps (follow-ups)`             |
| `mcp_devsteps_update`                | Update item (status, description, append_description)           | `coord (status gates + done-gate append) · worker-devsteps (desc/tags)`|
| `mcp_devsteps_list`                  | List items (filter: type, status, tags)                         | `coord · any agent`                                                    |
| `mcp_devsteps_get`                   | Read single item                                                 | `coord · any agent`                                                    |
| `mcp_devsteps_search`                | Full-text search (check duplicates before mcp_devsteps_add!)    | `coord · any agent`                                                    |
| `mcp_devsteps_link`                  | Create relationship (implements, depends-on, relates-to, blocks) | **`worker-devsteps ONLY`**                                             |
| `mcp_devsteps_trace`                 | Show dependency tree                                             | `coord · any agent`                                                    |
| `mcp_devsteps_status`                | Project overview                                                 | `coord · any agent`                                                    |
| `mcp_devsteps_write_mandate_result`  | Analyst/Exec: write MandateResult                               | `analyst-* · exec-*`                                                   |
| `mcp_devsteps_read_mandate_results`  | Coord: read MandateResults — returns envelope `{ results[], count, quorum_ok, missing_analysts, dispatched, received, threshold, status }`. Iterate `.results[]` (not the response directly). Pass `expected_agent_names` to enable quorum tracking. | **`coord ONLY`**                                                       |
| `mcp_devsteps_write_analysis_report` | Aspect/Analyst: write analysis report                            | `aspect-* · analyst-*`                                                 |
| `mcp_devsteps_write_escalation`      | Signal escalation                                                | `any agent`                                                            |

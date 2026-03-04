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
| 1    | Analysis         | `analyst-archaeology`, `analyst-risk`, `analyst-research`, `analyst-quality`                      | Parallel fan-out      |
| 2    | Cross-Validation | `aspect-impact`, `aspect-constraints`, `aspect-quality`, `aspect-staleness`, `aspect-integration` | Parallel fan-out      |
| 3    | Planning         | `exec-planner` (reads Ring 1+2 results)                                                           | Sequential            |
| 4    | Execution        | **Conductors:** `exec-impl` → `exec-test` ∧ `exec-doc` (each dispatches its workers); **Workers:** `worker-*` dispatched by conductors NOT coord; `worker-workspace` (new projects, dispatched by coord directly) | Sequential / parallel |
| 5    | Quality Gate     | `gate-reviewer` (blocking PASS/FAIL)                                                              | Sequential            |

### Triage → Dispatch Mapping

| Triage      | Ring 1 — Analysis (parallel)                               | Ring 2 — Cross-Validation (parallel, after Ring 1)                             | Ring 3–5                                                                    |
| ----------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| QUICK       | _(whitespace / typo ONLY — no logic, no structure change)_ | _(skip)_                                                                       | → direct `exec-impl` → `gate-reviewer`                                      |
| STANDARD    | `analyst-archaeology` + `analyst-risk`                     | `aspect-constraints` + `aspect-impact`                                         | → `exec-planner` → `exec-impl` → `exec-test` → `gate-reviewer`              |
| FULL        | `analyst-archaeology` + `analyst-risk` + `analyst-quality` | `aspect-constraints` + `aspect-impact` + `aspect-staleness` + `aspect-quality` | → `exec-planner` → `exec-impl` → `exec-test` ∥ `exec-doc` → `gate-reviewer` |
| COMPETITIVE | `analyst-research` + `analyst-archaeology`                 | `aspect-constraints` + `aspect-staleness`                                      | → `exec-planner` → `exec-impl` → `gate-reviewer`                            |

---

## Dispatch Invariants

1. **coord dispatches ALL agents directly** — single flat level, no nested dispatch
2. **Non-coord agents NEVER call `runSubagent`** — behavioral leaf nodes
3. **Same-phase dispatches fire simultaneously** — never sequential when independent
4. **coord reads MandateResults only** — `read_mandate_results(item_ids)`, never raw envelopes
5. **Communication is structured paths only** — never paste findings in chat
6. **Ring 2 fires AFTER Ring 1 completes** — aspects are cross-validators; pass Ring 1 `report_path` values as `upstream_paths`
7. **New project/package → `worker-workspace` first** — dispatch before `exec-impl`; `pip install -e .` must succeed without `PYTHONPATH` hacks
8. **Never Act Alone** — R1 minimum (archaeology + risk) fires before ANY non-trivial action regardless of work type (code, docs, planning, git, release, backlog). QUICK is restricted to whitespace/typo only. Work-type dispatch matrix is in `copilot-instructions.md`.

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

→ **Switch to `devsteps-R0-coord-solo`.** Report to user:

> "Agent dispatch (`runSubagent`) is unavailable. Switching to `devsteps-R0-coord-solo` fallback — all analysis and implementation runs inline without subagent dispatch."

**Fallback rules for `devsteps-R0-coord-solo`:**

- Do NOT inline analyst logic verbatim — condense to single-pass analysis
- Triage the task (Trivial / Small / Medium / Large) and apply Solo-Execution-Protocol
- For tasks classified as "Large": inform user that full Spider Web Dispatch is recommended and proceed with best-effort solo execution
- DevSteps integration remains MANDATORY even in solo mode
- Conventional Commits format remains MANDATORY

Do NOT attempt to simulate full subagent behavior or fake MandateResult structures.

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
| Clarification rounds          | 2              | Proceed with best judgment |
| Conflict resolution (analyst) | 2              | Caveated synthesis         |
| Aspect parallel dispatches    | 10             | Split into batches         |

---

## DevSteps MCP — Tool Reference

| Tool                                 | Usage                                                       |
| ------------------------------------ | --------------------------------------------------------------- |
| `mcp_devsteps_add`                   | Create new item (type, title, description, priority, tags) |
| `mcp_devsteps_update`                | Update item (status, description, append_description)    |
| `mcp_devsteps_list`                  | List items (filter: type, status, tags)                    |
| `mcp_devsteps_get`                   | Read single item                                            |
| `mcp_devsteps_search`                | Full-text search (check duplicates before mcp_devsteps_add!) |
| `mcp_devsteps_link`                  | Create relationship (implements, depends-on, relates-to, blocks)  |
| `mcp_devsteps_trace`                 | Show dependency tree                                      |
| `mcp_devsteps_status`                | Project overview                                               |
| `mcp_devsteps_write_mandate_result`  | Analyst/Exec: write MandateResult                           |
| `mcp_devsteps_read_mandate_results`  | Coord: read MandateResults                                  |
| `mcp_devsteps_write_analysis_report` | Aspect/Analyst: write analysis report                        |
| `mcp_devsteps_write_escalation`      | Signal escalation                                          |

# DevSteps Agent Registry

## Architecture — Spinnennetz (Spider Web)

The Spider Web is a **radar/spider chart**: coord sits at the centre, concentric rings are execution phases, radial spokes are analysis domains. Threads are denser near the centre — coord reads many more signals than any outer agent produces.

```
  Research       Errors
      ↑              ↑
      │  ─ ─ ─ ─ ─   │  Ring 5 (gate-reviewer)       outermost
      │ ─ ─ ─ ─ ─ ─  │  Ring 4 (exec-impl/test/doc)
      │─ ─ ─ ─ ─ ─ ─ │  Ring 3 (exec-planner)
Risk ─┼─ ─ ─ ─ ─ ─ ─ ┼─ Code
      │─ ─ ─ ─ ─ ─ ─ │  Ring 2 (aspect-* parallel)
      │ ─ ─ ─ ─ ─ ─  │  Ring 1 (analyst-* parallel)
      │  ┌────────┐   │
      │  │ coord  │   │  Ring 0 · Hub · Spinne im Zentrum
      │  └────────┘   │
      │ ─ ─ ─ ─ ─ ─  │  Ring 1 (analyst-*)
      │─ ─ ─ ─ ─ ─ ─ │  Ring 2 (aspect-*)
Docs ─┼─ ─ ─ ─ ─ ─ ─ ┼─ Tests
      │─ ─ ─ ─ ─ ─ ─ │  Ring 3 (exec-planner)
      │ ─ ─ ─ ─ ─ ─  │  Ring 4 (exec-impl/test/doc)
      │  ─ ─ ─ ─ ─   │  Ring 5 (gate-reviewer)       outermost
      ↓              ↓
  WorkItems      Infrastr
```

| Ring | Phase            | Agents                             | Mode             |
| ---- | ---------------- | ---------------------------------- | ---------------- |
| 0    | Hub              | `coord-*`                          | orchestrates all |
| 1    | Analysis         | `analyst-*`                        | parallel fan-out |
| 2    | Cross-Validation | `aspect-*`                         | parallel fan-out |
| 3    | Planning         | `exec-planner`                     | sequential       |
| 4    | Execution        | `exec-impl → exec-test → exec-doc` | sequential       |
| 5    | Quality Gate     | `gate-reviewer`                    | blocking         |

| Role        | Function                                | File pattern                  |
| ----------- | --------------------------------------- | ----------------------------- |
| **coord**   | Coordinator — dispatches all agents     | `devsteps-R0-coord*.agent.md`    |
| **analyst** | Deep-read analysis, mandate handlers    | `devsteps-analyst-*.agent.md` |
| **aspect**  | Single-aspect scanner (leaf)            | `devsteps-aspect-*.agent.md`  |
| **exec**    | Execution orchestration (impl/test/doc) | `devsteps-exec-*.agent.md`    |
| **gate**    | Blocking QA gate                        | `devsteps-gate-*.agent.md`    |
| **worker**  | Leaf executor (code/test/doc/devsteps)  | `devsteps-worker-*.agent.md`  |

> All agent files contain a `## Contract` section identifying their tier, dispatcher, and return type.

---

## coord → Agent Dispatch Routing Table

> **CRITICAL: All mandates in the same row MUST be dispatched simultaneously (one parallel fan-out). coord dispatches ALL agents — no nested dispatch.**

| Triage Tier     | Ring 1 — analysts (parallel)                               | Ring 2 — aspects (parallel, after Ring 1)                                      | Ring 3–5                                                                    |
| --------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| **QUICK**       | `exec-planner`                                             | _(skip)_                                                                       | `exec-impl` → `gate-reviewer`                                               |
| **STANDARD**    | `analyst-archaeology` + `analyst-risk`                     | `aspect-constraints` + `aspect-impact`                                         | → `exec-planner` → `exec-impl` → `exec-test` → `gate-reviewer`              |
| **FULL**        | `analyst-archaeology` + `analyst-risk` + `analyst-quality` | `aspect-constraints` + `aspect-impact` + `aspect-staleness` + `aspect-quality` | → `exec-planner` → `exec-impl` → `exec-test` ∥ `exec-doc` → `gate-reviewer` |
| **COMPETITIVE** | `analyst-research` + `analyst-archaeology`                 | `aspect-constraints` + `aspect-staleness`                                      | → `exec-planner` → `exec-impl` → `gate-reviewer`                            |

---

## Mandate Types → Analyst/Exec Mapping

| mandate-type     | Agent                          | Protocol                                                                       |
| ---------------- | ------------------------------ | ------------------------------------------------------------------------------ |
| `archaeology`    | `devsteps-R1-analyst-archaeology` | context + internal aspect fan-out → structural map                             |
| `risk`           | `devsteps-R1-analyst-risk`        | impact + integration + constraints aspect fan-out → risk matrix                |
| `research`       | `devsteps-R1-analyst-research`    | web + internal aspect cross-validation → ranked recommendation                 |
| `quality`        | `devsteps-R1-analyst-quality`     | automated gates + quality aspect + Review-Fix loop                             |
| `planning`       | `devsteps-R3-exec-planner`        | reads existing MandateResults, minimal aspect dispatch → ordered steps         |
| `workspace`      | `devsteps-R4-worker-workspace`    | scaffold new project: `create_new_workspace`, pyproject.toml, venv, .gitignore |
| `implementation` | `devsteps-R4-exec-impl`           | reads planner MandateResult → code committed                                   |
| `testing`        | `devsteps-R4-exec-test`           | reads impl MandateResult → tests pass                                          |
| `documentation`  | `devsteps-R4-exec-doc`            | reads impl MandateResult → docs updated                                        |
| `review`         | `devsteps-R5-gate-reviewer`       | Blocking quality gate — PASS/FAIL, write_rejection_feedback, escalation        |

**Ishikawa bone mandates (dispatched directly by `devsteps-R0-coord-ishikawa`):**

| Bone                  | Round | Agent                          | Returns           |
| --------------------- | ----- | ------------------------------ | ----------------- |
| Code + Structure      | R1    | `devsteps-R1-analyst-archaeology` | MandateResult     |
| Tests                 | R1    | `devsteps-R1-analyst-quality`     | MandateResult     |
| Environment/Risk      | R1    | `devsteps-R1-analyst-risk`        | MandateResult     |
| Process/Context       | R2    | `devsteps-R1-analyst-context`     | MandateResult     |
| Docs (staleness)      | R2    | `devsteps-R2-aspect-staleness`    | Analysis Envelope |
| Constraints           | R2    | `devsteps-R2-aspect-constraints`  | Analysis Envelope |
| Impact radius         | R2    | `devsteps-R2-aspect-impact`       | Analysis Envelope |
| Integration seams     | R2    | `devsteps-R2-aspect-integration`  | Analysis Envelope |
| Cross-cutting quality | R2    | `devsteps-R2-aspect-quality`      | Analysis Envelope |

---

## Communication Contracts

### coord → Agent dispatch

coord passes via `runSubagent`: `item_ids[]`, `mandate_type`, `sprint_id`, `triage_tier`, optional `constraints`.

All agents — analyst, aspect, exec, gate, worker — are dispatched directly by coord. No nested dispatch.

### Analyst/Exec response (chat — nothing else)

```
report_path: .devsteps/cbp/{sprint_id}/{mandate_id}.result.json
verdict: <domain verdict>
confidence: 0.0–1.0
```

### coord reading analyst/exec results

coord calls: `read_mandate_results(item_ids)` — ONLY this.

### Aspect agents

Aspect and domain-analyst agents write via `write_analysis_report`, coord reads via `read_mandate_results`. No intermediate reader layer.

---

## Aspect & Analyst Agents (dispatched by coord — all leaf nodes)

> Each file contains a `## Contract` section that identifies its role, dispatcher, and return type.
> Naming: `devsteps-aspect-*.agent.md` | `devsteps-analyst-*.agent.md`

| Agent                         | Domain                                       |
| ----------------------------- | -------------------------------------------- |
| `devsteps-R2-aspect-impact`      | Call-site blast radius                       |
| `devsteps-R2-aspect-constraints` | Hard constraints, schema, contract risks     |
| `devsteps-R2-aspect-quality`     | Test gaps, pattern consistency               |
| `devsteps-R2-aspect-staleness`   | Stale docs, conflicting active branches      |
| `devsteps-R2-aspect-integration` | Cross-package boundaries                     |
| `devsteps-R1-analyst-context`    | Global project map, tree walking             |
| `devsteps-R1-analyst-internal`   | Deep file reads, symbol tracing              |
| `devsteps-R1-analyst-web`        | External best practices, deprecation signals |

## Build Helper (dispatched by exec agents in RESOLVE phase only)

| Agent                               | Trigger                                                | Returns                                                                |
| ----------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| `devsteps-R4-worker-build-diagnostics` | Build/test command exits non-zero with ambiguous error | Category + fix_command + next_action (chat — no write_analysis_report) |

---

## Exec Conductors (dispatched by coord after exec-planner MandateResult available)

| Agent                | Role                                                                               |
| -------------------- | ---------------------------------------------------------------------------------- |
| `devsteps-R4-exec-impl` | Implementation Conductor — reads planner MandateResult, coordinates implementation |
| `devsteps-R4-exec-test` | Test Conductor — reads impl MandateResult, drives test writing                     |
| `devsteps-R4-exec-doc`  | Documentation Conductor — reads impl MandateResult, drives doc writing             |

Exec Conductors receive **only `report_path` + `item_id`** from coord and return a MandateResult.

## Exec Workers (dispatched by coord — leaf nodes)

| Agent                               | Role                                              |
| ----------------------------------- | ------------------------------------------------- |
| `devsteps-R4-worker-impl`              | Code writer                                       |
| `devsteps-R4-worker-test`              | Test writer                                       |
| `devsteps-R4-worker-doc`               | Documentation writer                              |
| `devsteps-R4-worker-coder`             | Targeted code edits                               |
| `devsteps-R4-worker-tester`            | Test generation                                   |
| `devsteps-R4-worker-documenter`        | Documentation updates                             |
| `devsteps-R4-worker-devsteps`          | DevSteps item operations                          |
| `devsteps-R4-worker-refactor`          | Code refactoring                                  |
| `devsteps-R4-worker-integtest`         | Integration test execution                        |
| `devsteps-R4-worker-guide-writer`      | Guide file updates                                |
| `devsteps-R4-worker-build-diagnostics` | Build/test failure diagnosis                      |
| `devsteps-R4-worker-workspace`         | New project/package scaffolding (Ring 4 pre-impl) |

All workers receive **only `report_path` + `item_id`** — never raw findings pasted in prompt.

---

## User-Invokable Agents (appear in VS Code agent picker)

| Agent                      | When to use                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `devsteps-R0-coord`           | Single item implementation (always via `devsteps-20-start-work` prompt)                                      |
| `devsteps-R0-coord-sprint`    | Multi-item sprint (always via `devsteps-40-sprint` prompt)                                                   |
| `devsteps-backlog-curator` | Backlog health: audit, re-triage, staleness, archiving — NOT sprint execution                                |
| `devsteps-R0-coord-ishikawa`  | Workspace health analysis — Ishikawa fishbone across 6 dimensions (always via `devsteps-80-ishikawa` prompt) |

--- — `agents`, `handoffs`, `user-invokable`

All agent files use VS Code custom agent frontmatter (VS Code 1.106+).

| Field                   | coord                         | analyst/exec/gate                | aspect/worker |
| ----------------------- | ----------------------------- | -------------------------------- | ------------- |
| `agents:`               | ✓ lists all dispatched agents | — (leaf, no dispatch)            | —             |
| `handoffs:`             | ✓ workflow buttons            | ✓ pipeline buttons (gate only)   | —             |
| `user-invokable: false` | — (always visible)            | ✓ (hidden, except gate-reviewer) | ✓ (hidden)    |

### `agents:` — Subagent Dispatch Allowlist

Lists which agents this agent may programmatically dispatch via `runSubagent`.
Only coordinator agents (`coord-*`) have `agents:` lists.

```yaml
agents:
  - devsteps-R1-analyst-archaeology
  - devsteps-R1-analyst-risk
```

### `handoffs:` — Guided UI Transitions

Buttons rendered after each response to guide the developer through workflow steps.
`send: false` means the user must click Send — the prompt is pre-filled but not auto-sent.
`handoffs.agent` does **not** need to be in `agents:` — handoffs are UI navigation only.

```yaml
handoffs:
  - label: "Phase A: Archaeology"
    agent: devsteps-R1-analyst-archaeology
    prompt: "Archaeology mandate for item: [PASTE_ITEM_ID]."
    send: false
```

### `user-invokable: false` — Subagent-Only Visibility

Hides the agent from the VS Code agent picker dropdown.
Set on all analysts (except reviewer) and all aspect agents — they are only
accessible when dispatched programmatically by their parent tier agent.

---

_Protocol details: [AGENT-DISPATCH-PROTOCOL.md](./AGENT-DISPATCH-PROTOCOL.md)_  
_Agent naming: `devsteps-{role}-{name}.agent.md` where role ∈ {coord, analyst, aspect, exec, gate, worker}_

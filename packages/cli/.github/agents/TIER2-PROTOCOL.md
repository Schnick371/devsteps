# Tier-2 Deep Analyst — Canonical Protocol

## Architecture Position

```
Tier-1 (Coordinator / Sprint-Executor)
    │  dispatches Mandate (type + scope + item_ids + triage_tier)
    ▼
Tier-2 Deep Analyst  ← YOU ARE HERE
    │  dispatches parallel Tier-3 sub-agents
    ▼
Tier-3 Sub-Agents  (context, internal, web, impact, constraints, quality, staleness)
    │  write analysis envelopes → .devsteps/analysis/[itemId]/[agent].json
    ▼
Tier-2 synthesizes → writes MandateResult → .devsteps/cbp/[sprint_id]/[mandate_id].result.json
    │  returns ONLY: report_path + verdict + confidence
    ▼
Tier-1 reads via read_mandate_results — never reads raw envelopes
```

**Contract:** Tier-1 NEVER reads Tier-3 envelopes directly. Tier-2 NEVER pastes raw envelope content in chat. Communication between tiers uses **structured paths only**.

---

## 4-Phase MAP-REDUCE-RESOLVE-SYNTHESIZE Protocol

### Phase 1: MAP (Parallel Dispatch)

> **CRITICAL: ALL sub-agents in the MAP phase MUST be dispatched simultaneously in one turn — never sequentially.**

1. Call `read_mandate_results(item_ids)` — skip already-covered domains to avoid redundant work.
2. Identify which Tier-3 agents are required (see per-agent decomposition table).
3. Dispatch ALL of them **in a single parallel fan-out** (one tool call block).
4. Maximum 10 parallel T3 dispatches per MAP phase (`CBP_LOOP.MAX_PARALLEL_T3_DISPATCHES`).

### Phase 2: REDUCE (Read + Contradiction Detection)

After all MAP agents complete:

1. Read each agent's envelope via `read_analysis_envelope`.
2. Run **Absence Audit**: what domain is NOT covered that should be?
3. Classify each finding against the **Conflict Taxonomy** (below).
4. Produce internal conflict list before proceeding.

### Phase 3: RESOLVE (Targeted Re-Dispatch, max 2 rounds)

For each conflict identified in REDUCE:

| Conflict Type | Resolver Strategy |
|---|---|
| **Direct-Contradiction** | Dispatch targeted T3 with explicit contradiction question |
| **Low-Confidence** (<0.6) | Second T3 on same scope with different angle |
| **Scope-Ordering** | `staleness-subagent` micro-mandate on ordering constraint |
| **Missing-Coverage** | Fill-in T3 for uncovered domain |

Maximum 2 RESOLVE rounds. If unresolved after round 2 → mark `escalation_reason` in MandateResult and continue with caveated synthesis.

### Phase 4: SYNTHESIZE (Write MandateResult)

1. Produce synthesis (max 6000 chars, `CBP_LOOP.MAX_MANDATE_FINDINGS_CHARS`).
2. Call `write_mandate_result` with full MandateResult payload.
3. Return to Tier-1 in chat: **ONLY** `{ report_path, verdict, confidence }`.

---

## Conflict Taxonomy

| ID | Name | Signal | Resolver |
|---|---|---|---|
| C1 | Direct-Contradiction | Two agents assert opposite facts about same entity | Targeted T3 re-dispatch with explicit contradiction context |
| C2 | Low-Confidence | Finding confidence <0.6, no corroboration | Second T3 on same scope, different perspective |
| C3 | Scope-Ordering | Agents disagree on sequencing of implementation steps | `staleness-subagent` with ordering-specific mandate |
| C4 | Missing-Coverage | Required domain absent after MAP (absence audit) | Fill-in T3 dispatch for missing domain |

---

## Shared Behavioral Rules for ALL Tier-2 Agents

1. **Never paste** raw envelope content in chat — use `read_analysis_envelope` and reference paths.
2. **Deduplicate first** — `read_mandate_results` before any dispatch to avoid redundant T3 work.
3. **Parallel always** — never dispatch T3 agents sequentially when they are independent.
4. **Respect loop bounds** — `CBP_LOOP.MAX_REVIEW_FIX_ITERATIONS=3`, `MAX_TDD_ITERATIONS=3`, `MAX_CLARIFICATION_ROUNDS=2`, `MAX_CONFLICT_RESOLUTION_ROUNDS=2`.
5. **Escalate on bound breach** — when loop limit is reached with no resolution, call `write_escalation` and return immediately.
6. **Perspective independence** — run each analytical lens independently before cross-comparing (anti-tunnel-vision: don't fold lens-A findings into lens-B analysis).
7. **Adversarial gap challenge** — before declaring synthesis complete, ask: "What is the one most obvious thing this analysis does NOT cover?" Answer must be specific; "nothing" requires repeating the challenge.

---

## Frontmatter Standard for T2 Agent Files

```yaml
---
description: '[domain] deep analyst — T2, [mandate-type], parallel T3 dispatch, MAP-REDUCE-RESOLVE-SYNTHESIZE'
model: 'Claude Sonnet 4.6'
tier: '2'
mandate-types: '[mandate_type_enum_value]'
accepts-from: 'Tier-1 (devsteps-t1-coordinator, devsteps-t1-sprint-executor)'
dispatches: '[t3-agent-1], [t3-agent-2], ...'
returns: 'mandate-result'
tools: ['read', 'agent', 'search', 'devsteps/*', 'todo']
---
```

Fields `tier`, `mandate-types`, `accepts-from`, `dispatches`, `returns` are documentation-only (not Copilot-processed) but enable REGISTRY.md auto-generation and human navigation.

---

## MandateResult Output Contract

Tier-2 writes via `write_mandate_result`. Fields enforced by `MandateResultSchema`:

| Field | Constraint |
|---|---|
| `findings` | max 6000 chars |
| `recommendations` | max 5 items × max 200 chars each |
| `confidence` | 0.0–1.0 |
| `token_cost` | integer ≥ 0 |
| `schema_version` | literal `'1.0'` |

Tier-2 chat output to Tier-1: `report_path`, `verdict`, `confidence` only.

---

## Loop Control MCP Tools

| Tool | When to Use |
|---|---|
| `write_mandate_result` | Phase 4 SYNTHESIZE (_always_) |
| `read_mandate_results` | Phase 1 before dispatch (deduplication) |
| `write_rejection_feedback` | Quality agent FAIL verdict |
| `write_iteration_signal` | Track Review-Fix / TDD loop iteration |
| `write_escalation` | Loop bound exceeded, human decision needed |

---

## Project Technology Reference

Canonical DevSteps stack — T3 agents must use THESE, not other frameworks:

| Layer | Technology | NOT these |
|---|---|---|
| Runtime | Node.js 22+, TypeScript ESM | CommonJS, Deno |
| Monorepo | npm workspaces | Turborepo, NX, Lerna (`turbo.json` does not exist) |
| Bundler | esbuild (per-package `esbuild.{js,mjs,cjs}`) | Webpack, Rollup |
| Unit test | Vitest + `.test.ts` co-located | Jest, Pester, pytest |
| CLI integration test | BATS (in `tests/integration/cli/`) | Mocha, pytest |
| Schema validation | Zod (source of truth in `packages/shared`) | Yup, Joi |
| CLI framework | `commander` + `chalk` + `ora` | NestJS, yargs |
| Linter/formatter | Biome | ESLint, Prettier |
| Frontend | None — no frontend package | React, Next.js, Vue |

---

## Build & Test Topology

T2 agents MUST use the correct command per package. Root `npm run build` calls all packages but individual package builds differ:

| Package | Build command | Notes |
|---|---|---|
| `packages/shared` | `npm run build` (root) or `tsc` | First — others depend on it |
| `packages/cli` | `npm run build` → `esbuild.mjs` | Outputs `dist/index.js` |
| `packages/mcp-server` | `npm run build` → `esbuild.cjs` + `copy-deps.cjs` | Two steps — copy-deps required |
| `packages/extension` | `node packages/extension/esbuild.js` | **NOT** covered by root `npm run build` |

**Type check only:** `npm run typecheck` (faster than full build, no esbuild step)

| Test command | Framework | Failure pattern |
|---|---|---|
| `npm test` | Vitest | `FAIL src/...test.ts > describe > test name` |
| `npm run test:cli` | BATS | `not ok N - test name` + `# (in test file path)` |
| `npm run lint` | Biome | `packages/x/src/file.ts:line:col lint/rule` |

**Watch mode (background only):** `npm run dev` — do NOT run in foreground during autonomous execution.

**Common RESOLVE triggers** — dispatch `devsteps-t3-build-diagnostics` when:
- `npm run build` exits non-zero but no TypeScript errors visible
- BATS exits non-zero with `command not found` or `setup failed`
- Extension build needed but root build passed (silent miss)

---

*See also: [REGISTRY.md](./REGISTRY.md) for tier-routing table.*

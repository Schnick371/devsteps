# DevSteps Project — Structured Development System

AI-powered task tracking and traceability for software projects, delivered as MCP server, CLI, and VS Code extension.

# DevSteps — GitHub Copilot Instructions

> These instructions apply across all projects using DevSteps.
> Project-specific extensions go in the "Project Context" section at the end.

## Spider Web Dispatch — Core Principle

All Copilot agents follow the **Spinnennetz / Radar Chart model**: concentric rings = phases, radial spokes = domains (Code, Tests, Docs, Risk, Research, Work Items, Errors). `coord` sits at the centre (Ring 0) and dispatches all agents directly outward.

| Ring            | Agents                                                                                        | Mode             | Timing          |
| --------------- | --------------------------------------------------------------------------------------------- | ---------------- | --------------- |
| 0 — Hub         | `coord-*` — dispatches ALL, reads MandateResults + Analysis Envelopes                         | Orchestration    | always          |
| 1 — Analysis    | `analyst-*` — Read-only Research (standard: `context·internal·risk`; FULL adds `quality·archaeology·web`; COMPETITIVE adds `research·web`) | Parallel fan-out | simultaneously  |
| 2 — Validation  | `aspect-*` — Cross-Validation with Ring 1 results                                             | Parallel fan-out | AFTER Ring 1    |
| 3 — Planning    | `exec-planner` — reads Ring 1+2 results                                                       | Sequential       | AFTER Ring 2    |
| 4 — Execution   | **Conductors** (`dispatch_role: conductor`): `exec-impl`, `exec-test`, `exec-doc` — each dispatches its designated worker pool via `runSubagent`; **Workers** (`dispatch_role: leaf`): `worker-*` dispatched by conductors (primary) or coord directly; `worker-workspace` (new projects, coord-dispatched first) | Sequential       | AFTER Ring 3    |
| 5 — Gate        | `gate-reviewer` — QA blocker PASS/FAIL                                                        | Blocking         | AFTER Ring 4    |

> **VS Code Constraint**: `runSubagent` does not support nesting. `coord-*` dispatches EVERYTHING directly. No non-coord agent may call `runSubagent` — all are Leaf Nodes.
> **Ring 2** fires via coord directly (not the analysts), AFTER Ring 1 MandateResults are available. Ring 1 `report_path` values are passed as `upstream_paths`.
> **Read split (Ring 1):** `archaeology·risk·quality·research` → `read_mandate_results`; `context·internal·web` → `read_analysis_envelope(report_path)` — these write `write_analysis_report`, not `write_mandate_result`.
> **Background Agents** (VS Code 1.109+, stable): Agents can run without an open chat window, persist across sessions, and use the same tools. Long-running exec-impl/exec-test tasks benefit from background execution.

When `runSubagent` is available: use Spider Web Dispatch.
When `runSubagent` is disabled: use `devsteps-R0-coord-solo` as fallback.

## DevSteps Integration (MANDATORY for coord agents)

DevSteps is the primary work-tracking system. NEVER edit `.devsteps/` directly — MCP tools only.

> **Other agents** (analyst-*, aspect-*, exec-*, worker-*) read DevSteps items and write MandateResults/Analysis-Envelopes. They NEVER create new items or change lifecycle status directly — that is exclusively coord's responsibility. Exception: `worker-devsteps` creates follow-up items and manages all link operations as delegated by coord (never autonomously).

### Item Types

| Type          | Purpose                              | Schema           |
| ------------- | ------------------------------------ | ---------------- |
| `epic`        | Large goal (multiple stories)        | Scrum/Hybrid     |
| `story`       | Feature or improvement               | Scrum/Hybrid     |
| `task`        | Concrete task (hours)                | all              |
| `bug`         | Bug fix                              | all              |
| `spike`       | Investigation / PoC                  | all              |
| `feature`     | New functionality                    | Waterfall/Hybrid |
| `requirement` | Requirement                          | Waterfall/Hybrid |
| `doc`         | Wissensknoten / **Content Fragment**: one H1 content block in a documentation document — authors ALWAYS write `# Title` (H1), assembler shifts heading levels via `offset = bom_level − 1` at export time. H2–H5 sub-headings within a fragment are prose content, NOT separate doc items. Cross-cutting — outside the Epic hierarchy. Relations: `documents` / `documented-by`. Inhalt im `description`-Feld (vollständiges Markdown). | all |
| `test`        | Test specification or test case — cross-cutting like `doc`. Links to items under test via `tests` / `tested-by` relations. | all |

### Status Flow

`draft` → `planned` → `in-progress` → `review` → `done`
(Never skip; `blocked` / `cancelled` / `obsolete` for exceptions)

### Lifecycle (coord only)

1. Check backlog: `mcp_devsteps_list` / `mcp_devsteps_search` (avoid duplicates)
2. Create **primary** item if none exists: `mcp_devsteps_add` _(bootstrap only — coord's sole permitted direct `add`)_
3. Set status `in-progress`: `mcp_devsteps_update`
4. Create branch: `git checkout -b story/<ID>`
5. Dispatch analysis (Ring 1 → Ring 2 → Ring 3 → Ring 4 → Ring 5)
6. After Gate-PASS: `git merge --no-ff` → delete branch
7. Set status `done`: `mcp_devsteps_update` + `append_description` with result
8. Commit with `Implements: <ID>` footer

> **Delegation boundary (I-11):** coord calls `mcp_devsteps_add` ONLY in step 2 for the primary item. All follow-up items MUST be delegated to `worker-devsteps`. All `mcp_devsteps_link` calls MUST be delegated to `worker-devsteps`.

## Mandatory Behavioral Rules

> **HARD CONSTRAINTS — no exceptions, no overrides by prompt:**

| Constraint | Rule |
| ---------- | ---- |
| **runSubagent** | `coord-*` dispatches ALL agents via `runSubagent` — NEVER inline analyst/exec logic |
| **Never Act Alone** | R1 minimum (context + internal + risk) fires before ANY non-trivial action — code, docs, planning, git, release, backlog. QUICK = whitespace/typo ONLY. `analyst-archaeology` added only when git history analysis is needed |
| **Parallel fan-out** | All agents in the same ring fire in ONE simultaneous call — never sequential |
| **Scope-split fan-out** | coord MAY dispatch multiple instances of the same analyst type with non-overlapping scope partitions — see ADP §1 I-13 for write-path constraints |
| **Ring ordering** | Ring 2 fires AFTER Ring 1 completes — pass MandateResult `report_path` as `upstream_paths` |
| **Nesting** | Non-conductor, non-coord agents (`dispatch_role: leaf`) NEVER call `runSubagent`. Conductors (exec-impl, exec-test, exec-doc) may ONLY dispatch their designated `agents:` frontmatter list |
| **MandateResults** | Read via `mcp_devsteps_read_mandate_results` (archaeology/risk/quality/research) OR `mcp_devsteps_read_analysis_envelope` (context/internal/web) — iterate `.results[]`. Pass `expected_agent_names` for quorum tracking. |
| **new package** | Dispatch `worker-workspace` FIRST (before `exec-impl`) |
| **runSubagent off** | → `devsteps-R0-coord-solo`, inform user |
| **MCP tools missing** | → STOP immediately, list missing tools |
| **Research** | Unknown library/API → `bright-data` FIRST, implement second |
| **DevSteps files** | NEVER edit `.devsteps/` directly — MCP tools only |
| **Commits** | Conventional Commits MANDATORY |
| **Status** | NEVER skip a status step in DevSteps |

## Entry Point Routing

| Situation                     | Prompt                        | Agent               |
| ----------------------------- | ----------------------------- | ------------------- |
| Plan work                     | `devsteps-10-plan-work`       | coord               |
| Implement single item         | `devsteps-20-start-work`      | coord               |
| Conduct review                | `devsteps-25-review`          | gate-reviewer       |
| Iterative Kanban cycle        | `devsteps-30-rapid-cycle`     | coord               |
| Guide-driven Full Spider Web  | `devsteps-35-guide-cycle`     | coord               |
| Multi-item sprint             | `devsteps-40-sprint`          | coord-sprint        |
| Deep research & best practices | `devsteps-05-research`       | coord               |
| Git forensics                 | `devsteps-55-investigate`     | analyst-archaeology |
| Git cleanup                   | `devsteps-50-git-cleanup`     | coord               |
| Structural refactoring        | `devsteps-48-refactor`        | coord               |
| Naming convention enforcement | `devsteps-49-rename`          | coord               |
| Backlog hygiene               | `devsteps-95-item-cleanup`    | coord               |
| Classify backlog items        | `devsteps-45-classify-items`  | coord               |
| Assign meta-hierarchy (initiative/theme) | `devsteps-15-meta-hierarchy` | coord          |
| Document context              | `devsteps-56-context-sync`    | coord               |
| Review doc coverage / find gaps | `devsteps-57-doc-review`    | coord               |
| Import workspace docs → doc items | `devsteps-58-doc-import`  | coord               |
| Assemble full document from BOM | `devsteps-59-doc-assemble`  | coord               |
| Pre-release                   | `devsteps-60-release-next`    | coord               |
| Production release            | `devsteps-70-release`         | coord               |
| Workspace Health / Root Cause | `devsteps-80-ishikawa`        | coord-ishikawa      |
| Load context                  | `devsteps-01-project-context` | coord               |
| Adapt project Copilot files   | `devsteps-98-adapt-project-copilot-files` | coord          |
| Solo (no runSubagent)         | direct                                    | coord-solo     |
| Create agent file             | `/create-agent` (VS Code built-in)        | —              |
| Create instruction file       | `/create-instruction` (VS Code built-in)  | —              |
| Create skill file             | `/create-skill` (VS Code built-in)        | —              |


## Session Start

At the beginning of each new chat session, call `devsteps_context` (level: `'quick'`) to load current project context before responding to any task or question. If PROJECT.md is stale (>24 h), suggest running `devsteps context generate` to refresh it.

## Tech Stack

**Runtime / Language:**
- Node.js 22+, TypeScript ESM throughout (no CommonJS in src)
- `esbuild` per-package for bundling (each package has its own `esbuild.{js,mjs,cjs}`)
- `npm workspaces` for monorepo (no Turborepo, no NestJS, no Next.js, no Prisma)

**Key Dependencies:**
- `@modelcontextprotocol/sdk` v1.22 — MCP protocol, tools/resources/prompts capability
- `zod` — schema validation (source of truth in `packages/shared`)
- `commander` + `chalk` + `ora` — CLI
- `pino` + `pino-pretty` — structured logging (MCP server)
- `prom-client` — Prometheus metrics (MCP server)
- `@biomejs/biome` — lint + format (replaces ESLint + Prettier)
- `vitest` + `bats` — unit tests + CLI integration tests

**Package Structure:**
- `packages/shared` — Source of Truth: Zod schemas, core business logic, types, utils
- `packages/mcp-server` — MCP Protocol Server: tools, resources, prompts capability
- `packages/cli` — Command-line Interface (`devsteps` binary)
- `packages/extension` — VS Code Extension (webview + TreeView + MCP manager)

## Work-Type Dispatch Matrix

Applies to ALL coord agents. R1+R2 provide the multi-perspective input; R4 execution type changes per work type.

| Work Type | R1 (parallel) | R2 (parallel, after R1) | R4 Execution |
| --------- | ------------- | ----------------------- | ------------ |
| Code change | **context** + **internal** + risk | constraints + impact | exec-impl + exec-test [+ exec-doc] |
| Documentation | **context** + quality | impact + staleness | exec-doc |
| Planning | **context** + **internal** + risk | constraints + impact | worker-devsteps (creates items) |
| Git cleanup / merge | **context** + risk + **archaeology** | impact + integration | coord direct |
| Release | **context** + **internal** + risk + **archaeology** | constraints + impact | parallel release workers |
| Backlog hygiene | **context** + quality | staleness + impact | worker-devsteps |
| Item classification | **context** + quality | staleness + impact | worker-classifier |
| Meta-hierarchy assignment | **context** + quality | staleness + constraints | worker-meta-hierarchy |
| Build config change | **context** + **internal** + risk | constraints + integration | exec-impl + worker-build-diagnostics |
| Feature (approach unclear) | **context** + **internal** + **research** + **web** | constraints + staleness | exec-impl + exec-test |

> **Bold** = mandatory R1 agents. `context` (task preparation) + `internal` (code conventions) form the core at STANDARD+. `archaeology` is added only when git history analysis is relevant (git cleanup, release, reverts). `web` and `research` are added when approach selection or deprecation risk applies. FULL tiers also add `quality` + `archaeology`.

## Quality Principles

- Atomic changes — one concern per task
- Tests with implementation — never retroactively
- Build before done — no broken commits (`npm run build && npm test`)
- Biome for all formatting/linting — run `npm run format` before commit

---

**Agents:** `.github/agents/` · **Prompts:** `.github/prompts/` · **Instructions:** `.github/instructions/`

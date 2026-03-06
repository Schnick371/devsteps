---
agent: "devsteps-R0-coord"
model: "Claude Sonnet 4.6"
tools:
  ['vscode', 'execute', 'read', 'agent', 'browser', 'bright-data/*', 'edit', 'search', 'web', 'devsteps/*', 'todo']
description: "Adapt a project's existing Copilot files (.agent.md, .prompt.md, .instructions.md, copilot-instructions.md) to the DevSteps Spider Web protocol and Ring/Domain model"
---

# 🕸️ Adapt Project Copilot Files to DevSteps Spider Web

> **Reasoning:** Analyse the full current state of `.github/` before touching anything. Extended reasoning is MANDATORY — a wrong ring assignment or a missing `## Contract` section silently breaks dispatch.

> **Active Tools:** `#edit` (file updates) · `#search` + `#fileSearch` (discovery) · `#bright-data` (VS Code Copilot API changes in last 90 days)

## Mission

Analyse and adapt the Copilot files of **any project** (not just this repo) so that GitHub Copilot can work with the full DevSteps Spider Web protocol: concentric rings, parallel fan-out, MandateResult communication, and DevSteps MCP integration.

This prompt adapts **existing** files. For editing/linting individual already-conformant files, use `Edit-Copilot-Files.prompt.md`.

## Analysis Phase (read-only — no edits yet)

1. Read `copilot-instructions.md` (root `.github/` and any workspace `.github/`) — check for Spider Web block, Entry Point Routing table, DevSteps Integration section, and Tech Stack section.
2. Discover all `.github/agents/*.agent.md`, `.github/prompts/*.prompt.md`, `.github/instructions/*.instructions.md` in the target project.
3. For each agent file, check:
   - Does it have a `## Contract` section (tier, dispatcher, return type)?
   - Is it classified as a Ring-0 coord, Ring-1 analyst, Ring-2 aspect, Ring-3 exec-planner, Ring-4 exec-/worker-, or Ring-5 gate-reviewer?
   - Does it know it is a **leaf node** (non-coord agents must never call `runSubagent`)?
4. For each prompt file, check: does it reference the correct entry-point agent and triage tier?
5. Produce a **gap report** (console summary only — no file created) before proceeding:
   - Missing Spider Web block in `copilot-instructions.md`
   - Agents without `## Contract` section
   - Agents with wrong or missing Ring classification
   - Agents that may nest dispatch (non-coord calling `runSubagent`)
   - Prompts missing `agent:` frontmatter pointing to a coord variant

## Adaptation Rules

### copilot-instructions.md

Must contain all four blocks in this order:

1. **Spider Web Architecture block** — Ring table (0–5), triage dispatch matrix, domain axes
2. **DevSteps Integration block** — item types, status flow, lifecycle (coord only), MCP tool table
3. **Tech Stack block** — project-specific; keep existing content, do NOT overwrite
4. **Hard Constraints block** — the mandatory behavioral rules (Never Act Alone, parallel fan-out, ring ordering, nesting, MandateResults, Conventional Commits)

If `copilot-instructions.md` does not exist, create it from the four blocks above. Fill Tech Stack from the project's `package.json` / `pyproject.toml` / `pom.xml` / `go.mod` / `Cargo.toml`.

### Agent Files — Ring Classification

Every `.agent.md` file must receive a `## Contract` section stating:

- `Tier:` ring number and role abbreviation (e.g., `Ring 1 — analyst`)
- `Dispatcher:` who calls this agent (always `coord` for Ring 1–5)
- `Returns:` what this agent writes back (`MandateResult` / `AnalysisEnvelope` / `code committed` / `PASS/FAIL`)
- `May call runSubagent:` `false` for all non-coord agents

For coord agents additionally: triage tier routing table, dispatch invariants.

### Prompt Files

Each prompt must have `agent:` frontmatter pointing to the correct coord variant (`devsteps-R0-coord`, `devsteps-R0-coord-sprint`, etc.) and a triage tier hint in the body.

### Instruction Files

Apply `devsteps-agent-protocol.instructions.md` as the authoritative ring/dispatch reference — do not duplicate its content, only reference it via `applyTo: "**"`.

## Naming Conventions

See `Copilot-Files-Standards-Specification.instructions.md` for YAML frontmatter rules, file length limits (max 150 lines), naming (`devsteps-` prefix), and No Examples Policy.

Project-specific agents and prompts may keep their own prefix **only if** they are NOT intended to be dispatched by a devsteps coord. If they should be dispatched by coord, rename to `devsteps-` prefix.

## Execution Order

1. Run Analysis Phase — produce gap report in chat
2. Confirm with user which gaps to close (skip if user passed `--all`)
3. Update `copilot-instructions.md` (add missing blocks, preserve Tech Stack)
4. Add `## Contract` sections to all ring-classified agents
5. Update prompt frontmatter where `agent:` is missing or wrong
6. Validate: re-read all changed files, check line counts, check for nesting violations

## Success Criteria

- `copilot-instructions.md` contains all four blocks
- Every agent has `## Contract` with tier + dispatcher + returns + `May call runSubagent`
- No non-coord agent contains `runSubagent` references in its body
- All prompt files have `agent:` frontmatter
- No file exceeds 150 lines
- No code examples introduced

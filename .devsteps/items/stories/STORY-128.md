# Story: Extract Shared Agent Boilerplate — Apply DRY/SSOT to the Agent Hierarchy

## Overarching Principle (Research-Backed)

> **The LLM Attention Budget Law:** LLMs have an "attention budget" when parsing context (Anthropic, Sept 2025). Content in the middle of long files is systematically deprioritized. Shared content must exist **once** in a protocol reference file and be *referenced*, never duplicated. Each file carries only its unique differentiator.

## Problem — Measured Redundancy

Archaeology found **~545 lines of pure duplication** across all agent files:

| Duplicated content | Files affected | Lines wasted |
|---|---|---|
| Reasoning Protocol table (verbatim identical) | ALL 11 T3 files | ~110 lines |
| Context Budget Protocol persist block (verbatim identical) | 5 aspect T3 files | ~75 lines |
| T2 boilerplate (CRITICAL dispatch rule, Absence Audit, adversarial gap, Output block) | 9 T2 files | ~360 lines |

This duplication directly **pushes the unique, mission-critical content** (MAP dispatch tables, domain-specific contradiction checks, output schemas) toward the middle of each file where it is least attended to.

## Acceptance Criteria

### TIER2-PROTOCOL.md Additions (single source of truth)

- [ ] Add canonical "Reasoning Protocol" table (4 rows) — all T3 files reference it with a link, remove it from their bodies
- [ ] Add canonical "Context Budget Protocol — Persist block" (`write_analysis_report` call + `return report_path only` rule) — 5 aspect T3 files reference it, remove verbatim copies
- [ ] Add canonical T2 boilerplate block: `CRITICAL: dispatch simultaneously in ONE fan-out`, `T1 NEVER reads raw envelopes`, `Begin with internal analysis`, `Absence Audit: [question]`, `Adversarial gap challenge: [question]`, Output block format — all 9 T2 files reference, remove copies
- [ ] Add canonical Contract table format (table, not bullet list) — unify all 9 T2 files to this format
- [ ] TIER2-PROTOCOL.md remains ≤160 lines after additions

### T3 File Fixes (bugs found in archaeology)

- [ ] `t3-analyst-context.agent.md`: Body describes context loading but Contract says "Returns via `write_analysis_report`" — **no persist call exists in body**. Add `write_analysis_report` call or fix Contract to match actual behavior
- [ ] `t3-aspect-integration.agent.md`: Step 4 references `turbo.json` (Turborepo) — project uses npm workspaces. Replace with "check root `package.json` `workspaces`"
- [ ] `t3-impl.agent.md`: Section named "Context Budget Protocol (HOW YOU RECEIVE CONTEXT)" uses same name as the persist protocol but means the *opposite* (receive, not persist). Rename to **"Context Reception Protocol"**
- [ ] `t3-impl.agent.md`: Framework rules reference NestJS and React — neither used in project. Replace with: TypeScript ESM, esbuild, vitest, commander, pino

### T2 File Fixes (bugs found in archaeology)

- [ ] `devsteps-t2-archaeology.agent.md`, `devsteps-t2-impl.agent.md`, `devsteps-t2-research.agent.md`: `bright-data/*` listed **twice** in frontmatter `tools` array — remove duplicate
- [ ] `devsteps-t2-reviewer.agent.md`: `remarc-insight-mcp/*` tool listed with no explanation — document why or remove
- [ ] `devsteps-t2-test.agent.md`: `local-web-search/*` + `google-search/*` alongside `bright-data/*` — rationalise: one web search tool, not three
- [ ] All 9 T2 files: Contract format unified to markdown table (currently 6 use bullet list, 3 use table)

## Sources

- Anthropic: "Effective context engineering for AI agents" (Sept 2025) — attention budget finding
- T3 Archaeology report: 11 files, 1368 lines analyzed, ~110+75 lines of verbatim duplication found
- T2 Audit report: 9 files all exceeding 100-line budget, ~35–40% boilerplate per file

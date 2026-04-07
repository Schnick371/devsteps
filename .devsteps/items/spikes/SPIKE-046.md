# SPIKE: ADR Integration Research

## Research Question
Should DevSteps add `adr` as a new `ItemType`? How can ADRs improve DevSteps? How do they integrate with the existing Epic → Story → Task hierarchy?

## Verdict: REJECT Path A — Implement Path C → B

**Confidence: 0.93 | Gate: PASS 0.92 | Sources: 18 web + 6 internal**

ADRs are **not work items**. They are permanent, immutable knowledge records with a different lifecycle (`proposed → accepted → deprecated → superseded`) incompatible with `draft → done`. Adding `adr` to the `ItemType` enum has 2 hard blockers and installs permanent lifecycle semantic debt.

## Key Findings

### The Three-Line Distinction
- **Spike** = work item (investigation journey, mutable, archivable)
- **ADR** = knowledge record (decision outcome, immutable, permanent)
- **Relationship**: `Spike TRIGGERS ADR` via `triggered_by` link — not parent→child hierarchy

### User's Intuition: "Behind/Under Spikes"
Temporally correct, structurally wrong. The correct model: `ADR-NNN.triggered_by = [SPIKE-NNN]` — a relational link, not hierarchy placement.

### DevSteps Already Has the Right Design
- **STORY-026**: Architecture Decision Log (DECISION-NNN prefix)
- **STORY-145**: Knowledge System with MADR-compatible AdrSchema, .devsteps/knowledge/adrs/
- **EPIC-010**: Knowledge Management (parent epic)
- **EPIC-023**: Evolutionary Architecture + Spike to ADR auto-promotion
- **ID conflict to resolve**: STORY-026 uses DECISION-NNN, STORY-145 uses ADR-NNN — recommend ADR-NNN

### Current ADR Quality: 3/10
ADR-007 in docs/architecture/ is a disconnected markdown file.

### 4 Structural Bugs Already Present
- BUG-A: doc type in Zod enum but NOT in .devsteps/config.json
- BUG-B: system.ts ITEM_TYPE_ENUM hardcoded, missing doc
- BUG-C: No freeze test for ITEM_TYPE_ENUM vs ItemType.options
- BUG-D: TYPE_SHORTCUTS missing doc entry

## Technology Radar
- ADOPT: MADR 4.0, MCP ADR Analysis Server
- TRIAL: structured-madr, Agentient ADR Claude Code Skill
- ASSESS: log4brains v1.1.0
- HOLD: npryce/adr-tools (stale), ADR Manager VS Code ext (stale)
- REJECT: ADR as ItemType enum value

## How ADRs Improve DevSteps (5 Value Streams)
1. Decision archaeology: mcp_devsteps_trace shows full SPIKE to ADR to STORY chain
2. Quality gate: gate-reviewer adds MADR checklist
3. Knowledge separation: work items vs. permanent knowledge records
4. Auto-promotion: Spike done triggers ADR creation prompt (EPIC-023)
5. Compliance enforcement: MADR 4.0 auto-template prevents quality 3/10 permanently

## Recommended Path: C then B
Phase C (quickwin, 0 TypeScript changes): activate doc in config.json, fix system.ts enum desync
Phase B (proper, STORY-145): Knowledge subsystem with devsteps_adr_* MCP tools

## Full Research Brief
tmp/SPIKE-ADR-Integration-Research-Brief.md## Research Complete — Gate PASS 0.92

Full brief: `tmp/SPIKE-ADR-Integration-Research-Brief.md`
Date completed: 2026-04-04
Verdict: REJECT ADR as ItemType. Implement Path C → Path B.
Follow-up items tracked as BUG/TASK/STORY items (see Next Actions in brief).
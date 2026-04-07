---
agent: devsteps-R0-coord-sprint
model: Claude Sonnet 4.6
tools:
  ['vscode', 'execute', 'read', 'agent', 'browser', 'bright-data/*', 'edit', 'search', 'web', 'devsteps/*', 'todo']
description: Sprint kickoff — backlog coherence & harmonization check across all open items from the last 14 days
---

# Backlog Coherence Check

## Mission

Load project context, then analyze all open work items from the last **14 days** for
consistency, spike resolution, implementation conflicts, and documentation coverage.
Use subagent fan-out for multi-aspect analysis, then surface thematic priorities to the
user via `#vscode_askQuestions`. You handle all timeline and ordering decisions.

---

## Step 0 — Load Project Context (MANDATORY)

Before any analysis, run the full context load:
→ `.github\prompts\devsteps-90-project-context.prompt.md`

Do not proceed until context is loaded and verified.

---

## Step 1 — Collect Working Set (lookback: 14 days)

Use `mcp_devsteps_list` to collect all items where:

- `status` ∈ `{draft, planned, in-progress, review, blocked}`
- Created or updated within the last 14 days
- **All open `spike` items regardless of age** (spikes never expire from the working set)

Build the full working set: spikes · epics · stories · tasks · bugs · docs.

---

## Step 2 — Dispatch Ring 1 Analysts (parallel, simultaneously)

Dispatch these analysts with the full working set:

| Analyst | Focus |
|---|---|
| `analyst-context` | Current project state, active workstreams, known blockers |
| `analyst-risk` | Implementation risks in open items, priority contradictions |
| `analyst-internal` | Codebase conflicts between work item intents and existing code |
| `analyst-archaeology` | Recent git history — what was implemented vs. what is still open |

---

## Step 3 — Coherence Analysis (after Ring 1 results)

Answer these questions autonomously using Ring 1 results:

### 3.1 — Spike Backlog (highest priority gate)
- Are open spikes present? → They take priority over all implementation items.
- Have spike documents under `KnowledgeBase/` and `Transfer/` been converted to work items?
- Spike result with no corresponding story or feature item → flag as knowledge loss risk.

### 3.2 — Spike Result Propagation
- For each **closed** spike: did its findings produce a derived story, task, or feature?
- Closed spike with no derived item → flag for derivation.

### 3.3 — Work Item Contradictions
- Identify items whose approach conflicts with other open items or architectural decisions.
- Propose the reconciled approach; apply via `mcp_devsteps_update` only after user confirmation.

### 3.4 — Implementation Conflicts
- Check for items touching the same modules or files in incompatible ways.
- Flag dependency order violations (item A blocks B, but B is scheduled first).

### 3.5 — Documentation Coverage
- For each story or epic with code impact: does a DOC item exist in `.devsteps/items/docs/`?
- Missing DOC item for a story with implementation scope → flag as documentation gap.
- Diataxis type must be classifiable (tutorial / how-to / reference / explanation).

### 3.6 — Orphaned Items
- Tasks not linked to any story via `implements` → orphaned.
- Stories not linked to any epic → unanchored.
- Spikes with no parent and no derived item → double-flagged.

### 3.7 — Classification Coverage
- Flag items missing `metadata.classification` (no domain/subdomain assigned).
- Offer batch-classification via `devsteps-45-classify-items` if ≥3 items unclassified.

---

## Step 4 — User Interaction Gate

After completing the analysis, call `#vscode_askQuestions` with:

1. Summary of findings per check (3.1–3.7) — grouped by severity
2. Proposed resolutions for contradictions (3.3) — show delta before/after
3. Flagged items with proposed next action per item
4. **Thematic focus question**: which topic cluster or domain should this sprint prioritize?

**You own timeline order. Ask the user only about thematic priorities.**

---

## Step 5 — Apply Confirmed Changes

For each user-confirmed action:

1. `mcp_devsteps_update` — update description, status, or approach
2. Create missing DOC items: `mcp_devsteps_add` (type `doc`) + link via `worker-devsteps`
3. Derive story/task from spike result: `mcp_devsteps_add` + link `implements` to spike

## Step 6 — Handoff

After all changes are applied, report:

- Summary: which items were updated, created, or flagged
- Coherence score: how many of the 7 checks passed cleanly
- **Recommendation**: if all gates pass → the backlog is ready for `devsteps-40-sprint`

Do NOT automatically invoke `devsteps-40-sprint`. The user decides when to start the sprint.

---

## Rules

- **NEVER edit `.devsteps/` files directly** — MCP tools exclusively
- **Contradictions** → propose resolution, then confirm with user before applying
- **Timeline order** = coordinator decision; **thematic focus** = user decision
- **Hard Stop** if analyst returns `ESCALATED` verdict — surface to user before any action

---
agent: devsteps-R0-coord
model: Claude Sonnet 4.6
tools: [think, devsteps, runSubagent, readFile, search]
description: "Assign meta-hierarchy (initiative/theme) to DevSteps items — top-down strategic grouping above Epic"
---

# devsteps-15-meta-hierarchy

## Mission

This prompt drives **top-down strategic grouping** of the DevSteps backlog. It assigns `initiative`
labels from the governed vocabulary in `.devsteps/groups.json` to Epics, and cascades those labels
to child Stories and Tasks via the `worker-meta-hierarchy` agent (Ring 4).

Use this prompt when:
- Starting a new planning cycle and Epics need strategic context
- A new initiative is defined and existing Epics should be mapped to it
- AI retrieval quality is low due to missing initiative coverage (threshold: <50% of Epics assigned)
- The `devsteps-45-classify-items` prompt has been run and classification is complete

**Do NOT use this prompt for:** functional categorization (use `devsteps-45-classify-items`) or
ad-hoc tag management (use `mcp_devsteps_update` directly via `devsteps-20-start-work`).

---

## Inputs

| Parameter | Type | Default | Description |
|---|---|---|---|
| `item_ids` | string[] \| `'all'` | `'all'` | Epics to process. Use `'all'` for full backlog scan. |
| `dry_run` | boolean | `false` | If true, output proposed assignments without writing. |
| `reclassify` | boolean | `false` | If true, overwrite existing `initiative` values. |
| `initiative_filter` | string[] | all active | Restrict to specific initiative slugs from `groups.json`. |

---

## Coord Execution Protocol (STANDARD tier)

### Step 1 — Read Vocabulary

Before dispatching any agent, coord reads `.devsteps/groups.json` to load active initiatives.
If the file does not exist, coord STOPS and instructs the user to create it using the
Vocabulary Management section below before re-invoking this prompt.

### Step 2 — Dispatch Worker

Coord dispatches `devsteps-R4-worker-meta-hierarchy` with:
- `item_ids` (resolved from input; default: all Epics with status `planned` or `in-progress`)
- `dry_run`, `reclassify`, `initiative_filter`
- `groups_json_path`: `.devsteps/groups.json` (absolute path)

This is a STANDARD tier dispatch: no Ring 1/2 analysis required — the vocabulary is the
sole source of ground truth. The worker is the only Ring 4 agent fired for this prompt.

### Step 3 — Review Proposed Assignments

If `dry_run = true`, coord presents the worker's proposal table to the user and awaits
confirmation before proceeding. If `dry_run = false`, coord reads the worker's MandateResult
and validates that all assigned slugs exist in the active vocabulary.

### Step 4 — Apply and Report

Coord reads the worker's MandateResult summary table. If `quorum_ok = true` and zero
vocabulary violations are present, coord marks the session complete and reports:
- Epics assigned / already set / skipped
- Stories and Tasks updated via cascade
- Coverage percentage (assigned Epics / total Epics)
- Any items flagged as ambiguous (confidence < 70%)

---

## Vocabulary Management

To add a new initiative before assigning it:

1. Read `.devsteps/groups.json` (or confirm it does not exist)
2. Append a new entry with: `slug` (kebab-case, unique), `name`, `description`, `status: "active"`,
   optional `owner` and `color`
3. Confirm the entry is written before dispatching the worker
4. Only then proceed to Step 2 above

Coord MUST validate slug uniqueness. If the slug already exists with `status: "paused"` or
`"completed"`, coord asks the user whether to reactivate it before assigning.

---

## How This Differs from `devsteps-45-classify-items`

| Dimension | `devsteps-15-meta-hierarchy` | `devsteps-45-classify-items` |
|---|---|---|
| Direction | **Top-down** — strategic intent first, items second | **Bottom-up** — item content first, taxonomy second |
| Vocabulary | **Governed** — `groups.json` enforced | **Open taxonomy** — domain/subdomain/topic tree |
| Scope | Epic → cascade to children | Any item type |
| Output field | `initiative` (first-class) | `metadata.classification.*` facets |
| Inheritance | Cascade from Epic to children | No inheritance — per-item only |
| Frequency | Planning cycles + new initiatives | Initial classification + cleanup sprints |

---

## Success Criteria

- ≥50% of Epics have a valid `initiative` value from `groups.json` (or dry-run proposal covers them)
- Zero items carry an `initiative` slug not present in `groups.json`
- Coverage warning thresholds in the TreeView are respected (50% / 30% bands)
- If `dry_run = false`: `by-initiative` index reflects the updated state
- MandateResult written to `.devsteps/cbp/` before coord closes the session

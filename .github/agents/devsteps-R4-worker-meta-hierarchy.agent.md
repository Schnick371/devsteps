---
description: "Assigns initiative/theme labels from groups.json to DevSteps items — top-down governed vocabulary, cascade from Epic to children"
model: Claude Sonnet 4.6
tools: [think, devsteps, readFile, search]
user-invokable: false
---

# devsteps-R4-worker-meta-hierarchy

## Contract

| Property | Value |
|---|---|
| Tier | Ring 4 — Worker |
| Dispatcher | `coord` via `devsteps-15-meta-hierarchy` prompt |
| Returns | MandateResult written to `.devsteps/cbp/<sprint_id>/worker-meta-hierarchy.result.json` |
| May call runSubagent | **false** |
| May create/delete items | **false** |
| May change status/type/eisenhower | **false** |

---

## Mission

Perform governed top-down assignment of `initiative` labels from `.devsteps/groups.json` to
DevSteps Epic items, then cascade the assigned value to all child Stories and Tasks via linked
`implements` relationships. Apply changes via `mcp_devsteps_update`. Write a structured
MandateResult summarising all changes, skips, and ambiguous items.

---

## Inputs

| Parameter | Type | Description |
|---|---|---|
| `item_ids` | string[] | Epic IDs to process (pre-resolved by coord) |
| `groups_json_path` | string | Absolute path to `.devsteps/groups.json` |
| `dry_run` | boolean | If true, produce proposal table without writing |
| `reclassify` | boolean | If true, overwrite existing `initiative` values |
| `initiative_filter` | string[] | Optional: restrict matching to these slugs only |

---

## Protocol

1. **Read Vocabulary** — Read `groups_json_path`; extract `status: "active"` slugs. If missing/empty, write partial MandateResult with escalation and stop.
2. **Fetch Epics** — Call `mcp_devsteps_list` for `item_ids`. If `reclassify = false`, skip items already carrying an `initiative` value.
3. **Match Initiative** — For each Epic, score active slugs against `title`, `tags`, and `description`. Select highest-confidence match. Skip if confidence < 70% (flag as ambiguous).
4. **Cascade to Children** — For matched Epics, walk `implemented-by` chain via `mcp_devsteps_trace`. Skip children that already have an explicit `initiative`.
5. **Apply Updates** — If `dry_run = false`, call `mcp_devsteps_update` for each Epic and cascaded child with `initiative: <slug>`. Never modify `status`, `type`, `eisenhower`, `tags`, or `description`.
6. **MandateResult** — Write summary: items assigned (direct + cascade), items skipped (ambiguous), coverage percentage (assigned / total Epics). Signal `status: "partial"` if >30% of input Epics were ambiguous.

---

## Cascade and Ambiguity Rules

- Children inherit the `initiative` of their parent Epic; explicit child values override the inherited value
- Cascade depth: Epic → Story → Task only; Tasks do not cascade further
- Unmatched Epics (confidence < 70%) are skipped; their children are NOT modified
- Log top-two candidate scores for skipped items; do not prompt user inline

---

## Leaf-Node Constraints

- NEVER call `runSubagent`
- NEVER call `mcp_devsteps_add` or delete any item
- NEVER modify `status`, `type`, `eisenhower`, `priority`, `tags`, or `description`
- NEVER assign an `initiative` slug that is not present in the loaded `groups.json` vocabulary
- NEVER apply an `initiative` with `status: "paused"` or `"completed"` from `groups.json`

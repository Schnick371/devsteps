## Goal

Introduce a native `OBJECTIVE` item type for full OKR hierarchy support: Objective → (Epic as Initiative) → Story → Task.

## Blocked by

STORY-201 (Phase 2 — initiative field). Must reach ≥50% Epic assignment rate before beginning Phase 3.

## Scope (future)

1. New `objective` type in `ItemType` enum — prefix `OBJ`
2. ID regex update across all 4 packages
3. New `by-type/objective.json` index
4. Hierarchy rules: OBJ → implements-by → epic
5. `strategic_type` enum on Objective: `vision | platform | outcome | discovery`
6. VS Code TreeView: new root node type
7. Migration: which existing EPICs become OBJs?

## Gate condition

≥50% of non-done Epics must carry an `initiative` value (Phase 2) before this story may move to `planned`.

## Evidence (SPIKE-024)

Research signal: ASSESS (not ready until Phase 2 adoption proven).
OKR framework: best long-term fit for AI-first dev teams (mooncamp, Jan 2026; SAFe OKRs).
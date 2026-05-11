# Extend sdevsteps-diataxis-sprint SKILL.md — add Step 0 to 7-step workflow

## Problem

The current 7-step Diataxis workflow in `sdevsteps-diataxis-sprint/SKILL.md` starts directly with doc-gap scanning (Step 1). There is no Step 0 that:
- Establishes `output_mode` (handbook vs doc-set)
- Builds and confirms the ARCH-NNN skeleton with the user before authoring begins
- Calls `mcp_devsteps_add(type=doc)` to pre-create L0/L1/L2 BOM nodes

Without Step 0, the planner defaults to a flat list — the exact anti-pattern confirmed in the EPIC-046 post-mortem (Root Cause C).

## Action

Update the `## 7-Step Diataxis Workflow` section in `.github/skills/sdevsteps-diataxis-sprint/SKILL.md`:

1. Prepend a new **Step 0: Establish output_mode + build BOM skeleton**:
   - Ask: handbook (one assembled file) or doc-set (independent fragments)?
   - For handbook: draft ARCH-NNN tree at L0–L2, confirm with user
   - Call `mcp_devsteps_add(type=doc)` for each skeleton node (L0 first → L1 → L2)
   - Only THEN proceed to Step 1 (doc-gap scan)
2. Renumber existing Steps 1–7 → Steps 1–7 (unchanged); add the note "Step 0 applies to handbook mode only; skip for doc-set"
3. Cross-reference: "For DevSteps-own handbook: see STORY-297 for authoritative ARCH-NNN TOC"

## Acceptance Criteria

- The `## 7-Step Diataxis Workflow` section has a Step 0 at the top
- Step 0 includes: output_mode decision + skeleton creation via `mcp_devsteps_add` + user confirmation
- A note clarifies that Step 0 applies only to handbook mode
- Existing steps 1–7 are unchanged

## Umsetzung

Step 0 wurde in `.github/skills/sdevsteps-diataxis-sprint/SKILL.md` direkt vor den bisherigen Schritten 1–7 eingefügt. Inhalt:
- Bestimmung von `output_mode` (handbook vs doc-set)
- Für handbook: ARCH-NNN Baum L0–L2 entwerfen und mit User bestätigen
- `mcp_devsteps_add(type=doc)` top-down (L0 → L1 → L2) aufrufen
- Verweis auf STORY-297 als DevSteps-eigener ARCH-NNN Blueprint
- Hinweis: Step 0 gilt nur für handbook-mode
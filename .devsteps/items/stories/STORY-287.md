AI-generated BOM manifest based on audience persona. The AI says:
"Create a manual for an expert user of product X — limit tutorials, emphasize reference and how-to."

## Tool Definition
Tool name: devsteps_generate_rollup_manifest
Input:
  - audience: enum ('beginner' | 'intermediate' | 'expert')
  - topic_tags: string[] (content domain filter)
  - output_path: string optional

Audience → weight mapping:
  beginner:     tutorial=w4, how-to=w2, explanation=w3, reference=w1
  intermediate: tutorial=w2, how-to=w4, explanation=w2, reference=w3
  expert:       tutorial=w0, how-to=w3, explanation=w1, reference=w4

Output: docs-map.json compatible JSON BOM manifest (array of doc IDs ordered by weight)
        + preview: "Manifest for expert persona: 0 tutorials, 8 how-tos, 2 explanations, 12 references"

## Acceptance Criteria
- Uses by-diataxis.json + tag filter (depends on STORY-A)
- Output is valid input for rollupHandler item_ids
- No ML — pure structured query + weight-sort

## Estimated effort: 1 day## Phase 3 — Skeleton template + chronological ordering

Skeleton principle (product structure template):
- Input: a skeleton JSON defining product chapter structure (e.g., "Safety → Transport → Maintenance → Troubleshooting")
- Tool maps fragments onto skeleton sections by diataxis_type + component + tags
- Skeleton is optional; if absent, fall back to audience-weight sort (existing behavior)

Chronological ordering within sections:
- Within each section, sort fragments by detected heading chronology (sequence keywords: "before", "step 1", "first", numeric list anchors)
- Currently weight-sorts only — chronological keyword detection is new
- AC: if fragment has `^## Step \d` or `^## \d+\.` headings, sort by extracted step number within section
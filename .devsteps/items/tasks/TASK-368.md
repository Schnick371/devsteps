Four changes to a single file. ATOMIC: all four changes must land in one commit — FOCUSED profile without updated gate criteria causes 100% gate FAIL rate.

**Canonical source:** packages/mcp-server/.github/prompts/devsteps-05-research.prompt.md

**Change 1 — Add Dispatch Profile Selector section (after When-to-Use, before Full Spider Web Dispatch):**
Table with two rows: FOCUSED (specific API/library/pattern questions → analyst-research + aspect-constraints) and DEEP (architecture decisions / ecosystem comparison → Full Spider Web). Include trigger signals for each profile.

**Change 2 — Add FOCUSED Profile Dispatch section (insert before existing full dispatch section):**
Ring 1: analyst-research (≥5 sources, 90-day window, focused question). Ring 2: aspect-constraints only. Ring 3+4: exec-planner synthesizes, exec-doc produces concise answer. Ring 5 gate criteria: ≥5 sources, question directly answered, ≥1 actionable recommendation. Does NOT require all 5 coverage axes.

**Change 3 — Rename existing dispatch section:**
'Full Spider Web Dispatch' → 'DEEP Profile Dispatch — Full Spider Web'

**Change 4 — Gate criteria remain positioned under DEEP section:**
Existing gate criteria (≥10 sources, all 5 axes) stay under the DEEP section header — no text change needed. The tier is unambiguous by position.

## Done When
Prompt has both profile sections; FOCUSED gate requires ≥5 sources (not 10); DEEP gate unchanged; net file size ≤140 lines.
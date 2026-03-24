Five coordinated documentation-only changes across ADP, coord, exec-planner, and instructions files. No TypeScript, no Zod schema changes, no tests required.

## Changes

**P1 — Coord pre-scan (FULL tier only):** Before Ring 1 dispatch, coord runs ≤3 targeted searches to identify ≤8 most relevant files, passes result as `Relevant files:` in all Ring 1+2+3 DPFs.

**P2 — Tiered tool-call guidelines:** ADP §3 gets a tier-adjusted ceiling note (QUICK: 5, STANDARD: 12, FULL: 20 tool calls per analyst). Informational guideline, not a hard cutoff.

**P3 — I-14 invariant (single-concern mandate rule):** Each analyst/aspect mandate covers ONE investigation question. Coord MUST scope-split for ≥2 orthogonal concerns. Concern-split produces at most MAX_SPLIT=4 additional agents total (guard against concern-count explosion).

**P5 — DPF `Relevant files:` field:** Add `Relevant files: {pre_scan_results}` to Ring 1 and Ring 2 DPF templates in ADP §2. FULL tier only — omit at QUICK/STANDARD. Coord populates from Step 0.5 pre-scan.

**R3-fix — exec-planner cross-ring re-read fix:** Coord injects `Relevant files:` into Ring 3 DPF. exec-planner MAP step 5 updated to check `Relevant files:` before calling `read_file` — skips re-reading files already listed by coord.

## Acceptance Criteria
1. ADP §1 has I-14 with MAX_SPLIT=4 guard after I-13 row
2. ADP §2 Ring 1+2 DPF templates have `Relevant files:` field
3. ADP §3 has tier-adjusted ceiling note (QUICK:5 / STANDARD:12 / FULL:20)
4. Both coord files have Step 0.5 pre-scan block (FULL tier only)
5. Both coord files ≤150 lines (Scope-Split section compressed to reference pointer)
6. exec-planner MAP step 5 checks `Relevant files:` before read_file
7. devsteps-agent-protocol.instructions.md has I-14 row
8. All modified devsteps-* files identical in root, mcp-server, cli locations
9. AGENT-DISPATCH-PROTOCOL.md is root-only; no copies created

## Sync Direction
pkg/mcp-server/.github/ (canonical source) → root .github/ → packages/cli/.github/
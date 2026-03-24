Three changes to a single file in one commit. AGENT-DISPATCH-PROTOCOL.md is root-only — no package sync needed for this file.

**P3 — §1 Dispatch Invariants table:**
Add I-14 row after I-13: 'Each analyst/aspect mandate covers ONE investigation question. Coord MUST scope-split for ≥2 orthogonal concerns. Concern-split produces at most MAX_SPLIT=4 additional agents total across all splits.' In the Scope-Split Fan-Out prose section, append: 'I-14 concern-split guard: Splitting by concern produces at most MAX_SPLIT=4 additional agents total.'

**P5 — §2 DPF Ring 1+2 templates:**
Add `Relevant files: {pre_scan_results}` as the last field in both Ring 1 and Ring 2 DPF templates. Add parenthetical note: 'coord populates Relevant files: at FULL tier from Step 0.5 pre-scan result. Omit at QUICK and STANDARD — do not include empty line.'

**P2 — §3 Analyst Loop Bounds:**
Add subsection below existing table: 'Tier-Adjusted Tool-Call Ceiling (informational guideline)' — table with 3 rows (QUICK:5, STANDARD:12, FULL:20). Note: informational guideline, not hard cutoff.

## Done When
All three changes present; no other sections altered; file passes markdown syntax check.
Multi-story effort to reduce per-agent token consumption in the Spider Web dispatch system. Two verified root causes: (1) mandates too broad — 4–8 orthogonal concerns dispatched to a single analyst, causing 25+ tool calls where 8–12 suffice; (2) cross-ring file re-reads — exec-planner MAP step 5 calls read_file 'to verify locations' even when Ring 1 already read those files, because MandateResults carry synthesized text only.

Fixes via two stories:
- **Story A** — hardens the protocol (ADP invariants I-14, DPF field, tiered limits, coord pre-scan, exec-planner R3-fix) — documentation-only changes, no TypeScript
- **Story B** — restructures the research prompt to support FOCUSED vs DEEP dispatch profiles with matching tier-conditional gate criteria

## Done When
Both stories gate-PASS; all file copies are in sync; no regressions in existing dispatch flows.## Completion — 2026-03-24

All stories done:
- **STORY-213** (done, 2026-03-24): I-13 scope-split fan-out — foundation for I-14, linked as `relates-to`
- **STORY-214** (done, 2026-03-24): I-14 single-concern mandate, pre-scan Step 0.5, tier-adjusted limits, Relevant files DPF field, exec-planner R3-fix
- **STORY-215** (done, 2026-03-24): Research prompt FOCUSED/DEEP tiered profiles, tier-conditional gate criteria

All affected file copies in sync (mcp-server → root → cli).

Sub-items: TASK-363 through TASK-369 all done.
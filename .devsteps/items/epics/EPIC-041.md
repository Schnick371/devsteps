Multi-story effort to reduce per-agent token consumption in the Spider Web dispatch system. Two verified root causes: (1) mandates too broad — 4–8 orthogonal concerns dispatched to a single analyst, causing 25+ tool calls where 8–12 suffice; (2) cross-ring file re-reads — exec-planner MAP step 5 calls read_file 'to verify locations' even when Ring 1 already read those files, because MandateResults carry synthesized text only.

Fixes via two stories:
- **Story A** — hardens the protocol (ADP invariants I-14, DPF field, tiered limits, coord pre-scan, exec-planner R3-fix) — documentation-only changes, no TypeScript
- **Story B** — restructures the research prompt to support FOCUSED vs DEEP dispatch profiles with matching tier-conditional gate criteria

## Done When
Both stories gate-PASS; all file copies are in sync; no regressions in existing dispatch flows.
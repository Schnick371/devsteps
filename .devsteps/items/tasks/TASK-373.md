ADR-002 in .devsteps/ideas/DOC-ARCHITECTURE.md (and the copy in DOC-ARCHITECTURE copy.md) proposes adding the doc type via config.json only — no source code changes. This is INCORRECT. Research in SPIKE-036 confirmed that ItemType is a hardcoded Zod enum — config.json changes alone are insufficient. Source code changes are mandatory.

Task: Add a supersession note to ADR-002 in both files cross-referencing SPIKE-036 and the correct approach. Also retire ADR-006 (zoom levels = Diataxis types is invalid; use detail_level field instead; Diataxis forbids mixing presentation depth with content classification).

Must be done before Phase 1 implementation begins.
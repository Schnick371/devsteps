## Goal

Design and validate the architecture for a **server-directed multi-step dialog** between DevSteps MCP tools and GitHub Copilot for the `devsteps docs import` workflow.

## Background

The heuristic-only import plan (SPIKE-043) is insufficient: a static algorithm cannot replace editorial judgment for mixed-type documents. The solution: MCP tools return `next_steps` instructions + a cryptographic token that mechanically enforces the classify → confirm → commit sequence.

See preliminary research: `.devsteps/analysis/SPIKE-044/` (3 analyst reports, confidence 0.87–0.92)

## Research Questions

1. **Token + Session contract** — exact HMAC implementation, TTL, error surface for expired/invalid tokens
2. **5 Tool API contracts** — exact parameter/response schemas for:
   - `devsteps_docs_import` (scan + session init)
   - `devsteps_docs_classify` (excerpt → score vector + signals)
   - `devsteps_docs_classify_confirm` (user decision: accept / split / skip / rewrite)
   - `devsteps_docs_bom_status` (session progress)
   - `devsteps_docs_bom_commit` (DOC Items + DocsMapDocument update)
3. **BOM gap analysis** — what fields does `DocsMapDocument` lack for import-session output?
4. **`devsteps_docs_new` creation-time enforcement** — minimum tool design for Diataxis-at-first-keystroke
5. **next_steps text format** — optimal instruction text format for reliable Copilot tool-call following
6. **Scoring algorithm implementation** — pure-function `heuristicClassify(excerpt): ScoreVector`

## Acceptance Criteria

- [ ] AC-1: Token contract defined (HMAC-SHA256, TTL, format)
- [ ] AC-2: All 5 tool schemas documented (input/output Zod or JSON Schema)
- [ ] AC-3: Session state file schema defined (`.devsteps/import-sessions/<id>.json`)
- [ ] AC-4: BOM gap analysis complete — missing fields listed with migration plan
- [ ] AC-5: `heuristicClassify` pure-function spec with 6-type score vector
- [ ] AC-6: `devsteps_docs_new` tool spec
- [ ] AC-7: Work items created for implementation (STORY-238 or updates to STORY-236)
- [ ] AC-8: Citations for MCP token-chain pattern and next_steps format

## Constraints

- No new npm dependencies beyond what's in `@modelcontextprotocol/sdk` v1.22
- Token must not use crypto.randomUUID alone — needs HMAC for server-verification
- Session state must be idempotent (retry-safe) 
- All new tools must follow existing DevSteps tool naming pattern (`devsteps_*`)
- `devsteps_docs_classify` must work WITHOUT an LLM — scoring is algorithmic (LLM = optional addon)## Gate Result — PASS (0.90)

Ring 5 gate-reviewer passed all 10 ACs. Brief: `tmp/SPIKE-044-MCPDialog-Research-Brief.md`

**5 Implementation Notes from Gate:**
1. Remove `token_hash` from session file schema — HMAC re-derived on every call, never stored
2. Extend Appendix B: output path traversal guard for `splits[].new_path` + `devsteps_docs_new` stub path
3. Canonical `heuristicClassify` signature: `(excerpt: string, filepath?: string): ScoreVector`
4. Concurrent classify race: read-modify-write with conflict detection on `session.classified[]`
5. Slug sanitization rule needed for `devsteps_docs_new` (lowercase, hyphens, strip specials)

**Work items created:** STORY-238, TASK-404–410
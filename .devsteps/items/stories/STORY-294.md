G1 CRITICAL quality gap: `write_analysis_report` uses path-keyed storage (`.devsteps/analysis/<session>/<filename>.md`). When two analysts of the same type are dispatched in parallel (scope-split fan-out per I-13), the second writer silently overwrites the first. Fix: add optional `scope_shard` string field to the `write_analysis_report` tool schema. When present, the output path becomes `<session>/<filename>-<scope_shard>.md` (e.g. `analysis-context-STORY-281-packages.md`). This is a backward-compatible MINOR semver bump. Affects: all analyst-* agents using `write_analysis_report`, coord reading via `read_analysis_envelope`.

---

## Implementation Complete (commit c3ff0f0)

**Files changed (5):**
- `packages/shared/src/schemas/analysis.ts` — added `scope_shard?: string` to `AnalysisBriefingSchema` (regex `^[a-zA-Z0-9_-]+$`, max 32 chars)
- `packages/mcp-server/src/tools/analysis.ts` — added `scope_shard` property to `writeAnalysisReportTool` and `readAnalysisEnvelopeTool` input schemas (NOT required → backward compatible)
- `packages/mcp-server/src/handlers/analysis.ts` — handler appends `-${scope_shard}` suffix to filename when present, both on write and read; validates pattern on read
- `packages/shared/src/schemas/analysis.test.ts` — 5 new schema tests (valid chars, invalid chars, length limits, backward compat)
- `packages/mcp-server/src/handlers/analysis.test.ts` — 8 new handler tests (write/read with/without shard, collision-free across distinct shards, missing-file error, validation rejection)

**Test results:** 13/13 PASS (vitest)

**Behavior:**
- Without `scope_shard` → existing path `aspect-report.json` (backward compatible)
- With `scope_shard: "packages-shared"` → path `aspect-packages-shared-report.json`
- Invalid chars (e.g., `/`, `.`, space) → validation error at both schema and handler boundary
- Two parallel writers using different shards → both files written, no collision

**Note:** Pre-existing TypeScript build error in `packages/shared/src/core/index.ts` (missing exports from `heuristic-classify.js`) was present BEFORE this change and is unrelated to STORY-294. Vitest tests pass via TS source transformation. Build break tracked separately.
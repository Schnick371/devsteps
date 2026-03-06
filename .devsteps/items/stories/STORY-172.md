# guide_code_health — Local AST Code Complexity Analysis

## Context
EPIC-034: Daily Workflow. T2-H analysis confirmed the TypeScript compiler API is already in the devsteps toolchain — no new runtime deps needed.

## Complete Spec (T2-H)

**Local AST analysis** via `ts.createSourceFile()`:
- Per-function metrics: `line_count`, `nesting_depth`, `cyclomatic_complexity`, `param_count`
- Cyclomatic complexity = decision points (if/for/while/switch/catch/ternary/&&/||)

**Severity thresholds:**
| Level | cyclomatic | lines | nesting | params |
|-------|-----------|-------|---------|--------|
| CRITICAL | > 20 | > 150 | > 5 | — |
| HIGH | > 10 | > 80 | > 3 | — |
| MEDIUM | > 5 | > 40 | — | > 5 |
| LOW | otherwise | | | |

**File health score:** `max(0, 10 - min(10, cc_max/2 + line_count/500 + depth_max))`

**Guidance strings (emoji-prefixed per severity):**
- ⛔ `CRITICAL: Extract into smaller functions`
- ⚠️ `HIGH: Reduce nesting with early returns`
- ℹ️ `MEDIUM: Consider splitting the function`
- ✅ `Acceptable complexity`

**CodeScene optional enrichment:** checks `CODESCENE_API_KEY` env. If present: 5s timeout HTTP call; merges `coupling` + `quality_trend`. On timeout/error: local-only, no thrown error.

```typescript
GuideCodeHealthInput { paths: string[]; include_external?: boolean }

GuideCodeHealthOutput {
  files: Array<{
    path; language; line_count; health_score
    functions: Array<{ name; start_line; end_line; line_count; cyclomatic_complexity; nesting_depth; param_count; severity; guidance }>
    hotspots: Array<{ name; severity }>
    codescene?: { coupling: number; quality_trend: "improving"|"stable"|"degrading" }
  }>
  summary: { total_files; avg_health_score; critical_count; high_count }
  improvement_order: string[]   // paths sorted health_score ascending (worst first)
}
```

**Called SEPARATELY from `guide_work_context`** — AST parsing is slow (100–500ms/file).

## Acceptance Criteria

- [ ] Only uses `ts.createSourceFile()` — zero shell processes
- [ ] `CODESCENE_API_KEY` not set → no network calls, no errors, `codescene: null`
- [ ] CodeScene API timeout after 5000ms → local results returned, `codescene: null`
- [ ] `improvement_order` sorted by `health_score` ascending (worst files first)
- [ ] Guidance strings use correct emoji per severity
- [ ] Unit tests: cyclomatic complexity (5 patterns), health_score formula, threshold classification
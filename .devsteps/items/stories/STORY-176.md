# guide_ci_check — Pre-Merge Quality Gate

## Context
EPIC-010: Knowledge. T2-G competitive finding: Shrimp TM CI integration (gap #7 in DevSteps). DevSteps Guide needs a **programmatic quality gate** that blocks merge when Guide-layer invariants are violated — analogous to `biome check` but for the Guide quality layer.

## Tool Design

```typescript
GuideCiCheckInput {
  item_id:        string
  mode:           "fail-fast" | "report"  // default: "report"
  output_format?: "text" | "json" | "sarif"
}

GuideCiCheckOutput {
  item_id:   string
  passed:    boolean
  exit_code: 0 | 1      // 1 when mode="fail-fast" and passed=false
  checks: Array<{
    check_id:  string
    name:      string
    status:    "PASS" | "FAIL" | "WARN" | "SKIP"
    message:   string
    severity:  "error" | "warning" | "info"
  }>
  summary: string
}
```

**Check suite:**
| check_id | What it verifies | severity |
|----------|-----------------|---------|
| `deps-unmet` | All `depends-on` items are `done` | error |
| `acceptance-missing` | `guide_acceptance_check` was called for this item | error |
| `acceptance-fail` | Last acceptance check `gate_decision` = PASS | error |
| `cot-missing` | `guide_cot_capture` was called for this item | warning |
| `reflect-missing` | `guide_reflect` was called for this item | warning |
| `style-violations` | No open `guide_file_conventions_check` violations | warning |
| `open-blockers` | No unresolved `blocked-by` items | error |

**`passed: true`** = ALL `error` severity checks are PASS (warnings do not block).

**SARIF output** (when `output_format: "sarif"`): valid SARIF 2.1.0 JSON for GitHub Code Scanning integration.

**CLI integration:** `devsteps ci-check STORY-123 --fail-fast`
- Wraps this MCP tool as a CLI subcommand
- Exits with code 1 on fail-fast + failure

**Does NOT run:** `biome`, `tsc`, `npm test` — those are external tools. `guide_ci_check` only checks Guide-layer data files.

## Acceptance Criteria

- [ ] `passed: true` only when all `error`-severity checks are PASS
- [ ] `exit_code: 1` when `mode: "fail-fast"` AND `passed: false`
- [ ] `deps-unmet` reads actual `linked_items.depends-on` from item file
- [ ] SARIF output is valid SARIF 2.1.0 (automated schema check in unit tests)
- [ ] Does not invoke shell tools (`biome`, `tsc`, etc.)
- [ ] `devsteps ci-check` CLI command exists and exits with correct code
- [ ] Unit tests: each check_id independently, SARIF structure validates, fail-fast exit code